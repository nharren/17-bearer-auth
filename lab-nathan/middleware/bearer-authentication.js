'use strict';

const createError = require('http-errors');
const debug = require('debug')('authentication-server:bearer-authentication');
const jwt = require('jsonwebtoken');
const User = require('../model/user.js');

const bearerAuthentication = function(request, response, next) {
  debug('bearerAuthentication');
  
  let authorization = request.headers.authorization;

  if (!authorization) {
    let error = createError(401, 'Authorization header not provided.');
    return next(error);
  }

  let authenticationArray = authorization.split('Bearer ');

  if (authenticationArray.length < 2) {
    let error = createError(401, 'Invalid authorization header format.');
    return next(error);
  }

  let token = authenticationArray[1];

  if (!token) {
    let error = createError(401, 'Authentication token not provided.');
    return next(error);
  }

  jwt.verify(token, process.env.APP_SECRET, (error, decoded) => {
    if (error) {
      let error = createError(401, 'Unauthorized token.');
      return next(error);
    }

    User.findOne({ findHash: decoded.token })
      .then(user => {
        request.user = user;
        next();
      })
      .catch(error => {
        error = createError(401, error.message);
        next(error);
      });
  });
};

module.exports = bearerAuthentication;