/**
 * @file FmcUi.js
 */

import dtrtValidate from 'dtrt-type-validate';

export class FmcUi {
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
      elements,
      exportDelay,
      fmcCroppersUiInstance,
      fmcThumbsUiInstance,
      selectors
    } = config;

    Object.assign(this, {
      debounceDelay,
      elements,
      exportDelay,
      fmcCroppersUiInstance,
      fmcThumbsUiInstance,
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
   * exportDelay
   * @summary Time to wait between each export when exporting multiple images.
   * @type {number}
   * @memberof FmcUi
   */
  get exportDelay() {
    return this._exportDelay;
  }

  set exportDelay(exportDelay) {
    this._exportDelay = dtrtValidate.validate(exportDelay, 'number', 'FmcUi.exportDelay');
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
   * @function disable
   * @param {HTMLElement} el - Element
   * @memberof FmcUi
   */
  disable(el) {
    el.removeAttribute('title');

    el.setAttribute('disabled', '');
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
    const {
      href,
      title
    } = attrs;

    if (href) {
      el.dataset.href = href;
    }

    if (title) {
      el.dataset.title = title;
      el.setAttribute('title', title);
    } else if (el.dataset.title) {
      el.setAttribute('title', el.dataset.title);
    }

    el.removeAttribute('disabled');
  }

  /**
   * @function getElementIndex
   * @summary Get the index of the selected node in a nodelist
   * @param {HTMLElement} element = Element
   * @param {NodeList} nodeList = NodeList
   * @returns {number} selectedIndex
   * @memberof FmcUi
   * @static
   */
  static getElementIndex(element, nodeList) {
    return Array.from(nodeList).indexOf(element);
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
   * @function getTargetElementOfType
   * @summary Ensures that the target element matches the expected element type
   * @param {object} event - Event
   * @param {string} elementType - Element type (tagName)
   * @returns {HTMLElement} targetElement
   * @memberof FmcUi
   * @static
   */
  static getTargetElementOfType(event, elementType) {
    let targetElement = event.target; // event.currentTarget

    while (targetElement.tagName.toLowerCase() !== elementType) {
      targetElement = targetElement.parentElement;
    }

    return targetElement;
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
   * @function handleAutosaveRadioChange
   * @param {object} event - Change event
   * @memberof FmcUi
   */
  async handleAutosaveRadioChange(event) {
    const {
      elements,
      fmcCroppersUiInstance,
      fmcThumbsUiInstance
    } = this;

    const {
      focalpointXInput,
      focalpointYInput
    } = elements;

    window.electronAPI.storeSet({
      key: 'focalpointAutoSave',
      value: event.target.value === 'on'
    });

    const autosaveOn = event.target.value;
    const thumbIndex = fmcThumbsUiInstance.getSelectedThumbIndex();

    await this.autosaveFocalpoint(autosaveOn === 'on');

    fmcCroppersUiInstance.setFocalpointSaveState({
      thumbIndexPrevious: focalpointXInput.dataset.thumbIndexPrevious,
      thumbIndex,
      imagePercentXUi: focalpointXInput.value,
      imagePercentYUi: focalpointYInput.value
    });
  }

  /**
   * @function handleCopyPath
   * @param {object} event - Click event
   * @memberof FmcUi
   */
  handleCopyPath(event) {
    event.preventDefault();

    if (typeof window.electronAPI === 'undefined') {
      FmcUi.emitElementEvent(window, 'message', {
        msg: 'Error: Clipboard operations require Electron',
        type: 'warning'
      });

      return;
    }

    const et = FmcUi.getTargetElementOfType(event, 'button');

    const title = et.getAttribute('title');

    window.electronAPI.copyToClipboard({
      text: title
    });
  }

  /**
   * @function handleEditWebpage
   * @memberof FmcUi
   */
  async handleEditWebpage() {
    const {
      elements
    } = this;

    const {
      fileWebpageButton,
      folderWebsiteButton
    } = elements;

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
  }

  /**
   * @function handleExportAll
   * @memberof FmcUi
   * @todo Replace exportDelay with more robust check
   */
  async handleExportAll() {
    const {
      exportDelay,
      fmcThumbsUiInstance
    } = this;

    const thumbsButtons = fmcThumbsUiInstance.getButtons();
    let exportedCount = 0;

    for (let b = 0; b < thumbsButtons.length; b += 1) {
      const buttonEl = thumbsButtons[b];
      const imagePercentX = buttonEl.style.getPropertyValue('--image-percent-x');
      const imagePercentY = buttonEl.style.getPropertyValue('--image-percent-y');

      if ((imagePercentX !== '') && (imagePercentY !== '')) {
        buttonEl.click();
        exportedCount += 1;

        await new Promise(resolve => {
          // timeout prevents generic crops
          setTimeout(async () => {
            await this.handleExportSelected();

            resolve();
          }, exportDelay);
        });
      }
    }

    FmcUi.emitElementEvent(window, 'message', {
      msg: `Generated crops and sizes for ${exportedCount} thumbnails`,
      type: 'success'
    });
  }

  /**
   * @function handleExportSelected
   * @returns {string} baseExportPath
   * @memberof FmcUi
   */
  async handleExportSelected() {
    const {
      elements,
      fmcCroppersUiInstance
    } = this;

    const {
      folderOutButton
    } = elements;

    const { dataset } = folderOutButton;
    const { targetFolder } = dataset;

    const baseExportPath = await fmcCroppersUiInstance.resizeAndCropImage(targetFolder);

    this.setPaths(baseExportPath, false);

    return baseExportPath;
  }

  /**
   * @function handleFileWebpageChange
   * @memberof FmcUi
   */
  async handleFileWebpageChange() {
    const { fileName, filePath, folderPath } = await window.electronAPI.selectFile({
      dialogTitle: 'Webpage file',
      restore: false,
      storeKey: 'fileWebpage'
    });

    this.setFileWebpage({ fileName, filePath, folderPath });
  }

  /**
   * @function handleFilterClear
   * @memberof FmcUi
   */
  async handleFilterClear() {
    const {
      elements,
      fmcThumbsUiInstance
    } = this;

    const {
      filter
    } = elements;

    filter.value = '';

    fmcThumbsUiInstance.filterByFilename('');
  }

  /**
   * @function handleFilterSubmit
   * @memberof FmcUi
   */
  async handleFilterSubmit() {
    const {
      elements,
      fmcThumbsUiInstance
    } = this;

    const {
      filter
    } = elements;

    const searchStr = filter.value;

    fmcThumbsUiInstance.filterByFilename(searchStr);
  }

  /**
   * @function handleFocalpointDelete
   * @memberof FmcUi
   */
  async handleFocalpointDelete() {
    const {
      elements,
      fmcCroppersUiInstance
    } = this;

    const {
      focalpointXInput,
      focalpointYInput
    } = elements;

    const msg = await fmcCroppersUiInstance.deleteImagePercentXYFromImage();

    FmcUi.emitElementEvent(window, 'message', {
      msg
    });

    // input change listener calls setFocalpointSaveState
    focalpointXInput.value = 50;
    focalpointYInput.value = 50;

    // fire 'change' event so that change is picked up by listener
    FmcUi.emitElementEvent(focalpointYInput, 'change'); // for both X and Y
  }

  /**
   * @function handleFocalpointInputChange
   * @param {object} event - Change event
   * @memberof FmcUi
   */
  async handleFocalpointInputChange(event) {
    const {
      elements,
      fmcCroppersUiInstance,
      fmcThumbsUiInstance
    } = this;

    const {
      focalpointAutoSaveRadios,
      focalpointXInput,
      focalpointYInput
    } = elements;

    const {
      detail = {}
    } = event;

    const {
      focalpointReset = false
    } = detail;

    // move cropbox
    fmcCroppersUiInstance.displayImagePercentXY({
      imagePercentX: focalpointXInput.value, // string
      imagePercentY: focalpointYInput.value // string
    });

    if ((event.isTrusted) || (event.target === focalpointYInput)) {
      const autosaveOn = [ ...focalpointAutoSaveRadios ].filter(radio => radio.checked)[0].value;
      const thumbIndex = fmcThumbsUiInstance.getSelectedThumbIndex();

      await this.autosaveFocalpoint(autosaveOn === 'on');

      fmcCroppersUiInstance.setFocalpointSaveState({
        focalpointReset,
        thumbIndexPrevious: focalpointXInput.dataset.thumbIndexPrevious,
        thumbIndex,
        imagePercentXUi: focalpointXInput.value,
        imagePercentYUi: focalpointYInput.value
      });

      focalpointXInput.dataset.thumbIndexPrevious = thumbIndex;
      focalpointYInput.dataset.thumbIndexPrevious = thumbIndex;
    }
  }

  /**
   * @function handleFocalpointReset
   * @param {object} event - Click event
   * @memberof FmcUi
   */
  handleFocalpointReset(event) {
    const {
      fmcCroppersUiInstance
    } = this;

    // input change listener calls setFocalpointSaveState
    fmcCroppersUiInstance.reinstateImagePercentXYFromImage(event);
  }

  /**
   * @function handleFocalpointSave
   * @memberof FmcUi
   */
  async handleFocalpointSave() {
    const {
      elements,
      fmcCroppersUiInstance,
      fmcThumbsUiInstance
    } = this;

    const {
      focalpointXInput,
      focalpointYInput
    } = elements;

    const thumbIndex = fmcThumbsUiInstance.getSelectedThumbIndex();

    await this.saveFocalpoint();

    fmcCroppersUiInstance.setFocalpointSaveState({
      thumbIndexPrevious: focalpointXInput.dataset.thumbIndexPrevious,
      thumbIndex,
      imagePercentXUi: focalpointXInput.value,
      imagePercentYUi: focalpointYInput.value
    });
  }

  /**
   * @function handleFolderInChange
   * @memberof FmcUi
   */
  async handleFolderInChange() {
    const { folderName, folderPath, imagesData } = await window.electronAPI.selectFolder({
      dialogTitle: 'Source folder',
      retrieveImagesData: true,
      restore: false,
      storeKey: 'folderIn'
    });

    this.setFolderIn({ folderName, folderPath, imagesData });
  }

  /**
   * @function handleFolderOutChange
   * @memberof FmcUi
   */
  async handleFolderOutChange() {
    const { folderName, folderPath } = await window.electronAPI.selectFolder({
      dialogTitle: 'Export folder',
      retrieveImagesData: false,
      restore: false,
      storeKey: 'folderOut'
    });

    this.setFolderOut({ folderName, folderPath });
  }

  /**
   * @function handleFolderWebsiteChange
   * @memberof FmcUi
   */
  async handleFolderWebsiteChange() {
    const { folderName, folderPath } = await window.electronAPI.selectFolder({
      dialogTitle: 'Website folder',
      retrieveImagesData: false,
      restore: false,
      storeKey: 'folderWebsite'
    });

    this.setFolderWebsite({ folderName, folderPath });
  }

  /**
   * @function handleImageRenamed
   * @param {object} event - imageRenamed event
   * @memberof FmcUi
   */
  handleImageRenamed(event) {
    const {
      fmcCroppersUiInstance,
      fmcThumbsUiInstance,
      selectors
    } = this;

    const {
      thumbClass,
      thumbImgClass
    } = selectors;

    const { newFileName: src } = event.detail;
    const { selectedClass } = fmcThumbsUiInstance;
    const { imagePercentX, imagePercentY } = fmcCroppersUiInstance.getImagePercentXYFromImage(src);
    const thumbButton = document.querySelector(`.${selectedClass}`);
    const thumbImg = document.querySelector(`.${selectedClass} .${thumbImgClass}`);
    const thumbIndex = 0;
    const thumbs = document.querySelectorAll(`.${thumbClass}`);

    thumbs.forEach((_thumb, index) => {
      if (_thumb.classList.contains(selectedClass)) {
        thumbIndex = index;
      }
    });

    fmcThumbsUiInstance.changeSelectedImageSrc(src);
    fmcThumbsUiInstance.setCssImagePercentXY({
      thumbButton,
      thumbImg,
      thumbIndex,
      imagePercentX,
      imagePercentY
    });

    this.setPaths(src);
  }

  /**
   * @function handleLastCropperImgReady
   * @memberof FmcUi
   */
  handleLastCropperImgReady() {
    const {
      fmcCroppersUiInstance
    } = this;

    // short timeout prevents intermittent (browser) error from FmcCroppersUi.calcCanvasOffsets()
    setTimeout(() => {
      fmcCroppersUiInstance.initImagePercentXY();
    }, 10);
  }

  /**
   * @function handleLinkToPath
   * @param {object} event - Click event
   * @memberof FmcUi
   */
  async handleLinkToPath(event) {
    event.preventDefault();

    if (typeof window.electronAPI === 'undefined') {
      FmcUi.emitElementEvent(window, 'message', {
        msg: 'Error: Finder links require Electron',
        type: 'warning'
      });

      return;
    }

    const et = FmcUi.getTargetElementOfType(event, 'button');

    const { href } = et.dataset;

    if (href !== '#') {
      window.electronAPI.openInFinder({
        href
      });
    }
  }

  /**
   * @function handleThumbClick
   * @param {object} event - Click event
   * @memberof FmcUi
   */
  async handleThumbClick(event) {
    const {
      elements,
      fmcCroppersUiInstance,
      fmcThumbsUiInstance
    } = this;

    const {
      croppersContainer
    } = elements;

    const {
      dataset: {
        cropperFocalpointSaveStatus
      }
    } = croppersContainer;

    const {
      clickedButton,
      clickedButtonIndex
    } = fmcThumbsUiInstance.getClickedButton(event);

    const newImageSrc = clickedButton.querySelector('img').getAttribute('src');

    if (cropperFocalpointSaveStatus === 'dirty') {
      const saveChanges = window.confirm('Save focalpoint changes?');

      if (saveChanges) {
        await this.handleFocalpointSave();
      }
    }

    fmcThumbsUiInstance.applySelectedClass(clickedButton);

    const thumbsButtons = fmcThumbsUiInstance.getButtons();

    thumbsButtons.forEach(button => {
      button.setAttribute('tabindex', '-1');
    });

    clickedButton.setAttribute('tabindex', '0');
    clickedButton.focus();

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
    fmcCroppersUiInstance.changeSourceImage(newImageSrc);
  }

  /**
   * @function handleWindowKeydown
   * @param {object} event - Keydown event
   * @memberof FmcUi
   */
  async handleWindowKeydown(event) {
    const {
      elements,
      fmcThumbsUiInstance,
      selectors
    } = this;

    const {
      filter,
      filterSubmitButton
    } = elements;

    const {
      thumbButtonClass
    } = selectors;

    const {
      key,
      metaKey
    } = event;

    if (document.activeElement === filter) {
      if (key === 'Enter') {
        FmcUi.emitElementEvent(filterSubmitButton, 'click', {});
      } else if (metaKey && (key === 'v')) {
        filter.value = await window.electronAPI.copyFromClipboard();
      }
    } else if (document.activeElement.classList.contains(thumbButtonClass)) {
      if (key === 'ArrowLeft') {
        event.preventDefault(); // don't operate the native container scrollbar
        fmcThumbsUiInstance.focusThumb('previous');
      } else if (key === 'ArrowRight') {
        event.preventDefault();
        fmcThumbsUiInstance.focusThumb('next');
      }
    }
  }

  /**
   * @function handleWindowMessage
   * @param {object} event - Message event
   * @memberof FmcUi
   * @see {link https://www.macarthur.me/posts/when-dom-updates-appear-to-be-asynchronous}
   * @see {link https://stackoverflow.com/a/65144294}
   */
  async handleWindowMessage(event) {
    const {
      elements
    } = this;

    const {
      consoleContainer,
      consoleType
    } = elements;

    const {
      msg,
      type = 'message' // message|success|warning
    } = event.detail;

    consoleContainer.textContent = (msg !== '') ? `${msg}.` : msg;
    consoleType.classList.remove('msg-info', 'msg-success', 'msg-warning');
    consoleType.classList.add(`msg-${type}`);
    consoleType.textContent = type;

    // ensure each message is displayed
    await new Promise(resolve => {
      // fires before the next repaint (when queued UI changes are applied)
      requestAnimationFrame(() => {
        consoleContainer.textContent = (msg !== '') ? `${msg}.` : msg;

        // fires before the _next_ next repaint
        // ...which is effectively _after_ the next repaint
        // i.e. when the console has been updated
        requestAnimationFrame(resolve);
      });
    });
  }

  /**
   * @function handleWindowResize
   * @memberof FmcUi
   */
  handleWindowResize() {
    const {
      fmcThumbsUiInstance
    } = this;

    fmcThumbsUiInstance.focusThumb('selected');
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

    let msgObj;

    // value is a string despite input being of type number
    if ((Number(focalpointXInput.value) === 50) && (Number(focalpointYInput.value) === 50)) {
      msgObj = await fmcCroppersUiInstance.deleteImagePercentXYFromImage();
    } else {
      msgObj = await fmcCroppersUiInstance.writeImagePercentXYToImage({
        imagePercentX: focalpointXInput.value,
        imagePercentY: focalpointYInput.value
      });

      FmcUi.emitElementEvent(window, 'message', msgObj);
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
      focalpointAutoSaveRadios
    } = elements;

    const autoSaveSetting = enabled ? 'on' : 'off';

    focalpointAutoSaveRadios.forEach(radio => {
      radio.checked = (radio.value === autoSaveSetting);
    });
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

    const thumbButtons = fmcThumbsUiInstance.getButtons();
    const thumbImgs = document.querySelectorAll(`.${thumbImgClass}`);

    setTimeout(() => {
      thumbButtons.forEach((thumbButton, index) => {
        const thumbImg = thumbImgs[index];
        const { src } = thumbImg;
        const { imagePercentX, imagePercentY } = fmcCroppersUiInstance.getImagePercentXYFromImage(src);

        fmcThumbsUiInstance.setCssImagePercentXY({
          thumbButton,
          thumbImg,
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
   * @function srcSafe
   * @param {string} src - Path
   * @returns {string} srcSafe
   * @memberof FmcUi
   */
  srcSafe(src) {
    return src.replace(/%20/g, ' ');
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

    return function () {
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
