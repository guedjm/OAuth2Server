var config = require('../config');
var database = require('./database');

var vhost = require('vhost');
var express = require('express');
var http = require('http');

var log = require('debug')('app:start');
var err = require('debug')('app:start:error');

database.initializeDatabaseConnection();

var app = require('../app/app.js');

if (config.server.vhost) {
  log('Initializing vhost ...');
  var exp = express();
  exp.use(vhost(config.server.url, app));
  log('Done');
}

log('Initializing Http server ...');

var httpServer;
if (config.server.vhost) {
  httpServer = http.createServer(exp);
}
else {
  httpServer = http.createServer(app);
}
httpServer.on('error', onError);
httpServer.on('listening', onStated);
httpServer.listen(config.server.port);


function onStated() {
  log('Server started on port ' + config.server.port);
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = 'Port ' + config.server.port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      err(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      err(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}