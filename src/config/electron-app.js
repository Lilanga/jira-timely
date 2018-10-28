const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

require('electron-debug')();

let mainWindow;

function createWindow(){
    mainWindow = new BrowserWindow({webPreferences: {webSecurity: false}, Width:800, height:600, icon: __dirname+'/../img/jira_sm.png'});
    mainWindow.setMenu(null);

    // and load the index.html of the app.
    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true
    });
    
    mainWindow.loadURL(startUrl);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
    
    mainWindow.on('colsed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

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