var config = require('../../config');
var request = require('request');
var expect = require('chai').expect;
var querystring = require('querystring');
var cheerio = require('cheerio');

var loginUrl = config.server.fullUrl + '/v1/oauth2/login';
var reqJar;


describe('Login route : /v1/oauth2/login', function () {

  it('Should display login form', function (done) {

    reqJar = request.jar();

    var param = {
      response_type: 'code',
      client_id: config.test.client.client_id,
      redirect_uri: config.test.client.client_redirect_uri,
      scope: 'all'
    };
    loginUrl += '?' + querystring.stringify(param);

    request.get({
      url : loginUrl,
      jar: reqJar
    }, function (err, res, body) {

      expect(res.statusCode).to.equal(200);

      var $ = cheerio.load(body);
      expect($('form')).to.not.be.undefined;

      done();
    });
  });

  it('Should display login form when validating empty form', function (done) {

    request.post({
      url: loginUrl,
      jar: reqJar,
      form: {},
      followRedirect: false
    }, function (err, res, body) {

      expect(res.statusCode).to.equal(200);

      var $ = cheerio.load(body);
      expect($('form')).to.not.be.undefined;

      done();
    });
  });

  it('Should display login form when validating bad credentials', function (done) {

    request.post({
      url: loginUrl,
      jar: reqJar,
      form: {
        email: config.test.user.email,
        password: config.test.user.password + 'w'
      },
      followRedirect: false
    }, function (err, res, body) {

      expect(res.statusCode).to.equal(200);

      var $ = cheerio.load(body);
      expect($('form')).to.not.be.undefined;

      done();
    });
  });

  it('Should re to authorize form when validating good credentials', function (done) {

    request.post({
      url: loginUrl,
      jar: reqJar,
      form: {
        email: config.test.user.email,
        password: config.test.user.password
      },
      followRedirect: false
    }, function (err, res, body) {

      expect(res.statusCode).to.equal(302);
      expect(res.headers['location']).to.contain('/v1/oauth2/authorize');

      done();
    });
  });

});