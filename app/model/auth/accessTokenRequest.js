var mongoose = require('mongoose');
var log = require('debug')('app:model:auth:accessTokenRequest');

var accessTokenRequestSchema = new mongoose.Schema({
  grantType: String,
  authorizationCode: String, // For Authorization Code Grant
  username: String, // For Resource Owner Password Credentials Grant
  password: String, // For Resource Owner Password Credentials Grant
  scope: String, // For Resource Owner Password Credentials Grant
  refreshToken: String, // For Refresh Token Grant
  redirectUri: String,
  clientId: String,
  clientSecret: String,
  origin: String,
  date: Date
});

accessTokenRequestSchema.statics.createCodeGrant = function(authorizationCode, redirectUri, clientId, clientSecret, origin, cb) {
  var now = new Date();
  accessTokenRequestModel.create({
    grantType: 'authorization_code',
    authorizationCode: authorizationCode,
    username: null,
    password: null,
    scope: null,
    refreshToken: null,
    redirectUri: redirectUri,
    clientId: clientId,
    clientSecret: clientSecret,
    origin: origin,
    date: now
  }, cb);
};

accessTokenRequestSchema.statics.createPasswordGrant = function(username, password, scope, clientSecret, origin, cb) {
  var now = new Date();
  accessTokenRequestModel.create({
    grantType: 'password',
    authorizationCode: null,
    username: username,
    password: password,
    scope: scope,
    refreshToken: null,
    redirectUri: null,
    clientId: null,
    clientSecret: clientSecret,
    origin: origin,
    date: now
  }, cb);
};

accessTokenRequestSchema.statics.createClientCredentialGrant = function(scope, clientSecret, origin, cb) {
  var now = new Date();
  accessTokenRequestModel.create({
    grantType: 'client_credential',
    authorizationCode: null,
    username: null,
    password: null,
    scope: null,
    refreshToken: null,
    redirectUri: null,
    clientId: null,
    clientSecret: clientSecret,
    origin: origin,
    date: now
  }, cb);
};

accessTokenRequestSchema.statics.createRefreshTokenGrant = function(refreshToken, scope, clientSecret, origin, cb) {
  var now = new Date();
  accessTokenRequestModel.create({
    grantType: 'refreshToken',
    authorizationCode: null,
    username: null,
    password: null,
    scope: null,
    refreshToken: refreshToken,
    redirectUri: null,
    clientId: null,
    clientSecret: clientSecret,
    origin: origin,
    date: now
  }, cb);
};

accessTokenRequestSchema.statics.createRequest = function (grantType, authorizationCode, username, password, scope,
                                                           refreshToken, redirectUri, clientId, clientSecret, origin, cb) {

  var now = new Date();
  accessTokenRequestModel.create({
    grantType: grantType,
    authorizationCode: authorizationCode,
    username: username,
    password: password,
    scope: scope,
    refreshToken: refreshToken,
    redirectUri: redirectUri,
    clientId: clientId,
    clientSecret: clientSecret,
    origin: origin,
    date: now
  }, cb);
};

accessTokenRequestSchema.statics.deleteAll = function (cb) {
  accessTokenRequestModel.remove({}, function (err) {
    if (!err) {
      log('Collection dropped');
    }
    cb(err);
  });
};

var accessTokenRequestModel = mongoose.model('AuthAccessTokenRequest', accessTokenRequestSchema);

module.exports = accessTokenRequestModel;