'use strict';

window.onload = init();

function init() {
  var Cropper = window.Cropper;
  var URL = window.URL || window.webkitURL;
  var container = document.querySelector('.img-container');
  var image = container.getElementsByTagName('img').item(0);
  var actions = document.getElementById('actions');
  var rotateInput = document.getElementById('rotate');
  var thumbs = document.querySelector('.images');

  var aspectRatioEnlargementCollapsed = 865 / 368;

  var options = {
    ready: function (e) {
      console.log(e.type);
    },
    cropstart: function (e) {
      console.log(e.type, e.detail.action);
    },
    cropmove: function (e) {
      console.log(e.type, e.detail.action);
    },
    cropend: function (e) {
      console.log(e.type, e.detail.action);
    },
    crop: function (e) {
      var data = e.detail;

      console.log('crop', data);
      console.log('getData', cropper.getData()); // setData
      console.log('getImageData', cropper.getImageData());
      console.log('getCanvasData', cropper.getCanvasData()); // setCanvasData
      console.log('getCropBoxData', cropper.getCropBoxData()); // setCropBoxData
    },
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
    zoom: function (e) {
      console.log(e.type, e.detail.ratio);
    },
    zoomable: false,
    zoomOnTouch: false,
    zoomOnWheel: false
  };
  var cropper = new Cropper(image, options);
  var originalImageURL = image.src;
  var newImageSrc;

  // Buttons
  if (typeof document.createElement('cropper').style.transition === 'undefined') {
    $('button[data-method="rotate"]').prop('disabled', true);
  }

  const handleControlChange = (event => {
    var e = event || window.event;
    var target = e.target || e.srcElement;
    var cropped;
    var result;
    var input;
    var data;

    if (!cropper) {
      return;
    }

    while (target !== this) {
      if (target.getAttribute('data-method')) {
        break;
      }

      target = target.parentNode;
    }

    if (target === this || target.disabled || target.className.indexOf('disabled') > -1) {
      return;
    }

    data = {
      method: target.getAttribute('data-method'),
      target: target.getAttribute('data-target'),
      option: target.getAttribute('data-option') || undefined,
      secondOption: target.getAttribute('data-second-option') || undefined
    };

    cropped = cropper.cropped;

    if (data.method) {
      if (data.target === null) { // type === object
        if (!target.hasAttribute('data-option')) {
          data.option = target.value;
        }
      }

      switch (data.method) {
        case 'reset':
          
          rotateInput.value = 0;

          break;

        case 'rotate':
          // if (cropped && options.viewMode > 0) {
          //   cropper.clear(); // this resets the crop position
          // }

          cropper.rotateTo(0); // temporarily reset rotation so that a reduction of value is not treated as a further increase

          break;

        case 'rotateTo':
          rotateInput.value = target.value;

          break;
      }

      result = cropper[data.method](data.option, data.secondOption);

      switch (data.method) {
        case 'rotate':
          if (cropped && options.viewMode > 0) {
            cropper.crop();
          }

          break;

        case 'destroy':
          cropper = null;

          if (newImageSrc) {
            URL.revokeObjectURL(newImageSrc);
            newImageSrc = '';
            image.src = originalImageURL;
          }

          break;
      }

      if (typeof result === 'object' && result !== cropper && input) {
        try {
          input.value = JSON.stringify(result);
        } catch (e) {
          console.log(e.message);
        }
      }
    }
  });

  const handleThumbSelect = (event => {
    var e = event || window.event;
    var target = e.target || e.srcElement;

    if (!cropper) {
      return;
    }

    while (target.tagName.toLowerCase() !== 'button') {
      target = target.parentNode;
    }

    const newImage = target.querySelector('img');
    newImageSrc = newImage.getAttribute('src');

    image.src = newImageSrc; // = URL.createObjectURL(file);

    if (cropper) {
      cropper.destroy();
    }

    cropper = new Cropper(image, options);

    setTimeout(function() {
      const imageData = cropper.getImageData();
      console.log('imageData.naturalWidth', imageData.naturalWidth);
    }, 100);

  });
  
  actions.onclick = handleControlChange;
  thumbs.onclick = handleThumbSelect;

}