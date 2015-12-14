var accessModel = require('../model/auth/access');
var authorizationCodeModel = require('../model/auth/authorizationCode');
var authorizeRequestModel = require('../model/auth/authorizationRequest.js');
var authorizeErrorHandler = require('./authorizeErrorHandler');
var querystring = require('querystring');


function authorizationCodeGrant(req, res, next) {

  //Check query
  if (req.query.scope == undefined) {
    authorizeErrorHandler.handleAuthorizationError(req, res, 'invalid_request', next);
  }
  else if (req.authUserId == null) {
    //If user not logged, redirect to login form
    res.redirect('/v1/oauth2/login?' + querystring.stringify(req.query));
  }
  else {
    //TODO
  }
}

module.exports.authorizationCodeGrant = authorizationCodeGrant;