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
      debounceDelay,
      fmcCroppersUiInstance,
      fmcThumbsUiInstance,
      elements,
      selectors
    } = config;

    Object.assign(this, {
      debounceDelay,
      fmcCroppersUiInstance,
      fmcThumbsUiInstance,
      elements,
      selectors
    });
  }

  /* Getters and Setters */

  /**
   * debounceDelay
   * @type {number}
   * @memberof FmcUi
   */
  get debounceDelay() {
    return this._debounceDelay;
  }

  set debounceDelay(debounceDelay) {
    this._debounceDelay = dtrtValidate.validate(debounceDelay, 'number', 'FmcUi.debounceDelay');
  }

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
      debounceDelay,
      fmcCroppersUiInstance,
      fmcThumbsUiInstance,
      elements,
      selectors
    } = this;

    const {
      consoleContainer,
      copyPaths,
      croppersContainer,
      editWebpageButton,
      focalpointAutoSaveInput,
      focalpointDeleteButton,
      focalpointResetButton,
      focalpointSaveButton,
      focalpointXInput,
      focalpointYInput,
      folderInButton,
      folderOutButton,
      fileWebpageButton,
      folderWebsiteButton,
      exportCropsAndSizesButton,
      lastCropperImg,
      pathLinks,
      thumbsContainer,
      thumbFileNameFilter,
      thumbFileNameFilterClear,
      thumbFileNameFilterSubmit,
      window
    } = elements;

    const {
      thumbButtonClass,
      thumbClass,
      thumbImgClass
    } = selectors;

    const handleFocalpointInputChangeDebounced = FmcUi.debounce(this.handleFocalpointInputChange, debounceDelay);
    const handleThumbClickDebounced = FmcUi.debounce(this.handleThumbClick, debounceDelay);

    copyPaths.forEach(el => {
      el.addEventListener('click', (event) => {
        event.preventDefault();

        if (typeof window.electronAPI === 'undefined') {
          consoleContainer.textContent = 'Error: Clipboard operations require Electron';

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

    croppersContainer.addEventListener('statusChange', (event) => {
      const { msg } = event.detail;

      consoleContainer.textContent = (msg !== '') ? `${msg}.` : msg;
    });

    editWebpageButton.addEventListener('click', async () => {
      const {
        dataset: {
          targetFolder
        }
      } = folderWebsiteButton;

      const {
        dataset: {
          targetFile
        }
      } = fileWebpageButton;

      const msg = await window.electronAPI.openInEditor({
        editorCommand: 'code', // see https://code.visualstudio.com/docs/editor/command-line
        fileDescription: 'webpage',
        folderPath: targetFolder,
        filePath: targetFile
      });

      FmcUi.emitElementEvent(window, 'message', {
        msg
      });
    });

    focalpointAutoSaveInput.forEach(radio => {
      radio.addEventListener('change', async (event) => {
        window.electronAPI.storeSet({
          key: 'focalpointAutoSave',
          value: event.target.value === 'on'
        });

        const autosaveOn = event.target.value;

        await this.autosaveFocalpoint(autosaveOn === 'on');

        fmcCroppersUiInstance.setFocalpointSaveState({
          imagePercentXUi: focalpointXInput.value,
          imagePercentYUi: focalpointYInput.value
        });
      });
    });

    focalpointDeleteButton.addEventListener('click', async () => {
      const {
        croppersId
      } = fmcCroppersUiInstance;

      const msg = await fmcCroppersUiInstance.deleteImagePercentXYFromImage();

      FmcUi.emitEvent(croppersId, 'statusChange', {
        msg
      });

      // input change listener calls setFocalpointSaveState
      focalpointXInput.value = 50;
      focalpointYInput.value = 50;

      // fire 'change' event so that change is picked up by listener
      FmcUi.emitElementEvent(focalpointYInput, 'change'); // for both X and Y
    });

    focalpointXInput.addEventListener('change', handleFocalpointInputChangeDebounced.bind(this));
    focalpointYInput.addEventListener('change', handleFocalpointInputChangeDebounced.bind(this));

    focalpointResetButton.addEventListener('click', (event) => {
      // input change listener calls setFocalpointSaveState
      fmcCroppersUiInstance.reinstateImagePercentXYFromImage(event);
    });

    focalpointSaveButton.addEventListener('click', async () => {
      await this.saveFocalpoint();

      fmcCroppersUiInstance.setFocalpointSaveState({
        imagePercentXUi: focalpointXInput.value,
        imagePercentYUi: focalpointYInput.value
      });
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

    fileWebpageButton.addEventListener('click', async () => {
      const { fileName, filePath, folderPath } = await window.electronAPI.selectFile({
        dialogTitle: 'Webpage file',
        restore: false,
        storeKey: 'fileWebpage'
      });

      this.setFileWebpage({ fileName, filePath, folderPath });
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
          consoleContainer.textContent = 'Error: Finder links require Electron';

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

    thumbFileNameFilterClear.addEventListener('click', () => {
      thumbFileNameFilter.value = '';

      fmcThumbsUiInstance.filterByFilename('');
    });

    thumbFileNameFilterSubmit.addEventListener('click', () => {
      const searchStr = thumbFileNameFilter.value;

      fmcThumbsUiInstance.filterByFilename(searchStr);
    });

    thumbsContainer.addEventListener('click', this.handleThumbSelect.bind(this));
    thumbsContainer.addEventListener('click', handleThumbClickDebounced.bind(this));

    window.addEventListener('keydown', async (event) => {
      const {
        key,
        metaKey
      } = event;

      if (document.activeElement === thumbFileNameFilter) {
        if (key === 'Enter') {
          FmcUi.emitElementEvent(thumbFileNameFilterSubmit, 'click', {});
        } else if (metaKey && (key === 'v')) {
          thumbFileNameFilter.value = await window.electronAPI.copyFromClipboard();
        }
      } else if (document.activeElement.classList.contains(thumbButtonClass)) {
        if (key === 'ArrowLeft') {
          event.preventDefault(); // don't operate the native container scrollbar
          fmcThumbsUiInstance.scrollToThumb('previous');
        } else if (key === 'ArrowRight') {
          event.preventDefault();
          fmcThumbsUiInstance.scrollToThumb('next');
        }
      }
    });

    window.addEventListener('message', (event) => {
      const { msg } = event.detail;

      consoleContainer.textContent = (msg !== '') ? `${msg}.` : msg;
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
  async autosaveFocalpoint(on) {
    const {
      elements
    } = this;

    const {
      focalpointResetButton,
      focalpointSaveButton
    } = elements;

    if (on) {
      await this.saveFocalpoint();

      focalpointResetButton.setAttribute('disabled', '');
      focalpointSaveButton.setAttribute('disabled', '');
    } else {
      focalpointResetButton.removeAttribute('disabled');
      focalpointSaveButton.removeAttribute('disabled');
    }
  }

  /**
   * @function handleFocalpointInputChange
   * @param {object} event - Change event
   * @memberof FmcUi
   */
  async handleFocalpointInputChange(event) {
    const {
      elements,
      fmcCroppersUiInstance
    } = this;

    const {
      focalpointAutoSaveInput,
      focalpointXInput,
      focalpointYInput
    } = elements;

    // move cropbox
    fmcCroppersUiInstance.displayImagePercentXY({
      imagePercentX: focalpointXInput.value, // string
      imagePercentY: focalpointYInput.value // string
    });

    if ((event.isTrusted) || (event.target === focalpointYInput)) {
      const autosaveOn = [ ...focalpointAutoSaveInput ].filter(radio => radio.checked)[0].value;

      await this.autosaveFocalpoint(autosaveOn === 'on');

      fmcCroppersUiInstance.setFocalpointSaveState({
        imagePercentXUi: focalpointXInput.value,
        imagePercentYUi: focalpointYInput.value
      });
    }
  }

  /**
   * @function handleThumbClick
   * @param {object} event - Click event
   * @memberof FmcUi
   */
  handleThumbClick(event) {
    const {
      fmcCroppersUiInstance,
      fmcThumbsUiInstance
    } = this;

    const {
      clickedButton,
      clickedButtonIndex
    } = fmcThumbsUiInstance.getClickedButton(event);

    const newImageSrc = clickedButton.querySelector('img').getAttribute('src');

    setTimeout(() => {
      fmcThumbsUiInstance.displayCount({
        thumbIndex: clickedButtonIndex
      });

      window.electronAPI.storeSet({
        key: 'thumbIndex',
        value: clickedButtonIndex
      });
    }, 500);

    this.setPaths(newImageSrc);

    // calls fmcCroppersUiInstance.init
    fmcCroppersUiInstance.changeSourceImage(clickedButton);
  }

  /**
   * @function handleThumbSelect
   * @param {object} event - Click event
   * @memberof FmcUi
   */
  handleThumbSelect(event) {
    const {
      fmcThumbsUiInstance
    } = this;

    const {
      clickedButton
    } = fmcThumbsUiInstance.getClickedButton(event);

    fmcThumbsUiInstance.applySelectedClass(clickedButton);

    fmcThumbsUiInstance.scrollToThumb('selected');
  }

  /**
   * @function disable
   * @param {HTMLElement} el - Element
   * @memberof FmcUi
   */
  disable(el) {
    const tagName = el.tagName.toLowerCase();

    if (tagName === 'a') {
      if (typeof el.dataset.href === 'undefined') {
        el.dataset.href = el.getAttribute('href') || '';
      }

      if (typeof el.dataset.title === 'undefined') {
        el.dataset.title = el.getAttribute('title') || '';
      }

      el.parentElement.dataset.disabled = true;
      el.removeAttribute('href');
      el.removeAttribute('title');
    } else if (tagName === 'button') {
      if (typeof el.dataset.title === 'undefined') {
        el.dataset.title = el.getAttribute('title') || '';
      }

      el.setAttribute('disabled', '');
      el.removeAttribute('title');
    }
  }

  /**
   * @function enable
   * @param {HTMLElement} el - Element
   * @param {object} attrs - Attributes
   * @param {string} attrs.href - href attribute
   * @param {string} attrs.title - title attribute
   * @memberof FmcUi
   */
  enable(el, attrs) {
    const tagName = el.tagName.toLowerCase();

    if (tagName === 'a') {
      const {
        href = el.dataset.href,
        title = el.dataset.title
      } = attrs;

      if (typeof el.parentElement.dataset.disabled !== 'undefined') {
        delete el.parentElement.dataset.disabled;
      }

      el.setAttribute('href', href);
      el.setAttribute('title', title);
    } else if (tagName === 'button') {
      const {
        title = el.dataset.title
      } = attrs;

      el.removeAttribute('disabled');
      el.setAttribute('title', title);
    }
  }

  /**
   * @function srcSafe
   * @param {string} src - Path
   * @returns {string} srcSafe
   * @memberof FmcUi
   */
  srcSafe(src) {
    return src.replace(/%20/g, ' ');
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
      fileWebpageButton,
      folderWebsiteButton
    } = elements;

    const { targetFolder: pathWebEmbed } = fileWebpageButton.dataset;
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

    const storedFileWebpage = await window.electronAPI.selectFile({
      dialogTitle: 'Webpage folder',
      restore: true,
      storeKey: 'fileWebpage'
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
    this.setFileWebpage(storedFileWebpage);
    this.setFolderWebsite(storedFolderWebsite);
  }

  /**
   * @function saveFocalpoint
   * @memberof FmcUi
   */
  async saveFocalpoint() {
    const {
      elements,
      fmcCroppersUiInstance
    } = this;

    const {
      focalpointXInput,
      focalpointYInput
    } = elements;

    const {
      croppersId
    } = fmcCroppersUiInstance;

    let msg;

    // value is a string despite input being of type number
    if ((Number(focalpointXInput.value) === 50) && (Number(focalpointYInput.value) === 50)) {
      msg = await fmcCroppersUiInstance.deleteImagePercentXYFromImage();
    } else {
      msg = await fmcCroppersUiInstance.writeImagePercentXYToImage({
        imagePercentX: focalpointXInput.value,
        imagePercentY: focalpointYInput.value
      });

      FmcUi.emitEvent(croppersId, 'statusChange', {
        msg
      });
    }
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
  async setFolderIn({ folderName, folderPath, imagesData }) {
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

    const storedThumbIndex = await window.electronAPI.storeGet({
      key: 'thumbIndex'
    });

    const thumbIndex = (typeof storedThumbIndex !== 'undefined') ? storedThumbIndex : 1;

    fmcThumbsUiInstance.generateThumbsHtml(imagesData, thumbIndex);

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
   * @function setFileWebpage
   * @summary Set the webpage file
   * @param {object} args - Arguments
   * @param {string} args.fileName - File name
   * @param {string} args.filePath - File path
   * @param {string} args.folderPath - Folder path
   * @memberof FmcUi
   */
  setFileWebpage({ fileName, filePath, folderPath }) {
    const {
      elements,
      selectors
    } = this;

    const {
      fileWebpageButton
    } = elements;

    const {
      controlHintClass
    } = selectors;

    // if folder select was cancelled
    if ((typeof fileName === 'undefined') || (typeof filePath === 'undefined')) {
      return;
    }

    fileWebpageButton.dataset.targetFile = filePath;
    fileWebpageButton.dataset.targetFolder = folderPath;
    fileWebpageButton.dataset.hint = true;
    fileWebpageButton.querySelector(`.${controlHintClass}`).textContent = fileName;
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
    const srcSafe = this.srcSafe(src);

    this.enable(copyPathInButton, {
      title: srcSafe
    });

    this.enable(pathInLink, {
      href: srcSafe,
      title: srcSafe
    });

    thumbFileName.textContent = fileName;

    setTimeout(async () => {
      const pathOut = this.getPathOut();

      const pathOutExists = checkPathExists ? await window.electronAPI.pathExists({
        path: pathOut
      }) : true;

      if (pathOutExists) {
        const pathOutSafe = this.srcSafe(pathOut);
        const pathWebEmbed = await this.getPathWebEmbed();
        const pathWebEmbedSafe = this.srcSafe(pathWebEmbed);

        this.enable(copyPathOutButton, {
          title: pathOutSafe
        });

        this.enable(copyPathWebEmbedButton, {
          title: pathWebEmbedSafe
        });

        this.enable(pathOutLink, {
          href: pathOutSafe,
          title: pathOutSafe
        });
      } else {
        this.disable(copyPathOutButton);
        this.disable(copyPathWebEmbedButton);
        this.disable(pathOutLink);
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
   * @function emitElementEvent
   * @summary Emit a custom event
   * @param {HTMLElement} element - element that will dispatch the event
   * @param {string} eventName - Event names are case-sensitive
   * @param {object} eventDetail - name-value pair
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent}
   * @see {@link https://gomakethings.com/callbacks-vs.-custom-events-in-vanilla-js/}
   * @memberof FmcUi
   * @static
   */
  static emitElementEvent(element, eventName, eventDetail = {}) {
    const event = new CustomEvent(eventName, {
      bubbles: true, // stop with event.stopPropagation()
      cancelable: true, // cancel with event.preventDefault()
      // composed // web components only
      detail: eventDetail
    });

    element.dispatchEvent(event);
  }

  /**
   * @function debounce
   * @param {Function} func - Function to call after delay
   * @param {number} wait - Wait time in ms
   * @param {boolean} immediate - Call the function immediately
   * @returns {Function} function
   * @memberof FmcFile
   * @static
   * @see {@link https://stackoverflow.com/a/65081210}
   * @see {@link https://www.freecodecamp.org/news/debounce-explained-how-to-make-your-javascript-wait-for-your-user-to-finish-typing-2/}
   */
  static debounce(func, wait, immediate) {
    let timeout;

    return function () { // eslint-disable-line func-names
      const context = this;
      const args = arguments;

      const later = function () {
        timeout = null;

        if (!immediate) {
          func.apply(context, args);
        }
      };

      const callNow = immediate && !timeout;

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) {
        func.apply(context, args);
      }
    };
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
}
