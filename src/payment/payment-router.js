const express = require('express');
const config = require('../config');
const stripe = require('stripe')(config.SECRET_PAY_KEY);
const mapCartToLineItems = require('./helpers');
const webHookParser = require('body-parser');

const bodyParser = express.json();
const PaymentRouter = express.Router();

PaymentRouter
  .route('/create_session')
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
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US']
      },
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${config.CLIENT_URL}/confirm?success=true`,
      cancel_url: `${config.CLIENT_URL}/confirm?canceled=true`
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

      return res.status(200).json({ id: session.id });
    }).catch((err) => {
      console.error(err);
      next();
    });
  });

PaymentRouter
  .route('/create-intent')
  .get((req, res) => res.status(200).json({ message: 'create-intent route' }))
  .post(bodyParser, async (req, res) => {
    const { amount, id } = req.body;

    try {
      const payment = await stripe.paymentIntents.create({
        amount,
        payment_method: id,
        currency: 'usd',
        confirm: true
      });

      console.log('Stripe payment intent success', payment);
      return res.status(200).json({
        message: 'payment successful',
        success: true
      });
    }
    catch (err) {
      console.log('Stripe payment intent error ', err);
      return res.status(500).json({
        message: 'payment failed',
        success: false
      });
    }
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

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
    }

    res.status(200);
  });

module.exports = PaymentRouter;
