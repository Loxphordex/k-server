const express = require('express');
const config = require('../config');
const stripe = require('stripe')(config.SECRET_PAY_KEY);
const mapCartToLineItems = require('./helpers');

const bodyParser = express.json();
const PaymentRouter = express.Router();

// todo
// * check if sizes are available
// * return size info

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

    const { receiptEmail } = req.body;
    let lineItems = [];

    if (!receiptEmail) {
      return res.status(400).json({
        message: 'failed to destructure receiptEmail from request body',
        body: req.body
      });
    }

    try {
      lineItems = await mapCartToLineItems(req);
    }

    catch (error) {
      return res.status(404).json({
        message: 'failed to get line items',
        error
      });
    }

    if (!lineItems || lineItems.length === 0) {
      return res.status(404).json({
        message: 'failed to find line items'
      });
    }

    stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      receipt_email: receiptEmail,
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

      return res.status(200).json({ id: session.id });
    }).catch((err) => {
      console.error(err);
      next();
    });
  });

module.exports = PaymentRouter;