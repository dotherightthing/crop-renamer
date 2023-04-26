// Electron's render process (web page)

const selectFilesButton = document.getElementById('select-folder');
const imagesContainer = document.getElementById('images');

selectFilesButton.addEventListener('click', async () => {
  // The ipcRenderer module is an EventEmitter, for inter-process communication (IPC) with the main process
  const images = await window.electronAPI.selectFolder();

  let html = '';

  images.forEach(image => {
    html += (`<li><img src="${image}" alt="${image}" width="50"></li>`);
  });

  imagesContainer.innerHTML = html;
});
