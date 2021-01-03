const express = require('express');
const app = require('../app');
const config = require('../config');
const stripe = require('stripe')(config.SECRET_PAY_KEY);
const mapCartToLineItems = require('./helpers');
const webHookParser = require('body-parser');
const mailer = require('express-mailer');

const bodyParser = express.json();
const PaymentRouter = express.Router();

PaymentRouter
  .route('/create-session')
  .get((req, res) => res.status(200).json({
    message: 'create-session request successful'
  }))
  .post(bodyParser, async (req, res, next) => {
    if (!req) {
      return res.status(400).json({ message: 'no request sent' });
    }

    if (!req.body) {
      return res.status(400).json({ message: 'no request body sent' });
    }

    const lineItems = await mapCartToLineItems(req);

    if (!lineItems || lineItems.length === 0) {
      return res.status(404).json({
        message: 'failed to find line items',
        lineItems
      });
    }

    stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${config.TEST_CLIENT_URL}/confirm?success=true`,
      cancel_url: `${config.TEST_CLIENT_URL}/confirm?canceled=true`
    }).then((session) => {
      if (!session) {
        return res.status(404).json({
          error: 'No payment intent returned'
        });
      }

      if (!session.id) {
        return res.status(404).json({
          error: 'No session id',
          session
        });
      }

      // send email to dispatch order
      mailer.extend(app, {
        from: 'test.monkey.loxphordex@gmail.com',
        host: 'smtp.gmail.com',
        secureConnection: true,
        port: 456,
        transportMethod: 'SMTP',
        auth: {
          user: 'test.monkey.loxphordex@gmail.com',
          pass: config.EMAIL_PASSWORD
        }
      });

      return res.status(200).json({ id: session.id });
    }).catch((err) => {
      console.error(err);
      next();
    });
  });

PaymentRouter
  .route('/webhook')
  .post(webHookParser.raw({ type: 'application/json' }), (req, res) => {
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

    console.log('Got payload', payload);

    res.status(200);
  });

module.exports = PaymentRouter;
