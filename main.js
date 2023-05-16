// Electron's main process

'use strict';

const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu
} = require('electron');

const fs = require('fs');
const { rename } = require('fs');
const path = require('path');
const { resolve } = require('path');
const ExifReader = require('exifreader');
const contextMenu = require('electron-context-menu');

const appDebug = true;
const appName = 'Image cropper';
const appDimensions = [ 1280, 1024 ];

const getFiles = (dir) => {
  return fs.readdirSync(dir).flatMap(item => {
    const pth = `${dir}/${item}`;

    // get files from the directory
    if (fs.statSync(pth).isDirectory()) {
      const files = getFiles(pth);

      return files;
    }

    return pth;
  });
};

const createWindow = () => {
  const [ width, height ] = appDimensions;

  const mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      nodeIntegration: true, // disable sandboxing
      preload: path.join(__dirname, 'preload.js')
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

const getImagesData = async (imageFiles) => {
  const imagesData = [];

  for (let i = 0; i < imageFiles.length; i += 1) {
    const image = imageFiles[i];
    const tags = await ExifReader.load(image); /* eslint-disable-line no-await-in-loop */
    const imageDate = tags.DateTimeOriginal.description;

    imagesData.push({
      src: image,
      dateTimeOriginal: imageDate
    });
  }

  return imagesData;
};

// https://www.geeksforgeeks.org/node-js-fs-rename-method/
// https://nodejs.dev/en/learn/nodejs-file-paths/
const handleSaveCropCoordinatesToImage = async (event, data) => {
  const {
    fileName,
    percentageTop,
    percentageLeft
  } = data;

  let fileNameStr = fileName;
  fileNameStr = fileNameStr.replace('file://', '');
  fileNameStr = fileNameStr.replace(/%20/g, ' ');

  const dirName = path.dirname(fileNameStr);
  const fileName2 = path.basename(fileNameStr); // foo.ext
  const extName = path.extname(fileNameStr); // .ext
  const fileNameOnly = fileName2.replace(extName, '');

  const folderPath = resolve(__dirname, dirName); // same same

  // ok
  const oldFileName = `${folderPath}/${fileNameOnly}${extName}`;
  const newFileName = `${folderPath}/${fileNameOnly}__[x${percentageLeft}%-y${percentageTop}%]${extName}`;

  fs.rename(oldFileName, newFileName, (error) => {
    if (error) {
      console.log(error);
    }
  });

  return `Renamed\n ${oldFileName}\n to\n ${newFileName}`;
};

async function handleSelectFolder() {
  let canceled;
  let filePaths;

  if (appDebug) {
    canceled = false;
    filePaths = [
      "/Volumes/DanBackup4TB/Not cloud synced/Don't Believe The Hype (302.96GB)/2022.12.31 - 2023.01.08 - Wellington to Acheron, St James, Rainbow, to Wellington/Day 04 - 2023.01.03 - Aratere Valley to Acheron Campsite"
    ];
  } else {
    // https://stackoverflow.com/a/59416470
    (
      { canceled, filePaths } = await dialog.showOpenDialog({
        defaultPath: '~/',
        title: 'Select image folder',
        buttonLabel: 'Load images',
        properties: [ 'openDirectory', 'multiSelections' ]
      })
    );
  }

  let result = [];

  if (!canceled && filePaths.length) {
    const folderPath = filePaths[0];

    const files = getFiles(folderPath);

    const imageFiles = files.filter(file => file.match(/(.gif|.jpg|.jpeg|.png)+/gi));

    result = getImagesData(imageFiles);
  }

  return result;
}

// Open a window if none are open (macOS)
app.whenReady().then(() => {
  // ipcMain module for inter-process communication (IPC) with render process
  ipcMain.handle('dialog:selectFolder', handleSelectFolder);
  ipcMain.handle('test:saveCropCoordinatesToImage', handleSaveCropCoordinatesToImage);

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
