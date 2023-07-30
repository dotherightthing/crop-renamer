/**
 * @file FmcCroppersUi.js
 */
import dtrtValidate from 'dtrt-type-validate';
import { FmcUi } from './FmcUi.mjs';

export class FmcCroppersUi {
  /**
   * @class FmcCroppersUi
   * @summary Manages croppers component, containing instances of cropperjs
   * @param {object} config - Instance config
   * @public
   * @todo Add a subscribe method
   */
  constructor(config = {}) {
    // select the relevant arguments from the config object passed in
    const {
      Cropper,
      cropperCanvasClass,
      cropperImageClass,
      croppersId,
      croppersOptions,
      focalpointXInputId,
      focalpointYInputId,
      updateDelay
    } = config;

    Object.assign(this, {
      Cropper,
      cropperCanvasClass,
      cropperImageClass,
      croppersId,
      croppersOptions,
      focalpointXInputId,
      focalpointYInputId,
      updateDelay
    });

    // assign Expando property to expose methods during E2E testing
    document.getElementById(croppersId).fmcCroppersUi = this;

    this.croppers = [];
    this.resizers = [];
    this.masterCropperCropBoxWasDragged = false;
  }

  /* Getters and Setters */

  /**
   * Cropper
   * @type {Function}
   * @memberof FmcCroppersUi
   */
  get Cropper() {
    return this._Cropper;
  }

  set Cropper(Cropper) {
    this._Cropper = dtrtValidate.validate(Cropper, 'function', 'FmcCroppersUi.Cropper');
  }

  /**
   * cropperCanvasClass
   * @type {string}
   * @memberof FmcCroppersUi
   */
  get cropperCanvasClass() {
    return this._cropperCanvasClass;
  }

  set cropperCanvasClass(cropperCanvasClass) {
    this._cropperCanvasClass = dtrtValidate.validate(cropperCanvasClass, 'string', 'FmcCroppersUi.cropperCanvasClass');
  }

  /**
   * cropperImageClass
   * @type {string}
   * @memberof FmcCroppersUi
   */
  get cropperImageClass() {
    return this._cropperImageClass;
  }

  set cropperImageClass(cropperImageClass) {
    this._cropperImageClass = dtrtValidate.validate(cropperImageClass, 'string', 'FmcCroppersUi.cropperImageClass');
  }

  /**
   * croppers
   * @type {Array}
   * @memberof FmcCroppersUi
   */
  get croppers() {
    return this._croppers;
  }

  set croppers(croppers) {
    this._croppers = dtrtValidate.validate(croppers, 'Array', 'FmcCroppersUi.croppers');
  }

  /**
   * croppersId
   * @type {string}
   * @memberof FmcCroppersUi
   */
  get croppersId() {
    return this._croppersId;
  }

  set croppersId(croppersId) {
    this._croppersId = dtrtValidate.validate(croppersId, 'string', 'FmcCroppersUi.croppersId');
  }

  /**
   * croppersOptions
   * @type {object}
   * @memberof FmcCroppersUi
   */
  get croppersOptions() {
    return this._croppersOptions;
  }

  set croppersOptions(croppersOptions) {
    this._croppersOptions = dtrtValidate.validate(croppersOptions, 'object', 'FmcCroppersUi.croppersOptions');
  }

  /**
   * focalpointXInputId
   * @type {string}
   * @memberof FmcCroppersUi
   */
  get focalpointXInputId() {
    return this._focalpointXInputId;
  }

  set focalpointXInputId(focalpointXInputId) {
    this._focalpointXInputId = dtrtValidate.validate(focalpointXInputId, 'string', 'FmcCroppersUi.focalpointXInputId');
  }

  /**
   * focalpointYInputId
   * @type {string}
   * @memberof FmcCroppersUi
   */
  get focalpointYInputId() {
    return this._focalpointYInputId;
  }

  set focalpointYInputId(focalpointYInputId) {
    this._focalpointYInputId = dtrtValidate.validate(focalpointYInputId, 'string', 'FmcCroppersUi.focalpointYInputId');
  }

  /**
   * imageSrc
   * @type {string}
   * @memberof FmcCroppersUi
   */
  get imageSrc() {
    return this._imageSrc;
  }

  set imageSrc(imageSrc) {
    this._imageSrc = dtrtValidate.validate(imageSrc, 'string', 'FmcCroppersUi.imageSrc');
  }

  /**
   * masterCropper
   * @summary The object containing the master cropper instance
   * @type {object}
   * @memberof FmcCroppersUi
   */
  get masterCropper() {
    return this._masterCropper;
  }

  set masterCropper(masterCropper) {
    this._masterCropper = dtrtValidate.validate(masterCropper, 'object', 'FmcCroppersUi.masterCropper');
  }

  /**
   * masterCropperCropBoxWasDragged
   * @summary Tracks whether the cropbox was dragged
   * @type {boolean}
   * @memberof FmcCroppersUi
   */
  get masterCropperCropBoxWasDragged() {
    return this._masterCropperCropBoxWasDragged;
  }

  set masterCropperCropBoxWasDragged(masterCropperCropBoxWasDragged) {
    this._masterCropperCropBoxWasDragged = dtrtValidate.validate(masterCropperCropBoxWasDragged, 'boolean', 'FmcCroppersUi.masterCropperCropBoxWasDragged');
  }

  /**
   * resizers
   * @type {Array}
   * @memberof FmcCroppersUi
   */
  get resizers() {
    return this._resizers;
  }

  set resizers(resizers) {
    this._resizers = dtrtValidate.validate(resizers, 'Array', 'FmcCroppersUi.resizers');
  }

  /**
   * slaveCroppers
   * @summary An array of objects, each containing a slave cropper instance
   * @type {Array}
   * @memberof FmcCroppersUi
   */
  get slaveCroppers() {
    return this._slaveCroppers;
  }

  set slaveCroppers(slaveCroppers) {
    this._slaveCroppers = dtrtValidate.validate(slaveCroppers, 'Array', 'FmcCroppersUi.slaveCroppers');
  }

  /**
   * updateDelay
   * @type {number}
   * @memberof FmcCroppersUi
   */
  get updateDelay() {
    return this._updateDelay;
  }

  set updateDelay(updateDelay) {
    this._updateDelay = dtrtValidate.validate(updateDelay, 'number', 'FmcCroppersUi.updateDelay');
  }

  /* Instance methods */

  /**
   * @function calcCanvasOffsets
   * @summary cropper.getCanvasData().top ignores preceding UI and returns 0, this function returns the actual offset
   * @returns {object} { top, left }
   * @memberof FmcCroppersUi
   * @see {@link cypress/e2e/electron-spec.cy.js}
   */
  calcCanvasOffsets() {
    const {
      cropperCanvasClass,
      masterCropper
    } = this;

    const {
      element: cropperImage
    } = masterCropper.cropperInstance;

    const cropperContainerEl = cropperImage.nextSibling;
    const cropperCanvasEl = cropperContainerEl.querySelector(`.${cropperCanvasClass}`);

    if (cropperCanvasEl === null) {
      throw new Error('Cropper canvas not found - cropper was not injected');
    }

    const { top } = FmcUi.getOffset(cropperCanvasEl);
    const { left } = masterCropper.cropperInstance.getCanvasData();

    return { top, left };
  }

  /**
   * @function calcCropBoxXYFromPageXY
   * @param {object} args - Arguments
   * @param {number} args.pageX - Page X
   * @param {number} args.pageY - Page Y
   * @returns {object} { cropBoxX, cropBoxY }
   * @memberof FmcCroppersUi
   */
  calcCropBoxXYFromPageXY({ pageX, pageY }) {
    const { masterCropper } = this;

    const {
      top: canvasTop,
      left: canvasLeft
    } = masterCropper.cropperInstance.getCanvasData();

    const {
      top: canvasOffsetTop,
      left: canvasOffsetLeft
    } = this.calcCanvasOffsets();

    const {
      width: cropperWidth,
      height: cropperHeight
    } = masterCropper.cropperInstance.getCropBoxData();

    const pageXOffset = pageX + canvasLeft - canvasOffsetLeft;
    const cropBoxX = pageXOffset - (cropperWidth / 2);

    const pageYOffset = pageY + canvasTop - canvasOffsetTop;
    const cropBoxY = pageYOffset - (cropperHeight / 2);

    return {
      cropBoxX,
      cropBoxY
    };
  }

  /**
   * @function calcImageXYFromImagePercentXY
   * @param {object} args - Arguments
   * @param {number} args.imagePercentX - Image percentage X
   * @param {number} args.imagePercentY - Image percentage Y
   * @returns {object} { imageX, imageY }
   * @memberof FmcCroppersUi
   * @see {@link cypress/e2e/electron-spec.cy.js}
   */
  calcImageXYFromImagePercentXY({ imagePercentX, imagePercentY }) {
    const { masterCropper } = this;

    const {
      width: imageWidth,
      height: imageHeight
    } = masterCropper.cropperInstance.getImageData();

    const imageX = ((imagePercentX / 100) * imageWidth);
    const imageY = ((imagePercentY / 100) * imageHeight);

    return {
      imageX,
      imageY
    };
  }

  /**
   * @function calcImageXYFromPageXY
   * @param {object} args - Arguments
   * @param {number} args.pageX - Page X
   * @param {number} args.pageY - Page Y
   * @returns {object} { imageX, imageY }
   * @memberof FmcCroppersUi
   */
  calcImageXYFromPageXY({ pageX, pageY }) {
    const {
      left: canvasOffsetLeft,
      top: canvasOffsetTop
    } = this.calcCanvasOffsets();

    const imageX = pageX - canvasOffsetLeft;
    const imageY = pageY - canvasOffsetTop;

    return {
      imageX,
      imageY
    };
  }

  /**
   * @function calcPageXYForRoundedImagePercentXY
   * @summary Change x and y so they correspond with a rounded percentage
   * @param {object} args - Method arguments
   * @param {number} args.pageXRaw - Page X raw (unrounded)
   * @param {number} args.pageYRaw - Page Y raw (unrounded)
   * @returns {object} { pageX, pageY }
   * @memberof FmcCroppersUi
   */
  calcPageXYForRoundedImagePercentXY({ pageXRaw, pageYRaw }) {
    const {
      imagePercentX,
      imagePercentY
    } = this.calcImagePercentXYFromPageXY({
      pageX: pageXRaw,
      pageY: pageYRaw,
      round: true
    });

    const {
      imageX,
      imageY
    } = this.calcImageXYFromImagePercentXY({ imagePercentX, imagePercentY });

    const {
      pageX,
      pageY
    } = this.calcPageXYFromImageXY({ imageX, imageY });

    return {
      pageX,
      pageY
    };
  }

  /**
   * @function calcPageXYFromImageXY
   * @param {object} args - Arguments
   * @param {number} args.imageX - Image X
   * @param {number} args.imageY - Image Y
   * @returns {object} { pageX, pageY }
   * @memberof FmcCroppersUi
   * @see {@link cypress/e2e/electron-spec.cy.js}
   */
  calcPageXYFromImageXY({ imageX, imageY }) {
    const {
      left: canvasOffsetLeft,
      top: canvasOffsetTop
    } = this.calcCanvasOffsets();

    const pageX = imageX + canvasOffsetLeft;
    const pageY = imageY + canvasOffsetTop;

    return {
      pageX,
      pageY
    };
  }

  /**
   * @function calcImagePercentXYFromImageXorY
   * @summary Get the X or Y coordinate as a percentage of the image dimension, so that it can be stored and recalled later.
   * @param {object} args - Arguments
   * @param {number} args.imageXorY - Image X or Image Y
   * @param {number} args.dimensionLength - Dimension length (width or height)
   * @param {boolean} args.round - Round the result to the nearest whole number
   * @returns {number} percentage
   * @memberof FmcCroppersUi
   * @see {@link cypress/e2e/electron-spec.cy.js}
   */
  calcImagePercentXYFromImageXorY({ imageXorY, dimensionLength, round = false }) {
    let percentage = imageXorY / dimensionLength;

    if (percentage < 0) {
      percentage = 0;
    }

    if (percentage > 100) {
      percentage = 100;
    }

    // In testing, rounding changes the results by 1-4 units.
    // This causes little visual difference but makes the numbers much easier to store.

    return round ? Math.round(percentage * 100) : percentage * 100;
  }

  /**
   * @function calcImagePercentXYFromPageXY
   * @param {object} args - Arguments
   * @param {number} args.pageX - Page X
   * @param {number} args.pageY - Page Y
   * @param {boolean} args.round - Round the result to the nearest whole number
   * @returns {object} { imagePercentX, imagePercentY }
   * @memberof FmcCroppersUi
   * @see {@link cypress/e2e/electron-spec.cy.js}
   */
  calcImagePercentXYFromPageXY({ pageX, pageY, round = false }) {
    const {
      masterCropper
    } = this;

    const {
      width: imageWidth,
      height: imageHeight
    } = masterCropper.cropperInstance.getImageData();

    const { top, left } = this.calcCanvasOffsets();

    const imageX = pageX - left;
    const imageY = pageY - top;

    const imagePercentX = this.calcImagePercentXYFromImageXorY({
      imageXorY: imageX,
      dimensionLength: imageWidth,
      round
    });

    const imagePercentY = this.calcImagePercentXYFromImageXorY({
      imageXorY: imageY,
      dimensionLength: imageHeight,
      round
    });

    return {
      imagePercentX,
      imagePercentY
    };
  }

  /**
   * @function changeSourceImage
   * @param {string} newImageSrc - New image src
   * @memberof FmcCroppersUi
   */
  changeSourceImage(newImageSrc) {
    // TODO if exists
    this.destroy();

    this.imageSrc = newImageSrc;
    this.init();
  }

  /**
   * @function destroy
   * @summary Destroy instances of cropperjs
   * @memberof FmcCroppersUi
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
   * @function displayImagePercentXY
   * @summary Move cropbox to focalpoint
   * @param {object} args - Arguments
   * @param {number} args.imagePercentY - Image percentage top
   * @param {number} args.imagePercentX - Image percentage X
   * @memberof FmcCroppersUi
   */
  displayImagePercentXY({ imagePercentY, imagePercentX }) {
    // simulate click event
    this.masterCropperCropBoxWasDragged = false;

    const {
      imageX,
      imageY
    } = this.calcImageXYFromImagePercentXY({ imagePercentY, imagePercentX });

    const {
      pageX,
      pageY
    } = this.calcPageXYFromImageXY({ imageX, imageY });

    this.moveCropperCropBoxToPageXY({ pageX, pageY });
  }

  /**
   * @function getCropperOptions
   * @param {string} exportWidth - Export width
   * @param {string} exportHeight - Export height
   * @param {string} role - master | slave
   * @param {string} action - resizeAndCrop (with preview) | resize
   * @returns {object} options
   * @memberof FmcCroppersUi
   */
  getCropperOptions(exportWidth, exportHeight, role, action) {
    const {
      croppersOptions,
      focalpointXInputId,
      focalpointYInputId
    } = this;

    const options = { ...croppersOptions };

    if (role === 'master') {
      Object.assign(options, {
        aspectRatio: 1,
        autoCropArea: 0.2, // size of circular cropbox (20%)
        cropBoxMovable: true,
        guides: false,
        movable: true,
        // crop - fires during move, then after cropend
        // cropstart - occurs on mouse down, so before a click AND before a move
        cropmove: () => {
          this.masterCropperCropBoxWasDragged = true; // differentiate between a click and a move
        },
        cropend: (e) => { // dragEnd callback, see https://github.com/fengyuanchen/cropperjs/issues/669; fires after move
          const { updateDelay } = this;

          const {
            pageX: pageXRaw,
            pageY: pageYRaw
          } = e.detail.originalEvent;

          const {
            pageX: pageXRounded,
            pageY: pageYRounded
          } = this.calcPageXYForRoundedImagePercentXY({ pageXRaw, pageYRaw });

          this.moveCropperCropBoxToPageXY({
            pageX: pageXRaw,
            pageY: pageYRaw
          });

          FmcUi.emitElementEvent(window, 'message', {
            msg: 'Rounding percentages for storage...'
          });

          setTimeout(() => {
            this.moveCropperCropBoxToPageXY({
              pageX: pageXRounded,
              pageY: pageYRounded
            });

            const {
              imagePercentX,
              imagePercentY
            } = this.calcImagePercentXYFromPageXY({
              pageX: pageXRounded,
              pageY: pageYRounded,
              round: true
            });

            document.getElementById(focalpointXInputId).value = imagePercentX;
            document.getElementById(focalpointYInputId).value = imagePercentY;

            FmcUi.emitEvent(focalpointYInputId, 'change');

            FmcUi.emitElementEvent(window, 'message', {
              msg: ''
            });
          }, updateDelay);
        }
      });
    }

    if (action === 'resizeAndCrop') {
      if ((exportWidth !== null) && (exportHeight !== null)) {
        Object.assign(options, { aspectRatio: exportWidth / exportHeight });
      }
    }

    return options;
  }

  /**
   * @function setFocalpointSaveState
   * @summary Determine whether the current focalpoint settings have been saved to the current image
   * @param {object} args - Arguments
   * @param {string} args.imagePercentXUi - Image Percent X as shown in the UI controls
   * @param {string} args.imagePercentYUi - Image Percent Y as shown in the UI controls
   * @returns {string} state
   * @memberof FmcCroppersUi
   */
  setFocalpointSaveState({ imagePercentXUi, imagePercentYUi }) {
    const {
      croppersId,
      masterCropper
    } = this;

    const { src } = masterCropper.cropperInstance.element;

    let state;
    let msg;

    const {
      imagePercentX: savedImagePercentX, // string
      imagePercentY: savedImagePercentY // string
    } = this.getImagePercentXYFromImage(src);

    if ((imagePercentXUi === '50') && (imagePercentYUi === '50')) {
      state = 'default';
      msg = 'Default focalpoint';
    } else if ((imagePercentXUi === savedImagePercentX) && (imagePercentYUi === savedImagePercentY)) {
      state = 'saved';
      msg = 'Focalpoint saved';
    } else {
      state = 'dirty';
      msg = 'Warning: Focalpoint changed but not saved';
    }

    document.getElementById(croppersId).dataset.cropperFocalpointSaveStatus = state;

    FmcUi.emitElementEvent(window, 'message', {
      msg
    });

    return state;
  }

  /**
   * @function getImagePercentXYFromImage
   * @summary Get the values stored in the filename
   * @param {string} src - Image src
   * @returns {object} imagePercentXY
   * @memberof FmcCroppersUi
   */
  getImagePercentXYFromImage(src) {
    let imagePercentXY = {};

    const regexp = /\[([0-9]+)%,([0-9]+)%\]/g; // filename__[20%,30%].ext
    const matches = src.matchAll(regexp);
    const matchesArr = [ ...matches ];

    if (matchesArr.length) {
      imagePercentXY = {
        imagePercentX: matchesArr[0][1],
        imagePercentY: matchesArr[0][2]
      };
    }

    return imagePercentXY;
  }

  /**
   * @function getResizedImageCenterXY
   * @summary Get the center point of the resized image
   * @param {string} fileName - Image file name and path
   * @param {number} resizeW - Resize width
   * @param {number} resizeH - Resize height
   * @returns {object} { centerX, centerY }
   * @memberof FmcCroppersUi
   */
  getResizedImageCenterXY(fileName, resizeW, resizeH) {
    const {
      masterCropper
    } = this;

    const {
      imagePercentX = 50,
      imagePercentY = 50
    } = this.getImagePercentXYFromImage(fileName);

    // calculate length of the missing side
    let _resizeW = resizeW;
    let _resizeH = resizeH;

    if ((resizeW === null) || (resizeH === null)) {
      const {
        naturalWidth,
        naturalHeight
      } = masterCropper.cropperInstance.getImageData();

      if ((resizeW === null) && (resizeH !== null)) {
        _resizeW = naturalWidth * (resizeH / naturalHeight);
      } else if ((resizeH === null) && (resizeW !== null)) {
        _resizeH = naturalHeight * (resizeW / naturalWidth);
      }
    }

    return {
      centerX: (_resizeW * (imagePercentX / 100)),
      centerY: (_resizeH * (imagePercentY / 100))
    };
  }

  /**
   * @function init
   * @summary Initialise cropper instances (master and slaves)
   * @memberof FmcCroppersUi
   */
  init() {
    const {
      cropperImageClass,
      croppersId,
      imageSrc
    } = this;

    if (typeof imageSrc === 'undefined') {
      return;
    }

    // these are the images used by the 4 croppers
    // they start off with no src
    // when an image appears, what you see is the cropper - not the img
    const cropperImages = document.querySelectorAll(`#${croppersId} .${cropperImageClass}`);

    // prevent compounding arrays
    this.croppers = [];
    this.resizers = [];

    cropperImages.forEach((cropperImage, cropperIndex) => {
      const {
        cropperAction: action,
        cropperRole: role
      } = cropperImage.dataset;

      if ((role === 'master') || ((role === 'slave') && (action === 'resizeAndCrop'))) {
        const cropper = this.initCropper(cropperImage, cropperIndex);

        this.croppers.push(cropper);
      } else if ((role === 'slave') && (action === 'resize')) {
        const resizer = this.initResizer(cropperImage);

        this.resizers.push(resizer);
      }
    });

    if (!this.croppers.length) {
      FmcUi.emitElementEvent(window, 'message', {
        msg: 'Croppers could not be initialised'
      });

      return;
    }

    this.masterCropper = this.croppers.filter(cropper => cropper.role === 'master')[0];
    this.slaveCroppers = this.croppers.filter(cropper => cropper.role === 'slave');

    // if (typeof document.createElement('cropper').style.transition === 'undefined') {
    //   rotateEl.prop('disabled', true);
    // }
  }

  /**
   * @function initCropper
   * @summary Initialise cropper instance
   * @param {HTMLElement} cropperImage - Cropper image
   * @returns { object } cropper - Object containing cropperInstance
   * @memberof FmcCroppersUi
   */
  initCropper(cropperImage) {
    const {
      Cropper,
      imageSrc
    } = this;

    const {
      cropperAction: action,
      cropperExportWidth, // undefined for role="master"
      cropperExportHeight, // undefined for role="master"
      cropperExportMarker = 'false',
      cropperExportSuffix: exportSuffix,
      cropperLabel: label,
      cropperRole: role
    } = cropperImage.dataset;

    // resizing based on a known width but unknown (null) height (and vice versa)
    const exportWidth = ((cropperExportWidth === 'null') || (typeof cropperExportWidth === 'undefined')) ? null : Number(cropperExportWidth);
    const exportHeight = ((cropperExportHeight === 'null') || (typeof cropperExportHeight === 'undefined')) ? null : Number(cropperExportHeight);

    this.injectHeading(cropperImage, label, exportWidth, exportHeight);

    cropperImage.setAttribute('src', imageSrc);

    const cropperOptions = this.getCropperOptions(exportWidth, exportHeight, role, action);
    const cropperInstance = new Cropper(cropperImage, cropperOptions);

    const cropper = {
      cropperInstance,
      action,
      exportWidth,
      exportHeight,
      exportSuffix,
      label,
      marker: cropperExportMarker === 'true',
      role
    };

    return cropper;
  }

  /**
   * @function initResizer
   * @summary Initialise resizer instance
   * @param {HTMLElement} resizerImage - Resizer image
   * @returns { object } resizer
   * @memberof FmcCroppersUi
   */
  initResizer(resizerImage) {
    const {
      imageSrc
    } = this;

    const {
      cropperAction: action,
      cropperExportWidth,
      cropperExportHeight,
      cropperExportMarker = 'false',
      cropperExportSuffix: exportSuffix,
      cropperLabel: label,
      cropperRole: role
    } = resizerImage.dataset;

    // resizing based on a known width but unknown (null) height (and vice versa)
    const exportWidth = (cropperExportWidth === 'null') ? null : Number(cropperExportWidth);
    const exportHeight = (cropperExportHeight === 'null') ? null : Number(cropperExportHeight);

    this.injectHeading(resizerImage, label, exportWidth, exportHeight);

    resizerImage.setAttribute('src', imageSrc);

    const resizer = {
      action,
      exportWidth,
      exportHeight,
      exportSuffix,
      label,
      marker: cropperExportMarker === 'true',
      role
    };

    return resizer;
  }

  /**
   * @function initImagePercentXY
   * @summary Initialise focal point
   * @memberof FmcCroppersUi
   */
  initImagePercentXY() {
    this.reinstateImagePercentXYFromImage();
  }

  /**
   * @function injectHeading
   * @param {HTMLElement} cropperImage - Cropper image
   * @param {string} label - Cropper label
   * @param {number|null} exportWidth - Export width
   * @param {number|null} exportHeight - Export height
   * @returns {HTMLElement} heading element
   * @memberof FmcCroppersUi
   */
  injectHeading(cropperImage, label, exportWidth, exportHeight) {
    const parent = cropperImage.parentElement;
    let heading = parent.querySelector('h2');

    const _exportWidth = (exportWidth !== null) ? exportWidth : '?';
    const _exportHeight = (exportHeight !== null) ? exportHeight : '?';
    const whStr = ((_exportWidth === '?') && (_exportHeight === '?')) ? '' : ` (${_exportWidth} x ${_exportHeight})`;

    const labelText = `${label}${whStr}`;

    if (!heading) {
      const headingText = document.createTextNode(labelText);

      heading = document.createElement('h2');
      heading.appendChild(headingText);
      parent.insertBefore(heading, cropperImage);
    }

    return heading;
  }

  /**
   * @function moveCropperCropBoxToPageXY
   * @param {object} args - Method arguments
   * @param {number} args.pageX - Page X
   * @param {number} args.pageY - Page Y
   * @memberof FmcCroppersUi
   * @todo This sometimes needs to be clicked twice, needs to support a shaky hand (#5)
   * @todo Also support end of dragging
   */
  moveCropperCropBoxToPageXY({ pageX, pageY }) {
    const {
      croppers,
      masterCropper
    } = this;

    const cropperWasDragged = this.masterCropperCropBoxWasDragged;

    this.masterCropperCropBoxWasDragged = false;

    const slaveCroppers = croppers.filter(cropper => cropper.role === 'slave');

    const {
      top: masterCropperCanvasOffsetTop
      // left: masterCropperCanvasOffsetLeft
    } = this.calcCanvasOffsets();

    const {
      top: masterCropperCanvasTop,
      left: masterCropperCanvasLeft
    } = masterCropper.cropperInstance.getCanvasData();

    if (!cropperWasDragged) {
      // two step process for visual awareness of rounding process

      // move the cropper to the click location
      this.moveMasterCropperCropBoxToPageXY({
        pageX,
        pageY
      });

      slaveCroppers.forEach(cropper => {
        const {
          cropperInstance
        } = cropper;

        this.moveSlaveCropperCropBoxToPageXY({
          cropper: cropperInstance,
          pageX,
          pageY,
          masterCropperCanvasOffsetTop,
          masterCropperCanvasTop,
          masterCropperCanvasLeft
        });
      });
    }
  }

  /**
   * @function moveMasterCropperCropBoxToPageXY
   * @summary When the canvas is clicked, move the crop box on the master cropper so it centers on the pointer location
   * @param {object} args - Arguments
   * @param {number} args.pageX - Page X (corresponding to a rounded percent)
   * @param {number} args.pageY - Page Y (corresponding to a rounded percent)
   * @memberof FmcCroppersUi
   */
  moveMasterCropperCropBoxToPageXY({ pageX, pageY }) {
    const {
      masterCropper
    } = this;

    const {
      cropBoxX,
      cropBoxY
    } = this.calcCropBoxXYFromPageXY({ pageX, pageY });

    masterCropper.cropperInstance.setCropBoxData({
      top: cropBoxY,
      left: cropBoxX
    });
  }

  /**
   * @function moveSlaveCropperCropBoxToPageXY
   * @summary Move the crop box on the dependent cropper
   * @param {object} args - Arguments
   * @param {object} args.cropper - Slave cropper
   * @param {number} args.masterCropperCanvasLeft - gap between edge of viewport and start of master image
   * @param {number} args.masterCropperCanvasOffsetTop - Height of preceding UI
   * @param {number} args.pageX - Page X
   * @param {number} args.pageY - Page Y
   * @memberof FmcCroppersUi
   */
  moveSlaveCropperCropBoxToPageXY({
    cropper,
    masterCropperCanvasLeft,
    masterCropperCanvasOffsetTop,
    pageX,
    pageY
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
    const croppercropBoxY = cropperCanvasTop + cropBoxCenterY - this.scaleSlaveVal(cropper, masterCropperCanvasOffsetTop);
    const croppercropBoxX = cropBoxCenterX - this.scaleSlaveVal(cropper, masterCropperCanvasLeft);

    cropper.setCropBoxData({
      top: croppercropBoxY,
      left: croppercropBoxX
    });
  }

  /**
   * @function resizeAndCropImage
   * @param {string} targetFolder - Target folder
   * @returns {string} baseExportPath
   * @memberof FmcCroppersUi
   */
  async resizeAndCropImage(targetFolder) {
    const {
      masterCropper,
      resizers,
      slaveCroppers
    } = this;

    const cropsAndSizes = [];
    const fileName = masterCropper.cropperInstance.element.src;

    slaveCroppers.forEach(cropper => {
      const {
        exportWidth: resizeW,
        exportHeight: resizeH,
        exportSuffix: fileNameSuffix,
        marker
      } = cropper;

      const {
        x: cropX,
        y: cropY,
        width: cropW,
        height: cropH
      } = cropper.cropperInstance.getData();

      let centerX;
      let centerY;

      if (marker) {
        ({
          centerX,
          centerY
        } = this.getResizedImageCenterXY(fileName, resizeW, resizeH));
      }

      cropsAndSizes.push({
        centerX,
        centerY,
        cropW,
        cropH,
        cropX,
        cropY,
        fileNameSuffix,
        marker,
        markerHex: '#00c800', // matches --color-checked-on
        markerStrokeW: 4,
        markerWH: 160,
        resizeH,
        resizeW
      });
    });

    resizers.forEach(resizer => {
      const {
        exportWidth: resizeW,
        exportHeight: resizeH,
        exportSuffix: fileNameSuffix,
        marker
      } = resizer;

      let centerX;
      let centerY;

      if (marker) {
        ({
          centerX,
          centerY
        } = this.getResizedImageCenterXY(fileName, resizeW, resizeH));
      }

      cropsAndSizes.push({
        centerX,
        centerY,
        fileNameSuffix,
        marker,
        markerHex: '#00c800', // matches --color-checked-on
        markerStrokeW: 4,
        markerWH: 160,
        resizeW,
        resizeH
      });
    });

    const {
      baseExportPath,
      counts
    } = await window.electronAPI.resizeAndCropImage({
      fileName,
      quality: 75,
      targetFolder,
      cropsAndSizes
    });

    FmcUi.emitElementEvent(window, 'message', {
      msg: `Deleted ${counts.deletions} matching files. Generated ${counts.crops} crops and ${counts.resizes} sizes`
    });

    return baseExportPath;
  }

  /**
   * @function deleteImagePercentXYFromImage
   * @returns {Promise<string>} msg
   * @memberof FmcCroppersUi
   */
  async deleteImagePercentXYFromImage() {
    const {
      croppers,
      croppersId,
      masterCropper
    } = this;

    const fileName = masterCropper.cropperInstance.element.src;

    const newFileName = await window.electronAPI.deleteImagePercentXYFromImage({
      fileName
    });

    return new Promise(resolve => {
      if (fileName === newFileName) {
        resolve('Image filename does not contain a focalpoint');
      } else {
        // timeout prevents broken image
        setTimeout(() => {
          croppers.forEach(cropper => {
            cropper.cropperInstance.replace(newFileName, true); // hasSameSize = true
          });

          FmcUi.emitEvent(croppersId, 'imageRenamed', {
            newFileName
          });

          resolve('Removed focalpoint from image filename');
        }, 500);
      }
    });
  }

  /**
   * @function isDefaultFocalpoint
   * @param {object} args - Arguments
   * @param {string|number} args.imagePercentX - Image percent X
   * @param {string|number} args.imagePercentY - Image percent Y
   * @returns {boolean} isDefaultFocalpoint
   * @memberof FmcCroppersUi
   */
  isDefaultFocalpoint({ imagePercentX, imagePercentY }) {
    const nX = Number(imagePercentX);
    const nY = Number(imagePercentY);

    return ((nX === 50) && (nY === 50));
  }

  /**
   * @function reinstateImagePercentXYFromImage
   * @memberof FmcCroppersUi
   */
  reinstateImagePercentXYFromImage() {
    const {
      focalpointXInputId,
      focalpointYInputId,
      masterCropper
    } = this;

    const { src } = masterCropper.cropperInstance.element;

    const {
      imagePercentX = 50,
      imagePercentY = 50
    } = this.getImagePercentXYFromImage(src);

    const msg = this.isDefaultFocalpoint({ imagePercentX, imagePercentY }) ? 'Reset focalpoint' : 'Loaded focalpoint from image';

    document.getElementById(focalpointXInputId).value = imagePercentX;
    document.getElementById(focalpointYInputId).value = imagePercentY;

    FmcUi.emitEvent(focalpointYInputId, 'change');

    FmcUi.emitElementEvent(window, 'message', {
      msg
    });
  }

  /**
   * @function scaleSlaveVal
   * @summary Slave croppers are smaller than the Master cropper. Scale down values derived from calculations on the Master cropper.
   * @param {object} slaveCropper - Slave cropper instance
   * @param {number} val - Value to scale
   * @returns {number} Scaled value
   * @memberof FmcCroppersUi
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
   * @function validateCroppersImage
   * @summary Check that the croppers' image src is valid
   * @returns {boolean} valid
   * @memberof FmcCroppersUi
   */
  validateCroppersImage() {
    const { croppersId } = this;
    const cropperImages = document.querySelectorAll(`#${croppersId} .cropper-image`);
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
   * @function writeImagePercentXYToImage
   * @summary Save the values to the image filename
   * @param {object} args - Arguments
   * @param {string} args.imagePercentX - Image percentage X
   * @param {string} args.imagePercentY - Image percentage Y
   * @returns {Promise<string>} msg
   * @memberof FmcCroppersUi
   */
  async writeImagePercentXYToImage({ imagePercentX, imagePercentY }) {
    const {
      croppersId,
      croppers,
      masterCropper
    } = this;

    const fileName = masterCropper.cropperInstance.element.src;
    const oldFileName = fileName.replace('file://', '').replaceAll('%20', ' ');

    let errorMsg = '';
    let newFileName;

    // an 'out of range' user input such as 'xx' will be input as ''
    // although the change event may not actually fire in this case
    if ((imagePercentX === '') || (imagePercentY === '')) {
      errorMsg = 'Input out of range - focalpoint not saved to filename';
    } else {
      // cannot place await inside promise
      newFileName = await window.electronAPI.saveImagePercentXYToImage({
        fileName,
        imagePercentY,
        imagePercentX
      });
    }

    return new Promise(resolve => {
      if (errorMsg !== '') {
        resolve(errorMsg);
      } else if (newFileName !== oldFileName) {
        // timeout prevents broken image
        setTimeout(() => {
          croppers.forEach(cropper => {
            cropper.cropperInstance.replace(newFileName, true); // hasSameSize = true
          });

          FmcUi.emitEvent(croppersId, 'imageRenamed', {
            newFileName
          });

          resolve('Saved focalpoint to filename');
        }, 500);
      } else {
        resolve('Focalpoint already saved to filename');
      }
    });
  }

  /* Static methods */
}
