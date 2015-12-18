var express = require('express');
var router = express.Router();
var userModel = require('../model/user');
var querystring = require('querystring');
var log = require('debug')('app:route:login');
var errLog = require('debug')('app:route:login:error');


router.get('', function(req, res, next) {

  var session = req.session;

  log('Receive a login request : ' + req.method + ' ' + req.baseUrl + req.url);

  //If user is already logged, redirect to authorize
  if (session.authUserId != undefined) {
    log('User already logged in, redirecting to authorize page');
    res.redirect('/v1/oauth2/authorize?' + querystring.stringify(req.query));
  }
  else {
    log('Serving login form');
    res.render('login', {failed: false});
  }
});

router.post('', function (req, res, next) {
  var session = req.session;

  log('Receive a login request : ' + req.method + ' ' + req.baseUrl + req.url);

  //If user is already logged, redirect to authorize
  if (session.authUserId != undefined) {
    log('User already logged in, redirecting to authorize page');
    res.redirect('/v1/oauth2/authorize?' + querystring.stringify(req.query));
  }
  else if (req.body.email == undefined || req.body.password == undefined) {
    log('Incomplete post param, serving login form');
    res.render('login', {failed: true});
  }
  else {

    //Get user with email + password
    userModel.getUser(req.body.email, req.body.password, function (err, user) {
      if (err) {
        errLog('Unable to find user ...');
        next(err);
      }
      else if (user != null) {

        //User authenticated, set session & redirect
        log('User : ' + user.email + ' logged in, redirecting to authorize route');
        req.session.authUserId = user._id;
        res.redirect('/v1/oauth2/authorize?' + querystring.stringify(req.query));
      }
      else {
        log('User not found, login failed');
        log('Serving login form');
        res.render('login', {failed: true});
      }
    });
  }
});

module.exports = router;