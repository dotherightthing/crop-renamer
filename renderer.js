// Electron's render process (web page)

'use strict';

// globals

const Cropper = window.Cropper;
const cropperCanvasClass = 'cropper-canvas';
const cropperImageClass = 'cropperImage';
const croppersClass = 'grid-croppers';
const debugBarEl = document.getElementById('debug-bar');
const debugMsgClass = 'debug-param';
const readCropCoordinatesFromImageEl = document.getElementById('read-crop-coordinates-from-image');
const removeCropCoordinatesFromImageEl = document.getElementById('remove-crop-coordinates-from-image');
const rotateEl = document.getElementById('rotate');
const resetFocalPointEl = document.getElementById('reset-focal-point');
const writeCropCoordinatesToImageEl = document.getElementById('write-crop-coordinates-to-image');
const selectedClass = 'btn-selected';
const thumbButtonClass = 'btn-thumb';
const thumbClass = 'thumb';
const thumbImgClass = 'thumb-img';
const thumbMetaClass = 'thumb-meta';
const thumbsCount = document.getElementById('thumb-count-num');
const thumbsFolder = document.getElementById('thumb-folder');
const thumbsEl = document.getElementById('thumbs');

let croppers = [];
let masterCropperCropBoxWasDragged = false;

// functions

/**
 * @function capitalize
 * @summary Make the first letter of the string uppercase, also applies to underscore separated strings
 * @param {string} str - String
 * @returns {string}
*/
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * @function createOutputSet
 * @summary Create UI to display debugging parameters
 * @param {object} options - Options
 * @param {options.id} id - ID
 * @param {options.title} title - Title
 * @param {options.outputs} outputs - Outputs object
 * @returns {object} - { html, outputIds }
 */
const createOutputSet = ({ id, title, outputs = {} }) => {
  let outputsHtml = '';
  let outputIds = {};
  const outputsKeys = Object.keys(outputs);

  outputsKeys.forEach(outputKey => {
    const output = outputs[outputKey];
    const outputId = `${id}-output-${output}`;
    const outputParts = output.split('_');
    let outputLabel = '';

    outputParts.forEach(part => {
      outputLabel += capitalize(part) + ' ';
    });

    outputLabel = outputLabel.trim();

    outputIds[output] = outputId;

    outputsHtml += `<div class="control">
  <label for="${outputId}">${outputLabel}</label>
  <input type="text" value="0" id="${outputId}" readonly>
</div> 
`;
  });

  const html = `<div class="debug-param">
  <fieldset>
    <legend>
      <div class="legend">${title}</div>
    </legend>
    <div class="controls">
      ${outputsHtml}
    </div>
  </fieldset>
</div>
`;

  return {
    html,
    outputIds
  };
};

/**
 * @function debugClickLocation
 * @summary Output the pointer location
 * @param {event} e
*/
const debugClickLocation = (e) => {
  const masterCropper = getMasterCropper();
  const { outputIds } = masterCropper;

  document.getElementById(outputIds.mouse.page_x).value = Math.round(e.clientX);
  document.getElementById(outputIds.mouse.page_y).value = Math.round(e.clientY);
};

/**
 * @function debugParameter
 * @summary Output the pointer location
 * @param {object} cropper - Cropper from croppers array
 * @param {string} parameter - Output ID parameter
 * @param {Number} value - Value to display
 * @param {boolean} round - Whether to round the value
*/
const debugParameter = (cropper, parameter, value, round = false) => {
  const { outputIds } = cropper;
  let outputValue = round ? Math.round(value) : value;
  const [ group, param ] = parameter.split('.');

  document.getElementById(outputIds[group][param]).value = outputValue;
};

/**
 * @function getDebugParameterValue
 * @summary Get the value of a debugging field
 * @param {object} cropper - Cropper from croppers array
 * @param {string} parameter - Output ID parameter
 * @returns {Number} value - Displayed value
*/
const getDebugParameterValue = (cropper, parameter) => {
  const { outputIds } = cropper;
  const [ group, param ] = parameter.split('.');
  const field = document.getElementById(outputIds[group][param]);

  if (field !== null) {
    return field.value;
  }

  return -1;
};

/**
 * @function destroyCroppers
 * @summary Destroy instances of cropperjs
*/
const destroyCroppers = () => {
  croppers.forEach(cropper => {
    const { cropperInstance } = cropper;

    if (cropperInstance) {
      cropperInstance.destroy();
    }
  });

  croppers = [];
};

/**
 * @function getCropperCanvasOffsets
 * @summary cropper.getCanvasData().top ignores preceding UI and returns 0, this function returns the actual offset
 * @param {object} cropper - Cropper
 * @returns {object} { top, left }
*/
const getCropperCanvasOffsets = (cropper) => {
  const {
    element: cropperImage
  } = cropper;

  const cropperContainerEl = cropperImage.nextSibling;
  const cropperCanvasEl = cropperContainerEl.querySelector(`.${cropperCanvasClass}`);

  const {
    top,
    left
  } = getOffset(cropperCanvasEl);

  return { top, left };
};

/**
 * @function getMasterCropper
 * @summary Get the object for the master cropper (which contains the cropperInstance)
 * @returns {object} { cropperInstance, isMaster, outputIds }
*/
const getMasterCropper = () => {
  const masterCroppers = croppers.filter(cropper => cropper.isMaster);

  return masterCroppers[0];
};

/**
 * @function getNextIndex
 * @summary Get the index of the next node in a nodelist
 * @returns {Number} nextIndex | -1
*/
const getNextIndex = (nodeList, selectedIndex) => {
  let nextIndex = -1;

  if ((selectedIndex + 1) < nodeList.length) {
    nextIndex = selectedIndex + 1;
  } else {
    nextIndex = 0;
  }

  return nextIndex;
};

/**
 * @function getOffset
 * @summary Get the space between an element and the viewport (this matches the inline CSS translate implemented by cropperjs)
 * @returns {object} offset - { top, left }
 * @see {@link https://usefulangle.com/post/179/jquery-offset-vanilla-javascript}
*/
const getOffset = (el) => {
  const rect = el.getBoundingClientRect();
  const offset = {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX
  };

  return offset;
};

/**
 * @function getPreviousIndex
 * @summary Get the index of the previous node in a nodelist
 * @returns {Number} previousIndex | -1
*/
const getPreviousIndex = (nodeList, selectedIndex) => {
  let previousIndex = -1;

  if (selectedIndex > 0) {
    previousIndex = selectedIndex - 1;
  } else {
    previousIndex = nodeList.length - 1; // loop around to last item
  }

  return previousIndex;
};

/**
 * @function getSelectedIndex
 * @summary Get the index of the selected node in a nodelist
 * @returns {Number} selectedIndex | -1
*/
const getSelectedIndex = (nodeList) => {
  let selectedIndex = -1;

  nodeList.forEach((node, index) => {
    if (node.classList.contains(selectedClass)) {
      selectedIndex = index;
    }
  });

  return selectedIndex;
};

/**
 * @function getSlaveCroppers
 * @summary Get an array of slave croppers (containing objects which include the cropperInstance)
 * @returns {Array} slaveCroppers
*/
const getSlaveCroppers = () => {
  const slaveCroppers = croppers.filter(cropper => typeof cropper.isMaster === 'undefined');

  return slaveCroppers;
};

/**
 * @function handleKeyDown
 * @summary Handle key presses to facilitate thumb navigation with the cursor keys.
 * @param {event} e
*/
const handleKeyDown = (e) => {
  e.preventDefault(); // don't operate the native container scrollbar

  let masterCropper = getMasterCropper();

  if (!masterCropper) {
    return;
  }

  if (!thumbsEl.querySelectorAll(`.${thumbImgClass}`).length) {
    return;
  }

  const { keyCode } = e;
  const thumbsButtons = thumbsEl.querySelectorAll(`.${thumbButtonClass}`);
  const thumbsButtonSelectedIndex = getSelectedIndex(thumbsButtons);
  let thumbsButtonNextIndex = -1;

  if (keyCode === 37) { // left arrow
    e.preventDefault();
    thumbsButtonNextIndex = getPreviousIndex(thumbsButtons, thumbsButtonSelectedIndex);
  } else if (keyCode === 39) { // right arrow
    e.preventDefault();
    thumbsButtonNextIndex = getNextIndex(thumbsButtons, thumbsButtonSelectedIndex);
  }

  if (thumbsButtonNextIndex > -1) {
    thumbsButtons[thumbsButtonNextIndex].click();

    thumbsButtons[thumbsButtonNextIndex].scrollIntoView({
      behavior: 'auto'
    });
  }
};

/**
 * @function handleMouseUp
 * @summary Handle mouse clicks
 * @param {event} e - Event object passed to called function
*/
const handleMouseUp = (e) => {
  const masterCropper = getMasterCropper();

  if (!masterCropper) {
    return;
  }

  debugClickLocation(e);
};

/**
 * @function handleReadCropCoordinatesFromImage
*/
const handleReadCropCoordinatesFromImage = () => {
  const masterCropperInstance = getMasterCropper().cropperInstance;
  const masterCropperImageSrc = masterCropperInstance.element.src;

  const regexp = /\[([0-9]+)%,([0-9]+)%\]/g; // filename__[20%,30%].ext
  const matches = masterCropperImageSrc.matchAll(regexp);
  const matchesArr = [ ...matches ];

  if (matchesArr.length) {
    const position = {
      imagePercentageLeft: matchesArr[0][1],
      imagePercentageTop: matchesArr[0][2]
    };

    applyFocalPoint(position);
  }
};

/**
 * @function handleRemoveCropCoordinatesFromImage
*/
const handleRemoveCropCoordinatesFromImage = async () => {
  const masterCropper = getMasterCropper();

  const fileName = masterCropper.cropperInstance.element.src;

  removeCropCoordinatesFromImageEl.disabled = true;

  const newFileName = await window.electronAPI.removeCropCoordinatesFromImage({
    fileName
  });

  removeCropCoordinatesFromImageEl.disabled = false;

  masterCropper.cropperInstance.element.src = `file://${newFileName.replaceAll(' ', '%20')}`;
  document.querySelector('.thumbs .btn-selected img').src = newFileName;
};

/**
 * @function handleWriteCropCoordinatesToImage
 * @summary Save the crop XY to the image file
 * @param {event} e
 * @todo Working but top and left aren't correct for both tested images
 * @todo Refresh thumbnail and image src after renaming image file
 */
const handleWriteCropCoordinatesToImage = async () => {
  const masterCropper = getMasterCropper();

  const imagePercentageTop = getDebugParameterValue(masterCropper, 'cropbox.percentage_top');
  const imagePercentageLeft = getDebugParameterValue(masterCropper, 'cropbox.percentage_left');

  const fileName = masterCropper.cropperInstance.element.src;

  removeCropCoordinatesFromImageEl.disabled = true;

  const newFileName = await window.electronAPI.writeCropCoordinatesToImage({
    fileName,
    imagePercentageTop,
    imagePercentageLeft
  });

  removeCropCoordinatesFromImageEl.disabled = false;

  masterCropper.cropperInstance.element.src = `file://${newFileName.replaceAll(' ', '%20')}`;
  document.querySelector('.thumbs .btn-selected img').src = newFileName;
};

/**
 * @function handleThumbSelect
 * @summary Change the image when a thumb is selected (triggered on load)
 * @param {event} e
 */
const handleThumbSelect = (event) => {
  const e = event || window.event;
  let target = e.target || e.srcElement;

  while (target.tagName.toLowerCase() !== 'button') {
    target = target.parentNode;
  }

  if (!thumbsEl.querySelectorAll('img').length) {
    return;
  }

  const newImage = target.querySelector('img');
  const newImageSrc = newImage.getAttribute('src');

  destroyCroppers();

  initCroppers(newImageSrc);

  const thumbItems = thumbsEl.querySelectorAll('button');
  thumbItems.forEach(thumbItem => {
    thumbItem.classList.remove(selectedClass);
  });

  target.classList.add(selectedClass);
};

/**
 * @function initCroppers
 * @summary Initialise cropper instances (master and slaves)
 * @param {string} imageSrc - HTML src attribute
 */
const initCroppers = (imageSrc) => {
  const cropperImages = document.querySelectorAll(`.${cropperImageClass}`);

  const cropperOptions = {
    autoCrop: true, // Enable to crop the image automatically when initialized
    autoCropArea: 1, // Define the automatic cropping area size - as 100% of the image
    background: true,
    center: true, // Show the center indicator above the crop box
    checkCrossOrigin: true, // Check if the current image is a cross-origin image.
    checkOrientation: true, // Check the current image's Exif Orientation information
    cropBoxMovable: false, // Enable to move the crop box by dragging
    cropBoxResizable: false, // Enable to resize the crop box by dragging
    dragMode: 'none', // create a new crop box | move the canvas | do nothing
    guides: true,
    highlight: true,
    modal: true,
    movable: false, // Enable to move the image
    preview: '',
    responsive: true, // Re-render the cropper when resizing the window.
    restore: true, // Restore the cropped area after resizing the window
    rotatable: true, // TODO: rotate should affect entire image, not just the crop, so requires an additional pre-crop
    scale: 1,
    scalable: false, // Enable to scale the image
    toggleDragModeOnDblclick: false,
    viewMode: 1, // restrict the crop box not to exceed the size of the canvas.
    zoomable: false, // Enable to zoom the image
    zoomOnTouch: false,
    zoomOnWheel: false
  };

  const croppersEl = document.querySelectorAll(`.${croppersClass}`)[0];

  window.removeEventListener('resize', scrollToSelectedThumb);
  croppersEl.removeEventListener('click', handleMouseUp);

  window.addEventListener('resize', scrollToSelectedThumb);
  croppersEl.addEventListener('click', handleMouseUp);

  // remove debug messages whilst retaining any buttons
  const debugMsgs = debugBarEl.querySelectorAll(`.${debugMsgClass}`);

  debugMsgs.forEach(debugMsg => {
    debugMsg.remove();
  });

  cropperImages.forEach((cropperImage, cropperIndex) => {
    const data = cropperImage.dataset;

    cropperImage.setAttribute('src', imageSrc);

    const {
      cropperAspectRatio: aspectRatio,
      cropperLabel: label,
      cropperMaster: isMaster
    } = data;

    const parent = cropperImage.parentNode;

    let heading = parent.querySelector('h2');

    if (!heading) {
      const headingText = document.createTextNode(label);
      heading = document.createElement('h2');

      heading.appendChild(headingText);
      parent.insertBefore(heading, cropperImage);
    }

    const [
      a,
      b
    ] = aspectRatio.split(':');

    const options = { ...cropperOptions };

    Object.assign(options, {
      aspectRatio: a / b
    });

    if (isMaster) {
      // https://codepen.io/saleemnaufa/pen/gVewZw
      Object.assign(options, {
        autoCropArea: 0.2,
        cropBoxMovable: true,
        guides: false,
        movable: true,
        // crop - fires during move, then after cropend
        // cropstart - occurs on mouse down, so before a click AND before a move
        cropmove: () => {
          masterCropperCropBoxWasDragged = true; // differentiate between a click and a move
        },
        cropend: (e) => { // dragEnd callback, see https://github.com/fengyuanchen/cropperjs/issues/669; fires after move
          moveCropperCropBoxToPageXY(e);
        }
      });
    }

    const cropperInstance = new Cropper(cropperImage, options);

    let outputIdSets = {};

    let outputs = {
      // canvas: [ 'top', 'left' ],
      // cropbox: [ 'top', 'left' ]
    };

    if (cropperIndex === 0) {
      outputs = {
        mouse: [
          'page_x',
          'page_y'
        ], // same as 'client_x', 'client_y'
        // cropper: [ 'x', 'y' ],
        // container: [ 'width', 'height' ],
        // canvas: [ 'left', 'top' ],
        image: [ 'width', 'height' ],
        // drg: [ 'top' ],
        cropbox: [
          'canvas_top_offset',
          'canvas_top',
          'expected_center_x',
          'expected_center_y',
          'actual_center_x',
          'actual_center_y',
          'percentage_top',
          'percentage_left',
          'set_top',
          'set_left',
          'restored_top',
          'restored_left'
        ]
      };
    }

    const outputsKeys = Object.keys(outputs);

    outputsKeys.forEach(outputKey => {
      const index = cropperIndex + 1;
      const title = capitalize(outputKey);

      const { html: topHtml, outputIds } = createOutputSet({
        id: `cropper${index}-${outputKey}`,
        title: `${title} ${index}`,
        outputs: outputs[outputKey]
      });

      // https://stackoverflow.com/a/37448747
      debugBarEl.insertAdjacentHTML('beforeend', topHtml);

      outputIdSets[outputKey] = outputIds;
    });

    croppers.push({
      cropperInstance,
      // imageId, cropper.element.id
      isMaster,
      outputIds: outputIdSets
    });
  });

  if (typeof document.createElement('cropper').style.transition === 'undefined') {
    rotateEl.prop('disabled', true);
  }

  setTimeout(() => {
    const position = readFocalPointFromImage();

    applyFocalPoint(position);
  }, 5000);
};

/**
 * @function getCropBoxLeftTopFromPageXY
 * @param {object} { pageX, pageY }
 * @returns {object} { cropBoxLeft, cropBoxTop }
 */
const getCropBoxLeftTopFromPageXY = ({ pageX, pageY }) => {
  const masterCropperInstance = getMasterCropper().cropperInstance;

  const {
    top: canvasTop,
    left: canvasLeft
  } = masterCropperInstance.getCanvasData();

  const {
    top: canvasOffsetTop,
    left: canvasOffsetLeft
  } = getCropperCanvasOffsets(masterCropperInstance);

  const {
    width: cropperWidth,
    height: cropperHeight
  } = masterCropperInstance.getCropBoxData();

  const pageXOffset = pageX + canvasLeft - canvasOffsetLeft;
  const cropBoxLeft = pageXOffset - (cropperWidth / 2);

  const pageYOffset = pageY + canvasTop - canvasOffsetTop;
  const cropBoxTop = pageYOffset - (cropperHeight / 2);

  return {
    cropBoxLeft,
    cropBoxTop
  };
};

/**
 * @function getImagePercentageFromCropBoxCenter
 * @summary Get the X or Y coordinate as a percentage of the image dimension, so that it can be stored and recalled later.
 * @param {Number} cropCenter - Crop center (X or Y axis)
 * @param {Number} dimensionLength - Dimension length (width or height)
 * @returns {Number} percentage
 */
const getImagePercentageFromCropBoxCenter = (cropCenter, dimensionLength) => {
  let percentage = cropCenter / dimensionLength;

  if (percentage < 0) {
    percentage = 0;
  }

  if (percentage > 100) {
    percentage = 100;
  }

  // In testing, rounding changes the results by 1-4 units.
  // This causes little visual difference but makes the numbers much easier to store.

  return Math.round(percentage * 100);
};

/**
 * @function getImagePercentageLeftTopFromPageXY
 * @param {object} { pageX, pageY }
 * @returns {object} { imagePercentageLeft, imagePercentageTop }
 */
const getImagePercentageLeftTopFromPageXY = ({ pageX, pageY }) => {
  const masterCropper = getMasterCropper();
  const masterCropperInstance = masterCropper.cropperInstance;

  const {
    width: cropBoxWidth,
    height: cropBoxHeight
  } = masterCropperInstance.getCropBoxData();

  const {
    width: imageWidth,
    height: imageHeight
  } = masterCropperInstance.getImageData();

  debugParameter(masterCropper, 'cropbox.expected_center_x', imageWidth / 2, false);
  debugParameter(masterCropper, 'cropbox.expected_center_y', imageHeight / 2, false);

  const cropBoxCenterX = pageX - (cropBoxWidth / 2);
  const cropBoxCenterY = pageY - (cropBoxHeight / 2);

  debugParameter(masterCropper, 'cropbox.actual_center_x', cropBoxCenterX, false);
  debugParameter(masterCropper, 'cropbox.actual_center_y', cropBoxCenterY, false);

  const imagePercentageLeft = getImagePercentageFromCropBoxCenter(cropBoxCenterX, imageWidth, false);
  const imagePercentageTop = getImagePercentageFromCropBoxCenter(cropBoxCenterY, imageHeight, false);

  debugParameter(masterCropper, 'cropbox.percentage_top', imagePercentageTop, false);
  debugParameter(masterCropper, 'cropbox.percentage_left', imagePercentageLeft, false);

  return {
    imagePercentageLeft,
    imagePercentageTop
  };
};

/**
 * @function getImageXYFromPageXY
 * @param {object} { pageX, pageY }
 * @returns {object} { imageX, imageY }
 */
const getImageXYFromPageXY = ({ pageX, pageY }) => {
  const masterCropperInstance = getMasterCropper().cropperInstance;

  const {
    left: canvasOffsetLeft,
    top: canvasOffsetTop
  } = getCropperCanvasOffsets(masterCropperInstance);

  const imageX = pageX - canvasOffsetLeft;
  const imageY = pageY - canvasOffsetTop;

  return {
    imageX,
    imageY
  };
};

/**
 * @function getImageXYFromImagePercentageLeftTop
 * @param {object} { imagePercentageLeft, imagePercentageTop }
 * @returns {object} { imageX, imageY }
 */
const getImageXYFromImagePercentageLeftTop = ({ imagePercentageLeft, imagePercentageTop }) => {
  const masterCropperInstance = getMasterCropper().cropperInstance;

  const {
    width: imageWidth,
    height: imageHeight
  } = masterCropperInstance.getImageData();

  const imageX = ((imagePercentageLeft / 100) * imageWidth);
  const imageY = ((imagePercentageTop / 100) * imageHeight);

  return {
    imageX,
    imageY
  };
};

/**
 * @function getPageXYFromImageXY
 * @param {object} { imageX, imageY }
 * @returns {object} { pageX, pageY }
 */
const getPageXYFromImageXY = ({ imageX, imageY }) => {
  const masterCropperInstance = getMasterCropper().cropperInstance;

  const {
    left: canvasOffsetLeft,
    top: canvasOffsetTop
  } = getCropperCanvasOffsets(masterCropperInstance);

  const pageX = imageX + canvasOffsetLeft;
  const pageY = imageY + canvasOffsetTop;

  return {
    pageX,
    pageY
  };
};

// convert image percentage X/Y to crop Left/Top
const applyFocalPoint = ({ imagePercentageTop, imagePercentageLeft }) => {
  // simulate click event
  masterCropperCropBoxWasDragged = false;

  // const masterCropperInstance = getMasterCropper().cropperInstance;

  const {
    imageX,
    imageY
  } = getImageXYFromImagePercentageLeftTop({ imagePercentageTop, imagePercentageLeft });

  const {
    pageX,
    pageY
  } = getPageXYFromImageXY({ imageX, imageY });

  // const {
  //   cropBoxLeft,
  //   cropBoxTop
  // } = getCropBoxLeftTopFromPageXY({ pageX, pageY });

  // ok
  // TODO call moveMasterCropperCropBox instead
  // masterCropperInstance.setCropBoxData({
  //   top: cropBoxTop,
  //   left: cropBoxLeft
  // });

  // const e = {
  //   detail: {
  //     originalEvent: {
  //       pageX,
  //       pageY
  //     }
  //   }
  // };

  // moveCropperCropBoxToPageXY(e);

  moveMasterCropperCropBox({
    pageX,
    pageY
  });
};

/**
 * @function moveCropperCropBoxToPageXY
 * @param {event} e
 * @todo This sometimes needs to be clicked twice, needs to support a shaky hand (#5)
 * @todo Also support end of dragging
 */
const moveCropperCropBoxToPageXY = (e) => {
  const cropperWasDragged = masterCropperCropBoxWasDragged;

  masterCropperCropBoxWasDragged = false;

  const {
    pageX,
    pageY
  } = e.detail.originalEvent;

  const masterCropper = getMasterCropper(); // obj
  const slaveCroppers = getSlaveCroppers(); // arr

  const masterCropperInstance = masterCropper.cropperInstance;

  const {
    top: masterCropperCanvasOffsetTop,
    left: masterCropperCanvasOffsetLeft
  } = getCropperCanvasOffsets(masterCropperInstance);

  const {
    top: masterCropperCanvasTop,
    left: masterCropperCanvasLeft
  } = masterCropperInstance.getCanvasData();

  if (!cropperWasDragged) {
    // move the cropper to the click location
    moveMasterCropperCropBox({
      pageX,
      pageY
    });
  }

  slaveCroppers.forEach(cropper => {
    const {
      cropperInstance
    } = cropper;

    moveSlaveCropperCropBox({
      cropper: cropperInstance,
      pageX,
      pageY,
      masterCropperCanvasOffsetTop,
      masterCropperCanvasTop,
      masterCropperCanvasLeft
    });
  });
};

/**
 * @function moveMasterCropperCropBox
 * @summary When the canvas is clicked, move the crop box on the master cropper so it centers on the pointer location
 * @param {object} options
 * @param {options.pageX} pageX
 * @param {options.pageY} pageY
 */
const moveMasterCropperCropBox = ({
  pageX,
  pageY
}) => {
  const masterCropperInstance = getMasterCropper().cropperInstance;

  const {
    top: masterCropperCanvasTop,
    left: masterCropperCanvasLeft
  } = masterCropperInstance.getCanvasData();

  const {
    top: masterCropperCanvasOffsetTop,
    left: masterCropperCanvasOffsetLeft
  } = getCropperCanvasOffsets(masterCropperInstance);

  const {
    cropBoxLeft,
    cropBoxTop
  } = getCropBoxLeftTopFromPageXY({ pageX, pageY });

  const {
    imagePercentageLeft,
    imagePercentageTop
  } = getImagePercentageLeftTopFromPageXY({ pageX, pageY });

  const {
    width: imageWidth,
    height: imageHeight
  } = masterCropperInstance.getImageData();

  masterCropperInstance.setCropBoxData({
    top: cropBoxTop,
    left: cropBoxLeft
  });

  // test that the value is restored correctly if the percentages are applied

  // eslint-disable-next-line max-len
  const restoredTop = ((imagePercentageTop / 100) * imageHeight) + masterCropperCanvasTop - masterCropperCanvasOffsetTop;
  const restoredLeft = ((imagePercentageLeft / 100) * imageWidth);

  const masterCropper = getMasterCropper();

  debugParameter(masterCropper, 'cropbox.canvas_top_offset', masterCropperCanvasOffsetTop, true);
  debugParameter(masterCropper, 'cropbox.canvas_top', masterCropperCanvasTop, true);

  debugParameter(masterCropper, 'cropbox.set_top', cropBoxTop, true);
  debugParameter(masterCropper, 'cropbox.set_left', cropBoxLeft, true);
  debugParameter(masterCropper, 'cropbox.restored_top', restoredTop, true);
  debugParameter(masterCropper, 'cropbox.restored_left', restoredLeft, true);

  debugParameter(masterCropper, 'image.width', imageWidth, true);
  debugParameter(masterCropper, 'image.height', imageHeight, true);

  // visual delay so its clear what's happening
  setTimeout(() => {
    masterCropperInstance.setCropBoxData({
      top: restoredTop,
      left: restoredLeft
    });
  }, 500);
};

/**
 * @function moveSlaveCropperCropBox
 * @summary Move the crop box on the dependent cropper
 * @param {object} options
 * @param {options.cropper} cropper - Slave cropper
 * @param {options.pageX} pageX
 * @param {options.pageY} pageY
 * @param {options.masterCropperCanvasOffsetTop} masterCropperCanvasOffsetTop - Height of preceding UI
 * @param {options.masterCropperCanvasLeft} masterCropperCanvasLeft - gap between edge of viewport and start of master image
 */
const moveSlaveCropperCropBox = ({
  cropper,
  pageX,
  pageY,
  masterCropperCanvasOffsetTop,
  masterCropperCanvasLeft
}) => {
  const {
    top: cropperCanvasTop // gap between top of column and start of slave image
  } = cropper.getCanvasData();

  const {
    width: cropperWidth,
    height: cropperHeight
  } = cropper.getCropBoxData();

  const cropBoxCenterX = scaleSlaveVal(cropper, pageX) - (cropperWidth / 2);
  const cropBoxCenterY = scaleSlaveVal(cropper, pageY) - (cropperHeight / 2);
  const cropperCropBoxTop = cropperCanvasTop + cropBoxCenterY - scaleSlaveVal(cropper, masterCropperCanvasOffsetTop);
  const cropperCropBoxLeft = cropBoxCenterX - scaleSlaveVal(cropper, masterCropperCanvasLeft);

  cropper.setCropBoxData({
    top: cropperCropBoxTop,
    left: cropperCropBoxLeft
  });
};

/**
 * @function readFocalPointFromImage
 * @summary Read focal point position from filename
 * @returns {object} { imagePercentageTop, imagePercentageLeft }
 * @todo Finish - this is only placeholder code for testing purposes.
 */
const readFocalPointFromImage = () => {
  return {
    imagePercentageTop: 50,
    imagePercentageLeft: 50
  };
};

/**
 * @function handleResetFocalPoint
 * @summary Set default focal point position
 */
const handleResetFocalPoint = () => {
  const position = {
    imagePercentageTop: 50,
    imagePercentageLeft: 50
  };

  applyFocalPoint(position);
};

/**
 * @function scaleSlaveVal
 * @summary Slave croppers are smaller than the Master cropper. Scale down values derived from calculations on the Master cropper.
 * @param {object} slaveCropper - Slave cropper instance
 * @param {Number} val - Value to scale
 * @returns {Number} Scaled value
*/
const scaleSlaveVal = (slaveCropper, val) => {
  const masterCropperInstance = getMasterCropper().cropperInstance;

  const {
    width: masterCropperImageWidth
  } = masterCropperInstance.getImageData();

  const {
    width: cropperImageWidth
  } = slaveCropper.getImageData();

  const scalingRatio = (cropperImageWidth / masterCropperImageWidth);

  return val * scalingRatio;
};

/**
 * @function scrollToSelectedThumb
 * @summary Scroll the selected thumb into view
 * @todo Would programmatically shifting the focus make this redundant? (#7)
*/
const scrollToSelectedThumb = () => {
  const thumbsButtons = thumbsEl.querySelectorAll(`.${thumbButtonClass}`);

  if (!thumbsButtons.length) {
    return;
  }

  const thumbsButtonSelectedIndex = getSelectedIndex(thumbsButtons);

  thumbsButtons[thumbsButtonSelectedIndex].scrollIntoView({
    behavior: 'auto'
  });
};

// const reinstateCropCenterFromPercentages = () => {};

// const storeCropCenterAsPercentages = (cropBoxCenterX, cropBoxCenterY, imageWidth, imageHeight) => {};

async function uiSelectFolder() {
  const data = await window.electronAPI.selectFolder();
  let html = '';

  // if folder select was cancelled
  if (typeof data === 'undefined') {
    return;
  }

  const { folderPath, imagesData } = data;

  thumbsCount.textContent = imagesData.length;
  thumbsFolder.textContent = folderPath;

  imagesData.forEach((loadedThumb, i) => {
    const { src, dateTimeOriginal } = loadedThumb;

    html += `<li class="${thumbClass}">
  <button type="button" class="${thumbButtonClass}">
    <img src="${src}" class="${thumbImgClass}">
    <p class="meta ${thumbMetaClass}">${dateTimeOriginal}</p>  
  </button>
</li>`;

    thumbsEl.innerHTML = html;

    if (i === imagesData.length - 1) {
      thumbsEl.querySelectorAll(`.${thumbButtonClass}`)[0].click();
    }
  });
}

// listeners

window.addEventListener('load', () => {
  document.body.addEventListener('keydown', handleKeyDown);
  uiSelectFolder();

  resetFocalPointEl.addEventListener('click', handleResetFocalPoint);
  readCropCoordinatesFromImageEl.addEventListener('click', handleReadCropCoordinatesFromImage);
  removeCropCoordinatesFromImageEl.addEventListener('click', handleRemoveCropCoordinatesFromImage);
  writeCropCoordinatesToImageEl.addEventListener('click', handleWriteCropCoordinatesToImage);
  thumbsEl.addEventListener('click', handleThumbSelect);
});
