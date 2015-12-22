var mongoose = require('mongoose');
var sha1 = require('sha1');
var log = require('debug')('app:model:auth:accessToken');

var accessTokenSchema = new mongoose.Schema({
  requestId: {type: mongoose.Schema.Types.ObjectId, ref: 'AuthAccessTokenRequest'},
  accessId: {type: mongoose.Schema.Types.ObjectId, ref: 'AuthAccess'},
  token: String,
  usable: Boolean,
  deliveryDate: Date,
  expirationDate: Date
});

accessTokenSchema.statics.createToken = function (requestId, accessId, cb) {
  var now = new Date();
  var expirationDate = new Date();
  expirationDate.setDate(now.getDate() + 1);
  
  accessTokenModel.create({
    requestId: requestId,
    accessId: accessId,
    token : sha1(requestId + now.toString() + requestId),
    usable: true,
    deliveryDate: now,
    expirationDate: expirationDate
  }, cb);
};

accessTokenSchema.statics.getTokenById = function (tokenId, cb) {
  accessTokenModel.findOne({_id: tokenId}, cb);
};

accessTokenSchema.statics.deleteAll = function (cb) {
  accessTokenModel.remove({}, function (err) {
    if (!err) {
      log('Collection dropped');
    }
    cb(err);
  });
};


accessTokenSchema.methods.condemn = function (cb) {
  log('Condemning accessToken ...');
  this.usable = false;
  this.save(function (err) {
    cb(err);
  });
};

var accessTokenModel = mongoose.model('AuthAccessToken', accessTokenSchema);

module.exports = accessTokenModel;
