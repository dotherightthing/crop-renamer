/**
 * @file CrControlsUi.js
 */

import dtrtValidate from 'dtrt-type-validate';

export class CrControlsUi { // eslint-disable-line no-unused-vars
  /**
   * @class CrControlsUi
   * @summary Manages controls UI
   * @param {object} config - Instance config
   * @public
   */
  constructor(config = {}) {
    // select the relevant arguments from the config object passed in
    const {
      controlBarId,
      controlFieldClass,
      controlMsgId
    } = config;

    Object.assign(this, {
      controlBarId,
      controlFieldClass,
      controlMsgId
    });
  }

  /* Getters and Setters */

  /**
   * controlBarId
   * @type {string}
   * @memberof CrControlsUi
   */
  get controlBarId() {
    return this._controlBarId;
  }

  set controlBarId(controlBarId) {
    this._controlBarId = dtrtValidate.validate(controlBarId, 'string', 'CrControlsUi.controlBarId');
  }

  /**
   * controlFieldClass
   * @type {string}
   * @memberof CrControlsUi
   */
  get controlFieldClass() {
    return this._controlFieldClass;
  }

  set controlFieldClass(controlFieldClass) {
    this._controlFieldClass = dtrtValidate.validate(controlFieldClass, 'string', 'CrControlsUi.controlFieldClass');
  }

  /**
   * controlMsgId
   * @type {string}
   * @memberof CrControlsUi
   */
  get controlMsgId() {
    return this._controlMsgId;
  }

  set controlMsgId(controlMsgId) {
    this._controlMsgId = dtrtValidate.validate(controlMsgId, 'string', 'CrControlsUi.controlMsgId');
  }

  /* Instance methods */

  /**
   * @function clearControlFields
   * @summary Delete injected control fields
   * @memberof CrControlsUi
   */
  clearControlFields() {
    const {
      controlBarId,
      controlFieldClass
    } = this;

    const inputs = document.querySelectorAll(`#${controlBarId} .${controlFieldClass} input`);

    inputs.forEach(input => {
      input.value = '';
    });
  }

  /**
   * @function clearControlMsg
   * @summary Clear control message in UI
   * @memberof CrControlsUi
   */
  clearControlMsg() {
    this.setControlMsg('');
  }

  /**
   * @function setControlMsg
   * @summary Display control message in UI
   * @param {string} msg - Message
   * @memberof CrControlsUi
   */
  setControlMsg(msg) {
    const { controlMsgId } = this;

    document.getElementById(controlMsgId).innerHTML = msg;
  }

  /* Static methods */

  /**
   * @function getControlParameterValue
   * @summary Get the value of a controlging field
   * @param {string} parameter - Output ID parameter
   * @returns {number} value - Displayed value
   * @memberof CrControlsUi
   * @static
   */
  static getControlParameterValue(parameter) {
    const field = document.getElementById(parameter);

    if (field !== null) {
      return field.value;
    }

    return -1;
  }

  /**
   * @function setControlParameter
   * @summary Output the parameter value
   * @param {string} parameter - Output ID parameter
   * @param {number} value - Value to display
   * @memberof CrControlsUi
   * @static
   * @todo Replace with event emitter
   */
  static setControlParameter(parameter, value) {
    document.getElementById(parameter).value = value;
  }
}
