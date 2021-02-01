const express = require('express');
const webHookParser = require('body-parser');
const config = require('../config');

const stripe = require('stripe')(config.SECRET_PAY_KEY);

const StripeEmailRouter = express.Router();

StripeEmailRouter
  .route('/')
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

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      console.log('EVENT TYPE CHECK SUCCESS | SESSION: ', session);

      // Send email to customer
      return res.status(200).json({
        message: 'checkout session completed'
      });
    }

    console.log('Got payload', payload);

    return res.status(200);
  });

module.exports = StripeEmailRouter;
