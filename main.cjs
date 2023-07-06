// Electron's main process

const {
  app,
  BrowserWindow,
  ipcMain,
  Menu
} = require('electron');

const CrFile = require('./classes/CrFile.cjs');

const path = require('path');
const contextMenu = require('electron-context-menu');

// TODO store last path, maybe a .restore file?
const appName = 'Image cropper';
const appDimensions = [ 1280, 1024 ];

const createWindow = () => {
  const [ width, height ] = appDimensions;

  const mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      nodeIntegration: true, // disable sandboxing
      preload: path.join(__dirname, 'preload.cjs')
    },
    title: appName
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
  });

  // https://www.electronjs.org/docs/latest/api/webview-tag
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Show Dev Tools', click: () => { mainWindow.webContents.openDevTools(); }
        },
        {
          label: 'Force reload', click: () => { mainWindow.webContents.reloadIgnoringCache(); }
        },
        {
          label: 'Bring window to front', click: () => { mainWindow.moveTop(); }
        },
        {
          label: 'Reset window size', click: () => { mainWindow.setSize(width, height); mainWindow.center(); }
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit', click: () => { app.quit(); }
        }
      ]
    },
    {
      label: appName,
      submenu: [
        {
          label: 'Load images', click: () => { mainWindow.webContents.executeJavaScript('uiSelectFolder()'); }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  // give dev tools drawer time to open
  // so that cropper is centered in remaining space
  setTimeout(() => {
    mainWindow.loadFile('index.html');
  }, 100);
};

// Open a window if none are open (macOS)
app.whenReady().then(() => {
  // ipcMain module for inter-process communication (IPC) with render process

  ipcMain.handle('CrFile:openInFinder', CrFile.openInFinder);
  ipcMain.handle('CrFile:selectFolder', CrFile.selectFolder);
  ipcMain.handle('CrFile:deleteImagePercentXYFromImage', CrFile.deleteImagePercentXYFromImage);
  ipcMain.handle('CrFile:saveImagePercentXYToImage', CrFile.saveImagePercentXYToImage);
  ipcMain.handle('CrFile:cropImage', CrFile.cropImage);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('web-contents-created', (e, contents) => {
  contextMenu({
    window: contents,
    showSaveImageAs: true,
    showInspectElement: true
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
