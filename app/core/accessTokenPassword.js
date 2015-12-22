var userModel = require('../model/user');
var accessModel = require('../model/auth/access');
var accessTokenErrorHandler = require('./accessTokenErrorHandler');
var log = require('debug')('app:core:accessTokenPassword');
var logErr = require('debug')('app:core:accessTokenPassword:error');

function accessTokenPassword(req, res, next) {

  //Check query
  if (req.body.username == undefined || req.body.password == undefined || req.body.scope == undefined) {
    accessTokenErrorHandler.handleAccessTokenError(req, res, 'invalid_request');
  }
  else {

    //Get user
    userModel.getUser(req.body.username, req.body.password, function (err, user) {
      if (err) {
        logErr('Unable to retrieve user ..');
        accessTokenErrorHandler.handleAccessTokenError(req, res, 'server_error');
      }
      else if (user == undefined) {
        log('Invalid username/password');
        accessTokenErrorHandler.handleAccessTokenError(req, res, 'invalid_grant');
      }
      else {

        log('User is ' + user.firstName + ' (' + user._id + ')');
        accessModel.getExistingAccess(user._id, req.authClient._id, req.body.scope, function (err, access) {
          if (err) {
            logErr('Unable to retrieve existing access ..');
            accessTokenErrorHandler.handleAccessTokenError(req, res, 'server_error');
          }
          else {

            if (access) {
              //Revoke
              log('Existing access found, revoking ...');
              access.revokeAccess(function (err) {
                if (err) {
                  logErr('Unable to revoke access ...');
                  accessTokenErrorHandler.handleAccessTokenError(req, res, 'server_error');
                }
              });
            }

            accessModel.createNewAccessPasswordGrant(req.authRequest, req.authClient._id, user._id, req.body.scope,
            function (err, newAccess, accessToken, refreshToken) {

              log('Sending response');

              var response = {
                access_token: accessToken.token,
                token_type: "bearer",
                expire_in: "3600",
                refresh_token: refreshToken.token
              };
              res.send(response);
            });
          }
        });
      }
    });
  }

}

module.exports.accessTokenAuthorizationCode = accessTokenPassword;