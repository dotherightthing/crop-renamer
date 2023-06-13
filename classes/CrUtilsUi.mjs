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
   * @function Emit a custom event
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
}
