/**
 * @file CrFile.js
 */

const fs = require('fs');
const { promises: Fs } = require('fs');
const path = require('path');
const process = require('process');
const ExifReader = require('exifreader');
const { clipboard, dialog, shell } = require('electron');
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
   * @function copyToClipboard
   * @param {event} event - CrFile:copyToClipboard event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.text - Text
   * @memberof CrFile
   * @static
   */
  static copyToClipboard(event, data) {
    const { text } = data;

    clipboard.writeText(text);
  }

  /**
   * getFocalpointRegex
   * @returns {string} regex
   * @memberof CrCroppersUi
   * @static
   */
  static getFocalpointRegex() {
    return /__\[([0-9]+)%,([0-9]+)%\]/g; // filename__[20%,30%].ext
  }

  /**
   * @function resizeAndCropImage
   * @param {event} event - CrFile:resizeAndCropImage event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.fileName - Filename
   * @param {number} data.quality - Quality
   * @param {string} data.targetFolder - Target folder
   * @param {Array} data.cropsAndSizes - Crops and sizes
   * @param {number|null} data.cropsAndSizes.resizeW - the width to resize the image to
   * @param {number|null} data.cropsAndSizes.resizeH - the width to resize the image to
   * @param {number|undefined} data.cropsAndSizes.cropW - the width of the cropped area
   * @param {number|undefined} data.cropsAndSizes.cropH - the height of the cropped area
   * @param {number|undefined} data.cropsAndSizes.cropX - the offset left of the cropped area
   * @param {number|undefined} data.cropsAndSizes.cropY - the offset top of the cropped area
   * @param {string} data.cropsAndSizes.fileNameSuffix - Filename suffix
   * @returns {string} baseExportPath
   * @memberof CrFile
   * @static
   */
  static async resizeAndCropImage(event, data) {
    const {
      fileName,
      quality,
      targetFolder,
      cropsAndSizes
    } = data;

    const {
      extName,
      fileNameOnly,
      fileNameClean
    } = CrFile.getFileNameParts(fileName);

    const currentDir = process.cwd();
    const sourceFileName = fileNameClean;
    const targetPath = path.relative(currentDir, targetFolder);
    const baseExportPath = `${targetPath}/${fileNameOnly}${extName}`;

    // forEach doesn't work here
    // see https://masteringjs.io/tutorials/fundamentals/async-foreach
    // see https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
    // see https://www.techiediaries.com/promise-all-map-async-await-example/ - Promise.all + map didn't work
    for (let i = 0; i < cropsAndSizes.length; i += 1) {
      const {
        fileNameSuffix,
        cropX,
        cropY,
        cropW,
        cropH,
        resizeW,
        resizeH
      } = cropsAndSizes[i];

      const suffix = (fileNameSuffix !== '') ? `__${fileNameSuffix}` : '';
      const targetFilename = `${targetPath}/${fileNameOnly}${suffix}${extName}`;

      // resizing based on a known width but unknown (null) height (and vice versa)
      //
      // might be better to add explicit data- options so this magic is not hidden from users
      // this logic needs fixing when i am more awake so that
      // 1. width is the default axis to resize on, unless it is null
      const _resizeW = (resizeW !== null) ? resizeW : null;
      // const _resizeH = (resizeH !== null) ? resizeH : null;

      const successMessage = await CrFile.gmResizeAndCrop({ // eslint-disable-line no-await-in-loop
        sourceFileName,
        targetFilename,
        quality,
        cropX,
        cropY,
        cropW,
        cropH,
        resizeW: _resizeW,
        resizeH
      });

      console.log(successMessage);
    }

    return baseExportPath;
  }

  /**
   * @function gmResizeAndCrop
   * @param {object} data - Data
   * @param {string} data.sourceFileName - Source file name
   * @param {number} data.quality - Quality
   * @param {number|undefined} data.cropX - the offset left of the cropped area
   * @param {number|undefined} data.cropY - the offset top of the cropped area
   * @param {number|undefined} data.cropW - the width of the cropped area
   * @param {number|undefined} data.cropH - the height of the cropped area
   * @param {number} data.resizeW - the width to resize the image to
   * @param {number|undefined} data.resizeH - the height to resize the image to
   * @param {string} data.targetFilename - Export filename
   * @returns {string} successMessage
   * @memberof CrFile
   * @static
   */
  static async gmResizeAndCrop(data) {
    const {
      sourceFileName,
      quality,
      cropX,
      cropY,
      cropW,
      cropH,
      resizeW,
      resizeH,
      targetFilename
    } = data;

    const isCrop = ((typeof cropX !== 'undefined') && (typeof cropY !== 'undefined') && (typeof cropW !== 'undefined') && (typeof cropH !== 'undefined'));

    if (isCrop) {
      return new Promise((resolve, reject) => {
        gm(sourceFileName)
          .strip()
          .autoOrient()
          .quality(quality) // TODO possibly remove this line for PNG
          .crop(cropW, cropH, cropX, cropY)
          .resize(resizeW, null) // TODO make this possible to have width null
          .write(targetFilename, err => {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              resolve(`Generated crop ${targetFilename}`);
            }
          });
      });
    }

    return new Promise((resolve, reject) => {
      gm(sourceFileName)
        .strip()
        .autoOrient()
        .quality(quality) // TODO possibly remove this line for PNG
        .resize(resizeW, resizeH)
        .write(targetFilename, err => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(`Generated size ${targetFilename}`);
          }
        });
    });
  }

  /**
   * @function getRelativePath
   * @param {event} event - CrFile:getRelativePath event captured by ipcMain.handle
   * @summary Get the relative path from From to To based on the selected Base directory
   * @param {object} data - Data
   * @param {string} data.base - Website path
   * @param {string} data.from - From path
   * @param {string} data.to - To path
   * @returns {string} relativePath
   * @memberof CrFile
   * @static
   */
  static getRelativePath(event, data) {
    const {
      base,
      from,
      to
    } = data;

    const appFolder = process.cwd();

    process.chdir(base);

    const relativePath = path.relative(from, to);

    process.chdir(appFolder);

    return relativePath;
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

    const regex = CrFile.getFocalpointRegex();

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
   * @function pathExists
   * @param {event} event - CrFile:fileExists event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.path - Path
   * @returns {boolean} exists
   * @memberof CrFile
   * @static
   * @see {@link https://futurestud.io/tutorials/node-js-check-if-a-file-exists}
   */
  static async pathExists(event, data) {
    const {
      path: filePath
    } = data;

    try {
      await Fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @function getFileNameParts
   * @param {string} fileName - File name
   * @returns {object} parts
   * @memberof CrFile
   * @static
   */
  static getFileNameParts(fileName) {
    const fileNameAndExt = path.basename(fileName); // Filename.ext | Filename__[nn%,nn%].ext
    const extName = path.extname(fileName); // .ext
    const fileNameOnly = fileNameAndExt.replace(extName, ''); // Filename | Filename__[nn%,nn%]
    const fileNameClean = fileName.replace('file://', '').replace(/%20/g, ' '); // /Volumes/Foo/Bar/Baz/Filename.ext
    const folderPath = path.dirname(fileNameClean); // /Volumes/Foo/Bar/Baz

    return {
      extName,
      fileNameAndExt,
      fileNameOnly,
      folderPath,
      fileNameClean
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
   * @function selectFolderDialog
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
  static async selectFolderDialog({
    dialogTitle,
    dialogButtonLabel,
    retrieveImagesData,
    restore,
    storeKey
  }) {
    let folderPath;

    const data = await CrFile.storeGet(null, {
      key: storeKey
    });

    if (typeof data !== 'undefined') {
      ({
        folderPath = '~/' // default
      } = data);
    }

    if (restore) {
      if (typeof data === 'undefined') {
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

    const { canceled, filePaths } = await dialog.showOpenDialog({
      buttonLabel: dialogButtonLabel,
      defaultPath: folderPath,
      message: dialogTitle,
      properties: [
        'createDirectory',
        'openDirectory',
        'showHiddenFiles'
      ],
      title: dialogTitle
    });

    if (!canceled && filePaths.length) {
      let imagesData = [];

      folderPath = filePaths[0];

      if (retrieveImagesData) {
        const imageFiles = CrFile.getImageFiles(folderPath);

        imagesData = await CrFile.getImagesData(imageFiles);
      }

      const pathSeparator = folderPath.lastIndexOf('/');
      const folderName = folderPath.slice(pathSeparator + 1);

      data = {
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
   * @function selectFolder
   * @param {event} event - CrFile:selectFolder event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.dialogTitle - Title for the dialog
   * @param {boolean} data.retrieveImagesData - Get information about images in the folder
   * @param {boolean} data.restore - Restore setting if it was previously stored
   * @param {string} data.storeKey - Key under which to persist the folder path in the JSON file
   * @returns { object } { folderName, folderPath, imagesData }
   * @memberof CrFile
   * @static
   */
  static async selectFolder(event, data) { // eslint-disable-line no-unused-vars
    const {
      dialogTitle,
      retrieveImagesData,
      restore,
      storeKey
    } = data;

    // if getImagesData
    if (retrieveImagesData) {
      const { folderName, folderPath, imagesData } = await CrFile.selectFolderDialog({
        dialogTitle,
        dialogButtonLabel: 'Select folder',
        retrieveImagesData,
        restore,
        storeKey
      });

      if ((typeof folderName === 'undefined') || (typeof folderPath === 'undefined') || (typeof imagesData === 'undefined')) {
        return {};
      }

      return { folderName, folderPath, imagesData };
    }

    // if !getImagesData
    const { folderName, folderPath } = await CrFile.selectFolderDialog({
      dialogTitle,
      dialogButtonLabel: 'Select folder',
      retrieveImagesData,
      restore,
      storeKey
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

    const regex = CrFile.getFocalpointRegex();

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
