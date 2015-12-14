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
          //TODO Revoke access + tokens
        }

        //Display authorize form
        res.render('authorize', {fname: req.authUser.firstName, lname: req.authUser.lastName, api: req.authClient.applicationName});
      }

    });
  }
}

module.exports.authorizationCodeGrant = authorizationCodeGrant;