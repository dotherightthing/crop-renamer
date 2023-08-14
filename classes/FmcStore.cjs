/**
 * @file FmcStore.js
 * @summary FmcStore user data in a JSON file
 * @see {@link https://cameronnokes.com/blog/how-to-store-user-data-in-electron/}
 * @see {@link https://gist.githubusercontent.com/ccnokes/95cb454860dbf8577e88d734c3f31e08/raw/7b98c7eaa9c74b40f1a62ceb70116c799b9dd555/store.js}
 */

const electron = require('electron');
const path = require('path');
const fs = require('fs');

class FmcStore {
  constructor(opts) {
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = (electron.app || electron.remote.app).getPath('userData'); // Users/NAME/Library/Application\ Support/focalpoint-multi-cropper

    // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
    this.path = path.join(userDataPath, `${opts.configName}.json`);

    this.data = FmcStore.parseDataFile(this.path, opts.defaults);
  }

  /* Getters and Setters */

  // This will just return the property on the `data` object
  get(key) {
    return this.data[key];
  }

  // ...and this will set it
  set(key, val) {
    this.data[key] = val;
    // Wait, I thought using the node.js' synchronous APIs was bad form?
    // We're not writing a server so there's not nearly the same IO demand on the process
    // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
    // we might lose that data.

    try {
      fs.writeFileSync(this.path, JSON.stringify(this.data));
    } catch (error) {
      throw new Error(`Cannot write to FmcStore: ${error}`);
    }
  }

  /* Static methods */

  /**
   * @function getActivePreset
   * @param {event|null} event - FmcStore:getActivePreset event captured by ipcMain.handle
   * @returns {object} preset
   * @memberof FmcStore
   * @static
   */
  static async getActivePreset(event) { // eslint-disable-line no-unused-vars
    // this returns { key: value, key2: value2 }
    let activePresetKeyValuePairs = await FmcStore.getKeys(null, {
      keys: [ 'activePreset' ]
    });

    // in this case there's only one key
    let {
      activePreset: presetName
    } = activePresetKeyValuePairs;

    if (typeof presetName === 'undefined') {
      presetName = 'default';
    }

    const { preset } = await FmcStore.getPreset(null, {
      presetName
    });

    return preset;
  }

  /**
   * @function getKeys
   * @param {event|null} event - FmcStore:getKeys event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {Array} data.keys - Keys
   * @param {string} data.presetName - Preset name (if key was saved with preset)
   * @returns {object} keyValuePairs
   * @memberof FmcStore
   * @static
   */
  static async getKeys(event, data) {
    const {
      keys,
      presetName
    } = data;

    const keyValuePairs = {};

    if (typeof presetName !== 'undefined') {
      const { preset } = await FmcStore.getPreset(null, {
        presetName
      });

      if (typeof preset !== 'undefined') {
        keys.forEach(key => {
          keyValuePairs[key] = (typeof preset[key] !== 'undefined') ? preset[key] : null; // value could also be nested object
        });
      }
    } else {
      for (let k = 0; k < keys.length; k += 1) {
        const key = keys[k];

        const value = await store.get(key, (error) => {
          if (error) {
            throw new Error(`Error ${key} does not exist: ${error}`);
          }
        });

        keyValuePairs[key] = value;
      }
    }

    return keyValuePairs;
  }

  /**
   * @function getPreset
   * @param {event|null} event - FmcStore:getPreset event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.presetName - Preset name (if key was saved with preset)
   * @returns {object} { preset, presetIndex, presets }
   * @memberof FmcStore
   * @static
   */
  static async getPreset(event, data) {
    const {
      presetName
    } = data;

    let msgObj;
    let preset = {};
    let presetIndex = -1;

    const presets = await store.get('presets');

    if ((typeof presets !== 'undefined') && presets.length) {
      preset = presets.filter(item => item.name === presetName);
      presetIndex = presets.findIndex(item => item.name === presetName);

      msgObj = {
        msg: 'Loaded preset',
        type: 'success'
      };
    } else {
      msgObj = {
        msg: 'Could not load preset',
        type: 'warning'
      };
    }

    return {
      msgObj,
      preset: preset[0],
      presetIndex,
      presets
    };
  }

  /**
   * @function getPresetNames
   * @returns {Array} presets in alphabetical order
   * @memberof FmcStore
   * @static
   * @see {@link https://stackoverflow.com/a/8900922}
   */
  static async getPresetNames() {
    const presets = await store.get('presets');
    let presetNames = [];

    if (typeof presets !== 'undefined') {
      presetNames = presets.map(item => item.name);
      presetNames = presetNames.sort();
    }

    return presetNames;
  }

  /**
   * @function getStoreFilePath
   * @param {event|null} event - FmcStore:getStoreFilePath event captured by ipcMain.handle
   * @returns {string} storeFilePath
   * @memberof FmcStore
   * @static
   */
  static async getStoreFilePath(event) { // eslint-disable-line no-unused-vars
    return store.path;
  }

  /**
   * @function parseDataFile
   * @param {string} filePath - File path
   * @param {object} defaults - Defaults
   * @returns {object} data|defaults
   * @memberof FmcStore
   * @static
   */
  static parseDataFile(filePath, defaults) {
    // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
    // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
    try {
      return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
      // if there was some kind of error, return the passed in defaults instead.
      return defaults;
    }
  }

  /**
   * @function setActivePresetName
   * @param {event|null} event - FmcStore:setActivePresetName event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.presetName - Preset name
   * @memberof FmcStore
   * @static
   */
  static async setActivePresetName(event, data) {
    const {
      presetName
    } = data;

    FmcStore.setKeys(null, {
      keyValuePairs: [
        {
          activePreset: presetName
        }
      ]
    });
  }

  /**
   * @function setKeys
   * @param {event|null} event - FmcStore:setKeys event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {Array} data.keyValuePairs - Objects (key - val pairs)
   * @param {string} data.presetName - Preset name (to save keys with preset)
   * @memberof FmcStore
   * @static
   */
  static async setKeys(event, data) {
    /*
    "propX": "foo",
    "presets": [
      {
        "name": "preset 1",
        "prop1": {
          "propA": "bar",
          "propB": "baz"
        },
        "prop1": "bar"
      }
    ]
    */

    const {
      keyValuePairs,
      presetName
    } = data;

    // allow non-preset settings such as UI auto-save toggle
    if (typeof presetName !== 'undefined') {
      let {
        preset = {},
        presetIndex = -1,
        presets = []
      } = await FmcStore.getPreset(null, {
        presetName
      });

      if (presetIndex === -1) {
        preset.name = presetName;

        presets.push(preset);
        presetIndex = presets.length - 1;
      }

      keyValuePairs.forEach(obj => {
        const [
          key,
          value // can be anything incl an object
        ] = Object.entries(obj)[0];

        preset[key] = value;
      });

      presets[presetIndex] = preset;

      store.set('presets', presets, (error) => {
        if (error) {
          throw error;
        }
      });
    } else {
      keyValuePairs.forEach(obj => {
        const [
          key,
          value
        ] = Object.entries(obj)[0];

        store.set(key, value, (error) => {
          if (error) {
            throw error;
          }
        });
      });
    }
  }

  /**
   * @function setPreset
   * @param {event} event - FmcStore:setPreset event captured by ipcMain.handle
   * @param {object} data - Data
   * @param {string} data.name - Preset name
   * @returns {object} msgObj
   * @memberof FmcStore
   * @static
   */
  static async setPreset(event, data) {
    const {
      name = 'default'
    } = data;

    const keyValuePairs = [];

    const entries = Object.entries(data);

    entries.forEach(entry => {
      const key = entry[0];
      const val = entry[1];

      keyValuePairs.push({
        [key]: val
      });
    });

    keyValuePairs.push({
      lastModified: new Date().toLocaleString() // "13/08/2023, 8:52:55 pm"
    });

    await FmcStore.setKeys(null, {
      keyValuePairs,
      presetName: name
    });

    return new Promise(resolve => {
      resolve({
        msg: 'Saved preset',
        type: 'success'
      });
    });
  }
}

// used internally to set and get data
const store = new FmcStore({
  configName: 'user-preferences',
  defaults: {}
});

// used externally to access static methods
module.exports = FmcStore;
