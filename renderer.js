// Electron's render process (web page)

const selectFilesButton = document.getElementById('select-folder');
const folderPathElement = document.getElementById('folder-path');

selectFilesButton.addEventListener('click', async () => {
  // The ipcRenderer module is an EventEmitter, for inter-process communication (IPC) with the main process
  const folderPath = await window.electronAPI.selectFolder();
  folderPathElement.innerText = folderPath;
});
