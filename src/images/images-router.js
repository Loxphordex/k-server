const express = require('express');
const ImagesRouter = express.Router();
const bodyParser = express.json();
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
  .post(bodyParser, (req, res, next) => {
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
  });

module.exports = ImagesRouter;