const express = require('express');
const nodeMailer = require('nodemailer');
const config = require('../config');

const bodyParser = express.json();
const EmailRouter = express.Router();

EmailRouter
  .route('/test_email')
  .post(bodyParser, (req, res, next) => {
    try {
      // const sendOptions = { template: 'testTemplate' };
      // res.mailer.send(sendOptions, {
      //   to: 'silasishallahan@gmail.com',
      //   subject: 'TEST'
      // }, (err) => {
      //   if (err) {
      //     console.log(`Email error: ${err}`);
      //     return res.status(500).json({ error: 'Email confirmation failed' });
      //   }

      //   return res.status(200);
      // });
      const transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 456,
        secure: false,
        auth: {
          user: 'test.monkey.loxphordex@gmail.com',
          pass: config.EMAIL_PASSWORD
        }
      });

      transporter.sendMail({
        from: 'Test Mankey',
        to: 'silasishallahan@gmail.com',
        subject: 'Testing',
        text: 'Test email sent from express',
        html: '<p>Test email sent from express</p>'
      })
        .then((onFulfilled) => res.status(200).json({ onFulfilled }))
        .catch((err) => res.status(500).json({ error: err }));
    }
    catch (err) {
      console.error('Email error catch: ', err);
      next();
    }
  });

module.exports = EmailRouter;
