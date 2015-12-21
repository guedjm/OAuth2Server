var config = require('../../config');
var request = require('request');
var expect = require('chai').expect;
var authorizeUrl = config.server.fullUrl + '/v1/oauth2/authorize';


describe('Basic', function () {

  describe('Route /v1/oauth2/authorize', function () {

    it ('Should return a 404 error when missing parameters', function (done) {
      request.get(authorizeUrl, function (err, res, body) {
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

    it('Should return a 404 error when wrong client_id', function (done) {
      request.get(authorizeUrl, function (err, res, body) {
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

  });
});