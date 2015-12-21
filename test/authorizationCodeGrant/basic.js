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
      var uri = authorizeUrl + '/?response_type=code&client_id=4a593f6f67d86099264e5f00e30de8fb4c95f181&redirect_uri=http%3A%2F%2Fgoogle.fr';
      request.get(uri, function (err, res, body) {
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

    it('Should return a 404 error when wrong redirect_uri with client_id', function (done) {
      var uri = authorizeUrl + '/?response_type=code&client_id=4a593f6f67d86099264e5f00e30de8fb4c95f182&redirect_uri=http%3A%2F%2Fgoogle.frr';
      request.get(uri, function (err, res, body) {
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

    it('Should redirect to client when scope missing', function (done) {
      var uri = authorizeUrl + '/?response_type=code&client_id=4a593f6f67d86099264e5f00e30de8fb4c95f182&redirect_uri=http%3A%2F%2Fgoogle.fr';
      var expectedRedirect = config.test.client.client_redirect_uri + '?error=invalid_request';
      request.get({url: uri, followRedirect: false} , function (err, res, body) {
        expect(res.statusCode).to.equal(302);
        expect(res.headers['location']).to.equal(expectedRedirect);
        done();
      });
    });



  });
});