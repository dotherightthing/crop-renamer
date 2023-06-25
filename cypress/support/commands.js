// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/**
 * Round a number to the specified number of decimal places
 * @param {number} value - Value
 * @param {number} numberOfDp - Number of decimal places
 * @returns {number} rounded number
 */
Cypress.Commands.add('roundToDp', (value, numberOfDp) => {
  return Number(value.toFixed(numberOfDp));
});

/**
 * Get style.transform.translateX
 * @param {object} cyElement - Cypress DOM element
 * @returns {number} translateX
 * @see {@link https://stackoverflow.com/a/55517628}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrix}
 */
Cypress.Commands.add('getTransformTranslateX', (cyElement) => {
  const $el = cyElement[0];
  const win = $el.ownerDocument.defaultView;
  const style = win.getComputedStyle($el);
  const matrix = new DOMMatrix(style.transform);
  const translateX = matrix.m41;

  return translateX;
});
