var mongoose = require('mongoose');

var accessTokenErrorSchema = new mongoose.Schema({
  requestId: {type: mongoose.Schema.Types.ObjectId, ref: 'TokenRequest'},
  error: String
});

accessTokenErrorSchema.statics.createError = function (accessTokenRequest, error, cb) {
  accessTokenErrorModel.create({
    requestId: accessTokenRequest._id,
    error: error
  }, cb)
};

var accessTokenErrorModel = mongoose.model('AccessTokenError', accessTokenErrorSchema);

module.exports = accessTokenErrorModel;