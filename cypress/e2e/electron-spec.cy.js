const images = [
  'landscape.jpeg',
  'portrait.jpeg',
  'portrait-with-rotation.jpeg',
  'panorama.jpeg',
  'square.jpg',
  'screenshot.PNG'
];

describe('template spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8000/');

    cy.get('#croppers').as('croppers');

    cy.get('.cropper-master .cropper-image').as('cropperMasterImg');
    cy.get('.cropper-banner-bg .cropper-image').as('cropperBannerImg');
    cy.get('.cropper-collapsed .cropper-image').as('cropperCollapsedImg');
    cy.get('.cropper-thumbnail .cropper-image').as('cropperThumbnailImg');

    cy.get('.cropper-master .cropper-canvas').as('cropperMasterCanvas'); // first
    cy.get('.cropper-banner-bg .cropper-canvas').as('cropperBannerCanvas');
    cy.get('.cropper-collapsed .cropper-canvas').as('cropperCollapsedCanvas');
    cy.get('.cropper-thumbnail .cropper-canvas').as('cropperThumbnailCanvas');

    cy.get('.cropper-master .cropper-crop-box').as('cropperMasterCropbox');
    cy.get('.cropper-master .cropper-center').as('cropperMasterCropboxCenter');
  });

  describe('Thumbs', () => {
    images.forEach((image, imageIndex) => {
      describe(image, () => {
        it('Image is loaded into all 4 croppers', () => {
          cy.get('#thumbs .thumb').eq(imageIndex).find('button').click();
          cy.get('#thumbs .thumb').eq(imageIndex).find('button').should('have.class', 'btn-selected');
          cy.get('@cropperMasterImg').should('have.attr', 'src', `./cypress/fixtures/${image}`);
          cy.get('@cropperBannerImg').should('have.attr', 'src', `./cypress/fixtures/${image}`);
          cy.get('@cropperCollapsedImg').should('have.attr', 'src', `./cypress/fixtures/${image}`);
          cy.get('@cropperThumbnailImg').should('have.attr', 'src', `./cypress/fixtures/${image}`);
        });
      });
    });
  });

  describe('Master cropper', () => {
    describe('Focal points (incl screenshots)', () => {
      images.forEach((image, imageIndex) => {
        describe(image, () => {
          // Clicking image at canvas XY 1 returns correct image X% Y%
          it('Cropbox centered on click point', () => {
            cy.get('#thumbs .thumb').eq(imageIndex).find('button').click();
            cy.get('#thumbs .thumb').eq(imageIndex).find('button').should('have.class', 'btn-selected');
            cy.get('@cropperMasterImg').should('have.attr', 'src', `./cypress/fixtures/${image}`);

            // avoid false negatives while image rendering into UI
            cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting

            cy.get('@cropperMasterImg').then($el => {
              const cropper = $el[0].cropper;
              const { width, naturalWidth } = cropper.getImageData();
              const scale = width / naturalWidth;

              cy.fixture(`${image}.json`).then(imageFocalpoints => {
                imageFocalpoints.forEach(imageFocalpoint => {
                  const {
                    id,
                    x: fixtureX,
                    y: fixtureY,
                    percentX: fixturePercentX,
                    percentY: fixturePercentY
                  } = imageFocalpoint;

                  const imageX = fixtureX * scale;
                  const imageY = fixtureY * scale;

                  cy.get('@cropperMasterCanvas').then($el2 => {
                    const canvasLeft = $el2[0].getBoundingClientRect().left;
                    const canvasTop = $el2[0].getBoundingClientRect().top;

                    const pageX = canvasLeft + imageX;
                    const pageY = canvasTop + imageY;

                    const html = $el2[0].ownerDocument.documentElement;

                    cy.wrap(html).click(pageX, pageY);

                    cy.get('@cropperMasterCanvas').screenshot(`focalpoint-${image}-${id}-x${fixturePercentX}-y${fixturePercentY}-a-master`, { overwrite: true });
                    // cy.get('@cropperBannerCanvas').screenshot(`focalpoint-${image}-${id}-x${fixturePercentX}-y${fixturePercentY}-b-banner`, { overwrite: true });
                    // cy.get('@cropperCollapsedCanvas').screenshot(`focalpoint-${image}-${id}-x${fixturePercentX}-y${fixturePercentY}-c-collapsed`, { overwrite: true });
                    // cy.get('@cropperThumbnailCanvas').screenshot(`focalpoint-${image}-${id}-x${fixturePercentX}-y${fixturePercentY}-d-thumbnail`, { overwrite: true });

                    cy.get('@cropperMasterCropboxCenter').then($el3 => {
                      const cropboxCenterX = $el3[0].getBoundingClientRect().left;
                      const cropboxCenterY = $el3[0].getBoundingClientRect().top;

                      // allow for 1px deviations due to getBoundingClientRect (int) vs pageX (canvasLeft: int, imageX: float)
                      expect(pageX).to.be.within(cropboxCenterX - 1, cropboxCenterX + 1);
                      expect(pageY).to.be.within(cropboxCenterY - 1, cropboxCenterY + 1);
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    describe('FmcCroppersUi', () => {
      images.forEach((image, imageIndex) => {
        describe(image, () => {
          /* Instance methods */

          it('calcCanvasOffsets', () => {
            cy.get('#thumbs .thumb').eq(imageIndex).find('button').click();
            cy.get('#thumbs .thumb').eq(imageIndex).find('button').should('have.class', 'btn-selected');
            cy.get('@cropperMasterImg').should('have.attr', 'src', `./cypress/fixtures/${image}`);

            // avoid false negatives while image rendering into UI
            cy.wait(500); // eslint-disable-line cypress/no-unnecessary-waiting

            cy.get('@croppers').then($c => {
              const { fmcCroppersUi } = $c[0];
              const { top, left } = fmcCroppersUi.calcCanvasOffsets();

              cy.get('@cropperMasterCanvas').then($el2 => {
                const canvasTop = $el2[0].getBoundingClientRect().top;

                cy.getTransformTranslateX($el2).then(val => {
                  if (image === 'screenshot.PNG') {
                    // rounding avoids fail: screenshot.PNG expected 348.4476600985222 to equal 348.447998046875
                    cy.roundToDp(left, 2).then(val2 => {
                      cy.roundToDp(val, 2).should('equal', val2);
                    });
                  } else {
                    expect(left).to.equal(val);
                  }
                });

                expect(top).to.equal(canvasTop);
              });
            });
          });

          it.skip('calcCropBoxXYFromPageXY', () => {});

          it('calcImageXYFromImagePercentXY', () => {
            cy.get('#thumbs .thumb').eq(imageIndex).find('button').click();
            cy.get('#thumbs .thumb').eq(imageIndex).find('button').should('have.class', 'btn-selected');
            cy.get('@cropperMasterImg').should('have.attr', 'src', `./cypress/fixtures/${image}`);

            // avoid false negatives while image rendering into UI
            cy.wait(500); // eslint-disable-line cypress/no-unnecessary-waiting

            cy.get('@cropperMasterImg').then($el => {
              const cropper = $el[0].cropper;
              const { width, naturalWidth } = cropper.getImageData();
              const scale = width / naturalWidth;

              cy.get('@croppers').then($el2 => {
                const { fmcCroppersUi } = $el2[0];

                cy.fixture(`${image}.json`).then(imageFocalpoints => {
                  imageFocalpoints.forEach(imageFocalpoint => {
                    const {
                      x: fixtureX,
                      y: fixtureY,
                      percentX: fixturePercentX,
                      percentY: fixturePercentY
                    } = imageFocalpoint;

                    const imagePercentX = fixturePercentX;
                    const imagePercentY = fixturePercentY;

                    const {
                      imageX,
                      imageY
                    } = fmcCroppersUi.calcImageXYFromImagePercentXY({ imagePercentX, imagePercentY });

                    cy.roundToDp(imageX, 2).then(val => {
                      cy.roundToDp(fixtureX * scale, 2).should('equal', val);
                    });

                    cy.roundToDp(imageY, 2).then(val => {
                      cy.roundToDp(fixtureY * scale, 2).should('equal', val);
                    });
                  });
                });
              });
            });
          });

          it.skip('calcImageXYFromPageXY', () => {});

          it('calcImagePercentXYFromImageXorY', () => {
            cy.get('#thumbs .thumb').eq(imageIndex).find('button').click();
            cy.get('#thumbs .thumb').eq(imageIndex).find('button').should('have.class', 'btn-selected');
            cy.get('@cropperMasterImg').should('have.attr', 'src', `./cypress/fixtures/${image}`);

            // avoid false negatives while image rendering into UI
            cy.wait(500); // eslint-disable-line cypress/no-unnecessary-waiting

            cy.get('@cropperMasterImg').then($el => {
              const { cropper } = $el[0];
              const { width, naturalWidth } = cropper.getImageData();
              const scale = width / naturalWidth;

              cy.get('@croppers').then($el2 => {
                const { fmcCroppersUi } = $el2[0];

                cy.fixture(`${image}.json`).then(imageFocalpoints => {
                  imageFocalpoints.forEach(imageFocalpoint => {
                    const {
                      w: fixtureW,
                      h: fixtureH,
                      x: fixtureX,
                      y: fixtureY,
                      percentX: fixturePercentX,
                      percentY: fixturePercentY
                    } = imageFocalpoint;

                    const imageW = fixtureW * scale;
                    const imageH = fixtureH * scale;
                    const imageX = fixtureX * scale;
                    const imageY = fixtureY * scale;

                    const imagePercentX = fmcCroppersUi.calcImagePercentXYFromImageXorY({
                      imageXorY: imageX,
                      dimensionLength: imageW,
                      round: true
                    });

                    const imagePercentY = fmcCroppersUi.calcImagePercentXYFromImageXorY({
                      imageXorY: imageY,
                      dimensionLength: imageH,
                      round: true
                    });

                    expect(imagePercentX).to.equal(fixturePercentX);
                    expect(imagePercentY).to.equal(fixturePercentY);
                  });
                });
              });
            });
          });

          it('calcImagePercentXYFromPageXY', () => {
            cy.get('#thumbs .thumb').eq(imageIndex).find('button').click();
            cy.get('#thumbs .thumb').eq(imageIndex).find('button').should('have.class', 'btn-selected');
            cy.get('@cropperMasterImg').should('have.attr', 'src', `./cypress/fixtures/${image}`);

            // avoid false negatives while image rendering into UI
            cy.wait(500); // eslint-disable-line cypress/no-unnecessary-waiting

            cy.get('@cropperMasterImg').then($el => {
              const { cropper } = $el[0];
              const { width, naturalWidth } = cropper.getImageData();
              const scale = width / naturalWidth;

              cy.get('@croppers').then($el2 => {
                const { fmcCroppersUi } = $el2[0];

                cy.get('@cropperMasterCanvas').then($el3 => {
                  const canvasLeft = $el3[0].getBoundingClientRect().left;
                  const canvasTop = $el3[0].getBoundingClientRect().top;

                  cy.fixture(`${image}.json`).then(imageFocalpoints => {
                    imageFocalpoints.forEach(imageFocalpoint => {
                      const {
                        x: fixtureX,
                        y: fixtureY,
                        percentX: fixturePercentX,
                        percentY: fixturePercentY
                      } = imageFocalpoint;

                      const imageX = fixtureX * scale;
                      const imageY = fixtureY * scale;
                      const pageX = canvasLeft + imageX;
                      const pageY = canvasTop + imageY;

                      const {
                        imagePercentX,
                        imagePercentY
                      } = fmcCroppersUi.calcImagePercentXYFromPageXY({ pageX, pageY, round: true });

                      expect(imagePercentX).to.equal(fixturePercentX);
                      expect(imagePercentY).to.equal(fixturePercentY);
                    });
                  });
                });
              });
            });
          });

          it.skip('calcPageXYForRoundedImagePercentXY', () => {});

          it('calcPageXYFromImageXY', () => {
            cy.get('#thumbs .thumb').eq(imageIndex).find('button').click();
            cy.get('#thumbs .thumb').eq(imageIndex).find('button').should('have.class', 'btn-selected');
            cy.get('@cropperMasterImg').should('have.attr', 'src', `./cypress/fixtures/${image}`);

            // avoid false negatives while image rendering into UI
            cy.wait(500); // eslint-disable-line cypress/no-unnecessary-waiting

            cy.get('@cropperMasterImg').then($el => {
              const cropper = $el[0].cropper;
              const { width, naturalWidth } = cropper.getImageData();
              const scale = width / naturalWidth;
              const imageX = 1609 * scale;
              const imageY = 1735 * scale;

              // and then check that programmatically retrieved coordinates are the same

              cy.get('@croppers').then($c => {
                const { fmcCroppersUi } = $c[0];
                const { pageX, pageY } = fmcCroppersUi.calcPageXYFromImageXY({ imageX, imageY });

                cy.get('@cropperMasterCanvas').then($el2 => {
                  const canvasTop = $el2[0].getBoundingClientRect().top;

                  cy.getTransformTranslateX($el2).then(val => {
                    if (image === 'screenshot.PNG') {
                      // rounding avoids fail: screenshot.PNG expected 770.5129310344828 to equal 770.5132689828356
                      cy.roundToDp(imageX + val, 2).then(comboVal => {
                        cy.roundToDp(pageX, 2).should('equal', comboVal);
                      });
                    } else {
                      expect(pageX).to.equal(imageX + val);
                    }
                  });

                  expect(pageY).to.equal(imageY + canvasTop);
                });
              });
            });
          });

          it.skip('changeSourceImage', () => {});
          it.skip('deleteImagePercentXYFromImage', () => {});
          it.skip('destroy', () => {});
          it.skip('displayImagePercentXY', () => {});
          it.skip('getCropperOptions', () => {});
          it.skip('getImagePercentXYFromImage', () => {});
          it.skip('init', () => {});
          it.skip('initCropper', () => {});
          it.skip('injectHeading', () => {});
          it.skip('moveCropperCropBoxToPageXY', () => {});
          it.skip('moveMasterCropperCropBoxToPageXY', () => {});
          it.skip('moveSlaveCropperCropBoxToPageXY', () => {});
          it.skip('reinstateImagePercentXYFromImage', () => {});
          it.skip('scaleSlaveVal', () => {});
          it.skip('validateCroppersImage', () => {});
          it.skip('writeImagePercentXYToImage', () => {});

          /* Static methods */
        });
      });
    });

    describe('FmcThumbsUi', () => {
      /* Instance methods */
      it.skip('applySelectedClass', () => {});
      it.skip('changeSelectedImageSrc', () => {});
      it.skip('containsThumbs', () => {});
      it.skip('displayCount', () => {});
      it.skip('generateThumbsHtml', () => {});
      it.skip('getClickedButton', () => {});
      it.skip('getSelectedIndex', () => {});
      it.skip('removeSelectedClass', () => {});
      it.skip('scrollToThumb', () => {});
      it.skip('selectFirstThumb', () => {});

      /* Static methods */
      it.skip('getNextIndex', () => {});
      it.skip('getPreviousIndex', () => {});
    });

    describe('FmcUi', () => {
      /* Instance methods */

      /* Static methods */
      it.skip('emitEvent', () => {});
      it.skip('getOffset', () => {});
      it.skip('isEmptyObject', () => {});
    });
  });
});
