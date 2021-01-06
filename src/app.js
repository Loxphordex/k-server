require('dotenv').config();
const express = require('express');
const mailer = require('express-mailer');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, EMAIL_PASSWORD } = require('./config');

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

mailer.extend(app, {
  from: 'test.monkey.loxphordex@gmail.com',
  host: 'smtp.gmail.com',
  secureConnection: true,
  port: 456,
  transportMethod: 'SMTP',
  auth: {
    user: 'test.monkey.loxphordex@gmail.com',
    pass: EMAIL_PASSWORD
  }
});

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use('/api', ImagesRouter);
app.use('/api/pay', PaymentRouter);
app.use('/api/auth', AuthRouter);

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
