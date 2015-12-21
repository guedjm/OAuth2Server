var config = require('../../config');
var request = require('request');
var expect = require('chai').expect;
var querystring = require('querystring');
var authorizeUrl = config.server.fullUrl + '/v1/oauth2/authorize';
var loginUrl = '/v1/oauth2/login';


describe('Authorization route :  /v1/oauth2/authorize', function () {

  it('Should return a 404 error when missing parameters', function (done) {
   request.get(authorizeUrl, function (err, res, body) {
     expect(res.statusCode).to.equal(404);
     done();
   });
  });

   it('Should return a 404 error when wrong client_id', function (done) {

     var param = {
       response_type: 'code',
       client_id: '4a593f6f67d86099264e5f00e30de8fb4c95f181',
       redirect_uri: config.test.client.client_redirect_uri
     };

     var uri = authorizeUrl + '?' + querystring.stringify(param);
     request.get(uri, function (err, res, body) {
       expect(res.statusCode).to.equal(404);
       done();
     });
   });

   it('Should return a 404 error when wrong redirect_uri with client_id', function (done) {

     var param = {
       response_type: 'code',
       client_id: config.test.client.client_id,
       redirect_uri: 'http://google.frr'
     };

     var uri = authorizeUrl + '?' + querystring.stringify(param);
     request.get(uri, function (err, res, body) {
       expect(res.statusCode).to.equal(404);
       done();
     });
   });


  it('Should redirect to client when scope missing', function (done) {

    var param = {
     response_type: 'code',
     client_id: config.test.client.client_id,
     redirect_uri: config.test.client.client_redirect_uri
    };

    var uri = authorizeUrl + '?' + querystring.stringify(param);
    var expectedRedirect = config.test.client.client_redirect_uri + '?error=invalid_request';
    request.get({url: uri, followRedirect: false}, function (err, res, body) {
     expect(res.statusCode).to.equal(302);
     expect(res.headers['location']).to.equal(expectedRedirect);
     done();
    });
  });

  it('Should redirect to login form when user not logged', function (done) {

    var param = {
      response_type: 'code',
      client_id: config.test.client.client_id,
      redirect_uri: config.test.client.client_redirect_uri,
      scope: 'all'
    };

    var uri = authorizeUrl + '?' + querystring.stringify(param);
    request.get({
      url: uri,
      followRedirect: false
    }, function (err, res, body) {
      expect(res.statusCode).to.equal(302);
      expect(res.headers['location']).to.contain(loginUrl);

      done();
    });
  });
});