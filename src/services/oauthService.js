import axios from 'axios';
import { OAUTH_CONFIG } from '../config/oauth';

class OAuthService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.cloudId = null;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code) {
    try {
      const tokenData = {
        grant_type: 'authorization_code',
        client_id: OAUTH_CONFIG.CLIENT_ID,
        client_secret: OAUTH_CONFIG.CLIENT_SECRET,
        code: code,
        redirect_uri: OAUTH_CONFIG.REDIRECT_URI
      };

      console.log('Exchanging code for token...');
      
      const response = await axios.post(OAUTH_CONFIG.TOKEN_URL, tokenData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

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
      throw new Error(`Token exchange failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  // Get accessible Jira sites for the user
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
        // Use the first site by default (you can let user choose later)
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

  // Refresh access token using refresh token
  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const tokenData = {
        grant_type: 'refresh_token',
        client_id: OAUTH_CONFIG.CLIENT_ID,
        client_secret: OAUTH_CONFIG.CLIENT_SECRET,
        refresh_token: this.refreshToken
      };

      const response = await axios.post(OAUTH_CONFIG.TOKEN_URL, tokenData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const { access_token, refresh_token, expires_in } = response.data;
      
      // Update tokens
      this.accessToken = access_token;
      if (refresh_token) {
        this.refreshToken = refresh_token;
      }
      this.tokenExpiry = new Date(Date.now() + (expires_in * 1000));

      // Update localStorage
      localStorage.setItem('jira_access_token', access_token);
      if (refresh_token) {
        localStorage.setItem('jira_refresh_token', refresh_token);
      }
      localStorage.setItem('jira_token_expiry', this.tokenExpiry.toISOString());

      console.log('✅ Access token refreshed successfully');
      return access_token;
      
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data || error.message);
      // Clear invalid tokens
      this.clearTokens();
      throw new Error('Token refresh failed. Please re-authenticate.');
    }
  }

  // Get valid access token (refresh if needed)
  async getValidAccessToken() {
    // Load tokens from localStorage if not in memory
    if (!this.accessToken) {
      this.loadTokensFromStorage();
    }

    if (!this.accessToken) {
      throw new Error('No access token available. Please authenticate.');
    }

    // Check if token is expired or will expire in next 5 minutes
    const now = new Date();
    const expiryBuffer = new Date(this.tokenExpiry.getTime() - 5 * 60 * 1000); // 5 minutes buffer

    if (now >= expiryBuffer) {
      console.log('Access token expired or expiring soon, refreshing...');
      await this.refreshAccessToken();
    }

    return this.accessToken;
  }

  // Load tokens from localStorage
  loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('jira_access_token');
    this.refreshToken = localStorage.getItem('jira_refresh_token');
    this.cloudId = localStorage.getItem('jira_cloud_id');
    
    const expiryStr = localStorage.getItem('jira_token_expiry');
    if (expiryStr) {
      this.tokenExpiry = new Date(expiryStr);
    }

    console.log('Tokens loaded from storage:', {
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken,
      hasCloudId: !!this.cloudId,
      tokenExpiry: this.tokenExpiry
    });
  }

  // Clear all tokens
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

  // Check if user is authenticated
  isAuthenticated() {
    this.loadTokensFromStorage();
    return !!(this.accessToken && this.refreshToken && this.cloudId);
  }

  // Get Cloud ID for API calls
  getCloudId() {
    if (!this.cloudId) {
      this.loadTokensFromStorage();
    }
    return this.cloudId;
  }
}

// Export singleton instance
export const oauthService = new OAuthService();