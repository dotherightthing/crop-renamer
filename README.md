# crop-renamer

Helper tool to rename images for batch cropping by ImageMagick.

## Usage

1. Select a folder on your harddrive
2. List grid of thumbnails
3. Click a thumbnail to open cropping interface
4. Enlargement of image appears with a 3x3 grid overlaid
5. Select the appropriate grid region (by clicking on the focal point)
6. Deselecting image adds a focal square overlay to the corresponding thumbnail
6. Repeat with next/any image
7. Click 'Save Crops' to rename the cropped originals to include the directional crop region, e.g. `my-photo-[TL]`
8. Run separate ImageMagick import script to crop images based on directional crop information in file names
