describe('template spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8000/');

    cy.get('#image1').as('cropperMasterImg');
    cy.get('#image2').as('cropperCollapsedImg');
    cy.get('#image3').as('cropperThumbnailImg');
    cy.get('#image4').as('cropperBannerImg');
    cy.get('#thumbs .thumb:nth-child(1) > button').as('defaultThumbButton');
    cy.get('#thumbs .thumb:nth-child(2) > button').as('portraitThumbButton');
    cy.get('#thumbs .thumb:nth-child(3) > button').as('squareThumbButton');
    cy.get('#thumbs .thumb:nth-child(4) > button').as('screenshotThumbButton');
    cy.get('#thumbs .thumb:nth-child(5) > button').as('panoramaThumbButton');

    cy.get('.cropper-master .cropper-canvas').as('cropperMasterCanvas');
    cy.get('.cropper-master .cropper-crop-box').as('cropperMasterCropbox');
    cy.get('.cropper-master .cropper-center').as('cropperMasterCropboxCenter');
  });

  describe('Thumbs', () => {
    describe('Default - Thumb 1', () => {
      it('Image 1 is loaded into all 4 croppers', () => {
        cy.get('@defaultThumbButton').should('have.class', 'btn-selected');
        cy.get('@cropperMasterImg').should('have.attr', 'src', './data/Tour1/Day1/default.jpeg');
        cy.get('@cropperBannerImg').should('have.attr', 'src', './data/Tour1/Day1/default.jpeg');
        cy.get('@cropperCollapsedImg').should('have.attr', 'src', './data/Tour1/Day1/default.jpeg');
        cy.get('@cropperThumbnailImg').should('have.attr', 'src', './data/Tour1/Day1/default.jpeg');
      });
    });
  });

  describe('Master cropper', () => {
    describe('Cropbox', () => {
      it('Expected center XY position (control)', () => {
        cy.get('@cropperMasterImg').then($el1 => {
          const cropper = $el1[0].cropper;
          const { width, height } = cropper.getImageData();
          const imageCenterX = width / 2;
          const imageCenterY = height / 2;

          // control
          cy.roundTo1dp(imageCenterX).should('equal', 426.0);
          cy.roundTo1dp(imageCenterY).should('equal', 319.5);
        });

        it('Expected center XY position', () => {
          cy.get('@cropperMasterCanvas').then($cmp => {
            const cropper = $cmp[0].cropper;
            const { width, height } = cropper.getImageData();
            const imageCenterX = width / 2;
            const imageCenterY = height / 2;

            const canvasLeft = $cmp[0].getBoundingClientRect().left; // 70
            const canvasTop = $cmp[0].getBoundingClientRect().top;

            cy.get('@cropperMasterCropboxCenter').then($cmcc => {
              const cropboxCenterLeft = $cmcc[0].getBoundingClientRect().left; // 496
              const cropboxCenterTop = $cmcc[0].getBoundingClientRect().top;

              cy.roundTo1dp(cropboxCenterLeft - canvasLeft).should('equal', imageCenterX);
              cy.roundTo1dp(cropboxCenterTop - canvasTop).should('equal', imageCenterY);
            });
          });
        });
      });

      it('Expected width and height', () => {
        cy.get('@cropperMasterCropbox').then(($el) => {
          const w = $el[0].getBoundingClientRect().width;
          const h = $el[0].getBoundingClientRect().height;

          cy.roundTo1dp(w).should('equal', 127.8);
          cy.roundTo1dp(h).should('equal', 127.8);
        });
      });
    });
  });
});
