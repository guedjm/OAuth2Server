var mongoose = require('mongoose');
var sha1 = require('sha1');

var refreshTokenSchema = new mongoose.Schema({
  requestId: {type: mongoose.Schema.Types.ObjectId, ref: 'AccessTokenRequest'},
  accessId: {type: mongoose.Schema.Types.ObjectId, ref: 'Access'},
  token: String,
  used: Boolean,
  usable: Boolean,
  deliveryDate: Date,
  expirationDate: Date
});

refreshTokenSchema.statics.createNewRefreshToken = function (requestId, accessId, cb) {
  var now = new Date();
  var expirationDate = new Date();
  expirationDate.setMonth(now.getMonth() + 1);
  refreshTokenModel.create({
    requestId: requestId,
    accessId: accessId,
    token: sha1(accessId + now.toString() + accessId),
    used: false,
    usable: true,
    deliveryDate: now,
    expirationDate: expirationDate
  }, cb);
};

refreshTokenSchema.methods.condemn = function (cb) {
  this.usable = false;
  this.save(function (err) {
    cb(err);
  });
};

var refreshTokenModel = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = refreshTokenModel;