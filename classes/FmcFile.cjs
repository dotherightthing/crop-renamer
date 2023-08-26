/**
 * @file FmcFile.js
 */

const commandExists = require('command-exists');
const ExifReader = require('exifreader');
const fs = require('fs');
const gm = require('gm').subClass({ imageMagick: '7+' });
const path = require('path');
const process = require('process');
const FmcStore = require('./FmcStore.cjs');

const { clipboard, dialog, shell } = require('electron');
const { promises: Fs } = require('fs');
const { spawn } = require('child_process');

module.exports = class FmcFile {
  /**
   * @class FmcFile
   * @summary Manages file manipulation
   * @param {object} config - Instance config
   * @public
   */

  /* Getters and Setters */

  /* Instance methods */

  /* Static methods */

  /**
   * @function copyFromClipboard
   * @returns {string} text
   * @memberof FmcFile
   * @static
   */
  static async copyFromClipboard() {
    const text = await clipboard.readText();

    return text;
  }

  /**
   * @function copyToClipboard
   * @param {event} event - FmcFile:copyToClipboard event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.text - Text
   * @memberof FmcFile
   * @static
   */
  static copyToClipboard(event, data) {
    const { text } = data;

    clipboard.writeText(text);
  }

  /**
   * getFocalpointRegex
   * @returns {string} regex
   * @memberof FmcCroppersUi
   * @static
   */
  static getFocalpointRegex() {
    return /__\[([0-9]+)%,([0-9]+)%\]/g; // filename__[20%,30%].ext
  }

  /**
   * @function resizeAndCropImage
   * @param {event} event - FmcFile:resizeAndCropImage event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.fileName - Filename
   * @param {number} data.quality - Quality
   * @param {string} data.targetFolder - Target folder
   * @param {Array} data.cropsAndSizes - Crops and sizes
   * @returns {object} { baseExportPath, counts }
   * @memberof FmcFile
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
    } = FmcFile.getFileNameParts(fileName);

    const counts = {
      deletions: 0,
      crops: 0,
      resizes: 0
    };

    const currentDir = process.cwd();
    const targetPath = path.relative(currentDir, targetFolder);
    const baseExportPath = `${targetPath}/${fileNameOnly}${extName}`;

    // delete existing files
    const regex = FmcFile.getFocalpointRegex();
    const baseTargetFilename = fileNameOnly.replace(regex, '');
    const files = await FmcFile.getImageFiles(targetFolder);
    const matchingFiles = files.filter(filePath => filePath.match(baseTargetFilename));

    matchingFiles.forEach(file => {
      fs.unlinkSync(file, err => {
        if (err) {
          throw err;
        }
      });
    });

    counts.deletions = matchingFiles.length;

    // forEach doesn't work here
    // see https://masteringjs.io/tutorials/fundamentals/async-foreach
    // see https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
    // see https://www.techiediaries.com/promise-all-map-async-await-example/ - Promise.all + map didn't work
    for (let i = 0; i < cropsAndSizes.length; i += 1) {
      const {
        centerX,
        centerY,
        cropW,
        cropH,
        cropX,
        cropY,
        fileNameSuffix,
        imagePercentX,
        imagePercentY,
        marker,
        markerHex,
        markerStrokeW,
        markerWH,
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

      const successfulAction = await FmcFile.gmResizeAndCrop({
        centerX,
        centerY,
        cropW,
        cropH,
        cropX,
        cropY,
        fileNameSuffix,
        imagePercentX,
        imagePercentY,
        marker,
        markerHex,
        markerStrokeW,
        markerWH,
        quality,
        resizeW: _resizeW,
        resizeH,
        sourceFileName: fileNameClean,
        targetFilename
      });

      if (successfulAction === 'crop') {
        counts.crops += 1;
      } else if (successfulAction === 'resize') {
        counts.resizes += 1;
      }
    }

    return {
      baseExportPath,
      counts
    };
  }

  /**
   * @function gmResizeAndCrop
   * @param {object} data - Data
   * @param {number|undefined} data.centerX - Center of image (X axis)
   * @param {number|undefined} data.centerY - Center of image (Y axis)
   * @param {number|undefined} data.cropW - Width of the cropped area
   * @param {number|undefined} data.cropH - Height of the cropped area
   * @param {number|undefined} data.cropX - Offset left of the cropped area
   * @param {number|undefined} data.cropY - Offset top of the cropped area
   * @param {string} data.fileNameSuffix - Suffix to add to the image
   * @param {boolean} data.marker - Draw focalpoint marker on image
   * @param {string} data.markerHex - Hex color of the focalpoint marker
   * @param {number} data.markerStrokeW - Stroke width of the focalpoint marker
   * @param {number} data.markerWH - Width/Height of the focalpoint marker
   * @param {number} data.resizeW - Width to resize the image to
   * @param {number|undefined} data.resizeH - Height to resize the image to
   * @param {number} data.quality - Image quality
   * @param {string} data.sourceFileName - Source file name
   * @param {string} data.targetFilename - Export filename
   * @returns {string} successMessage
   * @memberof FmcFile
   * @static
   */
  static async gmResizeAndCrop(data) {
    const {
      centerX,
      centerY,
      cropW,
      cropH,
      cropX,
      cropY,
      marker,
      markerHex,
      markerStrokeW,
      markerWH,
      resizeW,
      resizeH,
      quality,
      sourceFileName,
      targetFilename
    } = data;

    const isCrop = ((typeof cropX !== 'undefined') && (typeof cropY !== 'undefined') && (typeof cropW !== 'undefined') && (typeof cropH !== 'undefined'));

    return new Promise((resolve, reject) => {
      if (isCrop) {
        if (marker) {
          // Crop with marker
          gm(sourceFileName)
            .strip()
            .autoOrient()
            .quality(quality) // TODO possibly remove this line for PNG
            .crop(cropW, cropH, cropX, cropY)
            .resize(resizeW, null) // TODO make this possible to have width null
            .stroke(markerHex)
            .strokeWidth(markerStrokeW)
            .drawLine( // horz
              centerX,
              (centerY - (markerWH / 2)),
              centerX,
              (centerY + (markerWH / 2))
            )
            .drawLine( // vert
              (centerX - (markerWH / 2)),
              centerY,
              (centerX + (markerWH / 2)),
              centerY
            )
            .write(targetFilename, err => {
              if (err) {
                console.log(err);
                reject(err);
              } else {
                resolve('crop');
              }
            });
        } else {
          // Crop
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
                resolve('crop');
              }
            });
        }
      } else if (marker) {
        // Resize with marker
        // see https://legacy.imagemagick.org/discourse-server/viewtopic.php?p=36624#p36624
        gm(sourceFileName)
          .strip()
          .autoOrient()
          .quality(100) // TODO possibly remove this line for PNG
          .resize(resizeW, null) // TODO make this possible to have width null
          .stroke(markerHex)
          .strokeWidth(markerStrokeW)
          .drawLine( // horz
            centerX,
            (centerY - (markerWH / 2)),
            centerX,
            (centerY + (markerWH / 2))
          )
          .drawLine( // vert
            (centerX - (markerWH / 2)),
            centerY,
            (centerX + (markerWH / 2)),
            centerY
          )
          .write(targetFilename, err => {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              resolve('resize');
            }
          });
      } else {
        // Resize
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
              resolve('resize');
            }
          });
      }
    });
  }

  /**
   * @function getRelativePath
   * @param {event} event - FmcFile:getRelativePath event captured by ipcMain.handle
   * @summary Get the relative path from From to To based on the selected Base directory
   * @param {object} data - Data
   * @param {string} data.base - Website path
   * @param {string} data.from - From path
   * @param {string} data.to - To path
   * @returns {string} relativePath
   * @memberof FmcFile
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
   * @param {event} event - FmcFile:deleteImagePercentXYFromImage event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.fileName - Filename
   * @returns {object} { msg, type }
   * @memberof FmcFile
   * @static
   */
  static async deleteImagePercentXYFromImage(event, data) {
    const { fileName } = data;

    const {
      fileNameAndExt,
      folderPath
    } = FmcFile.getFileNameParts(fileName);

    const regex = FmcFile.getFocalpointRegex();

    const oldFileName = `${folderPath}/${fileNameAndExt}`;
    const newFileName = oldFileName.replace(regex, '');

    if (newFileName !== oldFileName) {
      fs.rename(oldFileName, newFileName, (error) => {
        if (error) {
          console.log(error);
        }
      });
    }

    return {
      msg: newFileName,
      type: 'success'
    };
  }

  /**
   * @function pathExists
   * @param {event} event - FmcFile:pathExists event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.path - Path
   * @returns {boolean} exists
   * @memberof FmcFile
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
   * @memberof FmcFile
   * @static
   */
  static getFileNameParts(fileName) {
    const fileNameAndExt = path.basename(fileName); // Filename.ext | Filename__[nn%,nn%].ext
    const fileNameAndExtClean = fileNameAndExt.replace(/%20/g, ' ');
    const extName = path.extname(fileName); // .ext
    const fileNameOnly = fileNameAndExt.replace(extName, ''); // Filename | Filename__[nn%,nn%]
    const fileNameOnlyClean = fileNameOnly.replace(/%20/g, ' ');
    const fileNameClean = fileName.replace('file://', '').replace(/%20/g, ' '); // /Volumes/Foo/Bar/Baz/Filename.ext
    const folderPath = path.dirname(fileNameClean); // /Volumes/Foo/Bar/Baz

    return {
      extName,
      fileNameAndExt,
      fileNameAndExtClean,
      fileNameClean,
      fileNameOnly,
      fileNameOnlyClean,
      folderPath
    };
  }

  /**
   * @function getFiles
   * @summary Get all files within a directory, ignoring subfolders
   * @param {string} dir - Directory path
   * @returns {Array} files
   * @memberof FmcFile
   * @static
   */
  static getFiles(dir) {
    return fs.readdirSync(dir).flatMap(item => {
      return `${dir}/${item}`;
    });
  }

  /**
   * @function getImageFiles
   * @param {string} dir - Directory path
   * @returns {Array} files
   * @memberof FmcFile
   * @static
   */
  static async getImageFiles(dir) {
    const files = await FmcFile.getFiles(dir);

    return files.filter(file => file.match(/(.gif|.jpg|.jpeg|.png|.webp)+/gi));
  }

  /**
   * @function getImagesData
   * @summary Get the path to a folder and the supported images within it
   * @param {Array} imageFiles - Supported file types contained within the folder
   * @returns {Array} imagesData
   * @memberof FmcFile
   * @static
   */
  static async getImagesData(imageFiles) {
    const imagesData = [];

    for (let i = 0; i < imageFiles.length; i += 1) {
      const image = imageFiles[i];

      try {
        const tags = await ExifReader.load(image);

        const {
          DateTimeOriginal = {}
        } = tags; // object: { id: number, value: Array of strings, description: string }

        const {
          description = ''
        } = DateTimeOriginal;

        imagesData.push({
          src: image,
          dateTimeOriginal: description
        });
      } catch (error) {
        console.log(`ExifReader could not load ${image}`, error);
      }
    }

    return imagesData;
  }

  /**
   * @function openInEditor
   * @param {event} event - FmcFile:openInEditor event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.editorCommand - Editor command (e.g. 'code')
   * @param {string} data.fileDescription - File description
   * @param {string} data.filePath - Path to website file
   * @param {string} data.folderPath - Path to website (workspace) folder
   * @returns {string} message
   * @memberof FmcFile
   * @static
   */
  static async openInEditor(event, data) {
    const {
      editorCommand,
      fileDescription,
      filePath,
      folderPath
    } = data;

    const opts = {
      // Make sure the editor processes are detached from the Desktop app.
      // Otherwise, some editors (like Notepad++) will be killed when the
      // Desktop app is closed.
      detached: true
    };

    let message = `Opened ${fileDescription} in editor`;

    commandExists(editorCommand, (error, exists) => {
      if (exists) {
        spawn(editorCommand, [ folderPath ], opts);
        spawn(editorCommand, [ filePath ], opts);
      } else {
        message = `Could not open ${fileDescription} - the command '${editorCommand}' is not available.)`;
      }
    });

    return message;
  }

  /**
   * @function openInFinder
   * @param {event} event - FmcFile:openInFinder event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.href - HREF
   * @memberof FmcFile
   * @static
   */
  static openInFinder(event, data) {
    const { href } = data;

    shell.showItemInFolder(href);
  }

  /**
   * @function selectFile
   * @param {event} event - FmcFile:selectFile event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.dialogTitle - Title for the dialog
   * @param {boolean} data.restore - Restore setting if it was previously stored
   * @param {string} data.storeKey - Key under which to persist the file path in the JSON file
   * @returns { object } { fileName, filePath }
   * @memberof FmcFile
   * @static
   */
  static async selectFile(event, data) {
    const {
      dialogTitle,
      restore,
      storeKey
    } = data;

    const preset = await FmcStore.getActivePreset(null) || {};
    const retrievedData = {};
    const storedData = preset[storeKey] || {};

    const {
      targetFolder // folderPath
    } = storedData;

    if (!restore) {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        buttonLabel: 'Select file',
        defaultPath: targetFolder,
        message: dialogTitle,
        properties: [
          'openFile',
          'showHiddenFiles'
        ],
        title: dialogTitle
      });

      if (!canceled && filePaths.length) {
        retrievedData.filePath = filePaths[0];

        const pathSeparator = retrievedData.filePath.lastIndexOf('/');

        retrievedData.fileName = retrievedData.filePath.slice(pathSeparator + 1);
        retrievedData.folderPath = path.dirname(retrievedData.filePath);

        return retrievedData;
      }
    }

    // if ((typeof fileName === 'undefined') || (typeof filePath === 'undefined') || (typeof folderPath === 'undefined')) {
    //   return {};
    // }

    return {
      fileName: storedData.value,
      filePath: storedData.targetFile,
      folderPath: storedData.targetFolder
    };
  }

  /**
   * @function sortDateOrderAscending
   * @summary Sort images in date order, ascending
   * @param {Array} imagesData - Images data
   * @returns {Array} imagesDataSorted
   * @memberof FmcFile
   * @static
   */
  static sortDateOrderAscending(imagesData) {
    const imagesDataSorted = imagesData.sort((a, b) => {
      // '2015:08:14 18:29:23' -> 20150814182923
      const numA = Number((a.dateTimeOriginal).replace(/[: ]+/g, ''));
      const numB = Number((b.dateTimeOriginal).replace(/[: ]+/g, ''));

      return numA - numB;
    });

    return imagesDataSorted;
  }

  /**
   * @function selectFolder
   * @param {event} event - FmcFile:selectFolder event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.dialogTitle - Title for the dialog
   * @param {boolean} data.retrieveImagesData - Get information about images in the folder
   *  (The UI contains multiple folder 'Browse' buttons, but only the 'folderIn' needs access to imagesData.)
   * @param {boolean} data.restore - Restore setting if it was previously stored
   * @param {string} data.storeKey - Key under which to persist the folder path in the JSON file
   * @returns {object} { folderName, folderPath, imagesData }
   * @todo Can slice() operation be merged into getFileNameParts() ?
   * @memberof FmcFile
   * @static
   */
  static async selectFolder(event, data) {
    const {
      dialogTitle,
      retrieveImagesData,
      restore,
      storeKey
    } = data;

    const preset = await FmcStore.getActivePreset(null) || {};
    const retrievedData = {};
    const storedData = preset[storeKey] || {};

    const {
      targetFolder, // folderPath
      value // folderName
    } = storedData;

    if (restore) {
      // TODO merge into conditional below?
      if ((typeof value === 'undefined') || (typeof targetFolder === 'undefined')) {
        return {
          folderName: storedData.value,
          folderPath: storedData.targetFolder
        };
      }

      if (retrieveImagesData) {
        const imageFiles = await FmcFile.getImageFiles(targetFolder);

        // imagesData retrieved separately to accommodate file renaming in the interim
        const imagesData = await FmcFile.getImagesData(imageFiles);

        // note: no point in storing imagesData in dataset as could change between loads
        // see also #30
        retrievedData.imagesData = FmcFile.sortDateOrderAscending(imagesData);
        retrievedData.folderName = value;
        retrievedData.folderPath = targetFolder;

        return retrievedData;
      }

      // don't open dialog
      return {
        folderName: storedData.value,
        folderPath: storedData.targetFolder
      };
    } else { // eslint-disable-line no-else-return
      const { canceled, filePaths } = await dialog.showOpenDialog({
        buttonLabel: 'Select folder',
        defaultPath: targetFolder,
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

        retrievedData.folderPath = filePaths[0];

        if (retrieveImagesData) {
          const imageFiles = await FmcFile.getImageFiles(retrievedData.folderPath);

          imagesData = await FmcFile.getImagesData(imageFiles);
          retrievedData.imagesData = FmcFile.sortDateOrderAscending(imagesData);
        }

        const pathSeparator = retrievedData.folderPath.lastIndexOf('/');

        retrievedData.folderName = retrievedData.folderPath.slice(pathSeparator + 1);

        return retrievedData;
      }
    }

    return {
      folderName: storedData.value,
      folderPath: storedData.targetFolder
    };
  }

  /**
   * @function saveImagePercentXYToImage
   * @param {event} event - FmcFile:saveImagePercentXYToImage event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.fileName - File name
   * @param {number} data.imagePercentX - Image percent X
   * @param {number} data.imagePercentY - Image percent Y
   * @returns {string} newFileName
   * @memberof FmcFile
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
      fileNameAndExtClean,
      fileNameOnlyClean,
      folderPath
    } = FmcFile.getFileNameParts(fileName);

    const regex = FmcFile.getFocalpointRegex();

    const fileNameOnlyCleanNoRegex = fileNameOnlyClean.replace(regex, ''); // foo

    const oldFileName = `${folderPath}/${fileNameAndExtClean}`;
    const newFileName = `${folderPath}/${fileNameOnlyCleanNoRegex}__[${imagePercentX}%,${imagePercentY}%]${extName}`;

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
   * @function isEmptyObject
   * @summary Determine whether an object is empty ({})
   * @param {object} obj - Object
   * @returns {boolean} is empty
   * @see {@link https://stackoverflow.com/a/49729848}
   * @memberof FmcFile
   * @static
   */
  static isEmptyObject(obj) {
    return (
      Object.getPrototypeOf(obj) === Object.prototype
      && Object.getOwnPropertyNames(obj).length === 0
      && Object.getOwnPropertySymbols(obj).length === 0
    );
  }
};
