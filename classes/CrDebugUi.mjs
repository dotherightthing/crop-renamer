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
      debugFieldClass
    } = config;

    Object.assign(this, {
      debugBarId,
      debugFieldClass
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
   * @function debugClickLocation
   * @summary Output the pointer location
   * @param {event} e - Event
   * @param {object} masterCropper - Master cropper
   * @memberof CrDebugUi
   */
  debugClickLocation(e, masterCropper) {
    const { outputIds } = masterCropper;

    document.getElementById(outputIds.mouse.page_x).value = Math.round(e.clientX);
    document.getElementById(outputIds.mouse.page_y).value = Math.round(e.clientY);
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
      mouse: [
        'page_x', 'page_y'
      ], // same as 'client_x', 'client_y'
      // cropper: [ 'x', 'y' ],
      // container: [ 'width', 'height' ],
      // canvas: [ 'left', 'top' ],
      image: [
        'width', 'height'
      ],
      // drg: [ 'top' ],
      cropbox: [
        'canvas_top',
        'canvas_top_offset',
        'expected_center_x', 'actual_center_x',
        'expected_center_y', 'actual_center_y',
        'percentage_top',
        'percentage_left',
        'set_top', 'restored_top',
        'set_left', 'restored_left'
      ]
    };

    const debugFieldKeys = Object.keys(debugFieldNames);

    let debugBarFieldsHtmls = [];

    debugFieldKeys.forEach(debugFieldKey => {
      const index = 0;
      const title = dtrtStringUtils.stringToCapitalised(debugFieldKey);

      const { html, outputIds } = CrDebugUi.getDebugField({
        id: `cropper${index}-${debugFieldKey}`,
        title: `${title} ${index}`,
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

  /* Static methods */

  /**
   * @function debugParameter
   * @summary Output the pointer location
   * @param {object} cropper - Cropper from croppers array
   * @param {string} parameter - Output ID parameter
   * @param {number} value - Value to display
   * @param {boolean} round - Whether to round the value
   * @memberof CrDebugUi
   * @static
   */
  static debugParameter(cropper, parameter, value, round = false) {
    const { outputIds } = cropper;
    let outputValue = round ? Math.round(value) : value;
    const [ group, param ] = parameter.split('.');

    document.getElementById(outputIds[group][param]).value = outputValue;
  }

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
}
