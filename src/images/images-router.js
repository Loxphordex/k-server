const express = require('express');

const ImagesRouter = express.Router();
const bodyParser = express.json();
const path = require('path');
const requireAuth = require('../middleware/jwt-auth');
const ImagesServices = require('./images-services');
const sizeChart = require('../constants/sizeChart');

ImagesRouter
  .route('/images')
  .get((req, res) => {
    console.log('IMAGES ROUTE FETCH - GET');
    ImagesServices.getAllImages(req.app.get('db'))
      .then((images) => {
        console.log('IMAGES SERVICES GET ALL IMAGES RAN');
        if (!images) {
          return res.status(500).json({
            error: 'Missing images in database'
          });
        }

        const mappedImages = images.map((image) => mapSizesToObject(image));
        console.log('MAPPED IMAGES RAN');
        return res.json({ mappedImages });
      });
  })
  .post(bodyParser, requireAuth, (req, res, next) => {
    const {
      url, name, link, description, type, category
    } = req.body;
    const newImage = {
      url, name, link, description, type, category
    };

    if (!newImage.url) {
      return res.status(400).json({
        error: 'Missing url in request body'
      });
    }

    for (const key in newImage) {
      if (!newImage[key]) {
        delete newImage[key];
      }
    }

    ImagesServices.insertImage(req.app.get('db'), newImage)
      .then((dbImage) => res.status(201)
        .location(path.posix.join(req.originalUrl, `/${dbImage.id}`))
        .json({ dbImage }))
      .catch(next);
  })
  .patch(bodyParser, requireAuth, (req, res, next) => {
    const {
      id,
      name,
      link,
      description,
      type,
      price,
      category,
      newArrival,
      saleEnabled,
      salePrice,
      small,
      medium,
      large,
      xLarge,
      xxLarge
    } = req.query;

    const updateInfo = {
      id,
      name,
      link,
      description,
      type,
      price,
      category,
      newArrival,
      saleEnabled,
      salePrice,
      small,
      medium,
      large,
      xLarge,
      xxLarge
    };

    if (!id) {
      return res.status(400).json({
        error: 'Missing id in request query'
      });
    }

    for (const key in updateInfo) {
      if (!updateInfo[key]) {
        delete updateInfo[key];
      }
    }

    if (!updateInfo) {
      return res.status(400).json({
        error: 'Empty request query'
      });
    }

    const db = req.app.get('db');
    let resImage = {};

    if (name) {
      ImagesServices.renameImage(db, id, name)
        .then((image) => {
          if (!image) {
            return res.status(404).json({
              error: `No image with name ${name} and id ${id} exists`
            });
          }

          resImage = image;
        })
        .catch(next);
    }

    if (link) {
      ImagesServices.alterLink(db, id, link)
        .then((image) => {
          if (!image) {
            return res.status(404).json({
              error: `No image with link ${link} and id ${id} exists`
            });
          }

          resImage = image;
        })
        .catch(next);
    }

    if (description) {
      ImagesServices.alterDescription(db, id, description)
        .then((image) => {
          if (!image) {
            return res.status(404).json({
              error: `No image with description ${description} and id ${id} exists`
            });
          }

          resImage = image;
        })
        .catch(next);
    }

    if (type) {
      ImagesServices.alterType(db, id, type)
        .then((image) => {
          if (!image) {
            return res.status(404).json({
              error: `No image with type ${type} and id ${id} exists`
            });
          }

          resImage = image;
        })
        .catch(next);
    }

    if (price) {
      ImagesServices.alterPrice(db, id, price)
        .then((image) => {
          if (!image) {
            return res.status(404).json({
              error: `No image with id ${id} exists`
            });
          }

          resImage = image;
        })
        .catch(next);
    }

    if (category && category !== 'null') {
      console.log('CATEGORY UPDATED | ', category);
      ImagesServices.alterCategory(db, id, category)
        .then((image) => {
          if (!image) {
            return res.status(404).json({
              error: `No image with id ${id} exists`
            });
          }

          resImage = image;
        })
        .catch(next);
    }

    if (newArrival && newArrival !== 'null') {
      ImagesServices.alterNewArrival(db, id, newArrival)
        .then((image) => {
          if (!image) {
            return res.status(404).json({
              error: `No image with id ${id} exists`
            });
          }

          resImage = image;
        })
        .catch(next);
    }

    if (saleEnabled && saleEnabled !== 'null') {
      ImagesServices.alterSaleEnabled(db, id, saleEnabled)
        .then((image) => {
          if (!image) {
            return res.status(404).json({
              error: `No image with id ${id} exists`
            });
          }

          resImage = image;
        })
        .catch(next);
    }

    if (salePrice && salePrice !== 'null') {
      ImagesServices.alterSalePrice(db, id, salePrice)
        .then((image) => {
          if (!image) {
            return res.status(404).json({
              error: `No image with id ${id} exists`
            });
          }

          resImage = image;
        })
        .catch(next);
    }

    sizeChart.forEach((size) => {
      if (updateInfo[size] && updateInfo[size] !== null && updateInfo[size] !== 'null') {
        ImagesServices.updateSize(db, id, size.toLowerCase(), updateInfo[size])
          .then((image) => {
            if (!image) {
              return res.status(404).json({
                error: `No image with id ${id} exists`
              });
            }

            resImage = image;
          })
          .catch(next);
      }
    });

    mapSizesToObject(resImage);
    return res.status(200).json({ resImage });
  })
  .delete(requireAuth, (req, res, next) => {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        error: 'Missing id in request query'
      });
    }

    ImagesServices.deleteImage(req.app.get('db'), id)
      .then((imageId) => {
        if (!imageId) {
          return res.status(404).json({
            error: `No image with id ${id} exists`
          });
        }

        return res.status(200).json({ id: imageId });
      })
      .catch(next);
  });

ImagesRouter
  .route('/images/sale')
  .get((req, res) => {
    ImagesServices.getImagesOnSale(req.app.get('db'))
      .then((images) => {
        if (!images) {
          return res.status(500).json({
            error: 'Missing images on sale in database'
          });
        }
      });
  });

ImagesRouter
  .route('/images/arrivals')
  .get((req, res) => {
    ImagesServices.getImagesOnNewArrival(req.app.get('db'))
      .then((images) => {
        if (!images) {
          return res.status(500).json({
            error: 'Missing images on new arrival in database'
          });
        }
      });
  });

function mapSizesToObject(image) {
  const newImage = image;
  newImage.availableSizes = {};
  sizeChart.forEach((size) => {
    const lowerSize = size.toLowerCase();
    newImage.availableSizes[lowerSize] = newImage[lowerSize];
    delete newImage[lowerSize];
  });
  return newImage;
}

module.exports = ImagesRouter;
