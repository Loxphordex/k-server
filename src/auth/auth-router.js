const express = require('express');

const AuthRouter = express.Router();
const path = require('path');
const AuthServices = require('./auth-services');

const bodyParser = express.json();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

AuthRouter
  .route('/register')
  .get((req, res) => {
    res.send('Auth Router');
  })
  .post(bodyParser, (req, res, next) => {
    console.log('ROUTER ACCESSED');
    const { username, password } = req.body;
    const newUser = { username, password };

    for (const [key, value] of Object.entries(newUser)) {
      if (!value) {
        return res.status(400).json({
          error: `Missing ${key} in request body`
        });
      }
    }

    return AuthServices.hashPassword(newUser.password)
      .then((hashedPassword) => {
        console.log('PASSWORD HASHED');
        newUser.password = hashedPassword;

        AuthServices.insertUser(req.app.get('db'), newUser)
          .then((user) => {
            console.log('USER INSERTED');
            res.status(201)
              .location(path.posix.join(req.originalUrl, `/${user.id}`))
              .json(AuthServices.serializeUser(user));
          });
      }).catch(next);
  });

AuthRouter
  .route('/login')
  .get((req, res) => {
    res.send('Auth Login');
  })
  .post(bodyParser, (req, res, next) => {
    const { username, password } = req.body;
    const userLogin = { username, password };

    for (const [key, value] of Object.entries(userLogin)) {
      if (!value) {
        return res.status(400).json({
          error: `Missing ${key} in request body`
        });
      }
    }

    AuthServices.getUserWithUsername(req.app.get('db'), userLogin.username)
      .then((dbUser) => {
        if (!dbUser) {
          return res.status(400).json({
            error: 'Incorrect username or password'
          });
        }

        return AuthServices.comparePasswords(userLogin.password, dbUser.password)
          .then((match) => {
            if (!match) {
              return res.status(400).json({
                error: 'Incorrect username or password'
              });
            }

            console.log('PASSWORDS MATCH');

            const sub = dbUser.username;
            const payload = { user_id: dbUser.id };
            const authToken = AuthServices.createJwt(sub, payload);

            res.send({ authToken });
          });
      })
      .catch((err) => {
        console.error(err);
        next();
      });
  });

module.exports = AuthRouter;
