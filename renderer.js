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

  images.forEach((image, i) => {
    const { src, dateTimeOriginal } = image;

    html += `<li class="image-list-item">
  <button type="button" class="btn-img">
    <img src="${src}">
    <p class="image-meta image-datetime">${dateTimeOriginal}</p>  
  </button>
</li>`;

    imagesContainer.innerHTML = html;

    if (i === images.length - 1) {
      imagesContainer.querySelectorAll('.btn-img')[0].click();
    }
  });
}

// const selectFolderButton = document.getElementById('select-images-folder');
// selectFolderButton.addEventListener('click', uiSelectFolder);
