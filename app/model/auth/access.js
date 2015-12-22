var mongoose = require('mongoose');
var log = require('debug')('app:model:auth:access');
var logErr = require('debug')('app:model:auth:access:error');
var accessTokenModel = require('./accessToken');
var refreshTokenModel = require('./refreshToken');
var authorizationCodeModel = require('./authorizationCode');

var  accessSchema = new mongoose.Schema({
  clientId: {type: mongoose.Schema.Types.ObjectId, ref: 'Client'},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  grantType: String,
  scope: String,
  currentAccessTokenId: {type: mongoose.Schema.Types.ObjectId, ref: 'AccessToken'},
  currentRefreshTokenId: {type: mongoose.Schema.Types.ObjectId, ref: 'RefreshToken'},
  deliveryDate: Date,
  revoked: Boolean,
  revokeDate: Date
});

accessSchema.statics.getExistingAccess = function (userId, clientId, scope, cb) {
  accessModel.findOne({
    clientId: clientId,
    userId: userId,
    scope: scope,
    revoked: false
  }, cb);
};

accessSchema.statics.createNewAccessCodeGrant = function (authRequest, clientId, userId, cb) {

   var accessObj = {
     clientId: clientId,
     userId: userId,
     scope: authRequest.scope,
     grantType: 'code',
     currentAccessTokenId: null,
     currentRefreshTokenId: null,
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

accessSchema.statics.createNewAccessFromCodeGrant = function (requestId, code, cb) {

  //Set Code as used
  code.useCode(function (err) {
    if (err) {
      return cb(err, null, null, null);
    }

    console.log("Code used");
    //Create access
    accessModel.create({
      clientId: code.clientId,
      userId: code.userId,
      scope: code.scope,
      currentAccessTokenId: null,
      currentRefreshTokenId: null,
      deliveryDate: new Date(),
      revoked: false
    }, function (err, access) {

      if (err) {
        return cb(err, null, null, null);
      }

      console.log('access created');
      //Create token
      accessTokenModel.createFromCode(requestId, access._id, function(err, token) {
        if (err) {
          return cb(err, null, null, null);
        }

        console.log('token created');
        //Create refresh token
        refreshTokenModel.createNewRefreshToken(requestId, access._id, function(err, refreshToken) {
          if (err) {
            return cb(err, null, null, null);
          }

          console.log("refresh token crated");
          //Update access
          access.currentAccessTokenId = token._id;
          access.currentRefreshTokenId = refreshToken._id;
          access.save(function(err) {
            if (err) {
              return cb(err, null, null, null);
            }
            console.log('access updated');

            //return
            return cb(null, access, token, refreshToken);
          });
        });
      });
    });
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

  if (access.currentAccessTokenId != null) {
    //Condemn access token
    accessTokenModel.getTokenById(access.currentAccessTokenId, function (err, accessToken) {
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
            if (access.currentRefreshTokenId != null) {

              //Condemn refresh token
              refreshTokenModel.getTokenById(access.currentRefreshTokenId, function (err, refreshToken) {
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

accessSchema.methods.renewTokens = function (requestId, cb) {
  var access = this;
  accessTokenModel.findOne({_id: this.currentAccessTokenId}, function (err, oldAccessToken) {
    if (err || oldAccessToken == undefined) {
      cb(err, null, null);
    }
    else {
      oldAccessToken.condemn(function (err) {
        if (err) {
          cb(err, null, null);
        }
        else {
          console.log('oldToken condemn');
          accessTokenModel.createFromCode(requestId, oldAccessToken.accessId, function (err, accessToken) {
            if (err || accessToken == undefined) {
              cb(err, null, null);
            }
            else {
              console.log('new token created');
              refreshTokenModel.findOne({_id: access.currentRefreshTokenId}, function (err, oldRefreshToken) {
                if (err || oldRefreshToken == undefined) {
                  cb(err, null, null);
                }
                else {
                  oldRefreshToken.condemn(function (err){
                    if (err) {
                      cb(err, null, null);
                      console.log('refreshToken condemn');
                    }
                    else {
                      refreshTokenModel.createNewRefreshToken(requestId, oldRefreshToken.accessId, function (err, refreshToken) {
                        if (err || refreshToken == undefined) {
                          cb(err, null, null);
                        }
                        else {
                          console.log('new refreshToken created');
                          access.currentAccessTokenId = accessToken._id;
                          access.currentRefreshTokenId = refreshToken._id;
                          access.save(function (err) {
                            if (err) {
                              cb(err, null, null);
                            }
                            else {
                              cb(null, accessToken, refreshToken);
                            }
                          });
                        }
                      });
                    }
                  });
                }
              })
            }
          });
        }
      })
    }
  });
};

accessSchema.methods.generateTokens = function (request, cb) {

  var access = this;
  log('Generating tokens ...');

  accessTokenModel.createToken(request._id, access._id, function (err, token) {
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
          access.currentAccessTokenId = token._id;
          access.currentRefreshTokenId = refreshToken._id;
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

var accessModel = mongoose.model('Access', accessSchema);

module.exports = accessModel;