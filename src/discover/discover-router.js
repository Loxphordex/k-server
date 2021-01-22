const express = require('express');
const path = require('path');
const requireAuth = require('../middleware/jwt-auth');
const xss = require('xss');

const bodyParser = require('body-parser');
const DiscoverServices = require('./discover-services');

const DiscoverRouter = express.Router();

DiscoverRouter
  .route('/')
  .get((req, res) => {
    const { id } = req.query;
    const db = req.app.get('db');

    if (id) {
      DiscoverServices.getById(db, id)
        .then((entry) => {
          if (!entry) {
            return res.status(404).json({
              error: 'Missing discover entry id in database'
            });
          }

          return res.json({ entry });
        });
    }
    else {
      DiscoverServices.getAllEntries(db)
        .then((entries) => {
          if (!entries) {
            return res.status(500).json({
              error: 'Missing discover entries in database'
            });
          }

          return res.json({ entries });
        });
    }
  })
  .post(bodyParser.json({ limit: '50mb' }), requireAuth, (req, res, next) => {
    const { title, content, url } = req.body;
    const db = req.app.get('db');

    if (!title) {
      return res.status(400).json({
        error: 'No title in request body'
      });
    }

    if (!content) {
      return res.status(400).json({
        error: 'No content property in request body'
      });
    }

    const safeTitle = xss(title);
    const safeContent = xss(content);
    const scrubbedContent = {
      title: safeTitle,
      content: safeContent,
      header_url: url
    };

    DiscoverServices.postEntry(db, scrubbedContent)
      .then((createdEntry) => res.status(201)
        .location(path.posix.join(req.originalUrl, `/${createdEntry.id}`))
        .json({ entry: createdEntry }))
      .catch(next);
  })
  .delete(requireAuth, (req, res, next) => {
    const { id } = req.query;
    const db = req.app.get('db');

    if (!id) {
      return res.status(400).json({
        error: 'Missing id in request query'
      });
    }

    DiscoverServices.deleteEntry(db, id)
      .then((entryId) => {
        if (!entryId) {
          return res.status(404).json({
            error: `No entry with id ${id} exists`
          });
        }

        return res.status(200).json({ id: entryId });
      })
      .catch(next);
  });

module.exports = DiscoverRouter;
