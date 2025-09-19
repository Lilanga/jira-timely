const {app, BrowserWindow, ipcMain, shell, session} = require('electron');
const path = require('path');
const url = require('url');
const http = require('http');
const { URL } = require('url');
const appConfig = require('./app-config');
// Node 18+ has global fetch; node 22 in your env supports it

// Use dynamic import for ESM modules
let installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS;
let electronDebug;

let mainWindow;

function createWindow(){
    mainWindow = new BrowserWindow({
        width: 800, 
        height: 600, 
        icon: path.join(__dirname, '../img/jira_sm.png'),
        frame: false,
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    mainWindow.setMenu(null);

    // and load the index.html of the app.
    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '../../build/index.html'),
        protocol: 'file:',
        slashes: true
    });
    
    mainWindow.loadURL(startUrl);

    // Open the DevTools only in development.
    if (process.env.NODE_ENV === 'development' || process.env.ELECTRON_IS_DEV) {
        mainWindow.webContents.openDevTools();
    }
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', async () => {
    createWindow();

    try {
        const filter = { urls: ['https://*.atlassian.net/rest/api/*'] };
        session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
            const headers = {
                ...details.requestHeaders,
                'User-Agent': 'jira-timely'
            };
            callback({ requestHeaders: headers });
        });
        console.log('Custom User-Agent applied for Atlassian REST requests');
    } catch (error) {
        console.warn('Failed to apply custom User-Agent:', error);
    }

    // Only load DevTools in development
    if (process.env.NODE_ENV === 'development' || process.env.ELECTRON_IS_DEV) {
        try {
            // Dynamic import for ESM modules
            const devtoolsInstaller = await import('electron-devtools-installer');
            const installExtension = devtoolsInstaller.default;
            const { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = devtoolsInstaller;
            
            // Install extensions sequentially
            try {
                await installExtension(REACT_DEVELOPER_TOOLS);
                console.log('Added Extension: React Developer Tools');
            } catch (err) {
                console.log('React DevTools extension error:', err.message);
            }
            
            try {
                await installExtension(REDUX_DEVTOOLS);
                console.log('Added Extension: Redux DevTools');
            } catch (err) {
                console.log('Redux DevTools extension error:', err.message);
            }
            
            const debug = await import('electron-debug');
            debug.default();
            
        } catch (error) {
            console.log('DevTools extensions could not be loaded:', error);
        }
    }
});

// Window control IPC handlers
ipcMain.on('window-controls', (event, action) => {
    if (!mainWindow) return;
    switch (action) {
        case 'minimize':
            mainWindow.minimize();
            break;
        case 'maximize':
            if (mainWindow.isMaximized()) mainWindow.unmaximize();
            else mainWindow.maximize();
            break;
        case 'close':
            mainWindow.close();
            break;
        default:
            break;
    }
});

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin'){
        app.quit();
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow()
    }
})

// OAuth 2.0 Server for Desktop Authentication
let oauthServer = null;
let oauthPort = appConfig.get('oauth.callbackPort') || 8080;

// Start OAuth callback server (fixed port 8080 to match Atlassian callback URL)
ipcMain.handle('start-oauth-server', async () => {
    return new Promise((resolve, reject) => {
        if (oauthServer) {
            console.log('OAuth server already running on port:', oauthPort);
            resolve(oauthPort);
            return;
        }

        oauthServer = http.createServer((req, res) => {
            const reqUrl = new URL(req.url, `http://localhost:${oauthPort}`);
            
            console.log('OAuth callback received:', reqUrl.pathname, reqUrl.search);

            if (reqUrl.pathname === '/callback') {
                const code = reqUrl.searchParams.get('code');
                const error = reqUrl.searchParams.get('error');
                const errorDescription = reqUrl.searchParams.get('error_description');
                const state = reqUrl.searchParams.get('state');

                // Send success page
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Jira Timely - Authentication ${error ? 'Failed' : 'Successful'}</title>
                        <style>
                            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                                   text-align: center; padding: 50px; background: #f5f5f5; }
                            .container { background: white; padding: 40px; border-radius: 12px; 
                                       box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px; 
                                       margin: 0 auto; }
                            .success { color: #52c41a; font-size: 48px; margin-bottom: 20px; }
                            .error { color: #ff4d4f; font-size: 48px; margin-bottom: 20px; }
                            h1 { color: #262626; }
                            p { color: #666; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            ${error ? `
                                <div class="error">❌</div>
                                <h1>Authentication Failed</h1>
                                <p>${errorDescription || error}</p>
                            ` : `
                                <div class="success">✅</div>
                                <h1>Authentication Successful!</h1>
                                <p>You can now close this window and return to the Jira Timely app.</p>
                            `}
                        </div>
                        <script>
                            // Auto-close window after 3 seconds
                            setTimeout(() => {
                                window.close();
                            }, 3000);
                        </script>
                    </body>
                    </html>
                `);

                // Send result to renderer process
                if (mainWindow && mainWindow.webContents) {
                    mainWindow.webContents.send('oauth-callback', {
                        code,
                        error,
                        error_description: errorDescription,
                        state
                    });
                }

                // Stop server after handling callback
                setTimeout(() => {
                    if (oauthServer) {
                        oauthServer.close();
                        oauthServer = null;
                        console.log('OAuth server stopped');
                    }
                }, 1000);

            } else {
                // 404 for other paths
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Not Found</h1>');
            }
        });

        // Listen only on 8080 to ensure redirect_uri matches registered callback
        oauthPort = 8080;
        oauthServer.listen(oauthPort, 'localhost', () => {
            console.log(`✅ OAuth server started on http://localhost:${oauthPort}/callback`);
            resolve(oauthPort);
        });

        oauthServer.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                const msg = `Port ${oauthPort} is in use. Please free it or add the active port to Atlassian app callbacks.`;
                console.error('OAuth server error:', msg);
                reject(new Error(msg));
            } else {
                console.error('OAuth server error:', err);
                reject(err);
            }
        });
    });
});

// Stop OAuth callback server
ipcMain.handle('stop-oauth-server', () => {
    if (oauthServer) {
        oauthServer.close();
        oauthServer = null;
        console.log('OAuth server stopped');
    }
});

// Open external URL in system browser
ipcMain.handle('open-external', (event, url) => {
    console.log('Opening external URL:', url);
    shell.openExternal(url);
});

// OAuth callbacks will be handled by the main process

// Get app configuration for renderer process
ipcMain.handle('get-app-config', () => {
    return appConfig.getPublicConfig();
});

// Confidential client token exchange (main process) to keep client_secret out of renderer
ipcMain.handle('oauth-token-exchange', async (event, args) => {
    const { code, redirectUri, tokenUrl } = args || {};
    const clientId = appConfig.get('jira.clientId');
    const clientSecret = appConfig.get('jira.clientSecret');
    
    if (!clientId || !clientSecret) {
        throw new Error('Missing client credentials for confidential OAuth exchange');
    }
    const endpoint = tokenUrl || 'https://auth.atlassian.com/oauth/token';
    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri
    });
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
    });
    const text = await res.text();
    if (!res.ok) {
        throw new Error(`Confidential token exchange failed: ${res.status} ${text}`);
    }
    try { return JSON.parse(text); } catch (_) { return {}; }
});

ipcMain.handle('oauth-refresh-token', async (event, args) => {
    const { refreshToken, tokenUrl } = args || {};
    const clientId = appConfig.get('jira.clientId');
    const clientSecret = appConfig.get('jira.clientSecret');
    
    if (!clientId || !clientSecret) {
        throw new Error('Missing client credentials for confidential refresh');
    }
    const endpoint = tokenUrl || 'https://auth.atlassian.com/oauth/token';
    const body = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken
    });
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
    });
    const text = await res.text();
    if (!res.ok) {
        throw new Error(`Confidential token refresh failed: ${res.status} ${text}`);
    }
    try { return JSON.parse(text); } catch (_) { return {}; }
});
