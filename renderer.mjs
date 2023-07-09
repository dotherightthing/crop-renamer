// Electron's render process (web page)

import { CrCroppersUi } from './classes/CrCroppersUi.mjs';
import { CrThumbsUi } from './classes/CrThumbsUi.mjs';
import { CrUtilsUi } from './classes/CrUtilsUi.mjs';

// listeners

window.addEventListener('DOMContentLoaded', async () => {
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

  // cache DOM elements

  const els = {
    body: document.body,
    croppers: document.getElementById('croppers'),
    focalpointAutoSaveInput: document.getElementsByName('focalpoint-autosave'),
    focalpointDelete: document.getElementById('delete-focalpoint'),
    focalpointInput: document.querySelectorAll('#focalpoint-x, #focalpoint-y'),
    focalpointReset: document.getElementById('reset-focalpoint'),
    focalpointX: document.getElementById('focalpoint-x'),
    focalpointY: document.getElementById('focalpoint-y'),
    folderIn: document.getElementById('folder-in'),
    folderOut: document.getElementById('folder-out'),
    imageCrop: document.getElementById('crop-image'),
    lastCropperImg: document.querySelector('#croppers .img-container:last-child img'),
    root: document.getElementById('root'),
    status: document.getElementById('control-status'),
    thumbs: document.getElementById('thumbs'),
    thumbPath: document.getElementById(thumbPathId),
    window: window
  };

  // functions

  /**
   * @function addEventListeners
   * @summary Listen for native and custom events
   */
  const addEventListeners = () => {
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

    els.croppers.addEventListener('statusChange', (event) => {
      const { msg } = event.detail;

      els.status.innerHTML = (msg !== '') ? `${msg}.` : msg;
    });

    els.focalpointAutoSaveInput.forEach(radio => {
      radio.addEventListener('change', (event) => {
        window.electronAPI.storeSet({
          key: 'focalpointAutoSave',
          value: event.target.value === 'on'
        });

        if (event.target.value === 'on') {
          // value is a string despite input being of type number
          if ((Number(els.focalpointX.value) === 50) && (Number(els.focalpointY.value) === 50)) {
            crCroppersUiInstance.deleteImagePercentXYFromImage();
          } else {
            crCroppersUiInstance.writeImagePercentXYToImage({
              imagePercentX: els.focalpointX.value,
              imagePercentY: els.focalpointY.value
            });
          }
        }
      });
    });

    els.focalpointDelete.addEventListener('click', () => {
      crCroppersUiInstance.deleteImagePercentXYFromImage();

      els.focalpointX.value = 50;
      els.focalpointY.value = 50;

      // fire 'change' event so that change is picked up by listener
      const ev = new Event('change');
      els.focalpointY.dispatchEvent(ev); // for both X and Y
    });

    els.focalpointInput.forEach(input => input.addEventListener('change', () => {
      // move cropbox
      crCroppersUiInstance.displayImagePercentXY({
        imagePercentX: els.focalpointX.value,
        imagePercentY: els.focalpointY.value
      });

      const autosave = [ ...els.focalpointAutoSaveInput ].filter(radio => radio.checked)[0].value;

      if (autosave === 'on') {
        // value is a string despite input being of type number
        if ((Number(els.focalpointX.value) === 50) && (Number(els.focalpointY.value) === 50)) {
          crCroppersUiInstance.deleteImagePercentXYFromImage();
        } else {
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

    els.folderIn.addEventListener('click', async () => {
      const { folderName, folderPath, imagesData } = await window.electronAPI.selectFolderIn();

      setFolderIn({ folderName, folderPath, imagesData });
    });

    els.folderOut.addEventListener('click', async () => {
      const { folderName, folderPath } = await window.electronAPI.selectFolderOut();

      setFolderOut({ folderName, folderPath });
    });

    els.imageCrop.addEventListener('click', () => {
      const { targetFolder } = els.folderOut.dataset;

      crCroppersUiInstance.cropImage(targetFolder);
    });

    els.lastCropperImg.addEventListener('ready', () => {
      // short timeout prevents intermittent (browser) error from CrCroppersUi.calcCanvasOffsets()
      setTimeout(() => {
        crCroppersUiInstance.initImagePercentXY();
      }, 10);
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
  };

  /**
   * @function restoreSettings
   * @summary Restore previous stored settings if they exist
   */
  const restoreSettings = async () => {
    const storedFolderIn = await window.electronAPI.selectFolderIn(true);
    const storedFolderOut = await window.electronAPI.selectFolderOut(true);
    const storedFocalpointAutoSave = await window.electronAPI.storeGet({
      key: 'focalpointAutoSave'
    });

    setAutoSave(storedFocalpointAutoSave);
    setFolderIn(storedFolderIn);
    setFolderOut(storedFolderOut);
  };

  /**
   * @function setAutoSave
   * @summary Turn auto save on or off
   * @param {boolean} enabled - On
   */
  const setAutoSave = (enabled) => {
    const autoSaveSetting = enabled ? 'on' : 'off';

    els.focalpointAutoSaveInput.forEach(radio => {
      radio.checked = (radio.value === autoSaveSetting);
    });
  };

  /**
   * @function setFolderIn
   * @summary Set the source folder
   * @param {object} args - Arguments
   * @param {string} args.folderName - Folder name
   * @param {string} args.folderPath - Folder path
   * @param {Array} args.imagesData - Images data
   */
  const setFolderIn = ({ folderName, folderPath, imagesData }) => {
    // if folder select was cancelled
    if ((typeof folderName === 'undefined') || (typeof folderPath === 'undefined') || (typeof imagesData === 'undefined')) {
      return;
    }

    els.folderIn.dataset.hint = true;
    els.folderIn.children[0].innerText = folderName;

    crThumbsUiInstance.generateThumbsHtml(imagesData);
  };

  /**
   * @function setFolderOut
   * @summary Set the target folder
   * @param {object} args - Arguments
   * @param {string} args.folderName - Folder name
   * @param {string} args.folderPath - Folder path
   */
  const setFolderOut = ({ folderName, folderPath }) => {
    // if folder select was cancelled
    if ((typeof folderName === 'undefined') || (typeof folderPath === 'undefined')) {
      return;
    }

    els.folderOut.dataset.targetFolder = folderPath;
    els.folderOut.dataset.hint = true;
    els.folderOut.children[0].innerText = folderName;

    CrUtilsUi.getNextSiblings(els.folderIn).forEach(el => {
      delete el.dataset.disabled;
      el.removeAttribute('disabled');
      el.querySelectorAll('button, input').forEach(formEl => formEl.removeAttribute('disabled'));
    });
  };

  /**
   * @function storeGet
   * @summary Retrieve a stored setting
   * @param {string} key - Key
   * @returns {*} value - Value
   */
  const storeGet = async (key) => {
    const value = await window.electronAPI.storeGet({ key });

    return value;
  };

  /**
   * @function storeSet
   * @summary Store a setting
   * @param {string} key - Key
   * @param {*} value - Value
   */
  const storeSet = async (key, value) => {
    await window.electronAPI.storeSetting({ key, value });
  };

  /**
   * @function useTestData
   */
  const useTestData = () => {
    crThumbsUiInstance.generateThumbsHtml({
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
  };

  // function calls

  addEventListeners();

  await restoreSettings();

  if (typeof window.electronAPI === 'undefined') {
    useTestData();
  }
});
