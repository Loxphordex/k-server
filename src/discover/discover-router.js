const express = require('express');
const path = require('path');
const requireAuth = require('../middleware/jwt-auth');
const xss = require('xss');

const bodyParser = express.json();
const DiscoverServices = require('./discover-services');

const DiscoverRouter = express.Router();

DiscoverRouter
  .route('/')
  .get((req, res) => {
    DiscoverServices.getAllEntries(req.app.get('db'))
      .then((entries) => {
        if (!entries) {
          return res.status(500).json({
            error: 'Missing discover entries in database'
          });
        }

        return res.json({ entries });
      });
  })
  .post(bodyParser, requireAuth, (req, res, next) => {
    const { content } = req.body;
    const db = req.app.get('db');

    if (!content) {
      return res.status(404).json({
        error: 'No content property in request body'
      });
    }

    const safeEntry = xss(content);
    const scrubbedContent = {
      content: safeEntry
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
