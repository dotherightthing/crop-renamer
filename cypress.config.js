const { defineConfig } = require('cypress');

// match electron window size on Macbook Pro
const viewportWidth = 1680;
const viewportHeight = 997;

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) { // eslint-disable-line no-unused-vars
      // implement node event listeners here

      // https://docs.cypress.io/api/plugins/browser-launch-api#Set-screen-size-when-running-headless
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args.push(`--window-size=${viewportWidth},${viewportHeight}`);
          launchOptions.args.push('--force-device-scale-factor=1');
        }

        if (browser.name === 'electron' && browser.isHeadless) {
          launchOptions.preferences.width = viewportWidth;
          launchOptions.preferences.height = viewportHeight;
        }

        if (browser.name === 'firefox' && browser.isHeadless) {
          launchOptions.args.push(`--width=${viewportWidth}`);
          launchOptions.args.push(`--height=${viewportHeight}`);
        }

        return launchOptions;
      });
    }
  },
  video: true,
  viewportWidth,
  viewportHeight,
  watchForFileChanges: true
});
