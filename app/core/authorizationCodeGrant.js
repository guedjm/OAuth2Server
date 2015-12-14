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

    //Get existing access
    accessModel.getExistingAccess(req.authUserId, req.authClient._id, req.authRequest.scope, function (err, access) {
      if (err) {
        next(err);
      }
      else {

        //If access already exists
        if (access != undefined) {
          access.revokeAccess(function (err) {
            if (err) {
              next(err);
            }
            else {
              //Display authorize form
              res.render('authorize', {fname: req.authUser.firstName, lname: req.authUser.lastName, api: req.authClient.applicationName, reqId: req.authRequest._id});
            }
          });
        }
        else {
          //Display authorize form
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
    res.redirect('/v1/oauth2/login?' + querystring.stringify(req.query));
  }
  else {

    console.log(req.body);
    //Check POST body
    if (req.body.reqId == undefined ||
      (req.body.allow == undefined && req.body.refuse == undefined)) {
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
          request.userId != req.authUserId) {

          authorizeErrorHandler.handleAuthorizationError(req, res, 'invalid_request', next);
        }
        else {

          if (req.body.allow != undefined) {
            //Generate code
            authorizationCodeModel.createCodeFromRequest(request, req.authUserId, req.authClient._id, function (err, authorizationCode) {
              if (err || authorizationCode == undefined) {
                authorizeErrorHandler.handleAuthorizationError(req, res, 'server_error', next);
              }
              else {
                //Redirect back to the client application with code
                var redirectQuery = {
                  code: authorizationCode.code
                };

                if (request.state != undefined) {
                  redirectQuery.state = request.state;
                }

                res.redirect(request.redirectUri + '?' + querystring.stringify(redirectQuery));
              }
            });
          }
          else {
            authorizeErrorHandler.handleAuthorizationError(req, res, 'access_denied', next);
          }
        }
      });
    }
  }
}

module.exports.authorizationCodeGrant = authorizationCodeGrant;
module.exports.authorizationCodeGrantResult = authorizationCodeGrantResult;