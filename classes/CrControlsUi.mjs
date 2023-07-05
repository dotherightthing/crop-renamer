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
      containerId,
      fieldClass,
      statusId
    } = config;

    Object.assign(this, {
      containerId,
      fieldClass,
      statusId
    });
  }

  /* Getters and Setters */

  /**
   * containerId
   * @type {string}
   * @memberof CrControlsUi
   */
  get containerId() {
    return this._containerId;
  }

  set containerId(containerId) {
    this._containerId = dtrtValidate.validate(containerId, 'string', 'CrControlsUi.containerId');
  }

  /**
   * fieldClass
   * @type {string}
   * @memberof CrControlsUi
   */
  get fieldClass() {
    return this._fieldClass;
  }

  set fieldClass(fieldClass) {
    this._fieldClass = dtrtValidate.validate(fieldClass, 'string', 'CrControlsUi.fieldClass');
  }

  /**
   * statusId
   * @type {string}
   * @memberof CrControlsUi
   */
  get statusId() {
    return this._statusId;
  }

  set statusId(statusId) {
    this._statusId = dtrtValidate.validate(statusId, 'string', 'CrControlsUi.statusId');
  }

  /* Instance methods */

  /**
   * @function clearParamValues
   * @summary Delete injected control fields
   * @memberof CrControlsUi
   */
  clearParamValues() {
    const {
      containerId,
      fieldClass
    } = this;

    const inputs = document.querySelectorAll(`#${containerId} .${fieldClass} input`);

    inputs.forEach(input => {
      input.value = '';
    });
  }

  /**
   * @function setStatus
   * @summary Display control message in UI
   * @param {string} msg - Message
   * @memberof CrControlsUi
   */
  setStatus(msg) {
    const { statusId } = this;

    document.getElementById(statusId).innerHTML = msg;
  }

  /* Static methods */

  /**
   * @function getParamValue
   * @summary Get the value of a controlging field
   * @param {string} parameter - Output ID parameter
   * @returns {number} value - Displayed value
   * @memberof CrControlsUi
   * @static
   */
  static getParamValue(parameter) {
    const field = document.getElementById(parameter);

    return field.value;
  }

  /**
   * @function setParamValue
   * @summary Output the parameter value
   * @param {string} parameter - Output ID parameter
   * @param {number} value - Value to display
   * @memberof CrControlsUi
   * @static
   * @todo Replace with event emitter
   */
  static setParamValue(parameter, value) {
    document.getElementById(parameter).value = value;
  }
}
