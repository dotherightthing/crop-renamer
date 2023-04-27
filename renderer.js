// Electron's render process (web page)

const selectFilesButton = document.getElementById('select-folder');
const imagesContainer = document.getElementById('images');


selectFilesButton.addEventListener('click', async () => {
  const images = await window.electronAPI.selectFolder();
  let html = '';

  images.forEach(image => {
    const { src, dateTimeOriginal } = image;

    html += (`<li>
  <img src="${src}">
  <p class="datetime">${dateTimeOriginal}</p>
</li>`);
  });

  imagesContainer.innerHTML = html;
});
