// Electron's render process (web page)

'use strict';

const consoleTop = document.getElementById('console-top');
const Cropper = window.Cropper;
const cropperCanvasClass = 'cropper-canvas';
const cropperImageClass = 'cropperImage';
const rotateEl = document.getElementById('rotate');
const selectedClass = 'btn-selected';
const thumbButtonClass = 'btn-thumb';
const thumbClass = 'thumb';
const thumbImgClass = 'thumb-img';
const thumbMetaClass = 'thumb-meta';
const thumbsCount = document.getElementById('thumbs-count');
const thumbsEl = document.getElementById('thumbs');
const URL = window.URL || window.webkitURL;

let croppers = [];

let newImageSrc;
let originalImageURL;

let masterCropper;
let slaveCropper1;
let slaveCropper2;

let masterCropperImage;
let slaveCropper1Image;
let slaveCropper2Image;

let masterCropperOptions;
let slaveCropper1Options;
let slaveCropper2Options;

let masterCropperCropBoxDidMove = false;

// functions

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

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

  const html = `<div class="control-set">
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

const destroyCroppers = () => {
  croppers.forEach(cropper => {
    const { cropperInstance } = cropper;

    if (cropperInstance) {
      cropperInstance.destroy();
    }
  });

  croppers = [];
};

const getCropper = (imageId) => {
  let _cropper = null;

  croppers.forEach(cropper => {
    const { cropperInstance } = cropper;

    if (cropperInstance) {
      if (cropperInstance.element.id === imageId) {
        _cropper = cropper;
      }
    }

    return true;
  });

  return _cropper;
};

const getNextIndex = (nodeList, selectedIndex) => {
  let nextIndex = -1;

  if ((selectedIndex + 1) < nodeList.length) {
    nextIndex = selectedIndex + 1;
  } else {
    nextIndex = 0;
  }

  return nextIndex;
};

// https://usefulangle.com/post/179/jquery-offset-vanilla-javascript
// this matches the translateY implemented by the cropperjs
const getOffset = (el) => {
  const rect = el.getBoundingClientRect();
  const offset = {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX
  };

  return offset;
};

/**
 * @function getCropperCanvasOffsetTop
 * @summary cropper.getCanvasData().top ignores preceding UI and returns 0, this function returns the actual offset
 * @param {object} cropper - Cropper
 * @returns {Number} cropperCanvasTop
*/
const getCropperCanvasOffsetTop = (cropper) => {
  const {
    element: cropperImage
  } = cropper;

  const cropperContainerEl = cropperImage.nextSibling;
  const cropperCanvasEl = cropperContainerEl.querySelector(`.${cropperCanvasClass}`);

  const {
    top: cropperCanvasTop
  } = getOffset(cropperCanvasEl);

  return cropperCanvasTop;
};

const getPreviousIndex = (nodeList, selectedIndex) => {
  let previousIndex = -1;

  if (selectedIndex > 0) {
    previousIndex = selectedIndex - 1;
  } else {
    previousIndex = nodeList.length - 1; // loop around to last item
  }

  return previousIndex;
};

const getSelectedIndex = (nodeList) => {
  let selectedIndex = -1;

  nodeList.forEach((node, index) => {
    if (node.classList.contains(selectedClass)) {
      selectedIndex = index;
    }
  });

  return selectedIndex;
};

const handleControlChange = (event) => {
  const evt = event || window.event;
  let evtTarget = evt.target || evt.srcElement;

  if (!masterCropper) {
    return;
  }

  while (evtTarget !== this) {
    if (evtTarget.getAttribute('data-method')) {
      break;
    }

    evtTarget = evtTarget.parentNode;
  }

  if (evtTarget === this || evtTarget.disabled || evtTarget.className.indexOf('disabled') > -1) {
    return;
  }

  const data = {
    method: evtTarget.getAttribute('data-method'),
    option: evtTarget.getAttribute('data-option') || undefined,
    secondOption: evtTarget.getAttribute('data-second-option') || undefined
  };

  const cropped1 = masterCropper.cropped;
  const cropped2 = slaveCropper1.cropped;
  const cropped3 = slaveCropper2.cropped;

  const { method, secondOption } = data;
  let { option } = data;

  if (method) {
    if (!evtTarget.hasAttribute('data-option')) {
      option = evtTarget.value;
    }

    if (method === 'reset') {
      rotateEl.value = 0;
    } else if (method === 'rotate') {
      // if (cropped1 && masterCropperOptions.viewMode > 0) {
      //   masterCropper.clear(); // this resets the crop position
      // }

      masterCropper.rotateTo(0); // temporarily reset rotation so that a reduction of value is not treated as a further increase
      slaveCropper1.rotateTo(0);
      slaveCropper2.rotateTo(0);
    } else if (method === 'rotateTo') {
      rotateEl.value = evtTarget.value;
    }

    masterCropper[method](option, secondOption);
    slaveCropper1[method](option, secondOption);
    slaveCropper2[method](option, secondOption);

    if (method === 'rotate') {
      if (cropped1 && masterCropperOptions.viewMode > 0) {
        masterCropper.crop();
      }

      if (cropped2 && slaveCropper1Options.viewMode > 0) {
        slaveCropper1.crop();
      }

      if (cropped3 && slaveCropper2Options.viewMode > 0) {
        slaveCropper2.crop();
      }
    } else if (method === 'destroy') {
      masterCropper = null;
      slaveCropper1 = null;
      slaveCropper2 = null;

      if (newImageSrc) {
        URL.revokeObjectURL(newImageSrc);
        newImageSrc = '';
        masterCropperImage.src = originalImageURL;
        slaveCropper1Image.src = originalImageURL;
        slaveCropper2Image.src = originalImageURL;
      }
    }
  }
};

const handleKeyDown = (e) => {
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

const handleMouseUp = (e) => {
  document.getElementById('cropper1-mouse-output-client_x').value = e.clientX;
  document.getElementById('cropper1-mouse-output-client_y').value = e.clientY;
};

// used to change the image, and triggered on load
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

  newImageSrc = newImage.getAttribute('src');

  destroyCroppers();

  initCroppers(newImageSrc);

  const thumbItems = thumbsEl.querySelectorAll('button');
  thumbItems.forEach(thumbItem => {
    thumbItem.classList.remove(selectedClass);
  });

  target.classList.add(selectedClass);
};

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

  // consoleTop.removeEventListener('click', handleControlChange);
  window.removeEventListener('resize', scrollToSelectedThumb);
  window.removeEventListener('click', handleMouseUp);

  // consoleTop.addEventListener('click', handleControlChange);
  window.addEventListener('resize', scrollToSelectedThumb);
  window.addEventListener('click', handleMouseUp);

  consoleTop.innerHTML = '';

  cropperImages.forEach((cropperImage, cropperIndex) => {
    const data = cropperImage.dataset;

    cropperImage.setAttribute('src', imageSrc);

    const {
      cropperAspectRatio: aspectRatio,
      cropperMaster: isMaster
    } = data;

    const [
      a,
      b
    ] = aspectRatio.split(':');

    const options = { ...cropperOptions };

    Object.assign(options, {
      aspectRatio: a / b
    });

    if (isMaster) {
      originalImageURL = ''; // cropperImage.src; // it's empty by default

      // https://codepen.io/saleemnaufa/pen/gVewZw
      Object.assign(options, {
        autoCropArea: 0.2,
        cropBoxMovable: true,
        guides: false,
        movable: true,
        // crop - fires during move, then after cropend
        // cropstart - occurs on mouse down, so before a click AND before a move
        cropmove: () => {
          masterCropperCropBoxDidMove = true; // differentiate between a click and a move
        },
        cropend: (e) => { // dragEnd callback, see https://github.com/fengyuanchen/cropperjs/issues/669; fires after move
          setCropboxData(e, masterCropperCropBoxDidMove);
        }
      });
    }

    const cropperInstance = new Cropper(cropperImage, options);

    let outputIdSets = {};

    let outputs = {
      canvas: [ 'top', 'left' ],
      cropbox: [ 'top', 'left' ]
    };

    if (cropperIndex === 0) {
      outputs = {
        mouse: [ 'client_x', 'client_y', 'page_x', 'page_y' ],
        cropper: [ 'x', 'y' ],
        container: [ 'width', 'height' ],
        canvas: [ 'left', 'top' ],
        image: [ 'left', 'top' ],
        drg: [ 'top' ],
        cropbox: [ 'center_x', 'center_y', 'actual_center_x', 'actual_center_y', 'left', 'top', 'left_rel', 'top_rel', 'width', 'height', 'new_left', 'new_top' ]
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

      consoleTop.innerHTML += topHtml;
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
};

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

// cropper is smaller than cropper 1
const scaleSlaveVal = (slaveCropper, slaveVal) => {
  // masterCropper is a global
  const {
    width: masterCropperImageWidth
  } = masterCropper.getImageData();

  const {
    width: cropperImageWidth
  } = slaveCropper.getImageData();

  const scalingRatio = (cropperImageWidth / masterCropperImageWidth);

  return slaveVal * scalingRatio;
};

/**
 * @function moveMasterCropper
 * @summary When the canvas is clicked, move the crop box on the master cropper so it centers on the pointer location
 * @param {object} options
 * @param {options.cropper} cropper - Master cropper
 * @param {options.pageX} pageX
 * @param {options.pageY} pageY
 * @param {options.masterCropperCanvasOffsetTop} masterCropperCanvasOffsetTop - Height of preceding UI
 */
const moveMasterCropper = ({
  cropper,
  pageX,
  pageY,
  masterCropperCanvasOffsetTop
}) => {
  const {
    width: cropperWidth,
    height: cropperHeight
  } = cropper.getCropBoxData();

  const cropBoxCenterX = pageX - (cropperWidth / 2);
  const cropBoxCenterY = pageY - (cropperHeight / 2);
  const cropperCropBoxTop = cropBoxCenterY - masterCropperCanvasOffsetTop;
  const cropperCropBoxLeft = cropBoxCenterX;

  cropper.setCropBoxData({
    top: cropperCropBoxTop,
    left: cropperCropBoxLeft
  });
};

/**
 * @function moveSlaveCropper
 * @summary Move the crop box on the dependent cropper
 * @param {object} options
 * @param {options.cropper} cropper - Slave cropper
 * @param {options.pageX} pageX
 * @param {options.pageY} pageY
 * @param {options.masterCropperCanvasOffsetTop} masterCropperCanvasOffsetTop - Height of preceding UI
 * @param {options.masterCropperCanvasLeft} masterCropperCanvasLeft - gap between edge of viewport and start of master image
 */
const moveSlaveCropper = ({
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
 * @function setCropboxData
 * @param {event} e
 * @todo This sometimes needs to be clicked twice, needs to support a shaky hand
 */
const setCropboxData = (e) => {
  const cropperWasDragged = masterCropperCropBoxDidMove;
  masterCropperCropBoxDidMove = false;

  const { pageX, pageY } = e.detail.originalEvent;

  masterCropper = getCropper('image1').cropperInstance;
  slaveCropper1 = getCropper('image2').cropperInstance;
  slaveCropper2 = getCropper('image3').cropperInstance;

  const masterCropperCanvasOffsetTop = getCropperCanvasOffsetTop(masterCropper);

  const {
    left: masterCropperCanvasLeft
  } = masterCropper.getCanvasData();

  if (!cropperWasDragged) {
    // move the cropper to the click location
    moveMasterCropper({
      cropper: masterCropper,
      pageX,
      pageY,
      masterCropperCanvasOffsetTop
    });
  }

  moveSlaveCropper({
    cropper: slaveCropper1,
    pageX,
    pageY,
    masterCropperCanvasOffsetTop,
    masterCropperCanvasLeft
  });

  moveSlaveCropper({
    cropper: slaveCropper2,
    pageX,
    pageY,
    masterCropperCanvasOffsetTop,
    masterCropperCanvasLeft
  });
};

async function uiSelectFolder() {
  const loadedThumbs = await window.electronAPI.selectFolder();
  let html = '';

  // if folder select was cancelled
  if (typeof loadedThumbs === 'undefined') {
    return;
  }

  thumbsCount.textContent = loadedThumbs.length;

  loadedThumbs.forEach((loadedThumb, i) => {
    const { src, dateTimeOriginal } = loadedThumb;

    html += `<li class="${thumbClass}">
  <button type="button" class="${thumbButtonClass}">
    <img src="${src}" class="${thumbImgClass}">
    <p class="meta ${thumbMetaClass}">${dateTimeOriginal}</p>  
  </button>
</li>`;

    thumbsEl.innerHTML = html;

    if (i === loadedThumbs.length - 1) {
      thumbsEl.querySelectorAll(`.${thumbButtonClass}`)[0].click();
    }
  });
}

// listeners

window.addEventListener('load', () => {
  document.body.addEventListener('keydown', handleKeyDown);
  thumbsEl.addEventListener('click', handleThumbSelect);
  uiSelectFolder();
});
