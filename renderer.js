// Electron's render process (web page)

'use strict';

const controlsEl = document.getElementById('controls');
const Cropper = window.Cropper;
const rotateEl = document.getElementById('rotate');
const selectedClass = 'btn-selected';
const thumbButtonClass = 'btn-thumb';
const thumbClass = 'thumb';
const thumbImgClass = 'thumb-img';
const thumbMetaClass = 'thumb-meta';
const thumbsCount = document.getElementById('thumbs-count');
const thumbsEl = document.getElementById('thumbs');
const URL = window.URL || window.webkitURL;

let newImageSrc;
let originalImageURL;

let cropper1;
let cropper2;
let cropper3;

let cropper1Image;
let cropper2Image;
let cropper3Image;

let cropper1Options;
let cropper2Options;
let cropper3Options;

let cropper1CropBoxDidMove = false;

// functions

const destroyCropper = () => {
  if (cropper1) {
    cropper1.destroy();
  }

  if (cropper2) {
    cropper2.destroy();
  }

  if (cropper3) {
    cropper3.destroy();
  }
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

  if (!cropper1) {
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

  const cropped1 = cropper1.cropped;
  const cropped2 = cropper2.cropped;
  const cropped3 = cropper3.cropped;

  const { method, secondOption } = data;
  let { option } = data;

  if (method) {
    if (!evtTarget.hasAttribute('data-option')) {
      option = evtTarget.value;
    }

    if (method === 'reset') {
      rotateEl.value = 0;
    } else if (method === 'rotate') {
      // if (cropped1 && cropper1Options.viewMode > 0) {
      //   cropper1.clear(); // this resets the crop position
      // }

      cropper1.rotateTo(0); // temporarily reset rotation so that a reduction of value is not treated as a further increase
      cropper2.rotateTo(0);
      cropper3.rotateTo(0);
    } else if (method === 'rotateTo') {
      rotateEl.value = evtTarget.value;
    }

    cropper1[method](option, secondOption);
    cropper2[method](option, secondOption);
    cropper3[method](option, secondOption);

    if (method === 'rotate') {
      if (cropped1 && cropper1Options.viewMode > 0) {
        cropper1.crop();
      }

      if (cropped2 && cropper2Options.viewMode > 0) {
        cropper2.crop();
      }

      if (cropped3 && cropper3Options.viewMode > 0) {
        cropper3.crop();
      }
    } else if (method === 'destroy') {
      cropper1 = null;
      cropper2 = null;
      cropper3 = null;

      if (newImageSrc) {
        URL.revokeObjectURL(newImageSrc);
        newImageSrc = '';
        cropper1Image.src = originalImageURL;
        cropper2Image.src = originalImageURL;
        cropper3Image.src = originalImageURL;
      }
    }
  }
};

// cropper (1) only
const handleKeyDown = (e) => {
  if (!cropper1) {
    return;
  }

  if (!thumbsEl.querySelectorAll(`.${thumbImgClass}`).length) {
    return;
  }

  const { keyCode } = e;
  const thumbsButtons = thumbsEl.querySelectorAll(`.${thumbButtonClass}`);
  const thumbsButtonSelectedIndex = getSelectedIndex(thumbsButtons);
  let thumbsButtonNextIndex = -1;

  if (keyCode === 37) {
    e.preventDefault();
    thumbsButtonNextIndex = getPreviousIndex(thumbsButtons, thumbsButtonSelectedIndex);
  } else if (keyCode === 39) {
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

const handleThumbSelect = (event) => {
  var e = event || window.event;
  var target = e.target || e.srcElement;

  if (!cropper1) {
    return;
  }

  if (!thumbsEl.querySelectorAll('img').length) {
    return;
  }

  while (target.tagName.toLowerCase() !== 'button') {
    target = target.parentNode;
  }

  const thumbItems = thumbsEl.querySelectorAll('button');
  thumbItems.forEach(thumbItem => {
    thumbItem.classList.remove(selectedClass);
  });

  target.classList.add(selectedClass);

  const newImage = target.querySelector('img');
  newImageSrc = newImage.getAttribute('src');

  cropper1Image.src = newImageSrc; // = URL.createObjectURL(file);
  cropper2Image.src = newImageSrc; // = URL.createObjectURL(file);
  cropper3Image.src = newImageSrc; // = URL.createObjectURL(file);

  destroyCropper();
  initCropper(); // eslint-disable-line no-use-before-define

  // setTimeout(function() {
  //   const imageData = cropper1.getImageData();
  //   console.log('imageData.naturalWidth', imageData.naturalWidth);
  // }, 100);
};

const initCropper = (e) => {
  const windowLoad = e.type && (e.type === 'load');

  cropper1Image = document.getElementById('image1');
  cropper2Image = document.getElementById('image2');
  cropper3Image = document.getElementById('image3');

  cropper1 = new Cropper(cropper1Image, cropper1Options);
  cropper2 = new Cropper(cropper2Image, cropper2Options);
  cropper3 = new Cropper(cropper3Image, cropper3Options);
  originalImageURL = cropper1Image.src;

  if (typeof document.createElement('cropper').style.transition === 'undefined') {
    rotateEl.prop('disabled', true);
  }

  if (windowLoad) {
    controlsEl.addEventListener('click', handleControlChange);
    thumbsEl.addEventListener('click', handleThumbSelect);
    document.body.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', scrollToSelectedThumb); // eslint-disable-line no-use-before-define
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

// only called from cropper1, which then controls cropper2
const setCropboxData = (e) => {
  const didMove = cropper1CropBoxDidMove; // TODO this sometimes needs to be clicked twice, needs to support a shaky hand
  cropper1CropBoxDidMove = false;

  // const el = e.target; // #image1
  const cropper1ContainerEl = cropper1Image.nextSibling;
  const cropper1DragBoxEl = cropper1ContainerEl.querySelector('.cropper-drag-box');
  const { pageX, pageY } = e.detail.originalEvent;

  const {
    top: cropper1DragBoxTop
  } = getOffset(cropper1DragBoxEl);

  const {
    top: cropper1CanvasTop,
    left: cropper1CanvasLeft
  } = cropper1.getCanvasData();

  // gap between edge of cropper-container and child cropper-crop-box (styled as a circle)
  // width and height values could be set on cropper.ready() as they don't change

  // get left and top then halve for center x and y
  const {
    top: cropper1CropboxTop,
    left: cropper1CropboxLeft,
    width: cropper1CropboxWidth,
    height: cropper1CropboxHeight
  } = cropper1.getCropBoxData();

  // get width and height of cropbox so we can calculate the position of the center crosshairs
  const {
    width: cropper2CropboxWidth,
    height: cropper2CropboxHeight
  } = cropper2.getCropBoxData();

  // get width and height of cropbox so we can calculate the position of the center crosshairs
  const {
    width: cropper3CropboxWidth,
    height: cropper3CropboxHeight
  } = cropper3.getCropBoxData();

  const { width: cropper1ImageWidth } = cropper1.getImageData();
  const { width: cropper2ImageWidth } = cropper2.getImageData();
  const { width: cropper3ImageWidth } = cropper3.getImageData();

  // cropper2 is smaller than cropper 1
  const cropper2ScalingRatio = (cropper2ImageWidth / cropper1ImageWidth);

  // cropper3 is smaller than cropper 1
  const cropper3ScalingRatio = (cropper3ImageWidth / cropper1ImageWidth);

  let cropper1RelativeLeft;
  let cropper1RelativeTop;

  if (didMove) {
    // subtract gap between LH edge of cropper-container (0px) and grandchild cropper-canvas containing the scaled down image (centered)
    // to get LH position of crop-box relative to canvas/image
    cropper1RelativeLeft = cropper1CropboxLeft - cropper1CanvasLeft;
    cropper1RelativeTop = cropper1CropboxTop - cropper1CanvasTop;
  } else {
    // use mouse XY
    cropper1RelativeLeft = pageX - cropper1CanvasLeft;
    cropper1RelativeTop = pageY - cropper1DragBoxTop;

    cropper1.setCropBoxData({
      left: cropper1RelativeLeft + (cropper1CropboxWidth),
      top: cropper1RelativeTop - (cropper1CropboxHeight / 2)
    });
  }

  const cropper1CropBoxCenterX = cropper1RelativeLeft + (cropper1CropboxWidth / 2);
  const cropper1CropBoxCenterY = cropper1RelativeTop + (cropper1CropboxHeight / 2);

  const cropper2CropBoxCenterX = (cropper1CropBoxCenterX * cropper2ScalingRatio);
  const cropper2CropBoxCenterY = (cropper1CropBoxCenterY * cropper2ScalingRatio);

  const cropper3CropBoxCenterX = (cropper1CropBoxCenterX * cropper3ScalingRatio);
  const cropper3CropBoxCenterY = (cropper1CropBoxCenterY * cropper3ScalingRatio);

  cropper2.setCropBoxData({
    left: cropper2CropBoxCenterX - (cropper2CropboxWidth / 2),
    top: cropper2CropBoxCenterY - (cropper2CropboxHeight / 2)
  });

  cropper3.setCropBoxData({
    left: cropper3CropBoxCenterX - (cropper3CropboxWidth / 2),
    top: cropper3CropBoxCenterY - (cropper3CropboxHeight / 2)
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

// options

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

cropper1Options = { ...cropperOptions };
cropper2Options = { ...cropperOptions };
cropper3Options = { ...cropperOptions };

// https://codepen.io/saleemnaufa/pen/gVewZw
Object.assign(cropper1Options, {
  aspectRatio: 1,
  autoCropArea: 0.2,
  cropBoxMovable: true,
  guides: false,
  movable: true,
  // crop - fires during move, then after cropend
  // cropstart - occurs on mouse down, so before a click AND before a move
  cropmove: () => {
    cropper1CropBoxDidMove = true; // differentiate between a click and a move
  },
  cropend: (e) => { // dragEnd callback, see https://github.com/fengyuanchen/cropperjs/issues/669; fires after move
    setCropboxData(e, cropper1CropBoxDidMove);
  }
});

Object.assign(cropper2Options, {
  aspectRatio: 865 / 368
});

Object.assign(cropper3Options, {
  aspectRatio: 320 / 320
});

// listeners

window.addEventListener('load', initCropper);
