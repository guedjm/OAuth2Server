var config = require('../../config');
var request = require('request');
var expect = require('chai').expect;

describe('Basic test', function() {
  it('Should respond to /ping url', function (done) {
    request.get(config.server.fullUrl + '/ping', function (err, res, body) {
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.equal('pong');
      done();
    });
  });
});