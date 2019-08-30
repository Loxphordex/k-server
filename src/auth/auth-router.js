const express = require('express');
const AuthRouter = express.Router();
const AuthServices = require('./auth-services');
const path = require('path');
const bodyParser = express.json();

AuthRouter
  .route('/register')
  .get((req, res) => {
    res.send('Auth Router');
  })
  .post(bodyParser, (req, res, next) => {
    const { username, password } = req.body;
    let newUser = { username, password };

    for (const [key, value] of Object.entries(newUser)) {
      if (!value) {
        res.status(400).json({ 
          error: `Missing ${key} in request body` 
        });
      }
    }

    return AuthServices.hashPassword(newUser.password)
      .then(hashedPassword => {
        newUser.password = hashedPassword;

        AuthServices.insertUser(req.app.get('app'), newUser)
          .then(user => {
            res.status(201)
              .location(path.posix.join(req.originalUrl, `/${user.id}`))
              .json(AuthServices.serializeUser(user));
          });
      }).catch(next);
  });

module.exports = AuthRouter;
