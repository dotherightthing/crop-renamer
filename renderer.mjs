// Electron's render process (web page)

import { FmcUi } from './classes/FmcUi.mjs';
import { FmcCroppersUi } from './classes/FmcCroppersUi.mjs';
import { FmcThumbsUi } from './classes/FmcThumbsUi.mjs';

// listeners

window.addEventListener('DOMContentLoaded', async () => {
  // instantiate classes

  const controlHintClass = 'control-hint';
  const focalpointXInputId = 'focalpoint-x';
  const focalpointYInputId = 'focalpoint-y';
  const hideClass = 'cropper-hide';
  const thumbButtonClass = 'btn-thumb';
  const thumbClass = 'thumb';
  const thumbImgClass = 'thumb-img';

  const fmcCroppersUiInstance = new FmcCroppersUi({
    Cropper: window.Cropper,
    cropperCanvasClass: 'cropper-canvas',
    cropperImageClass: 'cropper-image',
    croppersId: 'croppers',
    croppersOptions: {
      autoCrop: true, // Enable to crop the image automatically when initialized
      autoCropArea: 1, // Define the automatic cropping area size - as 100% of the image
      background: true, // Show the grid background of the container
      center: true, // Show the center indicator above the crop box
      checkCrossOrigin: true, // Check if the current image is a cross-origin image
      checkOrientation: false, // Check the current image's Exif Orientation information
      cropBoxMovable: false, // Enable to move the crop box by dragging
      cropBoxResizable: false, // Enable to resize the crop box by dragging
      dragMode: 'none', // create a new crop box | move the canvas | do nothing
      guides: true, // Show the dashed lines above the crop box
      highlight: true, // Show the white modal above the crop box (highlight the crop box)
      modal: true, // Show the black modal above the image and under the crop box
      movable: false, // Enable to move the image
      preview: '', // Add extra elements (containers) for preview
      responsive: (typeof Cypress === 'undefined'), // Re-render the cropper when resizing the window
      restore: true, // Restore the cropped area after resizing the window
      rotatable: true, // TODO: rotate should affect entire image, not just the crop, so requires an additional pre-crop
      scalable: false, // Enable to scale the image
      toggleDragModeOnDblclick: false, // Enable to toggle drag mode between "crop" and "move" when clicking twice on the cropper
      viewMode: 1, // restrict the crop box not to exceed the size of the canvas
      zoomable: false, // Enable to zoom the image
      zoomOnTouch: false, // Enable to zoom the image by dragging touch
      zoomOnWheel: false // Enable to zoom the image by mouse wheeling
    },
    focalpointXInputId,
    focalpointYInputId,
    initDelay: 5000,
    updateDelay: (typeof Cypress !== 'undefined') ? 0 : 1000
  });

  const fmcThumbsUiInstance = new FmcThumbsUi({
    hideClass,
    selectedClass: 'btn-selected',
    thumbButtonClass,
    thumbClass,
    thumbImgClass,
    thumbImgWrapperClass: 'thumb-img-wrapper',
    thumbMetaClass: 'thumb-meta',
    thumbsCountId: 'thumb-count',
    thumbsId: 'thumbs'
  });

  const fmcUi = new FmcUi({
    debounceDelay: 500,
    elements: {
      consoleContainer: document.getElementById('console'),
      copyPathInButton: document.getElementById('copy-path-in'),
      copyPathOutButton: document.getElementById('copy-path-out'),
      copyPathWebEmbedButton: document.getElementById('copy-path-web-embed'),
      croppersContainer: document.getElementById('croppers'),
      editWebpageButton: document.getElementById('edit-webpage'),
      exportAllButton: document.getElementById('crop-all'),
      exportSelectedButton: document.getElementById('crop-selected'),
      focalpointAutoSaveRadios: document.getElementsByName('focalpoint-autosave'),
      focalpointDeleteButton: document.getElementById('delete-focalpoint'),
      focalpointResetButton: document.getElementById('reset-focalpoint'),
      focalpointSaveButton: document.getElementById('save-focalpoint'),
      focalpointXInput: document.getElementById(focalpointXInputId),
      focalpointYInput: document.getElementById(focalpointYInputId),
      folderInButton: document.getElementById('folder-in'),
      folderOutButton: document.getElementById('folder-out'),
      folderOutButtonDependent: document.querySelector('[data-dependent="folder-out"]'),
      fileWebpageButton: document.getElementById('file-webpage'),
      folderWebsiteButton: document.getElementById('folder-website'),
      lastCropperImg: document.querySelector('#croppers .img-container-last img'),
      pathInLink: document.getElementById('link-path-in'),
      pathOutLink: document.getElementById('link-path-out'),
      thumbsContainer: document.getElementById('thumbs'),
      thumbFileName: document.getElementById('thumb-filename'),
      filter: document.getElementById('thumb-filename-filter'),
      filterClearButton: document.getElementById('thumb-filename-filter-clear'),
      filterSubmitButton: document.getElementById('thumb-filename-filter-submit'),
      window: window
    },
    fmcCroppersUiInstance,
    fmcThumbsUiInstance,
    selectors: {
      controlHintClass,
      thumbButtonClass,
      thumbClass,
      thumbImgClass
    }
  });

  /**
   * @function addEventListeners
   * @summary Expose fmcUi event listeners in renderer to simplify debugging
   * @memberof FmcUi
   */
  fmcUi.addEventListeners = () => {
    const _this = fmcUi;

    const {
      debounceDelay,
      elements
    } = _this;

    const {
      copyPathInButton,
      copyPathOutButton,
      copyPathWebEmbedButton,
      croppersContainer,
      editWebpageButton,
      exportAllButton,
      exportSelectedButton,
      fileWebpageButton,
      filterClearButton,
      filterSubmitButton,
      focalpointAutoSaveRadios,
      focalpointDeleteButton,
      focalpointResetButton,
      focalpointSaveButton,
      focalpointXInput,
      focalpointYInput,
      folderInButton,
      folderOutButton,
      folderWebsiteButton,
      lastCropperImg,
      pathInLink,
      pathOutLink,
      thumbsContainer,
      window
    } = elements;

    const handleFocalpointInputDebounced = FmcUi.debounce(_this.handleFocalpointInputChange, debounceDelay);

    copyPathInButton
      .addEventListener('click', _this.handleCopyPath.bind(_this));
    copyPathOutButton
      .addEventListener('click', _this.handleCopyPath.bind(_this));
    copyPathWebEmbedButton
      .addEventListener('click', _this.handleCopyPath.bind(_this));
    croppersContainer
      .addEventListener('imageRenamed', _this.handleImageRenamed.bind(_this));
    editWebpageButton
      .addEventListener('click', _this.handleEditWebpage.bind(_this));
    exportAllButton
      .addEventListener('click', _this.handleExportAll.bind(_this));
    exportSelectedButton
      .addEventListener('click', _this.handleExportSelected.bind(_this));
    fileWebpageButton
      .addEventListener('click', _this.handleFileWebpageChange.bind(_this));
    filterClearButton
      .addEventListener('click', _this.handleFilterClear.bind(_this));
    filterSubmitButton
      .addEventListener('click', _this.handleFilterSubmit.bind(_this));
    focalpointAutoSaveRadios.forEach(el => el
      .addEventListener('change', _this.handleAutosaveRadioChange.bind(_this)));
    focalpointDeleteButton
      .addEventListener('click', _this.handleFocalpointDelete.bind(_this));
    focalpointResetButton
      .addEventListener('click', _this.handleFocalpointReset.bind(_this));
    focalpointSaveButton
      .addEventListener('click', _this.handleFocalpointSave.bind(_this));
    focalpointXInput
      .addEventListener('change', handleFocalpointInputDebounced.bind(_this));
    focalpointYInput
      .addEventListener('change', handleFocalpointInputDebounced.bind(_this));
    folderInButton
      .addEventListener('click', _this.handleFolderInChange.bind(_this));
    folderOutButton
      .addEventListener('click', _this.handleFolderOutChange.bind(_this));
    folderWebsiteButton
      .addEventListener('click', _this.handleFolderWebsiteChange.bind(_this));
    lastCropperImg
      .addEventListener('ready', _this.handleLastCropperImgReady.bind(_this));
    pathInLink
      .addEventListener('click', _this.handleLinkToPath.bind(_this));
    pathOutLink
      .addEventListener('click', _this.handleLinkToPath.bind(_this));
    thumbsContainer
      .addEventListener('click', _this.handleThumbClick.bind(_this));
    window
      .addEventListener('keydown', _this.handleWindowKeydown.bind(_this));
    window
      .addEventListener('message', _this.handleWindowMessage.bind(_this));
    window
      .addEventListener('resize', _this.handleWindowResize.bind(_this));
  };

  // function calls

  fmcUi.addEventListeners();

  await fmcUi.restoreSettings();

  if (typeof window.electronAPI === 'undefined') {
    FmcUi.testData();
  }
});
