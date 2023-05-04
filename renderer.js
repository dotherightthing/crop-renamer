// Electron's render process (web page)

'use strict';

const controlsEl = document.getElementById('controls');
const Cropper = window.Cropper;
const cropperDragBoxClass = 'cropper-drag-box';
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

const destroyCroppers = () => {
  croppers.forEach(cropper => {
    const { cropperInstance } = cropper;

    if (cropperInstance) {
      cropperInstance.destroy();
    }
  });

  croppers = [];
};

const getCropperInstance = (imageId) => {
  let _cropperInstance = null;

  croppers.forEach(cropper => {
    const { cropperInstance } = cropper;

    if (cropperInstance) {
      if (cropperInstance.element.id === imageId) {
        _cropperInstance = cropperInstance;
      }
    }

    return true;
  });

  return _cropperInstance;
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
const getOffset = (el) => {
  const rect = el.getBoundingClientRect();
  const offset = {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX
  };

  return offset;
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
    autoCrop: true,
    autoCropArea: 1, // 100% (default is .8 - 80%)
    background: true,
    center: true,
    checkCrossOrigin: true,
    checkOrientation: true,
    cropBoxMovable: false,
    cropBoxResizable: false,
    dragMode: 'none',
    guides: true,
    highlight: true,
    modal: true,
    movable: false,
    preview: '',
    responsive: true,
    restore: true, // Restore the cropped area after resizing the window
    rotatable: true, // TODO: rotate should affect entire image, not just the crop, so requires an additional pre-crop
    scalable: false,
    toggleDragModeOnDblclick: false,
    viewMode: 1, // restrict the crop box not to exceed the size of the canvas.
    zoomable: false,
    zoomOnTouch: false,
    zoomOnWheel: false
  };

  cropperImages.forEach(cropperImage => {
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

    croppers.push({
      cropperInstance,
      // imageId, cropper.element.id
      isMaster
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

const getCropboxTopLeftRelative = (cropper, didMove, pageX, pageY) => {
  let top;
  let left;

  const {
    top: cropperCanvasTop,
    left: cropperCanvasLeft
  } = cropper.getCanvasData();

  const {
    element: cropperImage
  } = cropper;

  const cropperOutputId = `${cropperImage.id}Cropper`;

  document.getElementById(`${cropperOutputId}CanvasTopEl`).value = Math.round(cropperCanvasTop);
  document.getElementById(`${cropperOutputId}CanvasLeftEl`).value = Math.round(cropperCanvasLeft);

  // get left and top then halve for center x and y
  const {
    top: cropperCropboxTop,
    left: cropperCropboxLeft
  } = getCropBoxDataAdjustedMaster(cropper);

  document.getElementById(`${cropperOutputId}CropboxTopEl`).value = Math.round(cropperCanvasTop);
  document.getElementById(`${cropperOutputId}CropboxLeftEl`).value = Math.round(cropperCanvasLeft);

  const cropperContainerEl = cropperImage.nextSibling;
  const cropperDragBoxEl = cropperContainerEl.querySelector(`.${cropperDragBoxClass}`);

  const {
    top: cropperDragBoxTop
  } = getOffset(cropperDragBoxEl);

  if (didMove) {
    // get position of crop-box relative to canvas/image
    top = cropperCropboxTop - cropperCanvasTop;
    left = cropperCropboxLeft - cropperCanvasLeft;
  } else {
    // use mouse XY
    if (!(pageX && pageY)) {
      return;
    }

    top = pageY - cropperDragBoxTop;
    left = pageX - cropperCanvasLeft;
  }

  // eslint-disable-next-line consistent-return
  return {
    top,
    left
  };
};

const getCropBoxDataAdjustedMaster = (cropper) => {
  let data = cropper.getCropBoxData();

  const el = document.querySelector('.img-container1 .cropper-view-box');
  const boxShadowWidth = window.getComputedStyle(el).getPropertyValue('--cropper-view-box-width').replace('px', '').trim();
  const boxShadowWidthNum = Number(boxShadowWidth);

  const {
    top,
    left,
    width,
    height
  } = data;

  data.top = (top - boxShadowWidthNum);
  data.left = (left - boxShadowWidthNum);
  data.width = (width + boxShadowWidthNum + boxShadowWidthNum);
  data.height = (height + boxShadowWidthNum + boxShadowWidthNum);

  return data;
};

const moveCropperCropboxToXY = (cropper, x, y) => {
  const {
    width,
    height
  } = getCropBoxDataAdjustedMaster(cropper);

  const {
    top,
    left
  } = getCropboxTopLeftRelative(cropper, false, x, y);

  const newTop = top - (height / 2);
  const newLeft = left + width;

  masterCropper.setCropBoxData({
    top: newTop,
    left: newLeft
  });

  return {
    top: newTop,
    left: newLeft
  };
};

// get left and top then halve for center x and y
const getCropperInstanceCropboxCenter = (cropper, didMove, pageX, pageY) => {
  const {
    width,
    height
  } = getCropBoxDataAdjustedMaster(cropper);

  const {
    top,
    left
  } = getCropboxTopLeftRelative(cropper, didMove, pageX, pageY);

  const x = left + (width / 2);
  const y = top + (height / 2);

  return {
    x,
    y
  };
};

const updateSlaveCropper = (slaveCropper, centerX, centerY) => {
  const {
    element: slaveCropperImage
  } = slaveCropper;

  const slaveCropperId = slaveCropperImage.getAttribute('id') + 'Cropper';

  // const masterCropper = TODO this needs to be dynamic rather than a global

  const {
    width: masterCropperImageWidth
  } = masterCropper.getImageData();

  const {
    top: slaveCropperCanvasTop,
    left: slaveCropperCanvasLeft
  } = slaveCropper.getCanvasData();

  // get width and height of cropbox so we can calculate the position of the center crosshairs
  const {
    width: slaveCropperCropboxWidth,
    height: slaveCropperCropboxHeight
  } = slaveCropper.getCropBoxData();

  const {
    width: slaveCropperImageWidth
  } = slaveCropper.getImageData();

  // slaveCropper is smaller than cropper 1
  const slaveCropperScalingRatio = (slaveCropperImageWidth / masterCropperImageWidth);

  const slaveCropperCropBoxCenterX = (centerX * slaveCropperScalingRatio);
  const slaveCropperCropBoxCenterY = (centerY * slaveCropperScalingRatio);

  slaveCropper.setCropBoxData({
    left: slaveCropperCropBoxCenterX - (slaveCropperCropboxWidth / 2),
    top: slaveCropperCanvasTop + slaveCropperCropBoxCenterY - (slaveCropperCropboxHeight / 2)
  });

  const {
    top: slaveCropperCropBoxTop,
    left: slaveCropperCropBoxLeft
  } = slaveCropper.getCropBoxData();

  document.getElementById(`${slaveCropperId}CanvasTopEl`).value = slaveCropperCanvasTop;
  document.getElementById(`${slaveCropperId}CanvasLeftEl`).value = slaveCropperCanvasLeft;
  document.getElementById(`${slaveCropperId}CropBoxTopEl`).value = slaveCropperCropBoxTop;
  document.getElementById(`${slaveCropperId}CropBoxLeftEl`).value = slaveCropperCropBoxLeft;
};

// only called from masterCropper, which then controls slaveCropper1
const setCropboxData = (e) => {
  const cropperWasDragged = masterCropperCropBoxDidMove; // TODO this sometimes needs to be clicked twice, needs to support a shaky hand
  masterCropperCropBoxDidMove = false;

  const { pageX, pageY } = e.detail.originalEvent;

  const cropperOutputId = 'image1Cropper';

  masterCropper = getCropperInstance('image1');
  slaveCropper1 = getCropperInstance('image2');
  slaveCropper2 = getCropperInstance('image3');

  const {
    top: masterCropperImageTop,
    left: masterCropperImageLeft
  } = masterCropper.getImageData();

  document.getElementById(`${cropperOutputId}ImageDataTopEl`).value = Math.round(masterCropperImageTop);
  document.getElementById(`${cropperOutputId}ImageDataLeftEl`).value = Math.round(masterCropperImageLeft);

  const {
    x: centerX,
    y: centerY
  } = getCropperInstanceCropboxCenter(masterCropper, cropperWasDragged, pageX, pageY);

  if (!cropperWasDragged) {
    moveCropperCropboxToXY(masterCropper, centerX, centerY);
  }

  // after moving cropper cropbox, move slaves
  updateSlaveCropper(slaveCropper1, centerX, centerY);
  updateSlaveCropper(slaveCropper2, centerX, centerY);
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
  controlsEl.addEventListener('click', handleControlChange);
  thumbsEl.addEventListener('click', handleThumbSelect);
  document.body.addEventListener('keydown', handleKeyDown);
  window.addEventListener('resize', scrollToSelectedThumb);
});
