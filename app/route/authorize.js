var express = require('express');
var router = express.Router();
var authorizeErrorHandler = require('../core/authorizeErrorHandler');
var authorizationCodeGrant = require('../core/authorizationCodeGrant');


router.get('', function(req, res, next) {
  var supportedMethod = ['code'];

  //If arguments are missing -> error
  if (req.authRedirectAllowed == false || req.query.response_type == undefined) {
    authorizeErrorHandler.handleAuthorizationError(req, res, 'invalid_request', next);
  }
  else {
    //If method is not supported -> error
    if (supportedMethod.indexOf(req.query.response_type) == -1) {
      authorizeErrorHandler.handleAuthorizationError(req, res, 'unsupported_response_type', next);
    }
    else {
      //Handle each response_type
      switch (req.query.response_type) {
        case 'code':
          authorizationCodeGrant.authorizationCodeGrant(req, res, next);
          break;

        default:
          authorizeErrorHandler.handleAuthorizationError(req, res, 'unsupported_response_type', next);
      }
    }

  }


  //res.render('authorize', {fname: 'Maxime', lname: 'Guedj', api: 'Facebook'});
});

module.exports = router;