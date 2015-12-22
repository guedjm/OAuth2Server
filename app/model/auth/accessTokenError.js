var mongoose = require('mongoose');
var log = require('debug')('app:model:auth:accessTokenError');

var accessTokenErrorSchema = new mongoose.Schema({
  requestId: {type: mongoose.Schema.Types.ObjectId, ref: 'AuthTokenRequest'},
  error: String
});

accessTokenErrorSchema.statics.createError = function (accessTokenRequest, error, cb) {
  accessTokenErrorModel.create({
    requestId: accessTokenRequest._id,
    error: error
  }, cb)
};

accessTokenErrorSchema.statics.deleteAll = function (cb) {
  accessTokenErrorModel.remove({}, function (err) {
    if (!err) {
      log('Collection dropped');
    }
    cb(err);
  });
};

var accessTokenErrorModel = mongoose.model('AuthAccessTokenError', accessTokenErrorSchema);

module.exports = accessTokenErrorModel;