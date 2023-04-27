// Electron's main process

const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const fs = require('fs');
const path = require('path');
const ExifReader = require('exifreader');

const appName = 'Image cropper';
const appDimensions = [ 1280, 1024 ];

async function handleSelectFolder () {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    defaultPath: '~/',
    title: 'Select image folder',
    buttonLabel: 'Load images',
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
  const [ width, height ] = appDimensions;

  const mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    title: appName
  });

  // https://www.electronjs.org/docs/latest/api/webview-tag
  const template = [
    {
      label: 'File', submenu: [
        {
          label: 'Show Dev Tools', click:() => { mainWindow.webContents.openDevTools(); }
        },
        {
          label: 'Force reload', click: () => { mainWindow.webContents.reloadIgnoringCache(); }
        },
        {
          label: 'Bring window to front', click:() => { mainWindow.moveTop(); }
        },
        {
          label: 'Reset window size', click:() => { mainWindow.setSize(width, height); mainWindow.center(); }
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
      label: appName, submenu: [
        {
          label: 'Load images', click: () => { mainWindow.webContents.executeJavaScript('uiSelectFolder()'); }
        },
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

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
