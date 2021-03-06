var mongoose = require('mongoose');
var sha1 = require('sha1');
var log = require('debug')('app:model:auth:refreshToken');


var refreshTokenSchema = new mongoose.Schema({
  request: {type: mongoose.Schema.Types.ObjectId, ref: 'AuthAccessTokenRequest'},
  access: {type: mongoose.Schema.Types.ObjectId, ref: 'AuthAccess'},
  token: String,
  used: Boolean,
  usable: Boolean,
  deliveryDate: Date,
  expirationDate: Date
});

refreshTokenSchema.statics.createToken = function (requestId, accessId, cb) {
  var now = new Date();
  var expirationDate = new Date();
  expirationDate.setMonth(now.getMonth() + 1);

  refreshTokenModel.create({
    request: requestId,
    access: accessId,
    token: sha1(accessId + now.toString() + accessId),
    used: false,
    usable: true,
    deliveryDate: now,
    expirationDate: expirationDate
  }, cb);
};

refreshTokenSchema.statics.getTokenById = function (tokenId, cb) {
  refreshTokenModel.findOne({_id: tokenId}, cb);
};

refreshTokenSchema.methods.condemn = function (cb) {
  log('Condemning refreshToken ...');
  this.usable = false;
  this.save(function (err) {
    cb(err);
  });
};

refreshTokenSchema.statics.deleteAll = function (cb) {
  refreshTokenModel.remove({}, function (err) {
    if (!err) {
      log('Collection dropped');
    }
    cb(err);
  });
};

var refreshTokenModel = mongoose.model('AuthRefreshToken', refreshTokenSchema);

module.exports = refreshTokenModel;