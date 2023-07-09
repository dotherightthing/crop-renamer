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

  openInFinder: (data) => ipcRenderer.invoke('CrFile:openInFinder', data),
  selectFolderIn: (data) => ipcRenderer.invoke('CrFile:selectFolderIn', data),
  selectFolderOut: (data) => ipcRenderer.invoke('CrFile:selectFolderOut', data),
  deleteImagePercentXYFromImage: (data) => ipcRenderer.invoke('CrFile:deleteImagePercentXYFromImage', data),
  saveImagePercentXYToImage: (data) => ipcRenderer.invoke('CrFile:saveImagePercentXYToImage', data),
  cropImage: (data) => ipcRenderer.invoke('CrFile:cropImage', data),
  storeGet: (data) => ipcRenderer.invoke('CrFile:storeGet', data),
  storeSet: (data) => ipcRenderer.invoke('CrFile:storeSet', data)
});
