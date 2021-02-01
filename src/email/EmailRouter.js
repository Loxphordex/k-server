const express = require('express');
const nodeMailer = require('nodemailer');
const config = require('../config');
const requireAuth = require('../middleware/jwt-auth');

const bodyParser = express.json();
const EmailRouter = express.Router();

EmailRouter
  .route('/test_email')
  .post(bodyParser, requireAuth, (req, res, next) => {
    try {
      const transporter = nodeMailer.createTransport({
        name: 'pearegrine.com',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'test.monkey.loxphordex@gmail.com',
          pass: config.EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // verify connection configuration
      transporter.verify((error, success) => {
        if (error) {
          console.log(error);
        }
        else {
          console.log('Server is ready to take our messages', success);
        }
      });

      transporter.sendMail({
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
