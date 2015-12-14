var config = require('../../../config');
var mongoose = require('mongoose');
var sha1 = require('sha1');

var authorizationCodeSchemas = new mongoose.Schema({
  requestId: {type: mongoose.Schema.Types.ObjectId, ref: 'AuthorizationRequest'},
  clientId: {type: mongoose.Schema.Types.ObjectId, ref: 'Client'},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  accessId: {type: mongoose.Schema.Types.ObjectId, ref: 'Access'},
  code: String,
  scope: String,
  deliveryDate: Date,
  expirationDate: Date,
  used: Boolean,
  useDate: Date
});

authorizationCodeSchemas.statics.createCodeFromRequest = function (authorizationRequest, userId, clientId, access, cb) {
  var now = new Date();
  var expirationDate = new Date();
  expirationDate.setMinutes(now.getMinutes() + config.auth.accessCodeDuration);

  var code = {
    requestId: authorizationRequest._id,
    clientId: clientId,
    userId: userId,
    code: sha1(now.toString() + authorizationRequest.clientId + userId + userId),
    scope: authorizationRequest.scope,
    deliveryDate: now,
    expirationDate: expirationDate,
    used: false,
    useDate: null };

  if (access != null) {
    code.accessId = access._id;
  }
  authorizationCodeModel.create(code, cb);
};

authorizationCodeSchemas.methods.useCode = function (cb) {
  this.used = true;
  this.useDate = new Date();
  this.save(cb);
};


var authorizationCodeModel = mongoose.model('AuthorizationCode', authorizationCodeSchemas);

module.exports = authorizationCodeModel;