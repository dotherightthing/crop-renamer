/**
 * @file CrFile.js
 */

const fs = require('fs');
const path = require('path');
const { resolve } = require('path');
const ExifReader = require('exifreader');
const { dialog } = require('electron');

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
   * @function deleteCropCoordinates
   * @param {object} data - Data
   * @returns {string} newFileName
   * @memberof CrFile
   * @static
   */
  static async deleteCropCoordinates(data) {
    const { fileName } = data;

    let fileNameStr = fileName;
    fileNameStr = fileNameStr.replace('file://', '');
    fileNameStr = fileNameStr.replace(/%20/g, ' ');

    const dirName = path.dirname(fileNameStr);
    const fileName2 = path.basename(fileNameStr); // foo.ext
    const extName = path.extname(fileNameStr); // .ext
    const fileNameOnly = fileName2.replace(extName, '');

    const folderPath = resolve(__dirname, dirName); // same same

    const oldFileName = `${folderPath}/${fileNameOnly}${extName}`;
    const regex = /__\[([0-9]+)%,([0-9]+)%\]/g;
    const newFileName = oldFileName.replace(regex, '');

    console.log('oldFileName', oldFileName);
    console.log('newFileName', newFileName);

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
   * @param {string} folderPath - Full drive path to selected image folder
   * @param {Array} imageFiles - Supported file types contained within the folder
   * @returns {object} { folderPath, imagesData }
   * @memberof CrFile
   * @static
   */
  static async getFolderData(folderPath, imageFiles) {
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

    return {
      folderPath,
      imagesData
    };
  }

  /**
   * @function selectFolder
   * @param {event} event - CrFile:selectFolder event captured by ipcMain.handle
   * @param {object} data - Data
   * @returns {object} folderData
   * @memberof CrFile
   * @static
   */
  static async selectFolder(event, data) {
    const { appDebugDir } = data;

    let canceled;
    let filePaths;

    if (appDebugDir !== '') {
      canceled = false;
      filePaths = [ appDebugDir ];
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

    let folderData = {};

    if (!canceled && filePaths.length) {
      const folderPath = filePaths[0];

      const files = CrFile.getFiles(folderPath);

      const imageFiles = files.filter(file => file.match(/(.gif|.jpg|.jpeg|.png)+/gi));

      (folderData = await CrFile.getFolderData(folderPath, imageFiles)); // promise
    }

    return folderData; // { folderPath, imagesData }
  }

  /**
   * @function saveCropCoordinates
   * @param {object} data - Data
   * @returns {string} newFileName
   * @memberof CrFile
   * @static
   * @see {@link https://www.geeksforgeeks.org/node-js-fs-rename-method/ }
   * @see {@link https://nodejs.dev/en/learn/nodejs-file-paths/ }
   */
  static async saveCropCoordinates(data) {
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
    const fileName2 = path.basename(fileNameStr); // foo.ext
    const extName = path.extname(fileNameStr); // .ext
    const fileNameOnly = fileName2.replace(extName, '').replace(regex, '');

    const folderPath = resolve(__dirname, dirName); // same same

    const oldFileName = `${folderPath}/${fileNameOnly}${extName}`;
    const newFileName = `${folderPath}/${fileNameOnly}__[${imagePercentX}%,${imagePercentY}%]${extName}`;

    console.log('oldFileName', oldFileName);
    console.log('newFileName', newFileName);

    fs.rename(oldFileName, newFileName, (error) => {
      if (error) {
        console.log(error);
      }
    });

    return newFileName;
  }
};
