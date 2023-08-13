// Electron's main process

const {
  app,
  BrowserWindow,
  ipcMain,
  Menu
} = require('electron');

// argv[0] = path to node
// argv[1] = path to script
// args[2] = -- separating npm arguments from app's arguments
const args = process.argv.slice(3);
const showDevTools = args.indexOf('devtools') !== -1;

const FmcFile = require('./classes/FmcFile.cjs');
const FmcStore = require('./classes/FmcStore.cjs');

const path = require('path');
const contextMenu = require('electron-context-menu');

const appName = 'Focalpoint Multi-Cropper';
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
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  // Devtools need to be running from launch to enable console.log
  if (showDevTools) {
    mainWindow.webContents.openDevTools({
      mode: 'right'
    });
  }

  // give dev tools drawer time to open
  // so that cropper is centered in remaining space
  setTimeout(() => {
    mainWindow.loadFile('index.html');
  }, 100);
};

// Open a window if none are open (macOS)
app.whenReady().then(() => {
  // ipcMain module for inter-process communication (IPC) with render process

  ipcMain.handle('FmcFile:copyFromClipboard', FmcFile.copyFromClipboard);
  ipcMain.handle('FmcFile:copyToClipboard', FmcFile.copyToClipboard);
  ipcMain.handle('FmcFile:getRelativePath', FmcFile.getRelativePath);
  ipcMain.handle('FmcFile:openInEditor', FmcFile.openInEditor);
  ipcMain.handle('FmcFile:openInFinder', FmcFile.openInFinder);
  ipcMain.handle('FmcFile:pathExists', FmcFile.pathExists);
  ipcMain.handle('FmcFile:selectFile', FmcFile.selectFile);
  ipcMain.handle('FmcFile:selectFolder', FmcFile.selectFolder);
  ipcMain.handle('FmcFile:deleteImagePercentXYFromImage', FmcFile.deleteImagePercentXYFromImage);
  ipcMain.handle('FmcFile:saveImagePercentXYToImage', FmcFile.saveImagePercentXYToImage);
  ipcMain.handle('FmcFile:resizeAndCropImage', FmcFile.resizeAndCropImage);
  ipcMain.handle('FmcStore:setKeys', FmcStore.setKeys);
  ipcMain.handle('FmcStore:getActivePreset', FmcStore.getActivePreset);
  ipcMain.handle('FmcStore:getKeys', FmcStore.getKeys);
  ipcMain.handle('FmcStore:getPreset', FmcStore.getPreset);
  ipcMain.handle('FmcStore:getPresetNames', FmcStore.getPresetNames);
  ipcMain.handle('FmcStore:setActivePresetName', FmcStore.setActivePresetName);
  ipcMain.handle('FmcStore:setPreset', FmcStore.setPreset);

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
