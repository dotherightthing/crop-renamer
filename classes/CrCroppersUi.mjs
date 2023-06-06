/**
 * @file CrCroppersUi.js
 */
import dtrtValidate from 'dtrt-type-validate';
import { CrDebugUi } from './CrDebugUi.mjs';
import { CrUtilsUi } from './CrUtilsUi.mjs';

export class CrCroppersUi { // eslint-disable-line no-unused-vars
  /**
   * @class CrCroppersUi
   * @summary Manages croppers component, containing instances of cropperjs
   * @param {object} config - Instance config
   * @public
   * @todo Add a subscribe method
   */
  constructor(config = {}) {
    // select the relevant arguments from the config object passed in
    const {
      controlIds,
      Cropper,
      cropperCanvasClass,
      cropperImageClass,
      croppersId,
      croppersOptions,
      initDelay
    } = config;

    Object.assign(this, {
      controlIds,
      Cropper,
      cropperCanvasClass,
      cropperImageClass,
      croppersId,
      croppersOptions,
      initDelay
    });

    this.croppers = [];
    this.masterCropperCropBoxWasDragged = false;
  }

  /* Getters and Setters */

  /**
   * controlIds
   * @type {object}
   * @memberof CrCroppersUi
   */
  get controlIds() {
    return this._controlIds;
  }

  set controlIds(controlIds) {
    this._controlIds = dtrtValidate.validate(controlIds, 'object', 'CrCroppersUi.controlIds');
  }

  /**
   * Cropper
   * @type {Function}
   * @memberof CrCroppersUi
   */
  get Cropper() {
    return this._Cropper;
  }

  set Cropper(Cropper) {
    this._Cropper = dtrtValidate.validate(Cropper, 'function', 'CrCroppersUi.Cropper');
  }

  /**
   * cropperCanvasClass
   * @type {string}
   * @memberof CrCroppersUi
   */
  get cropperCanvasClass() {
    return this._cropperCanvasClass;
  }

  set cropperCanvasClass(cropperCanvasClass) {
    this._cropperCanvasClass = dtrtValidate.validate(cropperCanvasClass, 'string', 'CrCroppersUi.cropperCanvasClass');
  }

  /**
   * cropperImageClass
   * @type {string}
   * @memberof CrCroppersUi
   */
  get cropperImageClass() {
    return this._cropperImageClass;
  }

  set cropperImageClass(cropperImageClass) {
    this._cropperImageClass = dtrtValidate.validate(cropperImageClass, 'string', 'CrCroppersUi.cropperImageClass');
  }

  /**
   * croppersId
   * @type {string}
   * @memberof CrCroppersUi
   */
  get croppersId() {
    return this._croppersId;
  }

  set croppersId(croppersId) {
    this._croppersId = dtrtValidate.validate(croppersId, 'string', 'CrCroppersUi.croppersId');
  }

  /**
   * croppersOptions
   * @type {object}
   * @memberof CrCroppersUi
   */
  get croppersOptions() {
    return this._croppersOptions;
  }

  set croppersOptions(croppersOptions) {
    this._croppersOptions = dtrtValidate.validate(croppersOptions, 'object', 'CrCroppersUi.croppersOptions');
  }

  /**
   * imageSrc
   * @type {string}
   * @memberof CrCroppersUi
   */
  get imageSrc() {
    return this._imageSrc;
  }

  set imageSrc(imageSrc) {
    this._imageSrc = dtrtValidate.validate(imageSrc, 'string', 'CrCroppersUi.imageSrc');
  }

  /**
   * initDelay
   * @type {number}
   * @memberof CrCroppersUi
   */
  get initDelay() {
    return this._initDelay;
  }

  set initDelay(initDelay) {
    this._initDelay = dtrtValidate.validate(initDelay, 'number', 'CrCroppersUi.initDelay');
  }

  /**
   * masterCropper
   * @summary The object containing the master cropper instance
   * @type {object}
   * @memberof CrCroppersUi
   */
  get masterCropper() {
    return this._masterCropper;
  }

  set masterCropper(masterCropper) {
    this._masterCropper = dtrtValidate.validate(masterCropper, 'object', 'CrCroppersUi.masterCropper');
  }

  /**
   * masterCropperCropBoxWasDragged
   * @summary Tracks whether the cropbox was dragged
   * @type {boolean}
   * @memberof CrCroppersUi
   */
  get masterCropperCropBoxWasDragged() {
    return this._masterCropperCropBoxWasDragged;
  }

  set masterCropperCropBoxWasDragged(masterCropperCropBoxWasDragged) {
    this._masterCropperCropBoxWasDragged = dtrtValidate.validate(masterCropperCropBoxWasDragged, 'boolean', 'CrCroppersUi.masterCropperCropBoxWasDragged');
  }

  /**
   * slaveCroppers
   * @summary An array of objects, each containing a slave cropper instance
   * @type {Array}
   * @memberof CrCroppersUi
   */
  get slaveCroppers() {
    return this._slaveCroppers;
  }

  set slaveCroppers(slaveCroppers) {
    this._slaveCroppers = dtrtValidate.validate(slaveCroppers, 'Array', 'CrCroppersUi.slaveCroppers');
  }

  /* Instance methods */

  /**
   * @function setFocalPoint
   * @summary Convert image percentage X/Y to crop Left/Top
   * @param {object} args - Arguments
   * @param {number} args.imagePercentageTop - Image percentage top
   * @param {number} args.imagePercentageLeft - Image percentage left
   * @memberof CrCroppersUi
   * @todo Reset position is incorrect for image #5
   */
  setFocalPoint({ imagePercentageTop, imagePercentageLeft }) {
    // const { masterCropper } = this;

    // simulate click event
    this.masterCropperCropBoxWasDragged = false;

    const {
      imageX,
      imageY
    } = this.getImageXYFromImagePercentageLeftTop({ imagePercentageTop, imagePercentageLeft });

    const {
      pageX,
      pageY
    } = this.getPageXYFromImageXY({ imageX, imageY });

    // const {
    //   cropBoxLeft,
    //   cropBoxTop
    // } = getCropBoxLeftTopFromPageXY({ pageX, pageY });

    // ok
    // TODO call moveMasterCropperCropBox instead
    // masterCropper.cropperInstance.setCropBoxData({
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

    // this.moveCropperCropBoxToPageXY(e);

    this.moveMasterCropperCropBox({
      pageX,
      pageY
    });
  }

  /**
   * @function changeSourceImage
   * @param {HTMLElement} target - Image element
   * @memberof CrCroppersUi
   */
  changeSourceImage(target) {
    const newImage = target.querySelector('img');
    const newImageSrc = newImage.getAttribute('src');

    // TODO if exists
    this.destroy();

    this.imageSrc = newImageSrc;
    this.init();
  }

  /**
   * @function croppersImageIsValid
   * @summary Check that the croppers' image src is valid
   * @returns {boolean} valid
   * @memberof CrCroppersUi
   */
  croppersImageIsValid() {
    const { croppersId } = this;
    const cropperImages = document.querySelectorAll(`#${croppersId} img`);
    let isValid = true;

    if (!cropperImages.length) {
      isValid = false;
    }

    cropperImages.forEach(cropperImage => {
      if (cropperImage.getAttribute('src') === null) {
        isValid = false;
      } else if (cropperImage.getAttribute('src').indexOf('/undefined') !== -1) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * @function destroy
   * @summary Destroy instances of cropperjs
   * @memberof CrCroppersUi
   */
  destroy() {
    const { croppers } = this;

    croppers.forEach(cropper => {
      const { cropperInstance } = cropper;

      if (cropperInstance) {
        cropperInstance.destroy();
      }
    });

    this.croppers = [];
  }

  /**
   * @function getCropBoxLeftTopFromPageXY
   * @param {object} args - Arguments
   * @param {number} args.pageX - Page X
   * @param {number} args.pageY - Page Y
   * @returns {object} { cropBoxLeft, cropBoxTop }
   * @memberof CrCroppersUi
   */
  getCropBoxLeftTopFromPageXY({ pageX, pageY }) {
    const { masterCropper } = this;

    const {
      top: canvasTop,
      left: canvasLeft
    } = masterCropper.cropperInstance.getCanvasData();

    const {
      top: canvasOffsetTop,
      left: canvasOffsetLeft
    } = this.getCropperCanvasOffsets();

    const {
      width: cropperWidth,
      height: cropperHeight
    } = masterCropper.cropperInstance.getCropBoxData();

    const pageXOffset = pageX + canvasLeft - canvasOffsetLeft;
    const cropBoxLeft = pageXOffset - (cropperWidth / 2);

    const pageYOffset = pageY + canvasTop - canvasOffsetTop;
    const cropBoxTop = pageYOffset - (cropperHeight / 2);

    return {
      cropBoxLeft,
      cropBoxTop
    };
  }

  /**
   * @function getCropCoordinatesFromImage
   * @summary Get the crop coordinates stored in the filename
   * @returns {object} position
   * @memberof CrCroppersUi
   */
  getCropCoordinatesFromImage() {
    const { masterCropper } = this;
    let position = {};

    const masterCropperImageSrc = masterCropper.cropperInstance.element.src;

    const regexp = /\[([0-9]+)%,([0-9]+)%\]/g; // filename__[20%,30%].ext
    const matches = masterCropperImageSrc.matchAll(regexp);
    const matchesArr = [ ...matches ];

    if (matchesArr.length) {
      position = {
        imagePercentageLeft: matchesArr[0][1],
        imagePercentageTop: matchesArr[0][2]
      };
    }

    return position;
  }

  /**
   * @function getCropperCanvasOffsets
   * @summary cropper.getCanvasData().top ignores preceding UI and returns 0, this function returns the actual offset
   * @returns {object} { top, left }
   * @memberof CrCroppersUi
   */
  getCropperCanvasOffsets() {
    const {
      cropperCanvasClass,
      masterCropper
    } = this;

    const {
      element: cropperImage
    } = masterCropper.cropperInstance;

    const cropperContainerEl = cropperImage.nextSibling;
    const cropperCanvasEl = cropperContainerEl.querySelector(`.${cropperCanvasClass}`);

    const {
      top,
      left
    } = CrUtilsUi.getOffset(cropperCanvasEl);

    return { top, left };
  }

  /**
   * @function getCropperOptions
   * @param {string} cropperAspectRatio - Cropper Aspect Ratio
   * @param {string} isCropperMaster - Is Cropper Master?
   * @returns {object} options
   * @memberof CrCroppersUi
   */
  getCropperOptions(cropperAspectRatio, isCropperMaster) {
    const {
      croppersOptions
    } = this;

    const options = { ...croppersOptions };

    if (isCropperMaster) {
      Object.assign(options, {
        autoCropArea: 0.2,
        cropBoxMovable: true,
        guides: false,
        movable: true,
        // crop - fires during move, then after cropend
        // cropstart - occurs on mouse down, so before a click AND before a move
        cropmove: () => {
          this.masterCropperCropBoxWasDragged = true; // differentiate between a click and a move
        },
        cropend: (e) => { // dragEnd callback, see https://github.com/fengyuanchen/cropperjs/issues/669; fires after move
          this.moveCropperCropBoxToPageXY(e);
        }
      }); // https://codepen.io/saleemnaufa/pen/gVewZw
    }

    const [ a, b ] = cropperAspectRatio.split(':');

    Object.assign(options, { aspectRatio: a / b });

    return options;
  }

  /**
   * @function getImagePercentageFromCropBoxCenter
   * @summary Get the X or Y coordinate as a percentage of the image dimension, so that it can be stored and recalled later.
   * @param {number} cropCenter - Crop center (X or Y axis)
   * @param {number} dimensionLength - Dimension length (width or height)
   * @returns {number} percentage
   * @memberof CrCroppersUi
   */
  getImagePercentageFromCropBoxCenter(cropCenter, dimensionLength) {
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
  }

  /**
   * @function getImagePercentageLeftTopFromPageXY
   * @param {object} args - Arguments
   * @param {number} args.pageX - Page X
   * @param {number} args.pageY - Page Y
   * @returns {object} { imagePercentageLeft, imagePercentageTop }
   * @memberof CrCroppersUi
   */
  getImagePercentageLeftTopFromPageXY({ pageX, pageY }) {
    const {
      masterCropper
    } = this;

    const {
      width: cropBoxWidth,
      height: cropBoxHeight
    } = masterCropper.cropperInstance.getCropBoxData();

    const {
      width: imageWidth,
      height: imageHeight
    } = masterCropper.cropperInstance.getImageData();

    CrDebugUi.debugParameter(masterCropper, 'cropbox.expected_center_x', imageWidth / 2, false);
    CrDebugUi.debugParameter(masterCropper, 'cropbox.expected_center_y', imageHeight / 2, false);

    const cropBoxCenterX = pageX - (cropBoxWidth / 2);
    const cropBoxCenterY = pageY - (cropBoxHeight / 2);

    CrDebugUi.debugParameter(masterCropper, 'cropbox.actual_center_x', cropBoxCenterX, false);
    CrDebugUi.debugParameter(masterCropper, 'cropbox.actual_center_y', cropBoxCenterY, false);

    const imagePercentageLeft = this.getImagePercentageFromCropBoxCenter(cropBoxCenterX, imageWidth, false);
    const imagePercentageTop = this.getImagePercentageFromCropBoxCenter(cropBoxCenterY, imageHeight, false);

    CrDebugUi.debugParameter(masterCropper, 'cropbox.percentage_top', imagePercentageTop, false);
    CrDebugUi.debugParameter(masterCropper, 'cropbox.percentage_left', imagePercentageLeft, false);

    return {
      imagePercentageLeft,
      imagePercentageTop
    };
  }

  /**
   * @function getImageXYFromImagePercentageLeftTop
   * @param {object} args - Arguments
   * @param {number} args.imagePercentageLeft - Image percentage left
   * @param {number} args.imagePercentageTop -  Image percentage top
   * @returns {object} { imageX, imageY }
   * @memberof CrCroppersUi
   */
  getImageXYFromImagePercentageLeftTop({ imagePercentageLeft, imagePercentageTop }) {
    const { masterCropper } = this;

    const {
      width: imageWidth,
      height: imageHeight
    } = masterCropper.cropperInstance.getImageData();

    const imageX = ((imagePercentageLeft / 100) * imageWidth);
    const imageY = ((imagePercentageTop / 100) * imageHeight);

    return {
      imageX,
      imageY
    };
  }

  /**
   * @function getImageXYFromPageXY
   * @param {object} args - Arguments
   * @param {number} args.pageX - Page X
   * @param {number} args.pageY - Page Y
   * @returns {object} { imageX, imageY }
   * @memberof CrCroppersUi
   */
  getImageXYFromPageXY({ pageX, pageY }) {
    const {
      left: canvasOffsetLeft,
      top: canvasOffsetTop
    } = this.getCropperCanvasOffsets();

    const imageX = pageX - canvasOffsetLeft;
    const imageY = pageY - canvasOffsetTop;

    return {
      imageX,
      imageY
    };
  }

  /**
   * @function getMasterCropper
   * @summary Get the object for the master cropper (which contains the cropperInstance)
   * @returns {object} { cropperInstance, isMaster, outputIds }
   * @memberof CrCroppersUi
   */
  getMasterCropper() {
    const { croppers } = this;

    const masterCroppers = croppers.filter(cropper => cropper.isMaster);

    return masterCroppers[0];
  }

  /**
   * @function getPageXYFromImageXY
   * @param {object} args - Arguments
   * @param {number} args.imageX - Image X
   * @param {number} args.imageY - Image Y
   * @returns {object} { pageX, pageY }
   * @memberof CrCroppersUi
   */
  getPageXYFromImageXY({ imageX, imageY }) {
    const {
      left: canvasOffsetLeft,
      top: canvasOffsetTop
    } = this.getCropperCanvasOffsets();

    const pageX = imageX + canvasOffsetLeft;
    const pageY = imageY + canvasOffsetTop;

    return {
      pageX,
      pageY
    };
  }

  /**
   * @function getSlaveCroppers
   * @summary Get an array of slave croppers (containing objects which include the cropperInstance)
   * @returns {Array} slaveCroppers
   * @memberof CrCroppersUi
   */
  getSlaveCroppers() {
    const { croppers } = this;

    const slaveCroppers = croppers.filter(cropper => typeof cropper.isMaster === 'undefined');

    return slaveCroppers;
  }

  /**
   * @function init
   * @summary Initialise cropper instances (master and slaves)
   * @memberof CrCroppersUi
   */
  init() {
    const { croppersId, imageSrc } = this;

    if (typeof imageSrc === 'undefined') {
      return;
    }

    // these are the images used by the 4 croppers
    // they start off with no src
    // when an image appears, what you see is the cropper - not the img
    const cropperImages = document.querySelectorAll(`#${croppersId} img`);
    this.croppers = [];

    cropperImages.forEach((cropperImage, cropperIndex) => {
      this.initCropper(cropperImage, cropperIndex);
    });

    if (!this.croppers.length) {
      console.log('Croppers could not be initialised');
      return;
    }

    this.masterCropper = this.getMasterCropper();
    this.slaveCroppers = this.getSlaveCroppers();

    // if (typeof document.createElement('cropper').style.transition === 'undefined') {
    //   rotateEl.prop('disabled', true);
    // }

    setTimeout(() => {
      this.resetFocalPoint();

      const position = this.readFocalPointFromImage();

      this.setFocalPoint(position);
    }, this.initDelay);
  }

  /**
   * @function initCropper
   * @summary Initialise cropper instance
   * @param {HTMLElement} cropperImage - Cropper image
   * @param {number} cropperIndex - Cropper index
   * @returns { object } cropper - Object containing cropperInstance
   * @memberof CrCroppersUi
   */
  initCropper(cropperImage, cropperIndex) {
    const {
      Cropper,
      croppersId,
      imageSrc
    } = this;

    const {
      cropperAspectRatio,
      cropperLabel,
      isCropperMaster
    } = cropperImage.dataset;

    this.injectHeading(cropperImage, cropperLabel);

    cropperImage.setAttribute('src', imageSrc);

    const cropperOptions = this.getCropperOptions(cropperAspectRatio, isCropperMaster);
    const cropperInstance = new Cropper(cropperImage, cropperOptions);

    this.croppers.push({
      cropperInstance,
      isMaster: isCropperMaster
    });

    if (cropperIndex === 0) {
      CrUtilsUi.emitEvent(croppersId, 'createdMasterCropper', {
        cropperInstance,
        cropperOptions
      });
    } else {
      CrUtilsUi.emitEvent(croppersId, 'createdSlaveCropper', {
        cropperInstance,
        cropperOptions,
        cropperIndex
      });
    }

    return {
      cropperInstance,
      isMaster: isCropperMaster
    };
  }

  /**
   * @function injectHeading
   * @param {HTMLElement} cropperImage - Cropper image
   * @param {string} cropperLabel - Cropper label
   * @returns {HTMLElement} heading element
   * @memberof CrCroppersUi
   */
  injectHeading(cropperImage, cropperLabel) {
    const parent = cropperImage.parentNode;

    let heading = parent.querySelector('h2');

    if (!heading) {
      const headingText = document.createTextNode(cropperLabel);

      heading = document.createElement('h2');
      heading.appendChild(headingText);
      parent.insertBefore(heading, cropperImage);
    }

    return heading;
  }

  /**
   * @function moveCropperCropBoxToPageXY
   * @param {event} e - Event
   * @memberof CrCroppersUi
   * @todo This sometimes needs to be clicked twice, needs to support a shaky hand (#5)
   * @todo Also support end of dragging
   */
  moveCropperCropBoxToPageXY(e) {
    const { masterCropper } = this;

    const cropperWasDragged = this.masterCropperCropBoxWasDragged;

    this.masterCropperCropBoxWasDragged = false;

    const {
      pageX,
      pageY
    } = e.detail.originalEvent;

    const slaveCroppers = this.getSlaveCroppers(); // arr

    const {
      top: masterCropperCanvasOffsetTop
      // left: masterCropperCanvasOffsetLeft
    } = this.getCropperCanvasOffsets();

    const {
      top: masterCropperCanvasTop,
      left: masterCropperCanvasLeft
    } = masterCropper.cropperInstance.getCanvasData();

    if (!cropperWasDragged) {
      // move the cropper to the click location
      this.moveMasterCropperCropBox({
        pageX,
        pageY
      });
    }

    slaveCroppers.forEach(cropper => {
      const {
        cropperInstance
      } = cropper;

      this.moveSlaveCropperCropBox({
        cropper: cropperInstance,
        pageX,
        pageY,
        masterCropperCanvasOffsetTop,
        masterCropperCanvasTop,
        masterCropperCanvasLeft
      });
    });
  }

  /**
   * @function moveMasterCropperCropBox
   * @summary When the canvas is clicked, move the crop box on the master cropper so it centers on the pointer location
   * @param {object} args - Arguments
   * @param {number} args.pageX - Page X
   * @param {number} args.pageY - Page Y
   * @memberof CrCroppersUi
   */
  moveMasterCropperCropBox({ pageX, pageY }) {
    const {
      masterCropper
    } = this;

    console.log('moveMasterCropperCropBox to pageX', pageX, 'pageY', pageY);

    const {
      top: masterCropperCanvasTop,
      left: masterCropperCanvasLeft
    } = masterCropper.cropperInstance.getCanvasData();

    console.log('masterCropperCanvasTop', masterCropperCanvasTop, 'masterCropperCanvasLeft', masterCropperCanvasLeft);

    const {
      top: masterCropperCanvasOffsetTop,
      left: masterCropperCanvasOffsetLeft
    } = this.getCropperCanvasOffsets();

    console.log('masterCropperCanvasOffsetTop', masterCropperCanvasOffsetTop, 'masterCropperCanvasOffsetLeft', masterCropperCanvasOffsetLeft);

    const {
      cropBoxLeft,
      cropBoxTop
    } = this.getCropBoxLeftTopFromPageXY({ pageX, pageY });

    console.log('cropBoxLeft', cropBoxLeft, 'cropBoxTop', cropBoxTop);

    const {
      imagePercentageLeft,
      imagePercentageTop
    } = this.getImagePercentageLeftTopFromPageXY({ pageX, pageY });

    console.log('imagePercentageLeft', imagePercentageLeft, 'imagePercentageTop', imagePercentageTop);

    const {
      width: imageWidth,
      height: imageHeight
    } = masterCropper.cropperInstance.getImageData();

    masterCropper.cropperInstance.setCropBoxData({
      top: cropBoxTop,
      left: cropBoxLeft
    });

    console.log('cropBoxTop', cropBoxTop, 'cropBoxLeft', cropBoxLeft);

    // test that the value is restored correctly if the percentages are applied

    // eslint-disable-next-line max-len
    const restoredTop = ((imagePercentageTop / 100) * imageHeight) + masterCropperCanvasTop - masterCropperCanvasOffsetTop;
    const restoredLeft = ((imagePercentageLeft / 100) * imageWidth);

    console.log('restoredTop', restoredTop, 'restoredLeft', restoredLeft);

    CrDebugUi.debugParameter(masterCropper, 'cropbox.canvas_top_offset', masterCropperCanvasOffsetTop, true);
    CrDebugUi.debugParameter(masterCropper, 'cropbox.canvas_top', masterCropperCanvasTop, true);

    CrDebugUi.debugParameter(masterCropper, 'cropbox.set_top', cropBoxTop, true);
    CrDebugUi.debugParameter(masterCropper, 'cropbox.set_left', cropBoxLeft, true);
    CrDebugUi.debugParameter(masterCropper, 'cropbox.restored_top', restoredTop, true);
    CrDebugUi.debugParameter(masterCropper, 'cropbox.restored_left', restoredLeft, true);

    CrDebugUi.debugParameter(masterCropper, 'image.width', imageWidth, true);
    CrDebugUi.debugParameter(masterCropper, 'image.height', imageHeight, true);

    // visual delay so its clear what's happening
    setTimeout(() => {
      masterCropper.cropperInstance.setCropBoxData({
        top: restoredTop,
        left: restoredLeft
      });
    }, 500);
  }

  /**
   * @function moveSlaveCropperCropBox
   * @summary Move the crop box on the dependent cropper
   * @param {object} args - Arguments
   * @param {number} args.pageX - Page X
   * @param {number} args.pageY - Page Y
   * @param {object} args.cropper - Slave cropper
   * @param {number} args.masterCropperCanvasOffsetTop - Height of preceding UI
   * @param {number} args.masterCropperCanvasLeft - gap between edge of viewport and start of master image
   * @memberof CrCroppersUi
   */
  moveSlaveCropperCropBox({
    cropper,
    pageX,
    pageY,
    masterCropperCanvasOffsetTop,
    masterCropperCanvasLeft
  }) {
    const {
      top: cropperCanvasTop // gap between top of column and start of slave image
    } = cropper.getCanvasData();

    const {
      width: cropperWidth,
      height: cropperHeight
    } = cropper.getCropBoxData();

    const cropBoxCenterX = this.scaleSlaveVal(cropper, pageX) - (cropperWidth / 2);
    const cropBoxCenterY = this.scaleSlaveVal(cropper, pageY) - (cropperHeight / 2);
    const cropperCropBoxTop = cropperCanvasTop + cropBoxCenterY - this.scaleSlaveVal(cropper, masterCropperCanvasOffsetTop); // eslint-disable-line max-len
    const cropperCropBoxLeft = cropBoxCenterX - this.scaleSlaveVal(cropper, masterCropperCanvasLeft);

    cropper.setCropBoxData({
      top: cropperCropBoxTop,
      left: cropperCropBoxLeft
    });
  }

  /**
   * @function readFocalPointFromImage
   * @summary Read focal point position from filename
   * @returns {object} { imagePercentageTop, imagePercentageLeft }
   * @memberof CrCroppersUi
   * @todo Finish - this is only placeholder code for testing purposes.
   */
  readFocalPointFromImage() {
    return {
      imagePercentageTop: 50,
      imagePercentageLeft: 50
    };
  }

  /**
   * @function removeCropCoordinatesFromImage
   * @memberof CrCroppersUi
   * @static
   */
  async removeCropCoordinatesFromImage() {
    const {
      controlIds,
      croppersId,
      masterCropper
    } = this;

    const { deleteCropCoordinates } = controlIds;

    const fileName = masterCropper.cropperInstance.element.src;

    document.getElementById(deleteCropCoordinates).disabled = true;

    const newFileName = await window.electronAPI.deleteCropCoordinates({
      fileName
    });

    document.getElementById(deleteCropCoordinates).disabled = false;

    masterCropper.cropperInstance.element.src = `file://${newFileName.replaceAll(' ', '%20')}`;

    CrUtilsUi.emitEvent(croppersId, 'imageRenamed', {
      newFileName
    });
  }

  /**
   * @function resetFocalPoint
   * @summary Set default focal point position
   * @memberof CrCroppersUi
   */
  resetFocalPoint() {
    const position = {
      imagePercentageTop: 50,
      imagePercentageLeft: 50
    };

    this.setFocalPoint(position);
  }

  /**
   * @function scaleSlaveVal
   * @summary Slave croppers are smaller than the Master cropper. Scale down values derived from calculations on the Master cropper.
   * @param {object} slaveCropper - Slave cropper instance
   * @param {number} val - Value to scale
   * @returns {number} Scaled value
   * @memberof CrCroppersUi
   */
  scaleSlaveVal(slaveCropper, val) {
    const { masterCropper } = this;

    const {
      width: masterCropperImageWidth
    } = masterCropper.cropperInstance.getImageData();

    const {
      width: cropperImageWidth
    } = slaveCropper.getImageData();

    const scalingRatio = (cropperImageWidth / masterCropperImageWidth);

    return val * scalingRatio;
  }

  /**
   * @function writeCropCoordinatesToImage
   * @summary Save the crop XY to the image file
   * @memberof CrCroppersUi
   * @todo Working but top and left aren't correct for both tested images
   * @todo Refresh thumbnail and image src after renaming image file
   */
  async writeCropCoordinatesToImage() {
    const {
      controlIds,
      masterCropper
    } = this;

    const { deleteCropCoordinates } = controlIds;

    const imagePercentageTop = CrDebugUi.getDebugParameterValue(masterCropper, 'cropbox.percentage_top');
    const imagePercentageLeft = CrDebugUi.getDebugParameterValue(masterCropper, 'cropbox.percentage_left');

    const fileName = masterCropper.cropperInstance.element.src;

    document.getElementById(deleteCropCoordinates).disabled = true;

    const newFileName = await window.electronAPI.saveCropCoordinates({
      fileName,
      imagePercentageTop,
      imagePercentageLeft
    });

    document.getElementById(deleteCropCoordinates).disabled = false;

    masterCropper.cropperInstance.element.src = `file://${newFileName.replaceAll(' ', '%20')}`;
    document.querySelectorAll('.thumbs .btn-selected img').src = newFileName;
  }

  /* Static methods */
}
