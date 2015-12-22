var mongoose = require('mongoose');
var log = require('debug')('app:model:auth:authorizationError');

var authorizationErrorSchema = new mongoose.Schema({
  requestId: {type: mongoose.Schema.Types.ObjectId, ref: 'AuthorizationRequest'},
  error: String
});

authorizationErrorSchema.statics.createFromRequest = function (authorizationRequest, error, cb) {

  var err = {
    error: error
  };

  if (authorizationRequest != undefined) {
    err.requestId = authorizationRequest._id;
  }

  authorizationErrorModel.create(err, cb);
};

authorizationErrorSchema.statics.deleteAll = function (cb) {
  authorizationErrorModel.remove({}, function (err) {
    if (!err) {
      log('Collection dropped');
    }
    cb(err);
  });
};

var authorizationErrorModel = mongoose.model('AuthorizationError', authorizationErrorSchema);

module.exports = authorizationErrorModel;