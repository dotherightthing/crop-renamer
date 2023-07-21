/**
 * @file FmcUi.js
 */

import dtrtValidate from 'dtrt-type-validate';

export class FmcUi { // eslint-disable-line no-unused-vars
  /**
   * @class FmcUi
   * @summary Manages UI
   * @param {object} config - Instance config
   * @public
   */
  constructor(config = {}) {
    // select the relevant arguments from the config object passed in
    const {
      fmcCroppersUiInstance,
      fmcThumbsUiInstance,
      elements,
      selectors
    } = config;

    Object.assign(this, {
      fmcCroppersUiInstance,
      fmcThumbsUiInstance,
      elements,
      selectors
    });
  }

  /* Getters and Setters */

  /**
   * fmcCroppersUiInstance
   * @type {object}
   * @memberof FmcUi
   */
  get fmcCroppersUiInstance() {
    return this._fmcCroppersUiInstance;
  }

  set fmcCroppersUiInstance(fmcCroppersUiInstance) {
    this._fmcCroppersUiInstance = dtrtValidate.validate(fmcCroppersUiInstance, 'object', 'FmcUi.fmcCroppersUiInstance');
  }

  /**
   * fmcThumbsUiInstance
   * @type {object}
   * @memberof FmcUi
   */
  get fmcThumbsUiInstance() {
    return this._fmcThumbsUiInstance;
  }

  set fmcThumbsUiInstance(fmcThumbsUiInstance) {
    this._fmcThumbsUiInstance = dtrtValidate.validate(fmcThumbsUiInstance, 'object', 'FmcUi.fmcThumbsUiInstance');
  }

  /**
   * elements
   * @type {object}
   * @memberof FmcUi
   */
  get elements() {
    return this._elements;
  }

  set elements(elements) {
    this._elements = dtrtValidate.validate(elements, 'object', 'FmcUi.elements');
  }

  /**
   * selectors
   * @type {object}
   * @memberof FmcUi
   */
  get selectors() {
    return this._selectors;
  }

  set selectors(selectors) {
    this._selectors = dtrtValidate.validate(selectors, 'object', 'FmcUi.selectors');
  }

  /* Instance methods */

  /**
   * @function addEventListeners
   * @summary Listen for native and custom events
   * @memberof FmcUi
   */
  addEventListeners() {
    const {
      fmcCroppersUiInstance,
      fmcThumbsUiInstance,
      elements,
      selectors
    } = this;

    const {
      console,
      copyPaths,
      croppersContainer,
      focalpointAutoSaveInput,
      focalpointDeleteButton,
      focalpointInput,
      focalpointResetButton,
      focalpointXInput,
      focalpointYInput,
      folderInButton,
      folderOutButton,
      folderWebpageButton,
      folderWebsiteButton,
      exportCropsAndSizesButton,
      lastCropperImg,
      pathLinks,
      thumbsContainer,
      window
    } = elements;

    const {
      thumbClass,
      thumbImgClass
    } = selectors;

    document.body.addEventListener('keydown', (event) => {
      if (!thumbsContainer.querySelectorAll('img').length) {
        return;
      }

      const { keyCode } = event;

      if (keyCode === 37) {
        event.preventDefault(); // don't operate the native container scrollbar
        fmcThumbsUiInstance.scrollToThumb('previous');
      } else if (keyCode === 39) {
        event.preventDefault();
        fmcThumbsUiInstance.scrollToThumb('next');
      }
    });

    copyPaths.forEach(el => {
      el.addEventListener('click', (event) => {
        event.preventDefault();

        if (typeof window.electronAPI === 'undefined') {
          console.innerHTML = 'Error: Clipboard operations require Electron';

          return;
        }

        const et = event.currentTarget;

        while (et.tagName.toLowerCase() !== 'button') {
          et = et.parentElement;
        }

        const title = et.getAttribute('title');

        window.electronAPI.copyToClipboard({
          text: title
        });
      });
    });

    croppersContainer.addEventListener('imageRenamed', (event) => {
      const { newFileName: src } = event.detail;
      const { selectedClass } = fmcThumbsUiInstance;
      const { imagePercentX, imagePercentY } = fmcCroppersUiInstance.getImagePercentXYFromImage(src);
      const thumb = document.querySelector(`.${selectedClass}`).parentElement;
      const thumbImage = document.querySelector(`.${selectedClass} .${thumbImgClass}`);
      const thumbs = document.querySelectorAll(`.${thumbClass}`);
      const thumbIndex = 0;

      thumbs.forEach((_thumb, index) => {
        if (_thumb.classList.contains(selectedClass)) {
          thumbIndex = index;
        }
      });

      fmcThumbsUiInstance.changeSelectedImageSrc(src);
      fmcThumbsUiInstance.setCssImagePercentXY({
        thumbElement: thumb,
        thumbImgElement: thumbImage,
        thumbIndex,
        imagePercentX,
        imagePercentY
      });

      this.setPaths(src);
    });

    croppersContainer.addEventListener('paramChange', (event) => {
      const {
        triggerChange,
        parameter,
        value
      } = event.detail;

      const el = document.getElementById(parameter);

      const oldValue = el.value;

      if (oldValue !== value) {
        el.value = value;

        if (triggerChange) {
          // let fields update before actioning new values
          setTimeout(() => {
            // fire 'change' event so that change is picked up by listener
            const ev = new Event('change');
            el.dispatchEvent(ev);
          }, 500);
        }
      }
    });

    croppersContainer.addEventListener('statusChange', (event) => {
      const { msg } = event.detail;

      console.innerHTML = (msg !== '') ? `${msg}.` : msg;
    });

    focalpointAutoSaveInput.forEach(radio => {
      radio.addEventListener('change', (event) => {
        window.electronAPI.storeSet({
          key: 'focalpointAutoSave',
          value: event.target.value === 'on'
        });

        const autosaveOn = event.target.value;

        this.autosaveFocalpoint(autosaveOn);
      });
    });

    focalpointDeleteButton.addEventListener('click', () => {
      fmcCroppersUiInstance.deleteImagePercentXYFromImage();

      focalpointXInput.value = 50;
      focalpointYInput.value = 50;

      // fire 'change' event so that change is picked up by listener
      const ev = new Event('change');

      focalpointYInput.dispatchEvent(ev); // for both X and Y
    });

    focalpointInput.forEach(input => input.addEventListener('change', () => {
      // move cropbox
      fmcCroppersUiInstance.displayImagePercentXY({
        imagePercentX: focalpointXInput.value,
        imagePercentY: focalpointYInput.value
      });

      const autosaveOn = [ ...focalpointAutoSaveInput ].filter(radio => radio.checked)[0].value;

      this.autosaveFocalpoint(autosaveOn);
    }));

    focalpointResetButton.addEventListener('click', (event) => {
      fmcCroppersUiInstance.reinstateImagePercentXYFromImage(event);
    });

    folderInButton.addEventListener('click', async () => {
      const { folderName, folderPath, imagesData } = await window.electronAPI.selectFolder({
        dialogTitle: 'Source folder',
        retrieveImagesData: true,
        restore: false,
        storeKey: 'folderIn'
      });

      this.setFolderIn({ folderName, folderPath, imagesData });
    });

    folderOutButton.addEventListener('click', async () => {
      const { folderName, folderPath } = await window.electronAPI.selectFolder({
        dialogTitle: 'Export folder',
        retrieveImagesData: false,
        restore: false,
        storeKey: 'folderOut'
      });

      this.setFolderOut({ folderName, folderPath });
    });

    folderWebpageButton.addEventListener('click', async () => {
      const { folderName, folderPath } = await window.electronAPI.selectFolder({
        dialogTitle: 'Webpage folder',
        retrieveImagesData: false,
        restore: false,
        storeKey: 'folderWebpage'
      });

      this.setFolderWebpage({ folderName, folderPath });
    });

    folderWebsiteButton.addEventListener('click', async () => {
      const { folderName, folderPath } = await window.electronAPI.selectFolder({
        dialogTitle: 'Website folder',
        retrieveImagesData: false,
        restore: false,
        storeKey: 'folderWebsite'
      });

      this.setFolderWebsite({ folderName, folderPath });
    });

    exportCropsAndSizesButton.addEventListener('click', async () => {
      const { dataset } = folderOutButton;
      const { targetFolder } = dataset;

      const baseExportPath = await fmcCroppersUiInstance.resizeAndCropImage(targetFolder);

      this.setPaths(baseExportPath, false);
    });

    lastCropperImg.addEventListener('ready', () => {
      // short timeout prevents intermittent (browser) error from FmcCroppersUi.calcCanvasOffsets()
      setTimeout(() => {
        fmcCroppersUiInstance.initImagePercentXY();
      }, 10);
    });

    pathLinks.forEach(el => {
      el.addEventListener('click', (event) => {
        event.preventDefault();

        if (typeof window.electronAPI === 'undefined') {
          console.innerHTML = 'Error: Finder links require Electron';

          return;
        }

        const et = event.currentTarget;

        while (et.tagName.toLowerCase() !== 'a') {
          et = et.parentElement;
        }

        const href = et.getAttribute('href');

        if (href !== '#') {
          window.electronAPI.openInFinder({
            href
          });
        }
      });
    });

    thumbsContainer.addEventListener('click', (event) => {
      const {
        clickedButton,
        clickedButtonIndex
      } = fmcThumbsUiInstance.getClickedButton(event);

      const newImageSrc = clickedButton.querySelector('img').getAttribute('src');

      fmcThumbsUiInstance.applySelectedClass(clickedButton);

      fmcThumbsUiInstance.scrollToThumb('selected');

      setTimeout(() => {
        fmcThumbsUiInstance.displayCount({
          thumbIndex: clickedButtonIndex
        });
      }, 500);

      this.setPaths(newImageSrc);

      // calls fmcCroppersUiInstance.init
      fmcCroppersUiInstance.changeSourceImage(clickedButton);
    });

    window.addEventListener('resize', () => {
      fmcThumbsUiInstance.scrollToThumb('selected');
    });
  }

  /**
   * @function autosaveFocalpoint
   * @param {boolean} on - Auto-Save is on (true) or off (false)
   * @memberof FmcUi
   */
  autosaveFocalpoint(on) {
    const {
      fmcCroppersUiInstance,
      elements
    } = this;

    const {
      focalpointResetButton,
      focalpointXInput,
      focalpointYInput
    } = elements;

    if (on) {
      // value is a string despite input being of type number
      if ((Number(focalpointXInput.value) === 50) && (Number(focalpointYInput.value) === 50)) {
        fmcCroppersUiInstance.deleteImagePercentXYFromImage();
      } else {
        fmcCroppersUiInstance.writeImagePercentXYToImage({
          imagePercentX: focalpointXInput.value,
          imagePercentY: focalpointYInput.value
        });
      }

      focalpointResetButton.setAttribute('disabled', '');
    } else {
      focalpointResetButton.removeAttribute('disabled');
    }
  }

  /**
   * @function getPathOut
   * @summary Set the target path in the footer
   * @returns {string} pathOut
   * @memberof FmcUi
   */
  getPathOut() {
    const {
      fmcCroppersUiInstance,
      elements
    } = this;

    const {
      folderOutButton
    } = elements;

    const { croppers } = fmcCroppersUiInstance;
    const { targetFolder } = folderOutButton.dataset;
    const { src: cropperSrc } = croppers[0].cropperInstance.element;

    const fileName = FmcUi.getFileNameFromPath(cropperSrc);
    const pathOut = `${targetFolder}/${fileName}`;

    return pathOut;
  }

  /**
   * @function getPathWebEmbed
   * @summary Set the web embed path in the footer
   * @returns {string} pathWebEmbed
   * @memberof FmcUi
   */
  async getPathWebEmbed() {
    const {
      elements
    } = this;

    const {
      folderWebpageButton,
      folderWebsiteButton
    } = elements;

    const { targetFolder: pathWebEmbed } = folderWebpageButton.dataset;
    const { targetFolder: pathWebsite } = folderWebsiteButton.dataset;

    const pathOut = this.getPathOut();

    let path = '';

    if ((pathWebEmbed !== '') && (pathOut !== '')) {
      path = await window.electronAPI.getRelativePath({
        base: pathWebsite,
        from: pathWebEmbed,
        to: pathOut
      });
    }

    return path;
  }

  /**
   * @function restoreSettings
   * @summary Restore previous stored settings if they exist
   * @memberof FmcUi
   */
  async restoreSettings() {
    const storedFolderIn = await window.electronAPI.selectFolder({
      dialogTitle: 'Source folder',
      retrieveImagesData: true,
      restore: true,
      storeKey: 'folderIn'
    });

    const storedFolderOut = await window.electronAPI.selectFolder({
      dialogTitle: 'Export folder',
      retrieveImagesData: false,
      restore: true,
      storeKey: 'folderOut'
    });

    const storedFolderWebpage = await window.electronAPI.selectFolder({
      dialogTitle: 'Webpage folder',
      retrieveImagesData: false,
      restore: true,
      storeKey: 'folderWebpage'
    });

    const storedFolderWebsite = await window.electronAPI.selectFolder({
      dialogTitle: 'Website folder',
      retrieveImagesData: false,
      restore: true,
      storeKey: 'folderWebsite'
    });

    const storedFocalpointAutoSave = await window.electronAPI.storeGet({
      key: 'focalpointAutoSave'
    });

    this.setAutoSave(storedFocalpointAutoSave);
    this.setFolderIn(storedFolderIn);
    this.setFolderOut(storedFolderOut);
    this.setFolderWebpage(storedFolderWebpage);
    this.setFolderWebsite(storedFolderWebsite);
  }

  /**
   * @function setAutoSave
   * @summary Turn auto save on or off
   * @param {boolean} enabled - On
   * @memberof FmcUi
   */
  setAutoSave(enabled) {
    const {
      elements
    } = this;

    const {
      focalpointAutoSaveInput
    } = elements;

    const autoSaveSetting = enabled ? 'on' : 'off';

    focalpointAutoSaveInput.forEach(radio => {
      radio.checked = (radio.value === autoSaveSetting);
    });
  }

  /**
   * @function setFolderIn
   * @summary Set the source folder
   * @param {object} args - Arguments
   * @param {string} args.folderName - Folder name
   * @param {string} args.folderPath - Folder path
   * @param {Array} args.imagesData - Images data
   * @memberof FmcUi
   */
  setFolderIn({ folderName, folderPath, imagesData }) {
    const {
      fmcCroppersUiInstance,
      fmcThumbsUiInstance,
      elements,
      selectors
    } = this;

    const {
      folderInButton
    } = elements;

    const {
      controlHintClass,
      thumbClass,
      thumbImgClass
    } = selectors;

    // if folder select was cancelled
    if ((typeof folderName === 'undefined') || (typeof folderPath === 'undefined') || (typeof imagesData === 'undefined')) {
      return;
    }

    folderInButton.dataset.hint = true;
    folderInButton.querySelector(`.${controlHintClass}`).textContent = folderName;

    fmcThumbsUiInstance.generateThumbsHtml(imagesData);

    const thumbs = document.querySelectorAll(`.${thumbClass}`);
    const thumbImages = document.querySelectorAll(`.${thumbImgClass}`);

    setTimeout(() => {
      thumbs.forEach((thumb, index) => {
        const thumbImage = thumbImages[index];
        const { src } = thumbImage;
        const { imagePercentX, imagePercentY } = fmcCroppersUiInstance.getImagePercentXYFromImage(src);

        fmcThumbsUiInstance.setCssImagePercentXY({
          thumbElement: thumb,
          thumbImgElement: thumbImage,
          thumbIndex: index + 1,
          imagePercentX,
          imagePercentY
        });
      });
    }, 500);
  }

  /**
   * @function setFolderOut
   * @summary Set the target folder
   * @param {object} args - Arguments
   * @param {string} args.folderName - Folder name
   * @param {string} args.folderPath - Folder path
   * @memberof FmcUi
   */
  setFolderOut({ folderName, folderPath }) {
    const {
      elements,
      selectors
    } = this;

    const {
      folderOutButton,
      folderOutButtonDependent
    } = elements;

    const {
      controlHintClass
    } = selectors;

    // if folder select was cancelled
    if ((typeof folderName === 'undefined') || (typeof folderPath === 'undefined')) {
      return;
    }

    folderOutButton.dataset.targetFolder = folderPath;
    folderOutButton.dataset.hint = true;
    folderOutButton.querySelector(`.${controlHintClass}`).textContent = folderName;

    folderOutButtonDependent.removeAttribute('disabled');
  }

  /**
   * @function setFolderWebpage
   * @summary Set the webpage folder
   * @param {object} args - Arguments
   * @param {string} args.folderName - Folder name
   * @param {string} args.folderPath - Folder path
   * @memberof FmcUi
   */
  setFolderWebpage({ folderName, folderPath }) {
    const {
      elements,
      selectors
    } = this;

    const {
      folderWebpageButton
    } = elements;

    const {
      controlHintClass
    } = selectors;

    // if folder select was cancelled
    if ((typeof folderName === 'undefined') || (typeof folderPath === 'undefined')) {
      return;
    }

    folderWebpageButton.dataset.targetFolder = folderPath;
    folderWebpageButton.dataset.hint = true;
    folderWebpageButton.querySelector(`.${controlHintClass}`).textContent = folderName;
  }

  /**
   * @function setFolderWebsite
   * @summary Set the webpage folder
   * @param {object} args - Arguments
   * @param {string} args.folderName - Folder name
   * @param {string} args.folderPath - Folder path
   * @memberof FmcUi
   */
  setFolderWebsite({ folderName, folderPath }) {
    const {
      elements,
      selectors
    } = this;

    const {
      folderWebsiteButton
    } = elements;

    const {
      controlHintClass
    } = selectors;

    // if folder select was cancelled
    if ((typeof folderName === 'undefined') || (typeof folderPath === 'undefined')) {
      return;
    }

    folderWebsiteButton.dataset.targetFolder = folderPath;
    folderWebsiteButton.dataset.hint = true;
    folderWebsiteButton.querySelector(`.${controlHintClass}`).textContent = folderName;
  }

  /**
   * @function setPaths
   * @summary Update attributes in the path links and buttons
   * @param {string} src - Image src
   * @param {boolean} checkPathExists - Check whether the baseExport path exists
   * @memberof FmcUi
   */
  setPaths(src, checkPathExists = true) {
    const {
      elements
    } = this;

    const {
      copyPathInButton,
      copyPathOutButton,
      copyPathWebEmbedButton,
      pathInLink,
      pathOutLink,
      thumbFileName
    } = elements;

    const fileName = FmcUi.getFileNameFromPath(src);

    copyPathInButton.setAttribute('title', src);
    pathInLink.setAttribute('href', src);
    pathInLink.setAttribute('title', src);

    thumbFileName.textContent = fileName;

    setTimeout(async () => {
      const pathOut = this.getPathOut();

      const pathOutExists = checkPathExists ? await window.electronAPI.pathExists({
        path: pathOut
      }) : true;

      if (pathOutExists) {
        const pathWebEmbed = await this.getPathWebEmbed();

        copyPathOutButton.removeAttribute('disabled');
        copyPathOutButton.setAttribute('title', pathOut);

        copyPathWebEmbedButton.removeAttribute('disabled');
        copyPathWebEmbedButton.setAttribute('title', pathWebEmbed);

        delete pathOutLink.parentElement.dataset.disabled;
        pathOutLink.setAttribute('href', pathOut);
        pathOutLink.setAttribute('title', pathOut);
      } else {
        copyPathOutButton.setAttribute('disabled', '');
        copyPathOutButton.removeAttribute('title');

        copyPathWebEmbedButton.setAttribute('disabled', '');
        copyPathWebEmbedButton.removeAttribute('title');

        pathOutLink.parentElement.dataset.disabled = true;
        pathOutLink.removeAttribute('href');
        pathOutLink.removeAttribute('title');
      }
    }, 500);
  }

  /**
   * @function useTestData
   * @memberof FmcUi
   */
  testData() {
    const {
      fmcThumbsUiInstance
    } = this;

    fmcThumbsUiInstance.generateThumbsHtml({
      imagesData: [
        {
          src: './cypress/fixtures/landscape.jpeg',
          dateTimeOriginal: '2023:01:03 04:35:26'
        },
        {
          src: './cypress/fixtures/portrait.jpeg',
          dateTimeOriginal: '2023:01:03 05:35:26'
        },
        {
          src: './cypress/fixtures/portrait-with-rotation.jpeg',
          dateTimeOriginal: '2023:01:03 05:35:26'
        },
        {
          src: './cypress/fixtures/panorama.jpeg',
          dateTimeOriginal: '2023:01:03 09:35:26'
        },
        {
          src: './cypress/fixtures/square.jpg',
          dateTimeOriginal: '2023:01:03 06:35:26'
        },
        {
          src: './cypress/fixtures/screenshot.PNG',
          dateTimeOriginal: '2023:01:03 07:35:26'
        }
      ]
    });
  }

  /* Static methods */

  /**
   * @function emitEvent
   * @summary Emit a custom event
   * @param {string} elementId - ID of the element that will dispatch the event
   * @param {string} eventName - Event names are case-sensitive
   * @param {object} eventDetail - name-value pair
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent}
   * @see {@link https://gomakethings.com/callbacks-vs.-custom-events-in-vanilla-js/}
   * @memberof FmcUi
   * @static
   */
  static emitEvent(elementId, eventName, eventDetail = {}) {
    const event = new CustomEvent(eventName, {
      bubbles: true, // stop with event.stopPropagation()
      cancelable: true, // cancel with event.preventDefault()
      // composed // web components only
      detail: eventDetail
    });

    document.getElementById(elementId).dispatchEvent(event);
  }

  /**
   * @function getFileNameFromPath
   * @param {string} path - File path
   * @returns {string} fileName
   * @memberof FmcUi
   * @static
   */
  static getFileNameFromPath(path) {
    const pathSeparator = path.lastIndexOf('/');
    const fileName = path.slice(pathSeparator + 1);

    return fileName;
  }

  /**
   * @function getOffset
   * @summary Get the space between an element and the viewport (this matches the inline CSS translate implemented by cropperjs)
   * @param {HTMLElement} el - Element
   * @returns {object} offset - { top, left }
   * @see {@link https://usefulangle.com/post/179/jquery-offset-vanilla-javascript}
   * @memberof FmcUi
   * @static
   */
  static getOffset(el) {
    const rect = el.getBoundingClientRect();
    const offset = {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX
    };

    return offset;
  }

  /**
   * @function isEmptyObject
   * @summary Determine whether an object is empty ({})
   * @param {object} obj - Object
   * @returns {boolean} is empty
   * @see {@link https://stackoverflow.com/a/49729848}
   * @memberof FmcUi
   * @static
   */
  static isEmptyObject(obj) {
    return (
      Object.getPrototypeOf(obj) === Object.prototype
      && Object.getOwnPropertyNames(obj).length === 0
      && Object.getOwnPropertySymbols(obj).length === 0
    );
  }
}
