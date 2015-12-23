var mongoose = require('mongoose');
var log = require('debug')('app:model:auth:access');
var logErr = require('debug')('app:model:auth:access:error');
var accessTokenModel = require('./accessToken');
var refreshTokenModel = require('./refreshToken');
var authorizationCodeModel = require('./authorizationCode');

var  accessSchema = new mongoose.Schema({
  client: {type: mongoose.Schema.Types.ObjectId, ref: 'Client'},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  grantType: String,
  scope: String,
  currentAccessToken: {type: mongoose.Schema.Types.ObjectId, ref: 'AuthAccessToken'},
  currentRefreshToken: {type: mongoose.Schema.Types.ObjectId, ref: 'AuthRefreshToken'},
  deliveryDate: Date,
  revoked: Boolean,
  revokeDate: Date
});

accessSchema.statics.getExistingAccess = function (userId, clientId, scope, cb) {
  accessModel.findOne({
    client: clientId,
    user: userId,
    scope: scope,
    revoked: false
  }, cb);
};

accessSchema.statics.createNewAccessCodeGrant = function (authRequest, clientId, userId, cb) {

   var accessObj = {
     client: clientId,
     user: userId,
     scope: authRequest.scope,
     grantType: 'code',
     currentAccessToken: null,
     currentRefreshToken: null,
     deliveryDate: new Date(),
     revoked: false,
     revokeDate: null
   };

  accessModel.create(accessObj, function(err, access) {
    if (err) {
      logErr('Unable to create access');
      cb(err, null, null);
    }
    else {

      log('Access created for client : ' + clientId + ' user : ' + userId + ' scope : ' + authRequest.scope);

      //Create code
      authorizationCodeModel.createCodeFromAccess(authRequest, access, function (err, code) {
        if (err) {
          logErr('Unable to create code');
          cb(err, null, null);
        }
        else {

          log('Code created : ' + code.code);
          cb(null, access, code);
        }
      });
    }
  });
};

accessSchema.statics.createNewAccessPasswordGrant = function (authRequest, clientId, userId, scope, cb) {

  var accessObj = {
    client: clientId,
    user: userId,
    scope: scope,
    grantType: 'password',
    currentAccessToken: null,
    currentRefreshToken: null,
    deliveryDate: new Date(),
    revoked: false,
    revokeDate: null
  };

  accessModel.create(accessObj, function(err, access) {
    if (err) {
      logErr('Unable to create access');
      cb(err, null, null, null);
    }
    else {

      log('Access created for client : ' + clientId + ' user : ' + userId + ' scope : ' + scope);

      access.generateTokens(authRequest, function (err, accessToken, refreshToken) {
        if (err) {
          logErr('Token generation failed');
          cb(err, null, null, null);
        }
        else {
          cb(null, access, accessToken, refreshToken);
        }
      });
    }
  });
};

accessSchema.statics.deleteAll = function (cb) {
  accessModel.remove({}, function (err) {
    if (!err) {
      log('Collection dropped');
    }
    cb(err);
  });
};

accessSchema.methods.revokeAccess = function (cb) {
  var access = this;

  if (access.currentAccessToken != null) {
    //Condemn access token
    accessTokenModel.getTokenById(access.currentAccessToken, function (err, accessToken) {
      if (err || accessToken == undefined) {
        logErr('Unable to retrieve accessToken');
        cb(err);
      }
      else {
        accessToken.condemn(function (err) {
          if (err) {
            logErr('Unable to update accessToken');
            cb(err);
          }
          else {
            if (access.currentRefreshToken != null) {

              //Condemn refresh token
              refreshTokenModel.getTokenById(access.currentRefreshToken, function (err, refreshToken) {
                if (err || accessToken == undefined) {
                  logErr('Unable to retrieve refreshToken');
                  cb(err);
                }
                else {
                  refreshToken.condemn(function (err) {

                    if (err) {
                      logErr('Unable to update accessToken');
                      cb(err);
                    }
                    else {
                      //Revoke access
                      log('Revoking access ...');
                      access.revoked = true;
                      access.revokeDate = new Date();
                      access.save(function (err) {
                        cb(err);
                      });
                    }
                  });
                }
              });
            }
            else {
              cb(null);
            }
          }
        });
      }
    });
  }
};

accessSchema.methods.generateTokens = function (request, cb) {

  var access = this;
  log('Generating tokens ...');

  accessTokenModel.createToken(request._id, access._id, access.user , access.client, function (err, token) {
    if (err) {
      logErr('Unable to create access token');
      cb(err, null, null);
    }
    else {

      log('Access token created : ' + token.token);

      refreshTokenModel.createToken(request._id, access._id, function (err, refreshToken) {
        if (err) {
          logErr('Unable to create refresh token');
          cb(err, null, null);
        }
        else {

          log('Refresh token created : ' + refreshToken.token);
          access.currentAccessToken = token._id;
          access.currentRefreshToken = refreshToken._id;
          access.save(function (err) {
            if (err) {
              logErr('Unable to update access');
              cb(err, null, null);
            }
            else {
              log('Access updated !');
              cb(null, token, refreshToken);
            }
          });
        }
      });
    }
  });
};

var accessModel = mongoose.model('AuthAccess', accessSchema);

module.exports = accessModel;