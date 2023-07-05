/**
 * @file CrDebugUi.js
 */

import dtrtValidate from 'dtrt-type-validate';

export class CrDebugUi { // eslint-disable-line no-unused-vars
  /**
   * @class CrDebugUi
   * @summary Manages debugging UI
   * @param {object} config - Instance config
   * @public
   */
  constructor(config = {}) {
    // select the relevant arguments from the config object passed in
    const {
      debugBarId,
      debugFieldClass,
      debugMsgId
    } = config;

    Object.assign(this, {
      debugBarId,
      debugFieldClass,
      debugMsgId
    });
  }

  /* Getters and Setters */

  /**
   * debugBarId
   * @type {string}
   * @memberof CrDebugUi
   */
  get debugBarId() {
    return this._debugBarId;
  }

  set debugBarId(debugBarId) {
    this._debugBarId = dtrtValidate.validate(debugBarId, 'string', 'CrDebugUi.debugBarId');
  }

  /**
   * debugFieldClass
   * @type {string}
   * @memberof CrDebugUi
   */
  get debugFieldClass() {
    return this._debugFieldClass;
  }

  set debugFieldClass(debugFieldClass) {
    this._debugFieldClass = dtrtValidate.validate(debugFieldClass, 'string', 'CrDebugUi.debugFieldClass');
  }

  /**
   * debugMsgId
   * @type {string}
   * @memberof CrDebugUi
   */
  get debugMsgId() {
    return this._debugMsgId;
  }

  set debugMsgId(debugMsgId) {
    this._debugMsgId = dtrtValidate.validate(debugMsgId, 'string', 'CrDebugUi.debugMsgId');
  }

  /* Instance methods */

  /**
   * @function clearDebugFields
   * @summary Delete injected debug fields
   * @memberof CrDebugUi
   */
  clearDebugFields() {
    const {
      debugBarId,
      debugFieldClass
    } = this;

    // remove debug messages whilst retaining any buttons
    const inputs = document.querySelectorAll(`#${debugBarId} .${debugFieldClass} input`);

    inputs.forEach(input => {
      input.value = '';
    });
  }

  /**
   * @function clearDebugMsg
   * @summary Clear debug message in UI
   * @memberof CrDebugUi
   */
  clearDebugMsg() {
    this.setDebugMsg('');
  }

  /**
   * @function setDebugMsg
   * @summary Display debug message in UI
   * @param {string} msg - Message
   * @memberof CrDebugUi
   */
  setDebugMsg(msg) {
    const { debugMsgId } = this;

    document.getElementById(debugMsgId).innerHTML = msg;
  }

  /* Static methods */

  /**
   * @function getDebugParameterValue
   * @summary Get the value of a debugging field
   * @param {string} parameter - Output ID parameter
   * @returns {number} value - Displayed value
   * @memberof CrDebugUi
   * @static
   */
  static getDebugParameterValue(parameter) {
    const field = document.getElementById(parameter);

    if (field !== null) {
      return field.value;
    }

    return -1;
  }

  /**
   * @function setDebugParameter
   * @summary Output the parameter value
   * @param {string} parameter - Output ID parameter
   * @param {number} value - Value to display
   * @memberof CrDebugUi
   * @static
   * @todo Replace with event emitter
   */
  static setDebugParameter(parameter, value) {
    document.getElementById(parameter).value = value;
  }
}
