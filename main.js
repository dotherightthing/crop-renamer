// main script
// Electron's main process

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // use Electron's ipcMain and ipcRenderer modules for inter-process communication (IPC) between Electron's main and renderer processes
  ipcMain.handle('ping', () => 'pong')

  win.loadFile('index.html')
}

// Open a window if none are open (macOS)
app.whenReady().then(() => {
  createWindow()

  // app.on('activate', () => {
  //   if (BrowserWindow.getAllWindows().length === 0) createWindow()
  // })
})
