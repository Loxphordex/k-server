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
            user: 'noreplypearegrine@gmail.com',
            clientId: config.CLIENT_ID,
            clientSecret: config.CLIENT_SECRET,
            refreshToken: config.REFRESH_TOKEN,
            accessToken: config.ACCESS_TOKEN,
            expires: 3600
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
          from: 'Pearegrine <noreplypearegrine@gmail.com>',
          to: customerEmail,
          subject: 'Order Confirmed',
          text: 'Your order was recieved',
          html: '<p>Your order was recieved</p>'
        })
          .then((customerFulfilled) => {
            transporter.sendMail({
              from: 'Pearegrine <noreplypearegrine@gmail.com>',
              to: 'pearegrinenyc@outlook.com',
              subject: 'A new order has been made!',
              text: 'Please check your Stripe Dashboard for order details',
              html: '<p>Please check your Stripe Dashboard for order details</p>'
            }).then((notificationFulfilled) => res.status(200).json({
              customerFulfilled,
              notificationFulfilled
            })).catch((err) => res.status(500).json({ error: err }));
          })
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
