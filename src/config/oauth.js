// Web Crypto based PKCE helpers
const enc = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

function base64UrlEncode(bytes) {
  const bin = String.fromCharCode.apply(null, Array.from(bytes));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// OAuth 2.0 Configuration for Desktop Application
export const OAUTH_CONFIG = {
  // Replace with your actual Client ID from Atlassian Developer Console
  CLIENT_ID: process.env.REACT_APP_JIRA_CLIENT_ID || 'your-client-id',
  CLIENT_SECRET: process.env.REACT_APP_JIRA_CLIENT_SECRET,
  USE_CONFIDENTIAL: (process.env.REACT_APP_OAUTH_CONFIDENTIAL || '').toLowerCase() === 'true',
  // No CLIENT_SECRET needed for PKCE flow (more secure for desktop apps)
  
  // OAuth endpoints
  AUTHORIZATION_URL: 'https://auth.atlassian.com/authorize',
  TOKEN_URL: 'https://auth.atlassian.com/oauth/token',
  
  // Desktop app callback - using localhost with dynamic port
  REDIRECT_URI: 'http://localhost:8080/callback',
  
  // Required scopes for Jira operations
  SCOPES: [
    'read:jira-user',        // Get user information
    'read:jira-work',        // Read worklogs
    'write:jira-work',       // Create/edit worklogs
    'read:issue-meta:jira',  // Read issue metadata
    'write:issue:jira',      // Edit issues
    'read:project:jira',     // Access project data
    'offline_access'         // Refresh tokens
  ].join(' '),
  
  // Audience for Jira Cloud
  AUDIENCE: 'api.atlassian.com'
};

// PKCE (Proof Key for Code Exchange) functions for desktop security
export const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
};

export const generateCodeChallenge = async (verifier) => {
  const data = enc.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
};

// Generate OAuth authorization URL with PKCE
export const generateAuthUrl = (state, codeChallenge) => {
  const params = new URLSearchParams({
    audience: OAUTH_CONFIG.AUDIENCE,
    client_id: OAUTH_CONFIG.CLIENT_ID,
    scope: OAUTH_CONFIG.SCOPES,
    redirect_uri: OAUTH_CONFIG.REDIRECT_URI,
    response_type: 'code',
    state: state || generateRandomState(),
    prompt: 'consent',
    // PKCE parameters
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });
  
  return `${OAUTH_CONFIG.AUTHORIZATION_URL}?${params.toString()}`;
};

// Generate random state for CSRF protection
export const generateRandomState = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Validate state parameter
export const validateState = (receivedState, expectedState) => {
  return receivedState === expectedState;
};

// Check if running in Electron
export const isElectron = () => {
  return typeof window !== 'undefined' && window.electron !== undefined;
};
