// preload script
// runs before web page is loaded
// has access to both DOM APIs and the Node.js environment
// exposes privileged APIs to the renderer via the contextBridge API
// sets up inter-process communication (IPC) interfaces to pass arbitrary messages between Electron's main and renderer processes

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping'),
  // we can also expose variables, not just functions
})
