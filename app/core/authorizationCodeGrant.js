var accessModel = require('../model/auth/access');
var authorizationCodeModel = require('../model/auth/authorizationCode');
var authorizeRequestModel = require('../model/auth/authorizationRequest.js');
var authorizeErrorHandler = require('./authorizeErrorHandler');
var querystring = require('querystring');
var log = require('debug')('app:core:authorizationCodeGrant');
var logErr = require('debug')('app:core:authorizationCodeGrant:error');


function authorizationCodeGrant(req, res, next) {

  //Check query
  if (req.query.scope == undefined) {
    authorizeErrorHandler.handleAuthorizationError(req, res, 'invalid_request', next);
  }
  else if (req.authUserId == null) {
    //If user not logged, redirect to login form
    log('Redirecting user to login page');
    res.redirect('/v1/oauth2/login?' + querystring.stringify(req.query));
  }
  else {

    //Get existing access
    accessModel.getExistingAccess(req.authUserId, req.authClient._id, req.authRequest.scope, function (err, access) {
      if (err) {
        logErr('Error retrieving existing access');
        next(err);
      }
      else {

        //If access already exists
        if (access != undefined) {

          log('Access already exists, revoking ...');
          access.revokeAccess(function (err) {
            if (err) {
              logErr('Unable to revoke access');
              next(err);
            }
            else {
              //Display authorize form
              log('Displaying authorization form');
              res.render('authorize', {fname: req.authUser.firstName, lname: req.authUser.lastName, api: req.authClient.applicationName, reqId: req.authRequest._id});
            }
          });
        }
        else {
          //Display authorize form
          log('Displaying authorization form');
          res.render('authorize', {fname: req.authUser.firstName, lname: req.authUser.lastName, api: req.authClient.applicationName, reqId: req.authRequest._id});
        }
      }

    });
  }
}

function authorizationCodeGrantResult(req, res, next) {
  if (req.query.scope == undefined) {
    authorizeErrorHandler.handleAuthorizationError(req, res, 'invalid_request', next);
  }
  else if (req.authUserId == null) {
    //If user not logged, redirect to login form
    log('Redirecting user to login page');
    res.redirect('/v1/oauth2/login?' + querystring.stringify(req.query));
  }
  else {

    //Check POST body
    if (req.body.reqId == undefined ||
      (req.body.allow == undefined && req.body.denie == undefined)) {
      log('Invalid post data');
      authorizeErrorHandler.handleAuthorizationError(req, res, 'invalid_request', next);
    }
    else {
      //Check request
      authorizeRequestModel.getRequest(req.body.reqId, function(err, request) {

        if (err || request == undefined ||
          request.responseType != req.query.response_type ||
          request.clientId != req.authClient.clientId ||
          request.redirectUri != req.query.redirect_uri ||
          request.scope != req.query.scope ||
          request.user != req.authUserId) {

          authorizeErrorHandler.handleAuthorizationError(req, res, 'invalid_request', next);
        }
        else {

          if (req.body.allow != undefined) {

            //Generate access + code
            log('Creating access');
            accessModel.createNewAccessCodeGrant(request, req.authClient._id, request.userId, function(err, access, authorizationCode) {
              if (err) {
                logErr(err.errors);
                authorizeErrorHandler.handleAuthorizationError(req, res, 'server_error', next);
              }
              else {
                var redirectQuery = {
                  code: authorizationCode.code
                };

                if (request.state != undefined) {
                  redirectQuery.state = request.state;
                }

                log('Redirecting user to client app (' + request.redirectUri + ')');
                res.redirect(request.redirectUri + '?' + querystring.stringify(redirectQuery));
              }
            });
          }
          else {
            log('User denied access');
            authorizeErrorHandler.handleAuthorizationError(req, res, 'access_denied', next);
          }
        }
      });
    }
  }
}

module.exports.authorizationCodeGrant = authorizationCodeGrant;
module.exports.authorizationCodeGrantResult = authorizationCodeGrantResult;