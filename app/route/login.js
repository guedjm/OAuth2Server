var express = require('express');
var router = express.Router();
var userModel = require('../model/user');
var querystring = require('querystring');

//TODO display error on form

router.get('', function(req, res, next) {

  var session = req.session;

  //If user is already logged, redirect to authorize
  if (session.authUserId != undefined) {
    res.redirect('/v1/oauth2/authorize?' + querystring.stringify(req.query));
  }
  else {
    res.render('login', {});
  }
});

router.post('', function (req, res, next) {
  var session = req.session;

  //If user is already logged, redirect to authorize
  if (session.authUserId != undefined) {
    res.redirect('/v1/oauth2/authorize?' + querystring.stringify(req.query));
  }
  else if (req.body.email == undefined || req.body.password == undefined) {
    res.render('login', {});
  }
  else {

    //Get user with email + password
    userModel.getUser(req.body.email, req.body.password, function (err, user) {
      if (err) {
        next(err);
      }
      else if (user != null) {

        //User authenticated, set session & redirect
        req.session.authUserId = user._id;
        res.redirect('/v1/oauth2/authorize?' + querystring.stringify(req.query));
      }
      else {
        res.render('login');
      }
    });
  }
});

module.exports = router;