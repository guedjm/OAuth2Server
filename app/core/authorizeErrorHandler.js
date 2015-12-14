var querystring = require('querystring');
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

  if (req.authRedirectAllowed == false) {
    next();
  }
  else {
    var errorQuerry = {error: error};
    if (req.query.state != undefined) {
      errorQuerry.state = req.query.state;
    }
    res.redirect(req.query.redirect_uri + '?' + querystring.stringify(errorQuerry));
  }
}

module.exports.handleAuthorizationError = handleAuthorizationError;