const express = require('express');
const config = require('../config');
const stripe = require('stripe')(config.SECRET_PAY_KEY);

const PaymentRouter = express.Router();

PaymentRouter
  .route('/')
  .post((req, res, next) => {
    // const {
    //   amount, currency, payment_method_types, receipt_email
    // } = req.body;

    // Stripe API - creates initial payment intent
    // stripe.paymentIntents.create({
    //   amount,
    //   currency,
    //   payment_method_types,
    //   receipt_email
    stripe.paymentIntents.create({
      amount: 1000,
      currency: 'usd',
      payment_method_types: ['card'],
      receipt_email: 'jenny.rosen@example.com'
    }).then((intent) => {
      if (!intent) {
        return res.json(400).json({
          error: 'No payment intent returned'
          // amount,
          // currency,
          // payment_method_types,
          // receipt_email
        });
      }

      res.send({ intent });
    }).catch((err) => {
      console.error(err);
      next();
    });
  });

module.exports = PaymentRouter;
