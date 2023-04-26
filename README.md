# crop-renamer

Helper tool to rename images for batch cropping by ImageMagick.

## Desired usage

1. Select a folder on your harddrive
2. List grid of thumbnails
3. Click a thumbnail to open cropping interface in browser
4. Enlargement of image appears with a 3x3 grid overlaid
5. Select the appropriate grid region (by clicking on the focal point)
6. A preview of the desired size updates to show the image with the crop area applied
7. Deselecting image adds a focal square overlay to the corresponding thumbnail
8. Repeat with next/any image
9. Click 'Save Crops' to rename the cropped originals to include the directional crop region, e.g. `my-photo-[TL]`
10. Run separate ImageMagick import script to crop images based on directional crop information in file names

## Existing tools

Excluding anything that requires a subscription fee or complex serverside setup.

* <https://markerjs.com/docs/cropro/getting-started> - doesn't appear to offer preset size crops (only ratios)
* <https://github.com/fengyuanchen/cropperjs> - `cropBoxResizable` option
   * <https://github.com/danfickle/bulk-image-cropper> - no overview of crop position for multiple images (one at a time)
   * <https://w3codegenerator.com/code-snippets/javascript/how-to-crop-multiple-images-with-cropper-js>
* <https://pqina.nl/blog/rename-a-file-with-javascript/>

## Considerations

### Crops

```js
imagesSizes: {
   type: Object,
   default: () => ({
      collapsed: {
         width: 865,
         height: 368
      },
      expanded: {
         width: 865,
      },
      panorama: {
         height: 368
      },
      thumbnail: {
         width: 320,
         height: 320
      },
   })
},
```

### Approaches

* Store XY crop offset rather than gravity, but would need multiple offsets for different crops
* Crop around a crop point - requires knowing the width of the image so can move the crop box as necessary to avoid cropping off-canvas
https://stackoverflow.com/questions/60995032/crop-and-resize-image-around-a-custom-focus-point (can also rotate which is the other feature I might need)

---

### Electron

Images need to be loaded into the cropping tool. As this is best done locally to remove dependency on web-based subscription services, the app needs to be able to interact with the local file system.

The combination of `input[type="file"]` and JavaScript's [FileReader object](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) only provides access to a single file.

The cropper needs access to a folder of files.

A web browser is sandboxed for security reasons. Electron can run a web browser whilst also providing access to the operating system.

* [What is the difference between IPC send / on and invoke / handle in electron?](https://stackoverflow.com/questions/59889729/what-is-the-difference-between-ipc-send-on-and-invoke-handle-in-electron) - invoke vs send/on
* [Inter-Process Communication](https://www.electronjs.org/docs/latest/tutorial/ipc) - send/on
