var config = require('../config');
var express = require('express');

var info = require('debug')('auth:info');
var logErr = require('debug')('auth:error');
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

//Middleware
var authorizeMiddleware = require('./middleware/authorizeMiddleware');
var tokenMiddleware = require('./middleware/tokenMiddleware');

//Routes
var ping = require('./route/ping');
var login = require('./route/login');
var authorize = require('./route/authorize');
var token = require('./route/token');

app.use('/ping', ping);

app.use('/v1/oauth2/login', login);

app.use('/v1/oauth2/authorize', authorizeMiddleware);
app.use('/v1/oauth2/authorize', authorize);

app.use('/v1/oauth2/token', tokenMiddleware);
app.use('/v1/oauth2/token', token);

// 404 error
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//Error handler
app.use(function(err, req, res, next) {
  logErr(req.baseUrl);
  logErr(err.stack);
  res.status(err.status || 500);
  res.send();
});

module.exports = app;