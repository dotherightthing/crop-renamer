// Electron's render process (web page)

'use strict';

const consoleTop = document.getElementById('console-top');
const consoleBottom = document.getElementById('console-bottom');
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

const handleMouseUp = (e) => {
  document.getElementById('cropper1-mouse-output-x').value = e.clientX;
  document.getElementById('cropper1-mouse-output-y').value = e.clientY;
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

  // consoleTop.removeEventListener('click', handleControlChange);
  window.removeEventListener('resize', scrollToSelectedThumb);
  window.removeEventListener('click', handleMouseUp);

  // consoleTop.addEventListener('click', handleControlChange);
  window.addEventListener('resize', scrollToSelectedThumb);
  window.addEventListener('click', handleMouseUp);

  consoleTop.innerHTML = '';

  const { html: bottomHtml } = createOutputSet({
    id: 'console',
    title: 'Console',
    outputs: [ 'debug' ]
  });

  consoleBottom.innerHTML = bottomHtml;

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
        mouse: [ 'x', 'y' ],
        cropper: [ 'x', 'y' ],
        drgbx: [ 'top' ],
        canvas: [ 'left', 'top' ],
        cropbox: [ 'center_x', 'center_y', 'left', 'top', 'left_relative', 'top_relative' ],
        image: [ 'left', 'top' ]
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

const getCropboxTopLeftRelative = (cropper, didMove, pageX, pageY) => {
  let top;
  let left;

  const { outputIds } = getCropper(cropper.element.id);

  const {
    x: cropperX,
    y: cropperY
  } = cropper.getData();

  document.getElementById(outputIds.cropper.x).value = Math.round(cropperX);
  document.getElementById(outputIds.cropper.y).value = Math.round(cropperY);

  const {
    top: cropperCanvasTop,
    left: cropperCanvasLeft
  } = cropper.getCanvasData();

  document.getElementById(outputIds.canvas.top).value = Math.round(cropperCanvasTop);
  document.getElementById(outputIds.canvas.left).value = Math.round(cropperCanvasLeft);

  const {
    element: cropperImage
  } = cropper;

  // get left and top then halve for center x and y
  const {
    top: cropperCropboxTop,
    left: cropperCropboxLeft
  } = getCropBoxDataAdjustedMaster(cropper);

  document.getElementById(outputIds.cropbox.top).value = Math.round(cropperCropboxTop);
  document.getElementById(outputIds.cropbox.left).value = Math.round(cropperCropboxLeft);

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

    document.getElementById(outputIds.drgbx.top).value = Math.round(cropperDragBoxTop);

    // old
    // top = pageY - cropperDragBoxTop;
    // left = pageX - cropperCanvasLeft;

    // new
    top = pageY;
    left = pageX;
  }

  document.getElementById(outputIds.cropbox.top_relative).value = Math.round(top);
  document.getElementById(outputIds.cropbox.left_relative).value = Math.round(left);

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

  const newLeft = left + width;
  const newTop = top - (height / 2);

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
const getCropperCropboxCenter = (cropper, didMove, pageX, pageY) => {
  const {
    width, // 142
    height // 142
  } = getCropBoxDataAdjustedMaster(cropper);

  const {
    top,
    left
  } = getCropboxTopLeftRelative(cropper, didMove, pageX, pageY);

  const x = left + (width / 2);
  const y = top + (height / 2);

  document.getElementById('console-output-debug').value = `getCropperCropboxCenter - x/y: ${Math.round(x)} ${Math.round(y)}, left/top: ${Math.round(left)} ${Math.round(top)}, width/height: ${Math.round(width)} ${Math.round(height)}`;

  return {
    x,
    y
  };
};

const updateSlaveCropper = (slaveCropper, centerX, centerY) => {
  const { outputIds } = getCropper(slaveCropper.element.id);

  // const masterCropper = TODO this needs to be dynamic rather than a global

  const {
    width: masterCropperImageWidth
  } = masterCropper.getImageData();

  const {
    top: slaveCropperCanvasTop,
    left: slaveCropperCanvasLeft
  } = slaveCropper.getCanvasData();

  document.getElementById(outputIds.canvas.top).value = Math.round(slaveCropperCanvasTop);
  document.getElementById(outputIds.canvas.left).value = Math.round(slaveCropperCanvasLeft);

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

  document.getElementById(outputIds.cropbox.top).value = Math.round(slaveCropperCropBoxTop);
  document.getElementById(outputIds.cropbox.top).value = Math.round(slaveCropperCropBoxLeft);
};

// only called from masterCropper, which then controls slaveCropper1
const setCropboxData = (e) => {
  const cropperWasDragged = masterCropperCropBoxDidMove; // TODO this sometimes needs to be clicked twice, needs to support a shaky hand
  masterCropperCropBoxDidMove = false;

  const { pageX, pageY } = e.detail.originalEvent;

  masterCropper = getCropper('image1').cropperInstance;
  slaveCropper1 = getCropper('image2').cropperInstance;
  slaveCropper2 = getCropper('image3').cropperInstance;

  const { outputIds } = getCropper('image1');

  const {
    top: masterCropperImageTop,
    left: masterCropperImageLeft
  } = masterCropper.getImageData();

  document.getElementById(outputIds.image.top).value = Math.round(masterCropperImageTop);
  document.getElementById(outputIds.image.left).value = Math.round(masterCropperImageLeft);

  const {
    x: centerX,
    y: centerY
  } = getCropperCropboxCenter(masterCropper, cropperWasDragged, pageX, pageY);

  document.getElementById(outputIds.cropbox.center_x).value = Math.round(centerX);
  document.getElementById(outputIds.cropbox.center_y).value = Math.round(centerY);

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
  document.body.addEventListener('keydown', handleKeyDown);
  thumbsEl.addEventListener('click', handleThumbSelect);
});
