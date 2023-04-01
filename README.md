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
* <https://fengyuanchen.github.io/jquery-cropper/> - `cropBoxResizable` option
* <https://pqina.nl/blog/rename-a-file-with-javascript/>
