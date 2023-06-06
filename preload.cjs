// preload script
// runs before web page is loaded
// has access to both DOM APIs and the Node.js environment
// exposes privileged APIs to the renderer via the contextBridge API
// sets up inter-process communication (IPC) interfaces to pass arbitrary messages between Electron's main and renderer processes

const {
  contextBridge,
  ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // The ipcRenderer module is an EventEmitter, for inter-process communication (IPC) with the main process
  // ipcRenderer.send() sends to ipcMain.on()
  // ipcRenderer.invoke() invokes ipcMain.handle()
  //
  // function in renderer.js or frontend class calls window.electronAPI.methodName, with or without a data object
  // backend responds and returns data to calling function

  selectFolder: (data) => ipcRenderer.invoke('CrFile:selectFolder', data),
  deleteCropCoordinates: (data) => ipcRenderer.invoke('CrFile:deleteCropCoordinates', data),
  saveCropCoordinates: (data) => ipcRenderer.invoke('CrFile:saveCropCoordinates', data)
});
