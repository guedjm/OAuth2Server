var config = require('../config');
var database = require('./database');

var accessModel = require('../app/model/auth/access');
var accessTokenModel = require('../app/model/auth/accessToken');
var accessTokenErrorModel = require('../app/model/auth/accessTokenError');
var accessTokenRequestModel = require('../app/model/auth/accessTokenRequest');
var authorizationCodeModel = require('../app/model/auth/authorizationCode');
var authorizationErrorModel = require('../app/model/auth/authorizationError');
var authorizationRequestModel = require('../app/model/auth/authorizationRequest');
var refreshTokenModel = require('../app/model/auth/refreshToken');


var log = require('debug')('app:admin');
var err = require('debug')('app:admin:error');

function purge() {
  log('Purging database');

  accessModel.deleteAll(function (err) {
    accessTokenModel.deleteAll(function (err) {
      accessTokenErrorModel.deleteAll(function (err) {
        accessTokenRequestModel.deleteAll(function (err) {
          authorizationCodeModel.deleteAll(function (err) {
            authorizationErrorModel.deleteAll(function (err) {
              authorizationRequestModel.deleteAll(function (err) {
                refreshTokenModel.deleteAll(function (err) {
                  log('Done');
                  process.exit();
                });
              });
            });
          });
        });
      });
    });
  });
}

function admin() {

  var availableCmd = ['purge'];
  var cmd = process.argv[2];

  if (cmd == undefined || availableCmd.indexOf(cmd) == -1) {
    console.log('Invalid command');
    process.exit(1);
  }
  else {
    database.initializeDatabaseConnection();

    switch (cmd) {
      case 'purge':
        purge();
        break;

      default :
        console.log('Invalid command');
    }
  }
}


admin();