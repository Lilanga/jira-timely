// Unified OAuth service selector for web vs Electron
import { isElectron } from '../../config/oauth';
import { oauthService as webOAuthService } from '../oauthService';
import { desktopOAuthService } from '../desktopOAuthService';

// Pick the correct service at runtime
const active = isElectron() ? desktopOAuthService : webOAuthService;

export const oauth = {
  exchangeCodeForToken: (...args) => active.exchangeCodeForToken?.(...args),
  getAccessibleSites: (...args) => active.getAccessibleSites?.(...args),
  refreshAccessToken: (...args) => active.refreshAccessToken?.(...args),
  getValidAccessToken: (...args) => active.getValidAccessToken?.(...args),
  loadTokensFromStorage: (...args) => active.loadTokensFromStorage?.(...args),
  clearTokens: (...args) => active.clearTokens?.(...args),
  isAuthenticated: (...args) => active.isAuthenticated?.(...args),
  getCloudId: (...args) => active.getCloudId?.(...args),
};

export default oauth;

