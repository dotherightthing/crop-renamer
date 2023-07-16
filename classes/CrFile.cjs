/**
 * @file CrFile.js
 */

const fs = require('fs');
const path = require('path');
const { resolve } = require('path');
const ExifReader = require('exifreader');
const { dialog, shell } = require('electron');
const gm = require('gm').subClass({ imageMagick: '7+' });
const Store = require('./store.js');

const store = new Store({
  configName: 'user-preferences',
  defaults: {}
});

module.exports = class CrFile { // eslint-disable-line no-unused-vars
  /**
   * @class CrFile
   * @summary Manages file manipulation
   * @param {object} config - Instance config
   * @public
   */

  /* Getters and Setters */

  /* Instance methods */

  /* Static methods */

  /**
   * @function resizeAndCropImage
   * @param {event} event - CrFile:resizeAndCropImage event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.fileName - Filename
   * @param {number} data.quality - Quality
   * @param {string} data.targetFolder - Target folder
   * @param {Array} data.crops - Crops
   * @param {number} data.crops.resizeW - the width to resize the image to
   * @param {number} data.crops.resizeH - the width to resize the image to
   * @param {number} data.crops.cropW - the width of the cropped area
   * @param {number} data.crops.cropH - the height of the cropped area
   * @param {number} data.crops.cropX - the offset left of the cropped area
   * @param {number} data.crops.cropY - the offset top of the cropped area
   * @param {string} data.crops.fileNameSuffix - Filename suffix
   * @returns {string} successMsg
   * @memberof CrFile
   * @static
   */
  static async resizeAndCropImage(event, data) {
    const {
      fileName,
      quality,
      targetFolder,
      crops
    } = data;

    const { fileNameOnly, fileNameRaw } = CrFile.getFileNameParts(fileName);

    crops.forEach(crop => {
      const {
        resizeW,
        // resizeH,
        cropX,
        cropY,
        cropW,
        cropH,
        fileNameSuffix
      } = crop;

      const currentDir = process.cwd();
      const targetPath = path.relative(currentDir, targetFolder);

      // resizing based on a known width but unknown (null) height (and vice versa)
      //
      // might be better to add explicit data- options so this magic is not hidden from users
      // this logic needs fixing when i am more awake so that
      // 1. width is the default axis to resize on, unless it is null
      const _resizeW = (resizeW !== null) ? resizeW : null;
      // const _resizeH = (resizeH !== null) ? resizeH : null;

      // if (typeof cropX !== 'undefined')

      gm(fileNameRaw)
        .strip()
        .autoOrient()
        .quality(quality) // TODO possibly remove this line for PNG
        .crop(cropW, cropH, cropX, cropY)
        .resize(_resizeW, null) // TODO make this possible to have width null
        .write(`${targetPath}/${fileNameOnly}__${fileNameSuffix}.jpg`, err => {
          if (err) {
            console.log(err);
          } else {
            console.log(`Cropped ${fileNameOnly}__${fileNameSuffix}.jpg`);
          }
        });
    });

    return 'Crops generated';
  }

  /**
   * @function resizeImage
   * @param {event} event - CrFile:resizeImage event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.fileName - Filename
   * @param {number} data.quality - Quality
   * @param {string} data.targetFolder - Target folder
   * @param {Array} data.crops - Crops
   * @param {number} data.crops.resizeW - the width to resize the image to
   * @param {number} data.crops.resizeH - the height to resize the image to
   * @param {string} data.crops.fileNameSuffix - Filename suffix
   * @returns {string} successMsg
   * @memberof CrFile
   * @static
   */
  static async resizeImage(event, data) {
    const {
      fileName,
      quality,
      targetFolder,
      resizes
    } = data;

    const { fileNameOnly, fileNameRaw } = CrFile.getFileNameParts(fileName);

    resizes.forEach(resize => {
      const {
        resizeW,
        resizeH,
        fileNameSuffix
      } = resize;

      const currentDir = process.cwd();
      const targetPath = path.relative(currentDir, targetFolder);

      gm(fileNameRaw)
        .strip()
        .autoOrient()
        .quality(quality) // TODO possibly remove this line for PNG
        .resize(resizeW, resizeH)
        .write(`${targetPath}/${fileNameOnly}__${fileNameSuffix}.jpg`, err => {
          if (err) {
            console.log(err);
          } else {
            console.log(`Resized ${fileNameOnly}__${fileNameSuffix}.jpg`);
          }
        });
    });

    return 'Sizes generated';
  }

  /**
   * @function deleteImagePercentXYFromImage
   * @param {event} event - CrFile:openInFinder event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.fileName - Filename
   * @returns {string} newFileName
   * @memberof CrFile
   * @static
   */
  static async deleteImagePercentXYFromImage(event, data) {
    const { fileName } = data;

    const {
      fileNameAndExt,
      folderPath
    } = CrFile.getFileNameParts(fileName);

    const regex = /__\[([0-9]+)%,([0-9]+)%\]/g; // filename__[20%,30%].ext

    const oldFileName = `${folderPath}/${fileNameAndExt}`;
    const newFileName = oldFileName.replace(regex, '');

    if (newFileName !== oldFileName) {
      fs.rename(oldFileName, newFileName, (error) => {
        if (error) {
          console.log(error);
        }
      });
    }

    return newFileName;
  }

  /**
   * @function getFileNameParts
   * @param {string} fileName - File name
   * @returns {object} parts
   * @memberof CrFile
   * @static
   */
  static getFileNameParts(fileName) {
    let fileNameRaw = fileName;
    fileNameRaw = fileNameRaw.replace('file://', '');
    fileNameRaw = fileNameRaw.replace(/%20/g, ' ');

    const dirName = path.dirname(fileNameRaw);
    const fileNameAndExt = path.basename(fileNameRaw); // foo.ext | foo__[nn%,nn%].ext
    const extName = path.extname(fileNameRaw); // .ext
    const fileNameOnly = fileNameAndExt.replace(extName, ''); // foo | foo__[nn%,nn%]
    const folderPath = resolve(__dirname, dirName);

    return {
      extName,
      fileNameAndExt,
      fileNameOnly,
      folderPath,
      fileNameRaw
    };
  }

  /**
   * @function getFiles
   * @param {string} dir - Directory path
   * @returns {Array} files
   * @memberof CrFile
   * @static
   */
  static getFiles(dir) {
    return fs.readdirSync(dir).flatMap(item => {
      const pth = `${dir}/${item}`;

      // get files from the directory
      if (fs.statSync(pth).isDirectory()) {
        const files = CrFile.getFiles(pth);

        return files;
      }

      return pth;
    });
  }

  /**
   * @function getImageFiles
   * @param {string} dir - Directory path
   * @returns {Array} files
   * @memberof CrFile
   * @static
   */
  static getImageFiles(dir) {
    const files = CrFile.getFiles(dir);

    return files.filter(file => file.match(/(.gif|.jpg|.jpeg|.png)+/gi));
  }

  /**
   * @function getImagesData
   * @summary Get the path to a folder and the supported images within it
   * @param {Array} imageFiles - Supported file types contained within the folder
   * @returns {Array} imagesData
   * @memberof CrFile
   * @static
   */
  static async getImagesData(imageFiles) {
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
  }

  /**
   * @function openInFinder
   * @param {event} event - CrFile:openInFinder event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.href - HREF
   * @memberof CrFile
   * @static
   */
  static openInFinder(event, data) {
    const { href } = data;

    shell.showItemInFolder(href);
  }

  /**
   * @function selectFolder
   * @param {object} args - Arguments
   * @param {string} args.dialogTitle - Dialog title
   * @param {string} args.dialogButtonLabel - Dialog button label
   * @param {string} args.restore - Restore previously stored return
   * @param {string} args.storeKey - Store return value with this key
   * @param {boolean} args.retrieveImagesData - Return imagesData
   * @returns {object} { folderPath, imagesData }
   * @memberof CrFile
   * @static
   */
  static async selectFolder({
    dialogTitle, dialogButtonLabel, retrieveImagesData, restore, storeKey
  }) {
    if (restore) {
      const data = await CrFile.storeGet(null, {
        key: storeKey
      });

      if (typeof data !== 'undefined') {
        const { folderName, folderPath } = data;

        if ((typeof folderName === 'undefined') || (typeof folderPath === 'undefined')) {
          return {};
        }

        if (retrieveImagesData) {
          const imageFiles = CrFile.getImageFiles(data.folderPath);

          const dataCopy = { ...data }; // #30

          // imagesData retrieved separately to accommodate file renaming in the interim
          dataCopy.imagesData = await CrFile.getImagesData(imageFiles);

          return dataCopy;
        }

        return data; // !retrieveImagesData
      }

      return {};
    }

    const { canceled, filePaths } = await dialog.showOpenDialog({
      buttonLabel: dialogButtonLabel,
      defaultPath: '~/',
      message: dialogTitle,
      properties: [
        'createDirectory',
        'openDirectory',
        'showHiddenFiles'
      ],
      title: dialogTitle
    });

    if (!canceled && filePaths.length) {
      const folderPath = filePaths[0];
      let imagesData = [];

      if (retrieveImagesData) {
        const imageFiles = CrFile.getImageFiles(folderPath);

        imagesData = await CrFile.getImagesData(imageFiles);
      }

      const pathSeparator = folderPath.lastIndexOf('/');
      const folderName = folderPath.slice(pathSeparator + 1);

      const data = {
        folderName,
        folderPath,
        imagesData
      };

      CrFile.storeSet(null, {
        key: storeKey,
        value: {
          folderName,
          folderPath
        }
      });

      return data;
    }

    return {};
  }

  /**
   * @function selectFolderIn
   * @param {event} event - CrFile:selectFolderIn event captured by ipcMain.handle
   * @param {boolean} restore - Restore setting if it was previously stored
   * @returns { object } { folderPath, imagesData }
   * @memberof CrFile
   * @static
   */
  static async selectFolderIn(event, restore = false) { // eslint-disable-line no-unused-vars
    const { folderName, folderPath, imagesData } = await CrFile.selectFolder({
      dialogTitle: 'Source folder',
      dialogButtonLabel: 'Select folder',
      retrieveImagesData: true,
      restore,
      storeKey: 'folderIn'
    });

    if ((typeof folderName === 'undefined') || (typeof folderPath === 'undefined') || (typeof imagesData === 'undefined')) {
      return {};
    }

    return { folderName, folderPath, imagesData };
  }

  /**
   * @function selectFolderOut
   * @param {event} event - CrFile:selectFolderIn event captured by ipcMain.handle
   * @param {boolean} restore - Restore setting if it was previously stored
   * @returns { object } { folderPath }
   * @memberof CrFile
   * @static
   */
  static async selectFolderOut(event, restore = false) { // eslint-disable-line no-unused-vars
    const { folderName, folderPath } = await CrFile.selectFolder({
      dialogTitle: 'Target folder',
      dialogButtonLabel: 'Select folder',
      retrieveImagesData: false,
      restore,
      storeKey: 'folderOut'
    });

    if ((typeof folderName === 'undefined') || (typeof folderPath === 'undefined')) {
      return {};
    }

    return { folderName, folderPath };
  }

  /**
   * @function storeGet
   * @param {event|null} event - CrFile:storeGet event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.key - Key
   * @returns {*} value
   * @memberof CrFile
   * @static
   */
  static async storeGet(event, data) {
    const { key } = data;

    const value = await store.get(key, (error) => {
      if (error) {
        throw error;
      }
    });

    return value;
  }

  /**
   * @function storeSet
   * @param {event|null} event - CrFile:storeSet event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.key - Key
   * @param {*} data.value - Value
   * @memberof CrFile
   * @static
   */
  static storeSet(event, data) {
    const { key, value } = data;

    store.set(key, value, (error) => {
      if (error) {
        throw error;
      }
    });
  }

  /**
   * @function saveImagePercentXYToImage
   * @param {event} event - CrFile:saveImagePercentXYToImage event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.fileName - File name
   * @param {number} data.imagePercentX - Image percent X
   * @param {number} data.imagePercentY - Image percent Y
   * @returns {string} newFileName
   * @memberof CrFile
   * @static
   * @see {@link https://www.geeksforgeeks.org/node-js-fs-rename-method/ }
   * @see {@link https://nodejs.dev/en/learn/nodejs-file-paths/ }
   */
  static async saveImagePercentXYToImage(event, data) {
    const {
      fileName,
      imagePercentY,
      imagePercentX
    } = data;

    const {
      extName,
      fileNameAndExt,
      fileNameOnly,
      folderPath
    } = CrFile.getFileNameParts(fileName);

    const regex = /__\[([0-9]+)%,([0-9]+)%\]/g; // filename__[20%,30%].ext

    const fileNameOnlyNoRegex = fileNameOnly.replace(regex, ''); // foo

    const oldFileName = `${folderPath}/${fileNameAndExt}`;
    const newFileName = `${folderPath}/${fileNameOnlyNoRegex}__[${imagePercentX}%,${imagePercentY}%]${extName}`;

    if (newFileName !== oldFileName) {
      fs.rename(oldFileName, newFileName, (error) => {
        if (error) {
          console.log(error);
        }
      });
    }

    return newFileName;
  }
};
