// Electron's render process (web page)

'use strict';

const aspectRatioEnlargementCollapsed = 865 / 368;
const controlsEl = document.getElementById('controls');
const Cropper = window.Cropper;
const image = document.getElementById('image');
const rotateEl = document.getElementById('rotate');
const selectedClass = 'btn-selected';
const thumbsCount = document.getElementById('thumbs-count');
const thumbsEl = document.getElementById('thumbs');
const thumbClass = 'thumb';
const thumbButtonClass = 'btn-thumb';
const thumbImgClass = 'thumb-img';
const thumbMetaClass = 'thumb-meta';
const URL = window.URL || window.webkitURL;

let cropper;
let originalImageURL;
let newImageSrc;

const cropperOptions = {
  // ready: function (e) {
  //   console.log(e.type);
  // },
  // cropstart: function (e) {
  //   console.log(e.type, e.detail.action);
  // },
  // cropmove: function (e) {
  //   console.log(e.type, e.detail.action);
  // },
  // cropend: function (e) {
  //   console.log(e.type, e.detail.action);
  // },
  // crop: function (e) {
  //   var data = e.detail;
  //   console.log('crop', data);

  //   // console.log('getData', cropper.getData()); // setData
  //   // console.log('getImageData', cropper.getImageData());
  //   // console.log('getCanvasData', cropper.getCanvasData()); // setCanvasData
  //   // console.log('getCropBoxData', cropper.getCropBoxData()); // setCropBoxData
  // },
  aspectRatio: aspectRatioEnlargementCollapsed,
  autoCrop: true,
  autoCropArea: 1, // 100% (default is .8 - 80%)
  background: true,
  center: true,
  checkCrossOrigin: true,
  checkOrientation: true,
  cropBoxMovable: true,
  cropBoxResizable: true,
  guides: true,
  highlight: true,
  modal: true,
  movable: true,
  preview: '',
  responsive: true,
  restore: true,
  rotatable: true, // TODO: rotate should affect entire image, not just the crop, so requires an additional pre-crop
  scalable: false,
  toggleDragModeOnDblclick: false,
  viewMode: 1, // restrict the crop box not to exceed the size of the canvas.
  zoomable: false,
  zoomOnTouch: false,
  zoomOnWheel: false
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

const handleControlChange = (event) => {
  var evt = event || window.event;
  var evtTarget = evt.target || evt.srcElement;
  var cropped;
  var result;
  var input;
  var data;

  if (!cropper) {
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

  cropped = cropper.cropped;

  const { method, option, secondOption } = data;

  if (method) {
    if (!evtTarget.hasAttribute('data-option')) {
      option = evtTarget.value;
    }

    if (method === 'reset') {
      rotateEl.value = 0;
    } else if (method === 'rotate') {
      // if (cropped && cropperOptions.viewMode > 0) {
      //   cropper.clear(); // this resets the crop position
      // }

      cropper.rotateTo(0); // temporarily reset rotation so that a reduction of value is not treated as a further increase
    } else if (method === 'rotateTo') {
      rotateEl.value = evtTarget.value;
    }

    result = cropper[method](option, secondOption);

    if (method === 'rotate') {
      if (cropped && cropperOptions.viewMode > 0) {
        cropper.crop();
      }
    } else if (method === 'destroy') {
      cropper = null;

      if (newImageSrc) {
        URL.revokeObjectURL(newImageSrc);
        newImageSrc = '';
        image.src = originalImageURL;
      }
    }

    if (typeof result === 'object' && result !== cropper && input) {
      try {
        input.value = JSON.stringify(result);
      } catch (err) {
        console.log(err.message);
      }
    }
  }
};

const handleKeyDown = (e) => {
  if (!cropper) {
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

  if (!cropper) {
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

  image.src = newImageSrc; // = URL.createObjectURL(file);

  if (cropper) {
    cropper.destroy();
  }

  cropper = new Cropper(image, cropperOptions);

  // setTimeout(function() {
  //   const imageData = cropper.getImageData();
  //   console.log('imageData.naturalWidth', imageData.naturalWidth);
  // }, 100);
};

const initCropper = () => {
  cropper = new Cropper(image, cropperOptions);
  originalImageURL = image.src;

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
