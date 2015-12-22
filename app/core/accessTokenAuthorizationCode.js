var accessTokenErrorHandler = require('./accessTokenErrorHandler');
var authorizationCodeModel = require('../model/auth/authorizationCode');
var log = require('debug')('app:core:accessTokenAuthorizationCode');
var logErr = require('debug')('app:core:accessTokenAuthorizationCode:error');

function accessTokenAuthorizationCode(req, res, next) {

  //Check query
  if (req.body.code == undefined || req.body.redirect_uri == undefined || req.authClient.redirectUris.indexOf(req.body.redirect_uri) == -1) {
    accessTokenErrorHandler.handleAccessTokenError(req, res, 'invalid_request');
  }
  else {

    //Get code
    authorizationCodeModel.getAvailableCodeWithAccess(req.body.code, function (err, code) {

      if (err) {
        logErr('Unable to retrieve code ...');
        accessTokenErrorHandler.handleAccessTokenError(req, res, 'server_error');
      }
      else if (code == undefined) {
        log('Code not found');
        accessTokenErrorHandler.handleAccessTokenError(req, res, 'invalid_grant');
      }
      else {

        log('Code is attributed to ' + code.access.user);
        code.useCode(function (err) {
          if (err) {
            logErr('Unable to update code');
            accessTokenErrorHandler.handleAccessTokenError(req, res, 'server_error');
          }
          else {
            log('Code used');
          }
        });

        code.access.generateTokens(req.authRequest, function (err, accessToken, refreshToken) {
          if (err) {
            logErr('Error generating token');
            accessTokenErrorHandler.handleAccessTokenError(req, res, 'server_error');
          }
          else {
            log('Token generated');

            var response = {
              access_token: accessToken.token,
              token_type: "bearer",
              expire_in: "3600",
              refresh_token: refreshToken.token
            };
            res.send(response);

            log('Response sent');
          }
        });
      }
    });
  }
}

module.exports.accessTokenAuthorizationCode = accessTokenAuthorizationCode;