// Electron's render process (web page)

import { CrUi } from './classes/CrUi.mjs';
import { CrCroppersUi } from './classes/CrCroppersUi.mjs';
import { CrThumbsUi } from './classes/CrThumbsUi.mjs';

// listeners

window.addEventListener('DOMContentLoaded', async () => {
  // instantiate classes

  const controlHintClass = 'control-hint';
  const thumbClass = 'thumb';
  const thumbImgClass = 'thumb-img';

  const crCroppersUiInstance = new CrCroppersUi({
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
    initDelay: 5000,
    updateDelay: (typeof Cypress !== 'undefined') ? 0 : 1000
  });

  const crThumbsUiInstance = new CrThumbsUi({
    selectedClass: 'btn-selected',
    thumbButtonClass: 'btn-thumb',
    thumbClass,
    thumbImgClass,
    thumbImgWrapperClass: 'thumb-img-wrapper',
    thumbMetaClass: 'thumb-meta',
    thumbsCountId: 'thumb-count',
    thumbsId: 'thumbs'
  });

  const crUi = new CrUi({
    crCroppersUiInstance,
    crThumbsUiInstance,
    elements: {
      console: document.getElementById('console'),
      copyPaths: document.querySelectorAll('.control-copy'),
      copyPathIn: document.getElementById('copy-path-in'),
      copyPathOut: document.getElementById('copy-path-out'),
      copyPathWebEmbed: document.getElementById('copy-path-web-embed'),
      croppersContainer: document.getElementById('croppers'),
      exportCropsAndSizesButton: document.getElementById('crop-image'),
      focalpointAutoSaveInput: document.getElementsByName('focalpoint-autosave'),
      focalpointDeleteButton: document.getElementById('delete-focalpoint'),
      focalpointInput: document.querySelectorAll('#focalpoint-x, #focalpoint-y'),
      focalpointResetButton: document.getElementById('reset-focalpoint'),
      focalpointXInput: document.getElementById('focalpoint-x'),
      focalpointYInput: document.getElementById('focalpoint-y'),
      folderInButton: document.getElementById('folder-in'),
      folderOutButton: document.getElementById('folder-out'),
      folderOutButtonDependent: document.querySelector('[data-dependent="folder-out"]'),
      folderWebpageButton: document.getElementById('folder-webpage'),
      folderWebsiteButton: document.getElementById('folder-website'),
      lastCropperImg: document.querySelector('#croppers .img-container:last-child img'),
      pathLinks: document.querySelectorAll('.control-link'),
      pathInLink: document.getElementById('link-path-in'),
      pathOutLink: document.getElementById('link-path-out'),
      thumbsContainer: document.getElementById('thumbs'),
      thumbFileName: document.getElementById('thumb-filename'),
      window: window
    },
    selectors: {
      controlHintClass,
      thumbClass,
      thumbImgClass
    }
  });

  // function calls

  crUi.addEventListeners();

  await crUi.restoreSettings();

  if (typeof window.electronAPI === 'undefined') {
    CrUi.testData();
  }
});
