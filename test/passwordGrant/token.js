var config = require('../../config');
var request = require('request');
var expect = require('chai').expect;
var querystring = require('querystring');
var tokenUrl = config.server.fullUrl + '/v1/oauth2/token';
var tUrl = '/v1/oauth2/token';

describe('Token route :  /v1/oauth2/token', function () {

  it('Should return a 404 error on get', function (done) {

    request.get(tokenUrl, function (err, res, body) {
      expect(res.statusCode).to.equal(404);
      done();
    });
  });


  it('Should return a 400 error when posting invalid grant_type', function (done) {

    request.post({
      url: tokenUrl,
      form: {
        grant_type: 'passwordd',
        username: config.test.user.email,
        password: config.test.user.password,
        scope: 'all'
      },
      headers: {
        Authorization: 'Basic ' + config.test.client.client_secret
      }
    }, function (err, res, body) {
      expect(res.statusCode).to.equal(400);

      var result = JSON.parse(body);
      expect(result.error).to.not.be.undefined;
      expect(result.error).to.equal('unsupported_grant_type');

      done();
    });
  });

  it('Should return a 400 error when posting without Authorization header', function (done) {

    request.post({
      url: tokenUrl,
      form: {
        grant_type: 'password',
        username: config.test.user.email,
        password: config.test.user.password,
        scope: 'all'
      }
    }, function (err, res, body) {
      expect(res.statusCode).to.equal(400);

      var result = JSON.parse(body);
      expect(result.error).to.not.be.undefined;
      expect(result.error).to.equal('invalid_client');

      done();
    });
  });

  it('Should return a 400 error when posting without username', function (done) {

    request.post({
      url: tokenUrl,
      form: {
        grant_type: 'password',
        password: config.test.user.password,
        scope: 'all'
      },
      headers: {
        Authorization: 'Basic ' + config.test.client.client_secret
      }
    }, function (err, res, body) {
      expect(res.statusCode).to.equal(400);

      var result = JSON.parse(body);
      expect(result.error).to.not.be.undefined;
      expect(result.error).to.equal('invalid_request');

      done();
    });
  });

  it('Should return a 400 error when posting without password', function (done) {

    request.post({
      url: tokenUrl,
      form: {
        grant_type: 'password',
        username: config.test.user.email,
        scope: 'all'
      },
      headers: {
        Authorization: 'Basic ' + config.test.client.client_secret
      }
    }, function (err, res, body) {
      expect(res.statusCode).to.equal(400);

      var result = JSON.parse(body);
      expect(result.error).to.not.be.undefined;
      expect(result.error).to.equal('invalid_request');

      done();
    });
  });

  it('Should return a 400 error when posting without scope', function (done) {

    request.post({
      url: tokenUrl,
      form: {
        grant_type: 'password',
        username: config.test.user.email,
        password: config.test.user.password
      },
      headers: {
        Authorization: 'Basic ' + config.test.client.client_secret
      }
    }, function (err, res, body) {
      expect(res.statusCode).to.equal(400);

      var result = JSON.parse(body);
      expect(result.error).to.not.be.undefined;
      expect(result.error).to.equal('invalid_request');

      done();
    });
  });

  it('Should return a 400 error when posting with invalid client secret', function (done) {

    request.post({
      url: tokenUrl,
      form: {
        grant_type: 'password',
        username: config.test.user.email,
        password: config.test.user.password,
        scope: 'all'
      },
      headers: {
        Authorization: 'Basic ' + config.test.client.client_secret + 'j'
      }
    }, function (err, res, body) {
      expect(res.statusCode).to.equal(400);

      var result = JSON.parse(body);
      expect(result.error).to.not.be.undefined;
      expect(result.error).to.equal('invalid_client');

      done();
    });
  });


  it('Should return a 400 error when posting with invalid credentials', function (done) {

    request.post({
      url: tokenUrl,
      form: {
        grant_type: 'password',
        username: config.test.user.email,
        password: config.test.user.password + 'y',
        scope: 'all'
      },
      headers: {
        Authorization: 'Basic ' + config.test.client.client_secret
      }
    }, function (err, res, body) {
      expect(res.statusCode).to.equal(400);

      var result = JSON.parse(body);
      expect(result.error).to.not.be.undefined;
      expect(result.error).to.equal('invalid_grant');

      done();
    });
  });
});
