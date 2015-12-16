var config = require('../config');
var mongoose = require('mongoose');
var log = require('debug')('app:database');
var err = require('debug')('app:database:error');

var initializeDatabaseConnection = function () {

  log('Initializing database connection ...');

  mongoose.connection.on('open', function() {
    log('Database connection initialized');
  });

  mongoose.connection.on('error', function () {
    err('Cannot connect to database ...');
    process.exit(1);
  });

  mongoose.connect('mongodb://' + config.database.server + ':' + config.database.port + '/' + config.database.database);
};

module.exports.initializeDatabaseConnection = initializeDatabaseConnection;