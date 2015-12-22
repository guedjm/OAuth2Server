var config = require('../../../config');
var mongoose = require('mongoose');
var sha1 = require('sha1');
var log = require('debug')('app:model:auth:authorizationCode');

var authorizationCodeSchemas = new mongoose.Schema({
  request: {type: mongoose.Schema.Types.ObjectId, ref: 'AuthAuthorizationRequest'},
  access: {type: mongoose.Schema.Types.ObjectId, ref: 'AuthAccess'},
  code: String,
  deliveryDate: Date,
  expirationDate: Date,
  used: Boolean,
  useDate: Date
});

authorizationCodeSchemas.statics.createCodeFromRequest = function (authorizationRequest, userId, clientId, cb) {
  var now = new Date();
  var expirationDate = new Date();
  expirationDate.setMinutes(now.getMinutes() + config.auth.accessCodeDuration);

  var code = {
    request: authorizationRequest._id,
    clientId: clientId,
    userId: userId,
    code: sha1(now.toString() + authorizationRequest.clientId + userId + userId),
    scope: authorizationRequest.scope,
    deliveryDate: now,
    expirationDate: expirationDate,
    used: false,
    useDate: null };
  authorizationCodeModel.create(code, cb);
};

authorizationCodeSchemas.statics.createCodeFromAccess = function (request, access, cb) {
  var now = new Date();
  var expirationDate = new Date();
  expirationDate.setMinutes(now.getMinutes() + config.auth.accessCodeDuration);

  var code = {
    request: request._id,
    access: access._id,
    code: sha1(now.toString() + access.clientId + access.userId + access.userId),
    deliveryDate: now,
    expirationDate: expirationDate,
    used: false,
    useDate: null };
  authorizationCodeModel.create(code, cb);
};

authorizationCodeSchemas.statics.getAvailableCodeWithAccess = function (code, cb) {
  authorizationCodeModel.findOne({code: code, used: false, expirationDate: {$gt: new Date()}})
    .populate('access')
    .exec(function (err, code) {
      cb(err, code);
    });
};

authorizationCodeSchemas.statics.deleteAll = function (cb) {
  authorizationCodeModel.remove({}, function (err) {
    if (!err) {
      log('Collection dropped');
    }
    cb(err);
  });
};

authorizationCodeSchemas.methods.useCode = function (cb) {
  this.used = true;
  this.useDate = new Date();
  this.save(cb);
};


var authorizationCodeModel = mongoose.model('AuthAuthorizationCode', authorizationCodeSchemas);

module.exports = authorizationCodeModel;