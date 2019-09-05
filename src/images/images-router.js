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
    console.log('PATCH ROUTE');
    console.log(id, name, link)

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
    console.log('RES-IMAGE CREATED');

    if (name) {
      console.log('NAME IS TRUE');
      ImagesServices.renameImage(req.app.get('db'), id, name)
        .then(image => {
          console.log('IMAGE RENAMED');
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
      console.log('LINK IS TRUE');
      ImagesServices.alterLink(req.app.get('db'), id, link)
        .then(image => {
          console.log('IMAGE RELINKED');
          if (!image) {
            return res.status(404).json({
              error: `No image with link ${link} and id ${id} exists`
            });
          }

          resImage = image;
        })
        .catch(next);
    }

    console.log('RES TO BE SENT');
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