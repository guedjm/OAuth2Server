var querystring = require('querystring');
var log = require('debug')('app:core:authorizeErrorHandler');
var authorizeErrorModel = require('../model/auth/authorizationError');

/**
 * Handle error on authorize route (log + redirect)
 * @param req
 * @param res
 * @param error
 * @param next
 */
function handleAuthorizationError(req, res, error, next) {
  authorizeErrorModel.createFromRequest(req.authRequest, error, function(err, row) {
  });

  log('Error processing request : ' + error);

  if (req.authRedirectAllowed == false) {
    next();
  }
  else {
    var errorQuerry = {error: error};
    if (req.query.state != undefined) {
      errorQuerry.state = req.query.state;
    }
    log('Redirecting user');
    res.redirect(req.query.redirect_uri + '?' + querystring.stringify(errorQuerry));
  }
}

module.exports.handleAuthorizationError = handleAuthorizationError;