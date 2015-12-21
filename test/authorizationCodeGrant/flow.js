var config = require('../../config');
var request = require('request');
var expect = require('chai').expect;
var querystring = require('querystring');
var cheerio = require('cheerio');
var authorizeUrl = '/v1/oauth2/authorize';
var loginUrl = '/v1/oauth2/login';
var tokenUrl = '/v1/oauth2/token';

var aUrl;
var lUrl;
var reqJar;
var authReqId;
var code;

describe('Complete Flow', function () {

  it('Should redirect to login form when user not logged', function (done) {

    var param = {
      response_type: 'code',
      client_id: config.test.client.client_id,
      redirect_uri: config.test.client.client_redirect_uri,
      scope: 'all'
    };
    aUrl = config.server.fullUrl + authorizeUrl + '?' + querystring.stringify(param);
    reqJar = request.jar();
    request.get({
      url: aUrl,
      followRedirect: false,
      jar: reqJar
    }, function (err, res, body) {
      expect(res.statusCode).to.equal(302);
      expect(res.headers['location']).to.contain(loginUrl);
      lUrl = res.headers['location'];

      done();
    });
  });

  it('Should display login form', function (done) {

    request.get({
      url : config.server.fullUrl + lUrl,
      jar: reqJar
    }, function (err, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Should redirect to authorize form when user is logged', function (done) {

    request.post({
      url: config.server.fullUrl + lUrl,
      followRedirect: false,
      form: {
        email: config.test.user.email,
        password: config.test.user.password
      },
      jar: reqJar
    }, function (err, res, body) {
      expect(res.statusCode).to.equal(302);
      expect(res.headers['location']).to.contain(authorizeUrl);

      done();
    });
  });

  it('Should display authorize form', function (done) {

    request.get({
      url: aUrl,
      followRedirect: false,
      jar: reqJar
    }, function (err, res, body) {
      expect(res.statusCode).to.equal(200);

      var $ = cheerio.load(body);
      authReqId = $('input[name=reqId]').attr('value');
      done();
    });
  });

  it('Should redirect user back to client when validating authorization form and give authorization code', function (done) {

    request.post({
      url: aUrl,
      followRedirect: false,
      jar: reqJar,
      form: {
        allow: true,
        reqId: authReqId
      }
    }, function (err, res, body) {
      expect(res.statusCode).to.equal(302);
      expect(res.headers['location']).to.contain(config.test.client.client_redirect_uri);

      var fullUrl = res.headers['location'];
      var q = fullUrl.replace(config.test.client.client_redirect_uri + '?', '');
      var query = querystring.parse(q);
      code = query.code;
      expect(code).to.not.be.undefined;
      done();
    });
  });

  it('Should provide an access/refresh token when offering authorization code', function (done) {

    request.post({
      url: config.server.fullUrl + tokenUrl,
      form: {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: config.test.client.client_redirect_uri,
        client_id: config.test.client.client_id
      },
      headers: {
        Authorization: 'Basic ' + config.test.client.client_secret
      }
    }, function (err, res, body) {
      expect(res.statusCode).to.equal(200);

      var reply = JSON.parse(body);
      expect(reply.access_token).to.not.be.undefined;
      expect(reply.refresh_token).to.not.be.undefined;
      expect(reply.expire_in).to.not.be.undefined;
      expect(reply.token_type).to.equal('bearer');

      done();
    });
  });

});