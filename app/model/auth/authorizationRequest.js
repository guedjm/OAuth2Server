var mongoose = require('mongoose');

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

var authorizationRequestModel = mongoose.model('AuthorizationRequest', authorizationRequestSchema);

module.exports = authorizationRequestModel;