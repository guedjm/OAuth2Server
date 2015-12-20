var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var accessTokenErrorHandler = require('../core/accessTokenErrorHandler');
var accessTokenAuthorizationCode = require('../core/accessTokenAuthorizationCode');
var log = require('debug')('app:route:token');
var errLog = require('debug')('app:route:login:token');

router.post('', function(req, res, next) {
  var supportedGrant = ['authorization_code'];

  if (supportedGrant.indexOf(req.body.grant_type) == -1) {
    accessTokenErrorHandler.handleAccessTokenError(req, res, 'unsupported_grant_type');
  }
  else if (req.authClient == undefined) {
    accessTokenErrorHandler.handleAccessTokenError(req, res, 'invalid_client');
  }
  else {
    switch (req.body.grant_type) {
      case 'authorization_code':
        accessTokenAuthorizationCode.accessTokenAuthorizationCode(req, res, next);
        break;

      default:
        accessTokenErrorHandler.handleAccessTokenError(req, res, 'unsupported_grant_type');
    }
  }
});

module.exports = router;