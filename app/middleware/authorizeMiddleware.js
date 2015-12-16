var authorizeRequestModel = require('../model/auth/authorizationRequest');
var clientModel = require('../model/client');
var userModel = require('../model/user');
var log = require('debug')('app:middleware:authorizeMiddleware');
var err = require('debug')('app:middleware:authorizeMiddleware:error');



/**
 * This middleware is called on every request on the authorizeRoute
 * @param req
 * @param res
 * @param next
 */
function handleAuthorizationRequest(req, res, next) {


  req.authRedirectAllowed = false;
  req.authUserId = (req.session == undefined) ? null : req.session.authUserId;

  log('Receive an authorize request : ' + req.method + ' ' + req.baseUrl + req.url);

  //If its a GET, log the request
  if (req.method == 'GET') {
      authorizeRequestModel.createAuthorizationRequest(req.query.response_type, req.query.client_id,
        req.query.redirect_uri, req.query.scope, req.query.state, req.authUserId, req.ip, function (errRequest, request) {
          req.authRequest = request;

          log('Authorization request logged');
          getClientInformation(req, res, next);
      });
  }
  else {
    getClientInformation(req, res, next);
  }
}

function getClientInformation(req, res, next) {

  //If redirect uri or client_id not defined, skip and return error
  if (req.query.redirect_uri == undefined || req.query.client_id == undefined) {
    err('Missing \'redirect_uri\' or \'client_id\' field');
    next();
  }
  else {

    //Get client
    clientModel.getActivatedClient(req.query.client_id, function (errClient, client) {
      if (errClient || client == undefined) {
        err('Unable to find client');
        next();
      }
      else {
        req.authClient = client;
        req.authRedirectAllowed = client.redirectUris.indexOf(req.query.redirect_uri) != -1;

        log('Client is ' + client.applicationName);

        //Get user
        if (req.authUserId != null) {
          userModel.getUserById(req.authUserId, function (err, user) {
            if (err || user == null ) {
              err('Unable to find logged client');
              next(err);
            }
            else {
              req.authUser = user;
              log('User ' + user.firstName + '(' + user._id + ') logged');
              next();
            }
          });
        }
        else {
          log('User not logged');
          next();
        }
      }
    });
  }
}

module.exports = handleAuthorizationRequest;