var accessTokenRequestModel = require('../model/auth/accessTokenRequest');
var clientModel = require('../model/client');
var log = require('debug')('app:middleware:tokenMiddleware');
var logErr = require('debug')('app:middleware:tokenMiddleware:error');

function handleTokenRequest(req, res, next) {

  log('Receive a token request : ' + req.method + ' ' + req.baseUrl + req.url);

  //Create accessTokenRequest
  accessTokenRequestModel.createRequest(req.body.grant_type, req.body.code, req.query.username, req.query.password,
    req.query.scope, req.query.refreshToken, req.body.redirect_uri, req.body.client_id, req.get('Authorization'), req.ip,
  function (err, accessTokenRequest) {
    if (err) {
      logErr('Unable to create request');
      next();
    }

    req.authRequest = accessTokenRequest;
    if (req.get('Authorization') == undefined) {
      log('No Authorization in header');
      next();
    }

    log('Authorization header is ' + req.get('Authorization'));
    var clientSecret = req.get('Authorization').split(' ');
    if (clientSecret[0] != 'Basic' || clientSecret.length != 2) {
      next();
    }
    clientSecret = clientSecret[1];

    //Get client
    clientModel.authenticateClient(req.body.client_id, clientSecret, function (err, client) {
      if (err || client == undefined) {
        logErr('Unable to find client');
        next();
      }
      else {
        req.authClient = client;
        log('Client is ' + client.applicationName);
        next();
      }
    });
  });
}

module.exports = handleTokenRequest;