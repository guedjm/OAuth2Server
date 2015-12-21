var request = require('request');
var expect = require('chai').expect;

describe('Auth server', function () {

  before(function () {
    require('../bin/start');
  });

  require('./basic/basicTests');
  require('./authorizationCodeGrant/tests');
});