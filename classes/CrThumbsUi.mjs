/**
 * @file CrThumbsUi.js
 */

import dtrtValidate from 'dtrt-type-validate';

export class CrThumbsUi { // eslint-disable-line no-unused-vars
  /**
   * @class CrThumbsUi
   * @summary Manages thumbs component
   * @param {object} config - Instance config
   * @public
   */
  constructor(config = {}) {
    // select the relevant arguments from the config object passed in
    const {
      selectedClass,
      thumbButtonClass,
      thumbClass,
      thumbImgClass,
      thumbImgWrapperClass,
      thumbMetaClass,
      thumbPathId,
      thumbsCountId,
      thumbsId
    } = config;

    Object.assign(this, {
      selectedClass,
      thumbButtonClass,
      thumbClass,
      thumbImgClass,
      thumbImgWrapperClass,
      thumbMetaClass,
      thumbPathId,
      thumbsCountId,
      thumbsId
    });
  }

  /* Getters and Setters */

  /**
   * selectedClass
   * @type {string}
   * @memberof CrCroppersUi
   */
  get selectedClass() {
    return this._selectedClass;
  }

  set selectedClass(selectedClass) {
    this._selectedClass = dtrtValidate.validate(selectedClass, 'string', 'CrThumbsUi.selectedClass');
  }

  /**
   * thumbButtonClass
   * @type {string}
   * @memberof CrCroppersUi
   */
  get thumbButtonClass() {
    return this._thumbButtonClass;
  }

  set thumbButtonClass(thumbButtonClass) {
    this._thumbButtonClass = dtrtValidate.validate(thumbButtonClass, 'string', 'CrThumbsUi.thumbButtonClass');
  }

  /**
   * thumbClass
   * @type {string}
   * @memberof CrCroppersUi
   */
  get thumbClass() {
    return this._thumbClass;
  }

  set thumbClass(thumbClass) {
    this._thumbClass = dtrtValidate.validate(thumbClass, 'string', 'CrThumbsUi.thumbClass');
  }

  /**
   * thumbImgClass
   * @type {string}
   * @memberof CrCroppersUi
   */
  get thumbImgClass() {
    return this._thumbImgClass;
  }

  set thumbImgClass(thumbImgClass) {
    this._thumbImgClass = dtrtValidate.validate(thumbImgClass, 'string', 'CrThumbsUi.thumbImgClass');
  }

  /**
   * thumbImgWrapperClass
   * @type {string}
   * @memberof CrCroppersUi
   */
  get thumbImgWrapperClass() {
    return this._thumbImgWrapperClass;
  }

  set thumbImgWrapperClass(thumbImgWrapperClass) {
    this._thumbImgWrapperClass = dtrtValidate.validate(thumbImgWrapperClass, 'string', 'CrThumbsUi.thumbImgWrapperClass');
  }

  /**
   * thumbMetaClass
   * @type {string}
   * @memberof CrCroppersUi
   */
  get thumbMetaClass() {
    return this._thumbMetaClass;
  }

  set thumbMetaClass(thumbMetaClass) {
    this._thumbMetaClass = dtrtValidate.validate(thumbMetaClass, 'string', 'CrThumbsUi.thumbMetaClass');
  }

  /**
   * thumbPathId
   * @type {string}
   * @memberof CrCroppersUi
   */
  get thumbPathId() {
    return this._thumbPathId;
  }

  set thumbPathId(thumbPathId) {
    this._thumbPathId = dtrtValidate.validate(thumbPathId, 'string', 'CrThumbsUi.thumbPathId');
  }

  /**
   * thumbsCountId
   * @type {string}
   * @memberof CrCroppersUi
   */
  get thumbsCountId() {
    return this._thumbsCountId;
  }

  set thumbsCountId(thumbsCountId) {
    this._thumbsCountId = dtrtValidate.validate(thumbsCountId, 'string', 'CrThumbsUi.thumbsCountId');
  }

  /* Instance methods */

  /**
   * @function applySelectedClass
   * @summary Apply the 'selected' class to the selected thumb
   * @param {HTMLElement} target - Selected thumb
   * @memberof CrThumbsUi
   */
  applySelectedClass(target) {
    const { selectedClass } = this;

    this.removeSelectedClass();

    target.classList.add(selectedClass);
  }

  /**
   * @function changeSelectedImageSrc
   * @param {string} src - New src
   */
  changeSelectedImageSrc(src) {
    const { selectedClass } = this;

    // timeout prevents broken thumbnail
    setTimeout(() => {
      document.querySelector(`.${selectedClass} img`).src = src;
    }, 500);

    this.displayPath(src);
  }

  /**
   * @function setCssImagePercentXY
   * @param {object} args - Arguments
   * @param {HTMLElement} args.thumbElement - DOM Element
   * @param {HTMLElement} args.thumbImgElement - DOM Element
   * @param {number} args.thumbIndex - Thumb index
   * @param {number} args.imagePercentX - Image percent X
   * @param {number} args.imagePercentY - Image percent Y
   */
  setCssImagePercentXY({
    thumbElement, thumbImgElement, thumbIndex, imagePercentX, imagePercentY
  }) {
    const x = (typeof imagePercentX !== 'undefined') ? imagePercentX : 50;
    const y = (typeof imagePercentY !== 'undefined') ? imagePercentY : 50;

    // suppressing default output shows the default overlay colour
    if (x !== 50) {
      thumbElement.style.setProperty('--image-percent-x', `${x}%`);
    }

    if (y !== 50) {
      thumbElement.style.setProperty('--image-percent-y', `${y}%`);
    }

    thumbImgElement.setAttribute('alt', `Thumbnail ${thumbIndex} with focalpoint at ${y}% top and ${x}% left. `);
  }

  /**
   * @function containsThumbs
   * @summary Whether the thumb area of the UI contains any thumbs
   * @returns {number} thumbLength (truthy|falsy)
   * @memberof CrThumbsUi
   */
  containsThumbs() {
    const { thumbImgClass } = this;

    const thumbLength = document.querySelectorAll(`.${thumbImgClass}`).length;

    return thumbLength;
  }

  /**
   * @function displayCount
   * @param {number} count - Count
   * @memberof CrThumbsUi
   */
  displayCount(count) {
    const { thumbsCountId } = this;

    document.getElementById(thumbsCountId).textContent = count;
  }

  /**
   * @function displayPath
   * @param {string} path - Path
   * @memberof CrThumbsUi
   */
  displayPath(path) {
    const { thumbPathId } = this;

    const html = `<a href="${path}">${path}</a>`;

    document.getElementById(thumbPathId).innerHTML = html;
  }

  /**
   * @function generateThumbsHtml
   * @summary Inject the thumb images and their scaffolding, then select the first thumb
   * @param {Array} imagesData - Images data
   * @memberof CrThumbsUi
   */
  generateThumbsHtml(imagesData) {
    const {
      thumbButtonClass,
      thumbImgClass,
      thumbImgWrapperClass,
      thumbMetaClass,
      thumbsId
    } = this;

    let html = '';

    imagesData.forEach((loadedThumb, i) => {
      const { src, dateTimeOriginal } = loadedThumb;

      //  aria-selected="true"
      html += `<button role="tab" class="tabbed-carousel__tab thumb" aria-controls="croppers" id="tab-${i + 1}" tabindex="0" class="${thumbButtonClass}">
      <div class="thumb-liner">
        <div class="${thumbImgWrapperClass}">
          <img src="${src}" class="${thumbImgClass}">
        </div>
        <p class="meta ${thumbMetaClass}">${dateTimeOriginal}</p>
      </div>
    </button>`;

      if (i === imagesData.length - 1) {
        document.getElementById(thumbsId).innerHTML = html;
        this.selectFirstThumb();
      }
    });

    this.displayCount(imagesData.length);
  }

  /**
   * @function getClickedButton
   * @param {object} event - Event
   * @returns {HTMLElement} button
   * @memberof CrThumbsUi
   */
  getClickedButton(event) {
    const e = event || window.event;
    let target = e.target || e.srcElement;

    if (!document.querySelectorAll('#thumbs img').length) {
      return null;
    }

    while (target.tagName.toLowerCase() !== 'button') {
      target = target.parentNode;
    }

    return target;
  }

  /**
   * @function getSelectedIndex
   * @summary Get the index of the selected node in a nodelist
   * @param {NodeList} nodeList = NodeList
   * @returns {number} selectedIndex | -1
   * @memberof CrThumbsUi
   */
  getSelectedIndex(nodeList) {
    const { selectedClass } = this;

    let selectedIndex = -1;

    nodeList.forEach((node, index) => {
      if (node.classList.contains(selectedClass)) {
        selectedIndex = index;
      }
    });

    return selectedIndex;
  }

  /**
   * @function removeSelectedClass
   * @summary Remove the 'selected' class from the selected thumb
   * @memberof CrThumbsUi
   */
  removeSelectedClass() {
    const {
      selectedClass,
      thumbButtonClass
    } = this;

    const thumbItems = document.querySelectorAll(`.${thumbButtonClass}`);

    thumbItems.forEach(thumbItem => {
      thumbItem.classList.remove(selectedClass);
    });
  }

  /**
   * @function scrollToThumb
   * @summary Click then scroll the appropriate thumb into view
   * @param {string} position - Position of thumb (previous|next|selected)
   * @memberof CrThumbsUi
   * @todo Would programmatically shifting the focus make this redundant? (#7)
   */
  scrollToThumb(position) {
    const { thumbButtonClass } = this;
    const thumbsButtons = document.querySelectorAll(`.${thumbButtonClass}`);

    if (!thumbsButtons.length) {
      return;
    }

    const thumbsButtonSelectedIndex = this.getSelectedIndex(thumbsButtons);
    let thumbsButtonNextIndex = -1;

    if (position === 'previous') {
      thumbsButtonNextIndex = CrThumbsUi.getPreviousIndex(thumbsButtons, thumbsButtonSelectedIndex);
    } else if (position === 'next') {
      thumbsButtonNextIndex = CrThumbsUi.getNextIndex(thumbsButtons, thumbsButtonSelectedIndex);
    } else if (position === 'selected') {
      thumbsButtonNextIndex = this.getSelectedIndex(thumbsButtons);
    }

    if (thumbsButtonNextIndex > -1) {
      thumbsButtons[thumbsButtonNextIndex].focus();

      if (position !== 'selected') {
        thumbsButtons[thumbsButtonNextIndex].click();
      }
    }
  }

  /**
   * @function selectFirstThumb
   * @summary Select the first thumb
   * @memberof CrThumbsUi
   */
  selectFirstThumb() {
    const { thumbButtonClass } = this;

    document.querySelectorAll(`.${thumbButtonClass}`)[0].click();
  }

  /* Static methods */

  /**
   * @function getNextIndex
   * @summary Get the index of the next node in a nodelist
   * @param {NodeList} nodeList - List of thumb items
   * @param {number} selectedIndex - Index of selected thumb item
   * @returns {number} nextIndex | -1
   * @memberof CrThumbsUi
   * @static
   */
  static getNextIndex(nodeList, selectedIndex) {
    let nextIndex = -1;

    if ((selectedIndex + 1) < nodeList.length) {
      nextIndex = selectedIndex + 1;
    } else {
      nextIndex = 0;
    }

    return nextIndex;
  }

  /**
   * @function getPreviousIndex
   * @summary Get the index of the previous node in a nodelist
   * @param {NodeList} nodeList - List of thumb items
   * @param {number} selectedIndex - Index of selected thumb item
   * @returns {number} previousIndex | -1
   * @memberof CrThumbsUi
   * @static
   */
  static getPreviousIndex(nodeList, selectedIndex) {
    let previousIndex = -1;

    if (selectedIndex > 0) {
      previousIndex = selectedIndex - 1;
    } else {
      previousIndex = nodeList.length - 1; // loop around to last item
    }

    return previousIndex;
  }
}
