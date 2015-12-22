var config = require('../../config');
var request = require('request');
var expect = require('chai').expect;
var querystring = require('querystring');
var tokenUrl = config.server.fullUrl + '/v1/oauth2/token';


describe('Complete Flow', function () {

  it('Should return a 200 status with access information', function (done) {

    request.post({
      url: tokenUrl,
      form: {
        grant_type: 'password',
        username: config.test.user.email,
        password: config.test.user.password,
        scope: 'all'
      },
      headers: {
        Authorization: 'Basic ' + config.test.client.client_secret
      }
    }, function (err, res, body) {
      expect(res.statusCode).to.equal(200);

      var result = JSON.parse(body);

      expect(result.access_token).to.not.be.undefined;
      expect(result.refresh_token).to.not.be.undefined;
      expect(result.expire_in).to.not.be.undefined;
      expect(result.token_type).to.equal('bearer');

      done();
    });
  });

});