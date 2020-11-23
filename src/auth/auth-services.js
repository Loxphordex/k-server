const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const xss = require('xss');
const config = require('../config');

const AuthServices = {
  getById(db, id) {
    return db
      .select('*')
      .from('users')
      .where('users.id', id)
      .first();
  },

  hasUserWithUsername(db, username) {
    return db('users')
      .where({ username })
      .first()
      .then((user) => !!user);
  },

  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(([user]) => user)
      .then((user) => AuthServices.getById(db, user.id));
  },

  serializeUser(user) {
    return {
      id: user.id,
      username: xss(user.username)
    };
  },

  getUserWithUsername(db, username) {
    return db('users')
      .where({ username })
      .first();
  },

  comparePasswords(loginPassword, hash) {
    return bcrypt.compare(loginPassword, hash);
  },

  createJwt(subject, payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      expiresIn: config.JWT_EXPIRY,
      algorithm: 'HS256'
    });
  },

  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256']
    });
  },

  parseBasicToken(token) {
    return Buffer.from(token, 'base64')
      .toString()
      .split(':');
  }
};

module.exports = AuthServices;
