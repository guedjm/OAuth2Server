var mongoose = require('mongoose');
var log = require('debug')('app:model:auth:authorizationRequest');

var authorizationRequestSchema = new mongoose.Schema({
  responseType: String,
  clientId: String,
  redirectUri: String,
  scope: String,
  state: String,
  origin: String,
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  date: Date
});

authorizationRequestSchema.statics.createAuthorizationRequest = function (responseType, clientId, redirectUri, scope, state, userId, origin, cb) {
  var now = new Date();
  authorizationRequestModel.create({
    responseType: responseType,
    clientId: clientId,
    redirectUri: redirectUri,
    scope: scope,
    state: state,
    userId: userId,
    origin: origin,
    date: now
  }, cb);
};

authorizationRequestSchema.statics.getRequest = function (requestId, cb) {
  authorizationRequestModel.findOne({
    _id: requestId
  }, cb);
};

authorizationRequestSchema.statics.deleteAll = function (cb) {
  authorizationRequestModel.remove({}, function (err) {
    if (!err) {
      log('Collection dropped');
    }
    cb(err);
  });
};

var authorizationRequestModel = mongoose.model('AuthAuthorizationRequest', authorizationRequestSchema);

module.exports = authorizationRequestModel;