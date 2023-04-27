// Electron's main process

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const ExifReader = require('exifreader');

async function handleSelectFolder () {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    defaultPath: '~/',
    title: 'Select image folder',
    buttonLabel: 'Select',
    properties: ['openDirectory', 'multiSelections']
  })
  if (!canceled) {
    const folderPath = filePaths[0];
    const files = getFiles(folderPath);

    const images = files.filter(file => file.match(/(.gif|.jpg|.jpeg|.png)+/gi));
    const imagesData = [];

    const processImages = async (images) => {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const tags = await ExifReader.load(image);
        const imageDate = tags['DateTimeOriginal'].description;

        imagesData.push({
          src: image,
          dateTimeOriginal: imageDate
        });
      }

      return imagesData;
    }

    const result = processImages(images);

    return result;
  }
}

const getFiles = (dir) => {
  return fs.readdirSync(dir).flatMap(item => {
    const path = `${dir}/${item}`;

    // get files from the directory
    if (fs.statSync(path).isDirectory()) {
      const files = getFiles(path);

      return files;
    }

    return path;
  });
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

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
