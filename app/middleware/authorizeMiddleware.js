var authorizeRequestModel = require('../model/auth/authorizationRequest');
var clientModel = require('../model/client');

/**
 * This middleware is called on every request on the authorizeRoute
 * @param req
 * @param res
 * @param next
 */
function handleAuthorizationRequest(req, res, next) {


  req.authRedirectAllowed = false;
  req.authUserId = (req.session == undefined) ? null : req.session.userId;

  //If its a GET, log the request
  if (req.method == 'GET') {
      authorizeRequestModel.createAuthorizationRequest(req.query.response_type, req.query.client_id,
        req.query.redirect_uri, req.query.scope, req.query.state, req.authUserId, req.ip, function (errRequest, request) {
          req.authRequest = request;
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
    next();
  }
  else {

    //Get client
    clientModel.getActivatedClient(req.query.client_id, function (errClient, client) {
      if (errClient || client == undefined) {
        next();
      }
      else {
        req.authClient = client;
        req.authRedirectAllowed = client.redirectUris.indexOf(req.query.redirect_uri) != -1;
        next();
      }
    });
  }
}

module.exports = handleAuthorizationRequest;