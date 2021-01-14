const express = require('express');

const bodyParser = express.json();
const EmailRouter = express.Router();

EmailRouter
  .route('/test_email')
  .post(bodyParser, (req, res, next) => {
    try {
      res.mailer.send('testTemplate', {
        to: 'silasishallahan@gmail.com',
        subject: 'TEST'
      }, (err) => {
        if (err) {
          console.log(`Email error: ${err}`);
          return res.status(500).json({ error: 'Email confirmation failed' });
        }

        return res.status(200);
      });
    }
    catch (err) {
      console.error('Email error catch: ', err);
      next();
    }
  });

module.exports = EmailRouter;
