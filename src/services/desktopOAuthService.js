import axios from 'axios';
import { OAUTH_CONFIG, generateCodeVerifier, generateCodeChallenge, generateRandomState } from '../config/oauth';

const USE_CONFIDENTIAL = (process.env.REACT_APP_OAUTH_CONFIDENTIAL || '').toLowerCase() === 'true';
const CLIENT_SECRET = process.env.REACT_APP_JIRA_CLIENT_SECRET;

class DesktopOAuthService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.cloudId = null;
    this.callbackServer = null;
  }

  // Start OAuth flow for desktop app
  async initiateOAuthFlow() {
    // Validate config early
    if (!OAUTH_CONFIG.CLIENT_ID || /your-client-id/i.test(String(OAUTH_CONFIG.CLIENT_ID))) {
      throw new Error('Missing OAuth CLIENT_ID. Set REACT_APP_JIRA_CLIENT_ID in your .env');
    }

    // Generate PKCE parameters unless using confidential flow
    const codeVerifier = USE_CONFIDENTIAL ? null : generateCodeVerifier();
    const codeChallenge = USE_CONFIDENTIAL ? null : await generateCodeChallenge(codeVerifier);
    const state = generateRandomState();

    // Store PKCE verifier and state
    sessionStorage.setItem('oauth_code_verifier', codeVerifier);
    sessionStorage.setItem('oauth_state', state);

    console.log('🔐 Starting desktop OAuth flow...');
    console.log('Code verifier generated:', !!codeVerifier);
    console.log('Code challenge generated:', !!codeChallenge);

    try {
      const callbackUrl = await this.startCallbackServer();
      console.log('✅ Callback server started at:', callbackUrl);

      this.redirectUri = callbackUrl;
      const authUrl = this.generateDesktopAuthUrl(state, codeChallenge, this.redirectUri);
      console.log('🌐 Opening browser for authorization...');
      this.openBrowser(authUrl);

      const authCode = await this.waitForCallback();
      console.log('✅ Authorization code received');

      const tokens = await this.exchangeCodeForTokens(authCode, codeVerifier);
      console.log('✅ OAuth flow completed successfully');
      return tokens;
    } catch (error) {
      console.error('❌ OAuth flow failed:', error);
      throw error;
    } finally {
      this.stopCallbackServer();
      sessionStorage.removeItem('oauth_code_verifier');
      sessionStorage.removeItem('oauth_state');
    }
  }

  // Generate authorization URL for desktop
  generateDesktopAuthUrl(state, codeChallenge, redirectUri) {
    const params = new URLSearchParams({
      audience: OAUTH_CONFIG.AUDIENCE,
      client_id: OAUTH_CONFIG.CLIENT_ID,
      scope: OAUTH_CONFIG.SCOPES,
      redirect_uri: redirectUri || OAUTH_CONFIG.REDIRECT_URI,
      response_type: 'code',
      state: state,
      prompt: 'consent'
    });
    if (codeChallenge) {
      params.set('code_challenge', codeChallenge);
      params.set('code_challenge_method', 'S256');
    }
    
    return `${OAUTH_CONFIG.AUTHORIZATION_URL}?${params.toString()}`;
  }

  // Start localhost callback server
  async startCallbackServer() {
    return new Promise((resolve, reject) => {
      try {
        // For Electron, we'll use the main process to create the server
        if (window.electron && window.electron.startOAuthServer) {
          window.electron.startOAuthServer()
            .then((port) => {
              this.callbackPort = port;
              resolve(`http://localhost:${port}/callback`);
            })
            .catch(reject);
        } else {
          // Fallback: Use a simple approach for web version
          console.log('⚠️ Running in web mode - OAuth callback will be handled differently');
          resolve('http://localhost:8080/callback');
        }
      } catch (error) {
        reject(new Error(`Failed to start callback server: ${error.message}`));
      }
    });
  }

  // Wait for OAuth callback
  async waitForCallback() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('OAuth timeout - user did not complete authorization'));
      }, 300000); // 5 minutes timeout

      // Listen for callback from main process
      if (window.electron && window.electron.onOAuthCallback) {
        window.electron.onOAuthCallback((data) => {
          clearTimeout(timeout);
          
          if (data.error) {
            reject(new Error(data.error_description || data.error));
            return;
          }

          if (!data.code) {
            reject(new Error('No authorization code received'));
            return;
          }

          // Validate state to mitigate CSRF
          const expectedState = sessionStorage.getItem('oauth_state');
          if (expectedState && data.state && data.state !== expectedState) {
            reject(new Error('Invalid OAuth state'));
            return;
          }

          resolve(data.code);
        });
      } else {
        // Fallback for web mode
        setTimeout(() => {
          reject(new Error('OAuth callback not supported in web mode'));
        }, 1000);
      }
    });
  }

  // Stop callback server
  stopCallbackServer() {
    if (window.electron && window.electron.stopOAuthServer) {
      window.electron.stopOAuthServer();
    }
  }

  // Open browser for authorization
  openBrowser(url) {
    if (window.electron && window.electron.openExternal) {
      // Use Electron's shell to open external browser
      window.electron.openExternal(url);
    } else {
      // Fallback: open in same window (for web testing)
      window.open(url, '_blank');
    }
  }

  // Exchange authorization code for tokens using PKCE
  async exchangeCodeForTokens(code, codeVerifier) {
    try {
      console.log('🔄 Exchanging authorization code for tokens...');
      console.log('   using redirect_uri:', this.redirectUri || OAUTH_CONFIG.REDIRECT_URI);
      const maskedClient = String(OAUTH_CONFIG.CLIENT_ID || '').replace(/.(?=.{4})/g, '*');

      let response;
      if (USE_CONFIDENTIAL) {
        if (!CLIENT_SECRET) {
          throw new Error('Confidential OAuth is enabled but REACT_APP_JIRA_CLIENT_SECRET is not set');
        }
        console.log('   using confidential client flow');
        // Perform exchange in main process via IPC
        response = { data: await window.electron.exchangeTokenConfidential({
          code,
          redirectUri: this.redirectUri || OAUTH_CONFIG.REDIRECT_URI,
          clientId: OAUTH_CONFIG.CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          tokenUrl: OAUTH_CONFIG.TOKEN_URL
        })};
      } else {
        const params = new URLSearchParams();
        params.set('grant_type', 'authorization_code');
        params.set('client_id', OAUTH_CONFIG.CLIENT_ID);
        params.set('code', code);
        params.set('redirect_uri', this.redirectUri || OAUTH_CONFIG.REDIRECT_URI);
        params.set('code_verifier', codeVerifier);
        console.log('   client_id:', maskedClient, ' code_verifier_len:', (codeVerifier || '').length);
        response = await axios.post(OAUTH_CONFIG.TOKEN_URL, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
      }

      const { access_token, refresh_token, expires_in } = response.data;
      
      // Store tokens
      this.accessToken = access_token;
      this.refreshToken = refresh_token;
      this.tokenExpiry = new Date(Date.now() + (expires_in * 1000));

      // Save to localStorage for persistence
      localStorage.setItem('jira_access_token', access_token);
      localStorage.setItem('jira_refresh_token', refresh_token);
      localStorage.setItem('jira_token_expiry', this.tokenExpiry.toISOString());

      console.log('✅ OAuth tokens obtained successfully');
      
      // Get accessible Jira sites
      await this.getAccessibleSites();
      
      return {
        success: true,
        access_token,
        refresh_token,
        expires_in
      };
      
    } catch (error) {
      console.error('❌ Token exchange failed:', error.response?.data || error.message);
      // Extra diagnostics to help debugging misconfig
      console.error('   Details:', {
        status: error.response?.status,
        redirect_uri: this.redirectUri || OAUTH_CONFIG.REDIRECT_URI,
        client_id_present: !!OAUTH_CONFIG.CLIENT_ID,
        code_present: !!code
      });
      const baseMsg = error.response?.data?.error_description || error.message;
      const hint = error.response?.status === 401
        ? ' Hint: Ensure your Atlassian app is configured for OAuth 2.0 (3LO) with PKCE enabled and the callback URL exactly matches.'
        : '';
      throw new Error(`Token exchange failed: ${baseMsg}${hint}`);
    }
  }

  // Get accessible Jira sites
  async getAccessibleSites() {
    try {
      if (!this.accessToken) {
        throw new Error('No access token available');
      }

      const response = await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      const sites = response.data;
      console.log('Accessible Jira sites:', sites);

      if (sites && sites.length > 0) {
        // Use the first site by default
        this.cloudId = sites[0].id;
        localStorage.setItem('jira_cloud_id', this.cloudId);
        
        console.log(`✅ Using Jira site: ${sites[0].name} (${sites[0].url})`);
        return sites;
      } else {
        throw new Error('No accessible Jira sites found');
      }
      
    } catch (error) {
      console.error('❌ Failed to get accessible sites:', error.response?.data || error.message);
      throw error;
    }
  }

  // Rest of the methods same as original OAuth service...
  async getValidAccessToken() {
    if (!this.accessToken) {
      this.loadTokensFromStorage();
    }

    if (!this.accessToken) {
      throw new Error('No access token available. Please authenticate.');
    }

    const now = new Date();
    const expiryBuffer = new Date(this.tokenExpiry.getTime() - 5 * 60 * 1000);

    if (now >= expiryBuffer) {
      console.log('Access token expired, refreshing...');
      await this.refreshAccessToken();
    }

    return this.accessToken;
  }

  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }
      let response;
      if (USE_CONFIDENTIAL) {
        if (!CLIENT_SECRET) {
          throw new Error('Confidential OAuth is enabled but REACT_APP_JIRA_CLIENT_SECRET is not set');
        }
        const data = await window.electron.refreshTokenConfidential({
          refreshToken: this.refreshToken,
          clientId: OAUTH_CONFIG.CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          tokenUrl: OAUTH_CONFIG.TOKEN_URL
        });
        response = { data };
      } else {
        const params = new URLSearchParams();
        params.set('grant_type', 'refresh_token');
        params.set('client_id', OAUTH_CONFIG.CLIENT_ID);
        params.set('refresh_token', this.refreshToken);
        response = await axios.post(OAUTH_CONFIG.TOKEN_URL, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
      }

      const { access_token, refresh_token, expires_in } = response.data;
      
      this.accessToken = access_token;
      if (refresh_token) {
        this.refreshToken = refresh_token;
      }
      this.tokenExpiry = new Date(Date.now() + (expires_in * 1000));

      localStorage.setItem('jira_access_token', access_token);
      if (refresh_token) {
        localStorage.setItem('jira_refresh_token', refresh_token);
      }
      localStorage.setItem('jira_token_expiry', this.tokenExpiry.toISOString());

      console.log('✅ Access token refreshed successfully');
      return access_token;
      
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data || error.message);
      this.clearTokens();
      throw new Error('Token refresh failed. Please re-authenticate.');
    }
  }

  loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('jira_access_token');
    this.refreshToken = localStorage.getItem('jira_refresh_token');
    this.cloudId = localStorage.getItem('jira_cloud_id');
    
    const expiryStr = localStorage.getItem('jira_token_expiry');
    if (expiryStr) {
      this.tokenExpiry = new Date(expiryStr);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.cloudId = null;

    localStorage.removeItem('jira_access_token');
    localStorage.removeItem('jira_refresh_token');
    localStorage.removeItem('jira_token_expiry');
    localStorage.removeItem('jira_cloud_id');
  }

  isAuthenticated() {
    this.loadTokensFromStorage();
    return !!(this.accessToken && this.refreshToken && this.cloudId);
  }

  getCloudId() {
    if (!this.cloudId) {
      this.loadTokensFromStorage();
    }
    return this.cloudId;
  }
}

// Export singleton instance
export const desktopOAuthService = new DesktopOAuthService();
