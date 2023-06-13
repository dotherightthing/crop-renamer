const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    }
  },
  video: false,
  viewportWidth: 1680, // electron window.innerWidth
  viewportHeight: 997, // electron window.innerHeight
  watchForFileChanges: true
});
