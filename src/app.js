require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const webHookParser = require('body-parser');
const {
  NODE_ENV, SECRET_PAY_KEY, SIGNING_SECRET
} = require('./config');

const app = express();

const AuthRouter = require('./auth/auth-router');
const ImagesRouter = require('./images/images-router');
const PaymentRouter = require('./payment/payment-router');
const EmailRouter = require('./testRouter/EmailRouter');
const DiscoverRouter = require('./discover/discover-router');
const stripe = require('stripe')(SECRET_PAY_KEY);

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());

app.set('views', 'src/templates');
app.set('view engine', 'jade');

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use('/api', ImagesRouter);
app.use('/api/pay', PaymentRouter);
app.use('/api/auth', AuthRouter);
app.use('/api/email', EmailRouter);
app.use('/api/discover', DiscoverRouter);
app.post('/api/email/webhook', webHookParser.raw({ type: 'application/json' }), (req, res, next) => {
  const payload = req.body;
  const webhookEndpointSecret = SIGNING_SECRET;
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

    // send email to dispatch order
    app.mailer.send('testTemplate', {
      to: 'test.monkey.loxphordex@gmail.com',
      subject: 'TEST'
    }, (err) => {
      if (err) {
        console.log(`Email error: ${err}`);
        return res.status(500).json({ error: 'Email confirmation failed' });
      }

      return res.status(200);
    });
  }

  console.log('Got payload', payload);

  return res.status(200);
});

app.use((error, req, res, next) => {
  let response;

  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  }
  else {
    console.error(error);
    response = { message: error.message, error };
  }
  response = { error: { message: error.message, error } };
  res.status(500).json(response);
});

module.exports = app;
