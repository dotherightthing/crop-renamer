// Electron's render process (web page)

const imagesContainer = document.getElementById('images');
const imageCount = document.getElementById('image-count');

async function uiSelectFolder() {
  const images = await window.electronAPI.selectFolder();
  let html = '';

  // if folder select was cancelled
  if (typeof images === 'undefined') {
    return;
  }

  imageCount.textContent = images.length;

  images.forEach(image => {
    const { src, dateTimeOriginal } = image;

    html += `<li>
<img src="${src}">
<p class="image-meta image-datetime">${dateTimeOriginal}</p>
</li>`;

    imagesContainer.innerHTML = html;
  });
}

// const selectFolderButton = document.getElementById('select-images-folder');
// selectFolderButton.addEventListener('click', uiSelectFolder);
