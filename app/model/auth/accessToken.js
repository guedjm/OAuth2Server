var mongoose = require('mongoose');
var sha1 = require('sha1');

var accessTokenSchema = new mongoose.Schema({
  requestId: {type: mongoose.Schema.Types.ObjectId, ref: 'AccessTokenRequest'},
  accessId: {type: mongoose.Schema.Types.ObjectId, ref: 'Access'},
  grantType: String,
  token: String,
  usable: Boolean,
  deliveryDate: Date,
  expirationDate: Date
});

accessTokenSchema.statics.createFromCode = function (requestId, accessId, cb) {
  var now = new Date();
  var expirationDate = new Date();
  expirationDate.setDate(now.getDate() + 1);
  
  accessTokenModel.create({
    requestId: requestId,
    accessId: accessId,
    grantType: 'code',
    token : sha1(requestId + now.toString() + requestId),
    usable: true,
    deliveryDate: now,
    expirationDate: expirationDate
  }, cb);
};

accessTokenSchema.methods.condemn = function (cb) {
  this.usable = false;
  this.save(function (err) {
    cb(err);
  });
};

var accessTokenModel = mongoose.model('AccessToken', accessTokenSchema);

module.exports = accessTokenModel;
