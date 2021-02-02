const express = require('express');
const webHookParser = require('body-parser');
const nodeMailer = require('nodemailer');
const config = require('../config');

const stripe = require('stripe')(config.SECRET_PAY_KEY);

const StripeEmailRouter = express.Router();

StripeEmailRouter
  .route('/')
  .post(webHookParser.raw({ type: 'application/json' }), (req, res, next) => {
    const payload = req.body;
    const webhookEndpointSecret = config.SIGNING_SECRET;
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, webhookEndpointSecret);
    }
    catch (err) {
      return res.status(400).json({ error: err.message });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerEmail = session.customer_details.email;

      console.log('EVENT TYPE CHECK SUCCESS | SESSION: ', session);

      // Send email to customer
      try {
        const transporter = nodeMailer.createTransport({
          name: 'pearegrine.com',
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            type: 'OAuth2',
            user: 'test.monkey.loxphordex@gmail.com',
            clientId: config.TEST_CLIENT_ID,
            clientSecret: config.TEST_CLIENT_SECRET,
            refreshToken: config.TEST_REFRESH_TOKEN,
            accessToken: config.TEST_ACCESS_TOKEN,
            expires: 3510
          },
          tls: {
            rejectUnauthorized: true
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
          from: 'Pearegrine',
          to: customerEmail,
          subject: 'Order Confirmed',
          text: 'Your order was recieved',
          html: '<p>Your order was recieved</p>'
        })
          .then((onFulfilled) => res.status(200).json({ onFulfilled }))
          .catch((err) => res.status(500).json({ error: err }));
      }
      catch (err) {
        console.error('Email error catch: ', err);
        next();
      }

      return res.status(200).json({
        message: 'checkout session completed'
      });
    }

    console.log('Got payload', payload);

    return res.status(200);
  });

module.exports = StripeEmailRouter;
