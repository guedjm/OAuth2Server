var config = require('../config');
var express = require('express');

var info = require('debug')('auth:info');
var err = require('debug')('auth:error');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();

//Setting render engine
app.set('views', './app/view');
app.set('view engine', 'jade');

//Setting middleware
app.use(express.static('./app/public/'));
app.use(session({secret: config.server.session_secret, resave: true, saveUninitialized: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Routes
var login = require('./route/login');
var authorize = require('./route/authorize');

app.use('/v1/oauth2/login', login);
app.use('/v1/oauth2/authorize', authorize);

// 404 error
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//Error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send();
});

module.exports = app;