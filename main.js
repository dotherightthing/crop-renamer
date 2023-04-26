// Electron's main process

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

async function handleSelectFolder () {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    defaultPath: '~/',
    title: 'Select image folder',
    buttonLabel: 'Select',
    properties: ['openDirectory', 'multiSelections']
  })
  if (canceled) {

  } else {
    return filePaths[0];
  }
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const getFiles = (dir) => {
    return fs.readdirSync(dir).flatMap(item => {
      const path = `${dir}/${item}`;
      if (fs.statSync(path).isDirectory()) {
        return getFiles(path);
      }
  
      return path;
    });
  }

  mainWindow.loadFile('index.html');
}

// Open a window if none are open (macOS)
app.whenReady().then(() => {
  // ipcMain module for inter-process communication (IPC) with render process
  ipcMain.handle('dialog:selectFolder', handleSelectFolder);
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  })
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
