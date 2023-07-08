/**
 * @file CrFile.js
 */

const fs = require('fs');
const path = require('path');
const { resolve } = require('path');
const ExifReader = require('exifreader');
const { dialog, shell } = require('electron');
const gm = require('gm').subClass({ imageMagick: '7+' });

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
   * @function cropImage
   * @param {event} event - CrFile:cropImage event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.fileName - Filename
   * @param {number} data.quality - Quality
   * @param {string} data.targetFolder - Target folder
   * @param {Array} data.crops - Crops
   * @param {number} data.crops.resizeW - the width to resize the image to
   * @param {number} data.crops.cropW - the width of the cropped area
   * @param {number} data.crops.cropH - the height of the cropped area
   * @param {number} data.crops.cropX - the offset left of the cropped area
   * @param {number} data.crops.cropY - the offset top of the cropped area
   * @param {string} data.crops.fileNameSuffix - Filename suffix
   * @returns {string} successMsg
   * @memberof CrFile
   * @static
   */
  static async cropImage(event, data) {
    const {
      fileName,
      quality,
      targetFolder,
      crops
    } = data;

    const fileNameStr = decodeURIComponent(fileName);

    const pathSeparator = fileNameStr.lastIndexOf('/');
    const fileNameAndExt = fileNameStr.slice(pathSeparator + 1);
    const fileSeparator = fileNameAndExt.lastIndexOf('.');
    const fileNameOnly = fileNameAndExt.slice(0, fileSeparator);

    crops.forEach(crop => {
      const {
        resizeW,
        cropX,
        cropY,
        cropW,
        cropH,
        fileNameSuffix
      } = crop;

      const currentDir = process.cwd();
      const targetPath = path.relative(currentDir, targetFolder);

      gm(fileNameStr)
        .strip()
        .autoOrient()
        .quality(quality)
        .crop(cropW, cropH, cropX, cropY)
        .resize(resizeW, null)
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

    let fileNameStr = fileName;
    fileNameStr = fileNameStr.replace('file://', '');
    fileNameStr = fileNameStr.replace(/%20/g, ' ');

    const dirName = path.dirname(fileNameStr);
    const fileNameAndExt = path.basename(fileNameStr); // foo.ext
    const extName = path.extname(fileNameStr); // .ext
    const fileNameOnly = fileNameAndExt.replace(extName, '');

    const folderPath = resolve(__dirname, dirName); // same same

    const oldFileName = `${folderPath}/${fileNameOnly}${extName}`;
    const regex = /__\[([0-9]+)%,([0-9]+)%\]/g;
    const newFileName = oldFileName.replace(regex, '');

    fs.rename(oldFileName, newFileName, (error) => {
      if (error) {
        console.log(error);
      }
    });

    return newFileName;
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
   * @function getFolderData
   * @summary Get the path to a folder and the supported images within it
   * @param {Array} imageFiles - Supported file types contained within the folder
   * @returns {Array} imagesData
   * @memberof CrFile
   * @static
   */
  static async getFolderData(imageFiles) {
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
   * @param {boolean} args.getImagesData - Return imagesData
   * @returns {object} { folderPath, imagesData }
   * @memberof CrFile
   * @static
   */
  static async selectFolder({ dialogTitle, dialogButtonLabel, getImagesData }) {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      defaultPath: '~/',
      title: dialogTitle,
      buttonLabel: dialogButtonLabel,
      properties: [ 'openDirectory', 'multiSelections' ]
    });

    let imagesData = [];

    if (!canceled && filePaths.length) {
      const folderPath = filePaths[0];

      if (getImagesData) {
        const files = CrFile.getFiles(folderPath);
        const imageFiles = files.filter(file => file.match(/(.gif|.jpg|.jpeg|.png)+/gi));

        imagesData = await CrFile.getFolderData(imageFiles);
      }

      return {
        folderPath,
        imagesData
      };
    }

    return {};
  }

  /**
   * @function selectFolderIn
   * @param {event} event - CrFile:selectFolderIn event captured by ipcMain.handle
   * @returns { object } { folderPath, imagesData }
   * @memberof CrFile
   * @static
   */
  static async selectFolderIn(event) { // eslint-disable-line no-unused-vars
    const { folderPath, imagesData } = await CrFile.selectFolder({
      dialogTitle: 'Source folder',
      dialogButtonLabel: 'Select folder',
      getImagesData: true
    });

    const pathSeparator = folderPath.lastIndexOf('/');
    const folderName = folderPath.slice(pathSeparator + 1);

    return { folderName, folderPath, imagesData };
  }

  /**
   * @function selectFolderOut
   * @param {event} event - CrFile:selectFolderIn event captured by ipcMain.handle
   * @returns { object } { folderPath }
   * @memberof CrFile
   * @static
   */
  static async selectFolderOut(event) { // eslint-disable-line no-unused-vars
    const { folderPath } = await CrFile.selectFolder({
      dialogTitle: 'Target folder',
      dialogButtonLabel: 'Select folder',
      getImagesData: false
    });

    const pathSeparator = folderPath.lastIndexOf('/');
    const folderName = folderPath.slice(pathSeparator + 1);

    return { folderName, folderPath };
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

    let fileNameStr = fileName;
    fileNameStr = fileNameStr.replace('file://', '');
    fileNameStr = fileNameStr.replace(/%20/g, ' ');

    const regex = /__\[([0-9]+)%,([0-9]+)%\]/g; // filename__[20%,30%].ext

    const dirName = path.dirname(fileNameStr);
    const fileNameAndExt = path.basename(fileNameStr); // foo.ext | foo__[nn%,nn%].ext
    const extName = path.extname(fileNameStr); // .ext
    const fileNameOnly = fileNameAndExt.replace(extName, '').replace(regex, ''); // foo

    const folderPath = resolve(__dirname, dirName); // same same

    const oldFileName = `${folderPath}/${fileNameAndExt}`;
    const newFileName = `${folderPath}/${fileNameOnly}__[${imagePercentX}%,${imagePercentY}%]${extName}`;

    fs.rename(oldFileName, newFileName, (error) => {
      if (error) {
        console.log(error);
      }
    });

    return newFileName;
  }
};
