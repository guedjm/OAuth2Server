var querystring = require('querystring');
var log = require('debug')('app:core:accessTokenErrorHandler');
var accessTokenErrorModel = require('../model/auth/accessTokenError');

/**
 * Handle error on authorize route (log + redirect)
 * @param req
 * @param res
 * @param error
 * @param next
 */
function handleAccessTokenError(req, res, error) {
  accessTokenErrorModel.createError(req.authRequest, error, function(err, row) {
  });

  log('Error processing request : ' + error);

  res.status(400).send({error: error});
}

module.exports.handleAccessTokenError = handleAccessTokenError;