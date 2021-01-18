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
    const { newEntry } = req.body;
    const db = req.app.get('db');

    if (!newEntry) {
      return res.status(404).json({
        error: 'No newEntry property in request body'
      });
    }

    const safeEntry = xss(newEntry);

    DiscoverServices.postEntry(db, safeEntry)
      .then((createdEntry) => res.status(201)
        .location(path.posix.join(req.originalUrl, `/${createdEntry.id}`))
        .json({ entry: createdEntry }))
      .catch(next);
  });

module.exports = DiscoverRouter;
