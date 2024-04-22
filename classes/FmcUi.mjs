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
   * @param {string} imgSrc = Cropper image src
   * @returns {string} pathOut
   * @memberof FmcUi
   */
  getPathOut(imgSrc) {
    const {
      elements
    } = this;

    const {
      folderOutInput
    } = elements;

    const { targetFolder } = folderOutInput.dataset;

    const fileName = FmcUi.getFileNameFromPath(imgSrc);
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
   * @param {string} pathOut - Path out
   * @returns {string} pathWebEmbed
   * @memberof FmcUi
   */
  async getPathWebEmbed(pathOut) {
    const {
      elements
    } = this;

    const {
      fileWebpageInput,
      folderWebsiteInput
    } = elements;

    const { targetFolder: pathWebEmbed } = fileWebpageInput.dataset;
    const { targetFolder: pathWebsite } = folderWebsiteInput.dataset;

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
      focalpointProportionsRadios,
      focalpointXInput,
      focalpointYInput
    } = elements;

    await window.electronAPI.setKeys({
      keyValuePairs: [
        {
          focalpointAutoSave: event.target.value === 'on'
        }
      ]
    });

    const autosaveOn = event.target.value;
    const thumbIndex = fmcThumbsUiInstance.getSelectedThumbIndex();

    await this.autosaveFocalpoint(autosaveOn === 'on');

    fmcCroppersUiInstance.setFocalpointSaveState({
      thumbIndexPrevious: focalpointXInput.dataset.thumbIndexPrevious,
      thumbIndex,
      imagePercentXUi: focalpointXInput.value,
      imagePercentYUi: focalpointYInput.value,
      imageProportionsUi: [ ...focalpointProportionsRadios ].filter(radio => radio.checked)[0].value
    });
  }

  /**
   * @function handleAutoSelectFilteredRadioChange
   * @param {object} event - Change event
   * @memberof FmcUi
   */
  async handleAutoSelectFilteredRadioChange(event) {
    const {
      elements
    } = this;

    const {
      filterSubmitButton
    } = elements;

    await window.electronAPI.setKeys({
      keyValuePairs: [
        {
          thumbsAutoSelectFiltered: event.target.value === 'on'
        }
      ]
    });

    FmcUi.emitElementEvent(filterSubmitButton, 'click', {});
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
   * @function handleEditPresets
   * @memberof FmcUi
   */
  async handleEditPresets() {
    const {
      elements
    } = this;

    const {
      openPresetsInput
    } = elements;

    const filePath = openPresetsInput.value;
    const pathSeparator = filePath.lastIndexOf('/');
    const folderPath = filePath.slice(0, pathSeparator);

    const msg = await window.electronAPI.openInEditor({
      editorCommand: 'code', // see https://code.visualstudio.com/docs/editor/command-line
      fileDescription: 'webpage',
      folderPath,
      filePath
    });

    FmcUi.emitElementEvent(window, 'message', {
      msg
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
      fileWebpageInput,
      folderWebsiteInput
    } = elements;

    const { targetFolder } = folderWebsiteInput.dataset;
    const { targetFile } = fileWebpageInput.dataset;

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
      copyPathWebEmbedButton,
      folderOutInput
    } = elements;

    const { croppers } = fmcCroppersUiInstance;
    const { src } = croppers[0].cropperInstance.element;
    const { targetFolder } = folderOutInput.dataset;

    const baseExportPath = await fmcCroppersUiInstance.resizeAndCropImage(targetFolder);
    const pathOut = this.getPathOut(src);

    await this.setPaths(baseExportPath, pathOut, false);

    copyPathWebEmbedButton.focus();
    copyPathWebEmbedButton.click();

    return baseExportPath;
  }

  /**
   * @function handleFileWebpageBrowse
   * @param {object|null} event - Click event
   * @param {boolean} restore - Restore settings from store
   * @memberof FmcUi
   */
  async handleFileWebpageBrowse(event, restore = false) {
    const {
      elements
    } = this;

    const {
      fileWebpageInput
    } = elements;

    const { fileName, filePath, folderPath } = await window.electronAPI.selectFile({
      dialogTitle: 'Webpage file',
      restore,
      storeKey: 'fileWebpage'
    });

    // if folder select was cancelled
    if ((typeof fileName === 'undefined') || (typeof filePath === 'undefined')) {
      return;
    }

    fileWebpageInput.dataset.targetFile = filePath;
    fileWebpageInput.dataset.targetFolder = folderPath;
    fileWebpageInput.value = fileName;
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

    fmcThumbsUiInstance.filterByFilenameAndCropped('');
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

    fmcThumbsUiInstance.filterByFilenameAndCropped(searchStr);
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
      focalpointProportionsRadios,
      focalpointXInput,
      focalpointYInput
    } = elements;

    focalpointProportionsRadios.forEach(radio => {
      radio.checked = (radio.value === 'default');
    });

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
      focalpointProportionsRadios,
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
        imagePercentYUi: focalpointYInput.value,
        imageProportionsUi: [ ...focalpointProportionsRadios ].filter(radio => radio.checked)[0].value
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
      focalpointProportionsRadios,
      focalpointXInput,
      focalpointYInput
    } = elements;

    const thumbIndex = fmcThumbsUiInstance.getSelectedThumbIndex();

    await this.saveFocalpoint();

    fmcCroppersUiInstance.setFocalpointSaveState({
      thumbIndexPrevious: focalpointXInput.dataset.thumbIndexPrevious,
      thumbIndex,
      imagePercentXUi: focalpointXInput.value,
      imagePercentYUi: focalpointYInput.value,
      imageProportionsUi: [ ...focalpointProportionsRadios ].filter(radio => radio.checked)[0].value
    });
  }

  /**
   * @function handleFolderInBrowse
   * @summary Called on 'Browse' click, handleSettingsLoad, restoreSettings
   * @param {object|null} event - Click event
   * @param {boolean} restore - Restore settings from store
   * @memberof FmcUi
   */
  async handleFolderInBrowse(event, restore = false) {
    const {
      fmcCroppersUiInstance,
      fmcThumbsUiInstance,
      elements,
      selectors
    } = this;

    const {
      folderInInput
    } = elements;

    const {
      thumbImgClass
    } = selectors;

    // folderPath = targetFolder
    const { folderName, folderPath, imagesData } = await window.electronAPI.selectFolder({
      dialogTitle: 'Source folder',
      retrieveImagesData: true,
      restore, // loads folderName and folderPath from preset
      storeKey: 'folderIn'
    });

    // if folder select was cancelled
    if ((typeof folderName === 'undefined') || (typeof folderPath === 'undefined') || (typeof imagesData === 'undefined')) {
      return;
    }

    // if 'Browse' was clicked
    // capture data with the field (inside the 'Open Settings' dialog) until it is saved to a preset
    if (!restore) {
      folderInInput.dataset.targetFolder = folderPath;
      folderInInput.value = folderName;
    }

    // add thumbs to UI
    fmcThumbsUiInstance.generateThumbsHtml(imagesData, 1);

    const thumbButtons = fmcThumbsUiInstance.getButtons();
    const thumbImgs = document.querySelectorAll(`.${thumbImgClass}`);

    // add focalpoint overlays to thumbs
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
   * @function handleFolderOutBrowse
   * @param {object|null} event - Click event
   * @param {boolean} restore - Restore settings from store
   * @memberof FmcUi
   */
  async handleFolderOutBrowse(event, restore = false) {
    const {
      elements
    } = this;

    const {
      folderOutInput,
      folderOutInputDependent
    } = elements;

    const { folderName, folderPath } = await window.electronAPI.selectFolder({
      dialogTitle: 'Export folder',
      retrieveImagesData: false,
      restore,
      storeKey: 'folderOut'
    });

    // if folder select was cancelled
    if ((typeof folderName === 'undefined') || (typeof folderPath === 'undefined')) {
      return;
    }

    folderOutInput.dataset.targetFolder = folderPath;
    folderOutInput.value = folderName;

    // enables focalpoint controls
    // TODO controls are enabled before cropper is ready
    folderOutInputDependent.removeAttribute('disabled');
  }

  /**
   * @function handleFolderWebsiteBrowse
   * @param {object|null} event - Click event
   * @param {boolean} restore - Restore settings from store
   * @memberof FmcUi
   */
  async handleFolderWebsiteBrowse(event, restore = false) {
    const {
      elements
    } = this;

    const {
      folderWebsiteInput
    } = elements;

    const { folderName, folderPath } = await window.electronAPI.selectFolder({
      dialogTitle: 'Website folder',
      retrieveImagesData: false,
      restore,
      storeKey: 'folderWebsite'
    });

    // if folder select was cancelled
    if ((typeof folderName === 'undefined') || (typeof folderPath === 'undefined')) {
      return;
    }

    folderWebsiteInput.dataset.targetFolder = folderPath;
    folderWebsiteInput.value = folderName;
  }

  /**
   * @function handleImageRenamed
   * @param {object} event - imageRenamed event
   * @memberof FmcUi
   */
  async handleImageRenamed(event) {
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

    const pathOut = this.getPathOut(src);

    await this.setPaths(src, pathOut);
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
   * @function handleOptionsClose
   * @memberof FmcUi
   */
  handleOptionsClose() {
    const {
      elements
    } = this;

    const {
      consoleContainerOuter,
      options,
      thumbsContainerOuter
    } = elements;

    thumbsContainerOuter.appendChild(consoleContainerOuter);

    options.close();
  }

  /**
   * @function handleOptionsOpen
   * @memberof FmcUi
   */
  async handleOptionsOpen() {
    const {
      elements
    } = this;

    const {
      consoleContainerOuter,
      options
    } = elements;

    options.appendChild(consoleContainerOuter);

    options.showModal();
  }

  /**
   * @function handleSettingsClose
   * @memberof FmcUi
   */
  handleSettingsClose() {
    const {
      elements
    } = this;

    const {
      consoleContainerOuter,
      settings,
      thumbsContainerOuter
    } = elements;

    thumbsContainerOuter.appendChild(consoleContainerOuter);

    settings.close();
  }

  /**
   * @function handleSettingsLoad
   * @summary Run when the Presets 'Load' button is pressed
   * @memberof FmcUi
   */
  async handleSettingsLoad() {
    const {
      elements,
      fmcThumbsUiInstance
    } = this;

    const {
      activePresetName,
      fileWebpageInput,
      folderInInput,
      folderOutInput,
      folderWebsiteInput,
      presetNameInput,
      presetNamesSelect
    } = elements;

    let presetName = presetNamesSelect.value;

    if (presetName !== '') {
      await window.electronAPI.setActivePresetName({
        presetName
      });

      activePresetName.textContent = presetName;
    }

    try {
      // gets the active preset set above or one previously set
      const preset = await window.electronAPI.getActivePreset(null);

      ({ name: presetName } = preset);

      activePresetName.textContent = presetName;

      const {
        fileWebpage,
        folderIn,
        folderOut,
        folderWebsite,
        name
      } = preset;

      fileWebpageInput.dataset.targetFile = fileWebpage.targetFile;
      fileWebpageInput.dataset.targetFolder = fileWebpage.targetFolder;
      fileWebpageInput.value = fileWebpage.value;

      folderInInput.dataset.targetFolder = folderIn.targetFolder;
      folderInInput.value = folderIn.value;

      folderOutInput.dataset.targetFolder = folderOut.targetFolder; // aka handleFolderOutBrowse folderPath
      folderOutInput.value = folderOut.value; // aka handleFolderOutBrowse folderName
      // folderOutInputDependent.removeAttribute('disabled');

      folderWebsiteInput.dataset.targetFolder = folderWebsite.targetFolder;
      folderWebsiteInput.value = folderWebsite.value;

      presetNameInput.value = name;

      const restore = true;

      await this.handleFolderInBrowse(null, restore);
      await this.handleFolderOutBrowse(null, restore);
      await this.handleFolderWebsiteBrowse(null, restore);
      await this.handleFileWebpageBrowse(null, restore);

      const { focalpointAutoSave: storedFocalpointAutoSave } = await window.electronAPI.getKeys({
        keys: [ 'focalpointAutoSave' ]
      });

      const { thumbsAutoSelectFiltered: storedThumbsAutoSelectFiltered } = await window.electronAPI.getKeys({
        keys: [ 'thumbsAutoSelectFiltered' ]
      });

      this.setAutoSave(storedFocalpointAutoSave);
      this.setAutoSelectFiltered(storedThumbsAutoSelectFiltered);
      this.setFilterUncropped(false);

      fmcThumbsUiInstance.clickSelectedThumb(1);

      FmcUi.emitElementEvent(window, 'message', {
        msg: `Loaded preset ${name}`,
        type: 'success'
      });
    } catch (error) {
      FmcUi.emitElementEvent(window, 'message', {
        msg: 'No active preset to load',
        type: 'info'
      });
    }
  }

  /**
   * @function handleSettingsOpen
   * @memberof FmcUi
   */
  async handleSettingsOpen() {
    const {
      elements
    } = this;

    const {
      consoleContainerOuter,
      openPresetsInput,
      settings
    } = elements;

    await this.populateSettingsPresets();
    await this.selectActivePreset();

    openPresetsInput.value = await window.electronAPI.getStoreFilePath();

    settings.appendChild(consoleContainerOuter);

    settings.showModal();
  }

  /**
   * @function selectActivePreset
   * @summary Select the active preset from the dropdown in the Settings modal
   * @todo Consider renaming to selectStoredActivePreset ?
   * @memberof FmcUi
   */
  async selectActivePreset() {
    const {
      elements
    } = this;

    const {
      presetNamesSelect
    } = elements;

    const preset = await window.electronAPI.getActivePreset(null);

    if (typeof preset === 'undefined') {
      FmcUi.emitElementEvent(window, 'message', {
        msg: 'No active preset to select',
        type: 'info'
      });

      return;
    }

    const { name } = preset;

    // select the preset
    presetNamesSelect.value = name;
  }

  /**
   * @function handleSettingsSave
   * @memberof FmcUi
   */
  async handleSettingsSave() {
    const {
      elements,
      fmcThumbsUiInstance
    } = this;

    const {
      activePresetName,
      fileWebpageInput,
      folderInInput,
      folderOutInput,
      folderWebsiteInput,
      presetNameInput
    } = elements;

    const fileWebpage = {
      targetFile: fileWebpageInput.dataset.targetFile,
      targetFolder: fileWebpageInput.dataset.targetFolder,
      value: fileWebpageInput.value
    };

    const folderIn = {
      targetFolder: folderInInput.dataset.targetFolder,
      value: folderInInput.value // folderName
    };

    const folderOut = {
      targetFolder: folderOutInput.dataset.targetFolder,
      value: folderOutInput.value
    };

    const folderWebsite = {
      targetFolder: folderWebsiteInput.dataset.targetFolder,
      value: folderWebsiteInput.value
    };

    const name = presetNameInput.value;

    const msgObj = await window.electronAPI.setPreset({
      fileWebpage,
      folderIn,
      folderOut,
      folderWebsite,
      name
    });

    FmcUi.emitElementEvent(window, 'message', msgObj);

    await window.electronAPI.setActivePresetName({
      presetName: name
    });

    activePresetName.textContent = name;

    fmcThumbsUiInstance.clickSelectedThumb(1);

    await this.populateSettingsPresets(name);
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

    await new Promise(resolve => {
      setTimeout(async () => {
        fmcThumbsUiInstance.displayCount({
          thumbIndex: clickedButtonIndex
        });

        resolve();
      }, 500);
    });

    const pathOut = this.getPathOut(newImageSrc);

    const { latLong } = clickedButton.dataset;

    await this.setLatLong(latLong);
    await this.setPaths(newImageSrc, pathOut);

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
   * @function populateSettingsPresets
   * @param {string} selectName - Name of preset to select
   * @memberof FmcUi
   */
  async populateSettingsPresets(selectName = 'default') {
    const {
      elements
    } = this;

    const {
      presetNamesSelect
    } = elements;

    const presetNames = await window.electronAPI.getPresetNames();

    const optionsHtml = presetNames.map(item => `<option value="${item}">${item}</option>`).join('');

    presetNamesSelect.innerHTML = '<option value="default">Select a preset</option>' + optionsHtml;

    // select item
    presetNamesSelect.value = selectName;
  }

  /**
   * @function restoreSettings
   * @summary Restore previous stored settings if they exist
   * @memberof FmcUi
   */
  async restoreSettings() {
    await this.selectActivePreset();
    await this.handleSettingsLoad();
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
      focalpointProportionsRadios,
      focalpointXInput,
      focalpointYInput
    } = elements;

    let msgObj;

    let flags = [];

    const imageProportions = [ ...focalpointProportionsRadios ].filter(radio => radio.checked)[0].value;

    if (imageProportions === 'panorama') {
      flags.push('P');
    }

    // value is a string despite input being of type number
    if ((Number(focalpointXInput.value) === 50) && (Number(focalpointYInput.value) === 50)) {
      msgObj = await fmcCroppersUiInstance.deleteImagePercentXYFromImage();
    } else {
      msgObj = await fmcCroppersUiInstance.writeImagePercentXYToImage({
        imageFlags: flags.join(','),
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
   * @function setAutoSelectFiltered
   * @summary Turn auto save on or off
   * @param {boolean} enabled - On
   * @memberof FmcUi
   */
  setAutoSelectFiltered(enabled) {
    const {
      elements
    } = this;

    const {
      thumbsAutoSelectFilteredRadios
    } = elements;

    const autoSaveSetting = enabled ? 'on' : 'off';

    thumbsAutoSelectFilteredRadios.forEach(radio => {
      radio.checked = (radio.value === autoSaveSetting);
    });
  }

  /**
   * @function setFilterUncropped
   * @summary Turn filter uncropped thumbs on or off
   * @param {boolean} enabled - On
   * @memberof FmcUi
   */
  setFilterUncropped(enabled) {
    const {
      elements
    } = this;

    const {
      thumbsFilterUncroppedRadios
    } = elements;

    const filterUncroppedSetting = enabled ? 'on' : 'off';

    thumbsFilterUncroppedRadios.forEach(radio => {
      radio.checked = (radio.value === filterUncroppedSetting);

      if (radio.value === 'on') {
        FmcUi.emitElementEvent(radio, 'change');
      }
    });
  }

  /**
   * @function setLatLong
   * @summary Update attributes in the button
   * @param {string} latLong - Lat/Long
   * @memberof FmcUi
   */
  async setLatLong(latLong) {
    const {
      elements
    } = this;

    const {
      copyLatLongButton
    } = elements;

    if (latLong !== '') {
      this.enable(copyLatLongButton, {
        title: latLong
      });
    } else {
      this.disable(copyLatLongButton);
    }
  }

  /**
   * @function setPaths
   * @summary Update attributes in the path links and buttons
   * @param {string} src - Image src
   * @param {string} pathOut - Path out
   * @param {boolean} checkPathExists - Check whether the baseExport path exists
   * @memberof FmcUi
   */
  async setPaths(src, pathOut, checkPathExists = true) {
    const {
      elements
    } = this;

    const {
      copyPathInButton,
      copyPathOutButton,
      copyPathWebEmbedButton,
      pathInLink,
      pathOutLink, // "Copy base export path"
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

    await new Promise(resolve => {
      // timeout prevents generic crops
      setTimeout(async () => {
        const pathOutExists = checkPathExists ? await window.electronAPI.pathExists({
          path: pathOut
        }) : true;

        if (pathOutExists) {
          const pathOutSafe = this.srcSafe(pathOut);
          const pathWebEmbed = await this.getPathWebEmbed(pathOut);
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

        resolve();
      }, 500);
    });
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
