var config = require('../config');
var mongoose = require('mongoose');
var info = require('debug')('auth:info');
var err = require('debug')('auth:error');

var initializeDatabaseConnection = function () {

  info('Initializing database connection ...');

  mongoose.connection.on('open', function() {
    info('Database connection initialized');
  });

  mongoose.connection.on('error', function () {
    err('Cannot connect to database ...');
    process.exit(1);
  });

  mongoose.connect('mongodb://' + config.database.server + ':' + config.database.port + '/' + config.database.database);
};

module.exports.initializeDatabaseConnection = initializeDatabaseConnection;