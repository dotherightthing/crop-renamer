/**
 * @file CrDebugUi.js
 */

import dtrtStringUtils from 'dtrt-string-utils';
import dtrtValidate from 'dtrt-type-validate';
import { CrUtilsUi } from './CrUtilsUi.mjs';

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
      input.value = '-';
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
   * @function getDebugFields
   * @summary Get the IDs of debug fields used by a cropper
   * @returns {object} outputIds
   * @memberof CrDebugUi
   */
  getDebugFields() {
    const debugFieldIds = {};
    const debugFieldNames = {
      image: [
        'focalpoint_x',
        'focalpoint_y'
      ]
    };

    const debugFieldKeys = Object.keys(debugFieldNames);

    let debugBarFieldsHtmls = [];

    debugFieldKeys.forEach(debugFieldKey => {
      const index = 0;
      const title = dtrtStringUtils.stringToCapitalised(debugFieldKey);

      const { html, outputIds } = CrDebugUi.getDebugField({
        id: `cropper${index}-${debugFieldKey}`,
        title,
        outputs: debugFieldNames[debugFieldKey]
      });

      debugBarFieldsHtmls.push(html);
      debugFieldIds[debugFieldKey] = outputIds;
    });

    return {
      debugBarFieldsHtmls,
      debugFieldIds
    };
  }

  /**
   * @function injectDebugField
   * @summary Inject debug field into the debug bar
   * @param {string} html - HTML
   * @memberof CrDebugUi
   * @see {@link https://stackoverflow.com/a/37448747}
   */
  injectDebugField(html) {
    const { debugBarId } = this;

    document.getElementById(debugBarId).insertAdjacentHTML('beforeend', html);
  }

  /**
   * @function injectDebugFields
   * @summary Initialise debug bar
   * @memberof CrDebugUi
   */
  injectDebugFields() {
    const {
      debugBarId,
      debugFieldClass
    } = this;

    const {
      debugBarFieldsHtmls,
      debugFieldIds: cropperDebugFieldIds
    } = this.getDebugFields(0);

    const debugParamEls = document.querySelectorAll(`#${debugBarId} .${debugFieldClass}`);

    if (!debugParamEls.length) {
      debugBarFieldsHtmls.forEach(html => {
        this.injectDebugField(html);
      });
    }

    CrUtilsUi.emitEvent(debugBarId, 'injectedDebugFields', {
      cropperDebugFieldIds
    });
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
   * @function getDebugField
   * @summary Create UI to display debugging parameters
   * @param {object} args - Arguments
   * @param {string} args.id - ID
   * @param {string} args.title - Title
   * @param {object} args.outputs - Outputs
   * @returns {object} - { html, outputIds }
   * @memberof CrDebugUi
   * @static
   * @todo generate this on load
   */
  static getDebugField({ id, title, outputs = {} }) {
    let outputsHtml = '';
    let outputIds = {};
    const outputsKeys = Object.keys(outputs);

    outputsKeys.forEach(outputKey => {
      const output = outputs[outputKey];
      const outputId = `${id}-output-${output}`;
      const outputParts = output.split('_');
      let outputLabel = '';

      outputParts.forEach(part => {
        outputLabel += dtrtStringUtils.stringToCapitalised(part) + ' ';
      });

      outputLabel = outputLabel.trim();

      outputIds[output] = outputId;

      outputsHtml += `<div class="control">
    <label for="${outputId}">${outputLabel}</label>
    <input type="text" value="-" id="${outputId}" readonly>
  </div> 
  `;
    });

    const html = `<div class="debug-param">
    <fieldset>
      <legend>
        <div class="legend">${title}</div>
      </legend>
      <div class="controls">
        ${outputsHtml}
      </div>
    </fieldset>
  </div>
  `;

    return {
      html,
      outputIds
    };
  }

  /**
   * @function getDebugParameterValue
   * @summary Get the value of a debugging field
   * @param {object} cropper - Cropper from croppers array
   * @param {string} parameter - Output ID parameter
   * @returns {number} value - Displayed value
   * @memberof CrDebugUi
   * @static
   */
  static getDebugParameterValue(cropper, parameter) {
    const { outputIds } = cropper;
    const [ group, param ] = parameter.split('.');
    const field = document.getElementById(outputIds[group][param]);

    if (field !== null) {
      return field.value;
    }

    return -1;
  }

  /**
   * @function setDebugParameter
   * @summary Output the parameter value
   * @param {object} cropper - Cropper from croppers array
   * @param {string} parameter - Output ID parameter
   * @param {number} value - Value to display
   * @memberof CrDebugUi
   * @static
   * @todo Replace with event emitter
   */
  static setDebugParameter(cropper, parameter, value) {
    const { outputIds } = cropper;
    const outputValue = value;
    const [ group, param ] = parameter.split('.');

    document.getElementById(outputIds[group][param]).value = outputValue;
  }
}
