// Electron's render process (web page)

const selectFolderButton = document.getElementById('select-images-folder');
const imagesContainer = document.getElementById('images');

async function uiSelectFolder() {
  const images = await window.electronAPI.selectFolder();
  let html = '';

  images.forEach(image => {
    const { src, dateTimeOriginal } = image;

    html += `<li>
<img src="${src}">
<p class="datetime">${dateTimeOriginal}</p>
</li>`;

    imagesContainer.innerHTML = html;
  });
}

selectFolderButton.addEventListener('click', uiSelectFolder);
