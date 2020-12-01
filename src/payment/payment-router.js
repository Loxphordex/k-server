const express = require('express');
const config = require('../config');
const stripe = require('stripe')(config.SECRET_PAY_KEY);
const mapCartToLineItems = require('./helpers');

const PaymentRouter = express.Router();

// todo
// * check if sizes are available
// * return size info

PaymentRouter
  .route('/create-session')
  .post(async (req, res, next) => {
    const { receiptEmail } = req.body;

    stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: await mapCartToLineItems(req),
      receipt_email: receiptEmail,
      mode: 'payment',
      success_url: `${config.TEST_CLIENT_URL}/confirm?success=true`,
      cancel_url: `${config.TEST_CLIENT_URL}/confirm?canceled=true`
    }).then((session) => {
      if (!session) {
        return res.json(400).json({
          error: 'No payment intent returned'
        });
      }

      if (!session.id) {
        return res.json(400).json({
          error: 'No session id',
          session
        });
      }

      return res.json({ id: session.id });
    }).catch((err) => {
      console.error(err);
      next();
    });
  });

module.exports = PaymentRouter;
