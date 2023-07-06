// Electron's render process (web page)

import { CrCroppersUi } from './classes/CrCroppersUi.mjs';
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
    initDelay: 5000,
    updateDelay: (typeof Cypress !== 'undefined') ? 0 : 1000
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

  // elements

  const els = {
    body: document.body,
    croppers: document.getElementById('croppers'),
    focalpointAutoSaveInput: document.getElementsByName('focalpoint-autosave'),
    focalpointDelete: document.getElementById('delete-crop-coordinates'),
    focalpointInput: document.querySelectorAll('.focalpoint-input'),
    focalpointReset: document.getElementById('reset-focal-point'),
    focalpointX: document.getElementById('focalpoint-x'),
    focalpointY: document.getElementById('focalpoint-y'),
    lastCropperImg: document.querySelector('#croppers .img-container:last-child img'),
    root: document.getElementById('root'),
    status: document.getElementById('control-status'),
    thumbs: document.getElementById('thumbs'),
    thumbPath: document.getElementById(thumbPathId),
    window: window
  };

  // listen for native and custom events

  els.body.addEventListener('keydown', (event) => {
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

  els.croppers.addEventListener('imageRenamed', (event) => {
    const { newFileName } = event.detail;

    crThumbsUiInstance.changeSelectedImageSrc(newFileName);
  });

  els.croppers.addEventListener('paramChange', (event) => {
    const { parameter, value } = event.detail;

    document.getElementById(parameter).value = value;
  });

  els.croppers.addEventListener('statusChange', (event) => {
    const { msg } = event.detail;

    els.status.innerHTML = (msg !== '') ? `${msg}.` : msg;
  });

  els.focalpointAutoSaveInput.forEach(radio => {
    radio.addEventListener('change', (event) => {
      if (event.target.value === 'on') {
        crCroppersUiInstance.writeImagePercentXYToImage({
          imagePercentX: els.focalpointX.value,
          imagePercentY: els.focalpointY.value
        });
      }
    });
  });

  els.focalpointDelete.addEventListener('click', (event) => {
    crCroppersUiInstance.deleteImagePercentXYFromImage(event);

    els.focalpointX.value = 50;
    els.focalpointY.value = 50;

    crCroppersUiInstance.displayImagePercentXY({
      imagePercentX: els.focalpointX.value,
      imagePercentY: els.focalpointY.value
    });
  });

  els.focalpointInput.forEach(input => input.addEventListener('change', (event) => {
    if (event.isTrusted) {
      crCroppersUiInstance.displayImagePercentXY({
        imagePercentX: els.focalpointX.value,
        imagePercentY: els.focalpointY.value
      });

      const autosave = [ ...els.focalpointAutoSaveInput ].filter(radio => radio.checked)[0].value;

      if (autosave === 'on') {
        crCroppersUiInstance.writeImagePercentXYToImage({
          imagePercentX: els.focalpointX.value,
          imagePercentY: els.focalpointY.value
        });
      }
    }
  }));

  els.focalpointReset.addEventListener('click', (event) => {
    crCroppersUiInstance.reinstateImagePercentXYFromImage(event);
  });

  els.lastCropperImg.addEventListener('ready', () => {
    // short timeout prevents intermittent (browser) error from CrCroppersUi.calcCanvasOffsets()
    setTimeout(() => {
      crCroppersUiInstance.initImagePercentXY();
    }, 10);
  });

  els.root.addEventListener('selectedFolder', (event) => {
    const { imagesData } = event.detail;

    crThumbsUiInstance.generateThumbsHtml(imagesData);
  });

  els.thumbs.addEventListener('click', (event) => {
    const target = crThumbsUiInstance.getClickedButton(event);
    const newImageSrc = target.querySelector('img').getAttribute('src');

    crThumbsUiInstance.applySelectedClass(target);
    crThumbsUiInstance.scrollToThumb('selected');
    crThumbsUiInstance.displayPath(newImageSrc);

    // calls crCroppersUiInstance.init
    crCroppersUiInstance.changeSourceImage(target);
  });

  els.thumbPath.addEventListener('click', (event) => {
    event.preventDefault();

    if (typeof window.electronAPI === 'undefined') {
      els.status.innerHTML = 'Error: Finder links require Electron';

      return;
    }

    const href = event.target.getAttribute('href');

    if (href) {
      window.electronAPI.openInFinder({
        href
      });
    }
  });

  els.window.addEventListener('resize', () => {
    crThumbsUiInstance.scrollToThumb('selected');
  });

  uiSelectFolder();
});
