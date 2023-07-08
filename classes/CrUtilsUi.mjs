/**
 * @file CrUtilsUi.js
 */

// import dtrtStringUtils from 'dtrt-string-utils';
// import dtrtValidate from 'dtrt-type-validate';

export class CrUtilsUi { // eslint-disable-line no-unused-vars
  /**
   * @class CrUtilsUi
   * @summary Component helpers
   * @public
   */

  /* Getters and Setters */

  /* Instance methods */

  /* Static methods */

  /**
   * @function emitEvent
   * @summary Emit a custom event
   * @param {string} elementId - ID of the element that will dispatch the event
   * @param {string} eventName - Event names are case-sensitive
   * @param {object} eventDetail - name-value pair
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent}
   * @see {@link https://gomakethings.com/callbacks-vs.-custom-events-in-vanilla-js/}
   * @memberof CrUtilsUi
   * @static
   */
  static emitEvent(elementId, eventName, eventDetail = {}) {
    const event = new CustomEvent(eventName, {
      bubbles: true, // stop with event.stopPropagation()
      cancelable: true, // cancel with event.preventDefault()
      // composed // web components only
      detail: eventDetail
    });

    document.getElementById(elementId).dispatchEvent(event);
  }

  /**
   * @function getNextSiblings
   * @param {HTMLElement} el - Element to find 'next' (= following) siblings of
   * @returns {Array} HTMLElements
   * @see {@link https://stackoverflow.com/questions/842336/is-there-a-way-to-select-sibling-nodes}
   * @see {@link https://web.archive.org/web/20210529160753/https://j11y.io/jquery/#v=1.11.2&fn=jQuery.sibling}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for}
   */
  static getNextSiblings(el) {
    var n = el;
    const ret = [];

    for (; n; n = n.nextElementSibling) {
      if (n !== el) {
        ret.push(n);
      }
    }

    return ret;
  }

  /**
   * @function getOffset
   * @summary Get the space between an element and the viewport (this matches the inline CSS translate implemented by cropperjs)
   * @param {HTMLElement} el - Element
   * @returns {object} offset - { top, left }
   * @see {@link https://usefulangle.com/post/179/jquery-offset-vanilla-javascript}
   * @memberof CrUtilsUi
   * @static
   */
  static getOffset(el) {
    const rect = el.getBoundingClientRect();
    const offset = {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX
    };

    return offset;
  }

  /**
   * @function isEmptyObject
   * @summary Determine whether an object is empty ({})
   * @param {object} obj - Object
   * @returns {boolean} is empty
   * @see {@link https://stackoverflow.com/a/49729848}
   * @memberof CrUtilsUi
   * @static
   */
  static isEmptyObject(obj) {
    return (
      Object.getPrototypeOf(obj) === Object.prototype
      && Object.getOwnPropertyNames(obj).length === 0
      && Object.getOwnPropertySymbols(obj).length === 0
    );
  }
}
