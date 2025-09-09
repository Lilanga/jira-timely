const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

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
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
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

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', async () => {
    createWindow();
    
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