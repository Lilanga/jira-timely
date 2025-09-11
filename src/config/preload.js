const { contextBridge, ipcRenderer } = require('electron');

// Polyfill global for packages that expect it
window.global = window;

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // OAuth Server API
  startOAuthServer: () => ipcRenderer.invoke('start-oauth-server'),
  stopOAuthServer: () => ipcRenderer.invoke('stop-oauth-server'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // OAuth callback listener
  onOAuthCallback: (callback) => {
    ipcRenderer.on('oauth-callback', (event, data) => {
      callback(data);
    });
  },
  
  // Remove OAuth callback listener
  removeOAuthCallbackListener: () => {
    ipcRenderer.removeAllListeners('oauth-callback');
  },

  // Window controls (existing)
  windowControls: (action) => ipcRenderer.send('window-controls', action),

  // Confidential OAuth helpers (main process)
  exchangeTokenConfidential: (payload) => ipcRenderer.invoke('oauth-token-exchange', payload),
  refreshTokenConfidential: (payload) => ipcRenderer.invoke('oauth-refresh-token', payload)
});
