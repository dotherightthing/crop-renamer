// Electron's render process (web page)

import { CrCroppersUi } from './classes/CrCroppersUi.mjs';
import { CrControlsUi } from './classes/CrControlsUi.mjs';
import { CrThumbsUi } from './classes/CrThumbsUi.mjs';
import { CrUtilsUi } from './classes/CrUtilsUi.mjs';

const appDebugDir = "/Volumes/DanHDD4TB1/Don't Believe The Hype/2022.12.31 - 2023.01.08 - Wellington to Acheron, St James, Rainbow, to Wellington/Day 04 - 2023.01.03 - Aratere Valley to Acheron Campsite";

// globals

// const rotateEl = document.getElementById('rotate');

// functions

// const reinstateCropCenterFromPercentages = () => {};

// const storeCropCenterAsPercentages = (cropBoxCenterX, cropBoxCenterY, imageWidth, imageHeight) => {};

/**
 * @function uiSelectFolder
 */
async function uiSelectFolder() {
  // npm run serve
  if (typeof window.electronAPI === 'undefined') {
    CrUtilsUi.emitEvent('root', 'selectedFolder', {
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

    return;
  }

  const { folderPath, imagesData } = await window.electronAPI.selectFolder({
    appDebugDir
  });

  // if folder select was cancelled
  if ((typeof folderPath === 'undefined') || (typeof imagesData === 'undefined')) {
    return;
  }

  CrUtilsUi.emitEvent('root', 'selectedFolder', {
    imagesData
  });
}

// listeners

window.addEventListener('DOMContentLoaded', () => {
  // instantiate classes

  const thumbPathId = 'thumb-path';

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
    controlIds: {
      deleteImagePercentXYFromImage: 'delete-crop-coordinates'
    },
    initDelay: 5000,
    updateDelay: (typeof Cypress !== 'undefined') ? 0 : 1000
  });

  const crControlUiInstance = new CrControlsUi({
    controlBarId: 'control-bar',
    controlFieldClass: 'control-param',
    controlMsgId: 'control-status'
  });

  const crThumbsUiInstance = new CrThumbsUi({
    selectedClass: 'btn-selected',
    thumbButtonClass: 'btn-thumb',
    thumbClass: 'thumb',
    thumbImgClass: 'thumb-img',
    thumbMetaClass: 'thumb-meta',
    thumbPathId,
    thumbsCountId: 'thumb-count-num',
    thumbsId: 'thumbs'
  });

  // listen for native and custom events

  document.body.addEventListener('keydown', (event) => {
    if (!document.querySelectorAll('#thumbs img').length) {
      return;
    }

    const { keyCode } = event;

    if (keyCode === 37) {
      event.preventDefault(); // don't operate the native container scrollbar
      crThumbsUiInstance.scrollToThumb('previous');
    } else if (keyCode === 39) {
      event.preventDefault();
      crThumbsUiInstance.scrollToThumb('next');
    }
  });

  document.getElementById('croppers').addEventListener('createdMasterCropper', () => {
    crControlUiInstance.clearControlFields();
  });

  document.getElementById('croppers').addEventListener('imageRenamed', (event) => {
    const { newFileName } = event.detail;

    crThumbsUiInstance.changeSelectedImageSrc(newFileName);
  });

  document.getElementById('croppers').addEventListener('paramChange', (event) => {
    const {
      parameter,
      value
    } = event.detail;

    CrControlsUi.setControlParameter(parameter, value);
  });

  document.getElementById('croppers').addEventListener('statusChange', (event) => {
    const { msg } = event.detail;

    crControlUiInstance.setControlMsg(msg);
  });

  document.getElementById('delete-crop-coordinates').addEventListener('click', (event) => {
    crCroppersUiInstance.deleteImagePercentXYFromImage(event);
  });

  document.querySelector('#croppers .img-container:last-child img').addEventListener('ready', () => {
    // short timeout prevents intermittent (browser) error from CrCroppersUi.calcCanvasOffsets()
    setTimeout(() => {
      crCroppersUiInstance.initImagePercentXY();
    }, 10);
  });

  document.getElementById('focalpoint-x').addEventListener('change', (event) => {
    if (event.isTrusted) {
      const imagePercentX = CrControlsUi.getControlParameterValue('focalpoint-x');
      const imagePercentY = CrControlsUi.getControlParameterValue('focalpoint-y');

      crCroppersUiInstance.displayImagePercentXY({ imagePercentX, imagePercentY });
    }
  });

  document.getElementById('focalpoint-y').addEventListener('change', (event) => {
    if (event.isTrusted) {
      const imagePercentX = CrControlsUi.getControlParameterValue('focalpoint-x');
      const imagePercentY = CrControlsUi.getControlParameterValue('focalpoint-y');

      crCroppersUiInstance.displayImagePercentXY({ imagePercentX, imagePercentY });
    }
  });

  document.getElementById('reset-focal-point').addEventListener('click', (event) => {
    crCroppersUiInstance.reinstateImagePercentXYFromImage(event);
  });

  document.getElementById('root').addEventListener('selectedFolder', (event) => {
    const { imagesData } = event.detail;

    crThumbsUiInstance.generateThumbsHtml(imagesData);
  });

  document.getElementById('save-crop-coordinates').addEventListener('click', () => {
    crCroppersUiInstance.writeImagePercentXYToImage();
  });

  document.getElementById('thumbs').addEventListener('click', (event) => {
    const target = crThumbsUiInstance.getClickedButton(event);
    const newImageSrc = target.querySelector('img').getAttribute('src');

    crThumbsUiInstance.applySelectedClass(target);
    crThumbsUiInstance.scrollToThumb('selected');
    crThumbsUiInstance.displayPath(newImageSrc);

    // calls crCroppersUiInstance.init
    crCroppersUiInstance.changeSourceImage(target);
  });

  document.getElementById(thumbPathId).addEventListener('click', (event) => {
    event.preventDefault();

    if (typeof window.electronAPI === 'undefined') {
      crControlUiInstance.setControlMsg('Error: Finder links require Electron');

      return;
    }

    const href = event.target.getAttribute('href');

    if (href) {
      window.electronAPI.openInFinder({
        href
      });
    }
  });

  window.addEventListener('resize', () => {
    crThumbsUiInstance.scrollToThumb('selected');
  });

  uiSelectFolder();
});
