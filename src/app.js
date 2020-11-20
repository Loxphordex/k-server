require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');

const app = express();

const AuthRouter = require('./auth/auth-router');
const ImagesRouter = require('./images/images-router');
const PaymentRouter = require('./payment/payment-router');

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use('/api/auth', AuthRouter);
app.use('/api', ImagesRouter);
app.use('/pay', PaymentRouter);

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
