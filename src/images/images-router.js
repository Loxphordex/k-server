const express = require('express');
const ImagesRouter = express.Router();
const bodyParser = express.json();
const requireAuth = require('../middleware/jwt-auth');
const ImagesServices = require('./images-services');
const path = require('path');

ImagesRouter
  .route('/images')
  .get((req, res) => {
    ImagesServices.getAllImages(req.app.get('db'))
      .then(images => {
        if (!images) {
          return res.status(500).json({
            error: 'Missing images in database'
          });
        }

        return res.json({ images });
      });
  })
  .post(bodyParser, requireAuth, (req, res, next) => {
    const { url, name, link } = req.body;
    let newImage = { url, name, link };

    if (!newImage.url) {
      return res.status(400).json({
        error: 'Missing url in request body'
      });
    }

    for (let key in newImage) {
      if (!newImage[key]) {
        delete newImage[key];
      }
    }

    ImagesServices.insertImage(req.app.get('db'), newImage)
      .then(dbImage => {
        return res.status(201)
          .location(path.posix.join(req.originalUrl, `/${dbImage.id}`))
          .json({ dbImage });
      })
      .catch(next);
  })
  .patch(requireAuth, (req, res, next) => {
    const { id, name, link } = req.query;

    if (!id) {
      return res.status(400).json({
        error: 'Missing id in request query'
      });
    }

    if (!name && !link) {
      return res.status(400).json({
        error: 'Missing name and link in request query'
      });
    }

    let resImage = {};

    if (name) {
      ImagesServices.renameImage(req.app.get('db'), id, name)
        .then(image => {
          if (!image) {
            return res.status(404).json({
              error: `No image with name ${name} and id ${id} exists`
            });
          }

          resImage.name = image.name;
        })
        .catch(next);
    }

    if (!link) {
      ImagesServices.alterLink(req.app.get('db'), id, link)
        .then(image => {
          if (!image) {
            return res.status(404).json({
              error: `No image with link ${link} and id ${id} exists`
            });
          }

          resImage.link = image.link;
        })
        .catch(next);
    }

    return res.status(200).json(resImage);
  })
  .delete(requireAuth, (req, res, next) => {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        error: 'Missing id in request query'
      });
    }

    ImagesServices.deleteImage(req.app.get('db'), id)
      .then(imageId => {
        if (!imageId) {
          return res.status(404).json({
            error: `No image with id ${id} exists`
          });
        }

        return res.status(200).json({ id: imageId });
      })
      .catch(next);
  });

module.exports = ImagesRouter;