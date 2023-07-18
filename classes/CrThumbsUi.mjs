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
      thumbsCountId,
      thumbsId
    });
  }

  /* Getters and Setters */

  /**
   * selectedClass
   * @type {string}
   * @memberof CrThumbsUi
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
   * @memberof CrThumbsUi
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
   * @memberof CrThumbsUi
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
   * @memberof CrThumbsUi
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
   * @memberof CrThumbsUi
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
   * @memberof CrThumbsUi
   */
  get thumbMetaClass() {
    return this._thumbMetaClass;
  }

  set thumbMetaClass(thumbMetaClass) {
    this._thumbMetaClass = dtrtValidate.validate(thumbMetaClass, 'string', 'CrThumbsUi.thumbMetaClass');
  }

  /**
   * thumbsCountId
   * @type {string}
   * @memberof CrThumbsUi
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
   * @param {object} args - Arguments
   * @param {number} args.thumbTotal - Thumb total
   * @param {number} args.thumbIndex - Thumb index
   * @memberof CrThumbsUi
   */
  displayCount({ thumbTotal, thumbIndex }) {
    const { thumbsCountId } = this;
    const el = document.getElementById(thumbsCountId);

    let str = '';

    // store for later access
    if (typeof thumbTotal !== 'undefined') {
      el.dataset.thumbTotal = thumbTotal;
    }

    if (typeof el.dataset.thumbTotal !== 'undefined') {
      const _thumbTotal = el.dataset.thumbTotal;

      if (typeof thumbIndex !== 'undefined') {
        str = `#${thumbIndex} / ${_thumbTotal}`;
      }
    }

    el.innerHTML = str;
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
      thumbClass,
      thumbImgClass,
      thumbImgWrapperClass,
      thumbMetaClass,
      thumbsId
    } = this;

    let html = '';

    imagesData.forEach((loadedThumb, i) => {
      const { src, dateTimeOriginal } = loadedThumb;

      html += `<li class="${thumbClass}">
    <button type="button" class="${thumbButtonClass}">
      <div class="${thumbImgWrapperClass}">
        <img src="${src}" class="${thumbImgClass}">
      </div>
      <p class="${thumbMetaClass}">${dateTimeOriginal}</p>  
    </button>
  </li>`;

      if (i === imagesData.length - 1) {
        document.getElementById(thumbsId).innerHTML = html;
        this.selectFirstThumb();
      }
    });

    this.displayCount({
      thumbTotal: imagesData.length
    });
  }

  /**
   * @function getClickedButton
   * @param {object} event - Event
   * @returns {HTMLElement} button
   * @memberof CrThumbsUi
   */
  getClickedButton(event) {
    const {
      thumbButtonClass,
      thumbsId,
      thumbImgClass
    } = this;

    const e = event || window.event;
    let clickedButton = e.target || e.srcElement;

    if (!document.querySelectorAll(`#${thumbsId} .${thumbImgClass}`).length) {
      return null;
    }

    while (clickedButton.tagName.toLowerCase() !== 'button') {
      clickedButton = clickedButton.parentNode;
    }

    const buttons = document.querySelectorAll(`.${thumbButtonClass}`);
    const clickedButtonIndex = Array.from(buttons).indexOf(clickedButton) + 1;

    return {
      clickedButton,
      clickedButtonIndex
    };
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
      if (position !== 'selected') {
        thumbsButtons[thumbsButtonNextIndex].click();
      }

      thumbsButtons[thumbsButtonNextIndex].scrollIntoView({
        behavior: 'auto'
      });
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
