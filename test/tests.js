var server;

describe('Auth server', function () {

  before(function () {
    server = require('../bin/server');
    server.start();
  });

  require('./basic/basicTests');
  require('./authorizationCodeGrant/tests');
});