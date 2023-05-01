// Electron's render process (web page)

'use strict';

const controlsEl = document.getElementById('controls');
const Cropper = window.Cropper;
const rotateEl = document.getElementById('rotate');
const selectedClass = 'btn-selected';
const thumbsCount = document.getElementById('thumbs-count');
const thumbsEl = document.getElementById('thumbs');
const thumbClass = 'thumb';
const thumbButtonClass = 'btn-thumb';
const thumbImgClass = 'thumb-img';
const thumbMetaClass = 'thumb-meta';
const URL = window.URL || window.webkitURL;
let originalImageURL;
let newImageSrc;

const cropper1Image = document.getElementById('image1');
let cropper1;
let cropper1CropboxData;
let cropper1ImageData;

const cropper2Image = document.getElementById('image2');
let cropper2;
let cropper2CropboxData;
let cropper2ImageData;

const cropper3Image = document.getElementById('image3');
let cropper3;
let cropper3CropboxData;
let cropper3ImageData;

const cropperOptions = {
  // crop: function (e) {
  //   var data = e.detail;
  //   // console.log('getData', cropper1.getData()); // setData
  //   // console.log('getImageData', cropper1.getImageData());
  //   // console.log('getCanvasData', cropper1.getCanvasData()); // setCanvasData
  //   // console.log('getCropBoxData', cropper1.getCropBoxData()); // setCropBoxData
  // },
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

let cropperOptions1 = { ...cropperOptions };

// https://codepen.io/saleemnaufa/pen/gVewZw
Object.assign(cropperOptions1, {
  aspectRatio: 1,
  autoCropArea: .2,
  cropBoxMovable: true,
  guides: false,
  movable: true,
  crop: (e) => {
    // const { x, y } = e.detail;
    // setCropboxData(e);
    // console.log('crop', Math.round(x), Math.round(y));
  },
  cropend: (e) => {
    // https://github.com/fengyuanchen/cropperjs/issues/669
    setCropboxData(e);
  },
  ready: () => {
    cropper1CropboxData = cropper1.getCropBoxData();
    cropper1ImageData = cropper1.getImageData();
  }
});

let cropperOptions2 = { ...cropperOptions };

Object.assign(cropperOptions2, {
  aspectRatio: 865 / 368,
  ready: () => {
    cropper2CropboxData = cropper2.getCropBoxData();
    cropper2ImageData = cropper2.getImageData();
  }
});

let cropperOptions3 = { ...cropperOptions };

Object.assign(cropperOptions3, {
  aspectRatio: 320 / 320,
  ready: () => {
    cropper3CropboxData = cropper3.getCropBoxData();
    cropper3ImageData = cropper3.getImageData();
  }
});

const getSelectedIndex = (nodeList) => {
  let selectedIndex = -1;

  nodeList.forEach((node, index) => {
    if (node.classList.contains(selectedClass)) {
      selectedIndex = index;
    }
  });

  return selectedIndex;
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
    left: rect.left + window.scrollX, 
  };

  return offset;
}

const handleControlChange = (event) => {
  var evt = event || window.event;
  var evtTarget = evt.target || evt.srcElement;
  var cropped1;
  var cropped2;
  var result;
  var input;
  var data;

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

  data = {
    method: evtTarget.getAttribute('data-method'),
    option: evtTarget.getAttribute('data-option') || undefined,
    secondOption: evtTarget.getAttribute('data-second-option') || undefined
  };

  cropped1 = cropper1.cropped;
  cropped2 = cropper2.cropped;
  cropped3 = cropper3.cropped;

  const { method, secondOption } = data;
  let { option } = data;

  if (method) {
    if (!evtTarget.hasAttribute('data-option')) {
      option = evtTarget.value;
    }

    if (method === 'reset') {
      rotateEl.value = 0;
    } else if (method === 'rotate') {
      // if (cropped1 && cropperOptions1.viewMode > 0) {
      //   cropper1.clear(); // this resets the crop position
      // }

      cropper1.rotateTo(0); // temporarily reset rotation so that a reduction of value is not treated as a further increase
      cropper2.rotateTo(0);
      cropper3.rotateTo(0);
    } else if (method === 'rotateTo') {
      rotateEl.value = evtTarget.value;
    }

    result = cropper1[method](option, secondOption);
    cropper2[method](option, secondOption);
    cropper3[method](option, secondOption);

    if (method === 'rotate') {
      if (cropped1 && cropperOptions1.viewMode > 0) {
        cropper1.crop();
      }

      if (cropped2 && cropperOptions2.viewMode > 0) {
        cropper2.crop();
      }

      if (cropped3 && cropperOptions3.viewMode > 0) {
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

    if (typeof result === 'object' && result !== cropper1 && input) {
      try {
        input.value = JSON.stringify(result);
      } catch (err) {
        console.log(err.message);
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

  if (cropper1) {
    cropper1.destroy();
  }

  if (cropper2) {
    cropper2.destroy();
  }

  if (cropper3) {
    cropper3.destroy();
  }

  cropper1 = new Cropper(cropper1Image, cropperOptions1);
  cropper2 = new Cropper(cropper2Image, cropperOptions2);
  cropper3 = new Cropper(cropper3Image, cropperOptions3);

  // setTimeout(function() {
  //   const imageData = cropper1.getImageData();
  //   console.log('imageData.naturalWidth', imageData.naturalWidth);
  // }, 100);
};

const initCropper = () => {
  cropper1 = new Cropper(cropper1Image, cropperOptions1);
  cropper2 = new Cropper(cropper2Image, cropperOptions2);
  cropper3 = new Cropper(cropper3Image, cropperOptions3);
  originalImageURL = cropper1Image.src;

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

// this is only called from cropper1, which then controls cropper2
const setCropboxData = (e) => {
  const el = e.target; // #image1
  const cropper1ContainerEl = el.nextSibling;
  const cropper1DragBoxEl = cropper1ContainerEl.querySelector('.cropper-drag-box');
  const { left, top } = getOffset(cropper1DragBoxEl); // TODO this is always fixed rather than moving with cropbox (this is the parent element)
  const { pageX, pageY } = e.detail.originalEvent; // TODO this is position of mouse not center cross inside cropbox
  const x = pageX - left;
  const y = pageY - top;

  console.log('pageX', pageX);
  console.log('left', left);
  console.log('pageY', pageY);
  console.log('top', top);

  cropper1.setCropBoxData({
    left: x - (cropper1CropboxData.width / 2),
    top: y - (cropper1CropboxData.height / 2)
  });

  cropper2.setCropBoxData({
    left: (x * (cropper2ImageData.width / cropper1ImageData.width)) - (cropper2CropboxData.width / 2),
    top: (y * (cropper2ImageData.width / cropper1ImageData.width)) - (cropper2CropboxData.height / 2)
  });

  cropper3.setCropBoxData({
    left: (x * (cropper3ImageData.width / cropper1ImageData.width)) - (cropper3CropboxData.width / 2),
    top: (y * (cropper3ImageData.width / cropper1ImageData.width)) - (cropper3CropboxData.height / 2)
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

window.addEventListener('load', initCropper);

window.addEventListener('resize', scrollToSelectedThumb);

document.addEventListener('DOMContentLoaded', () => {
  controlsEl.addEventListener('click', handleControlChange);
  thumbsEl.addEventListener('click', handleThumbSelect);
  document.body.addEventListener('keydown', handleKeyDown);
});
