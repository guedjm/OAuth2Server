var mongoose = require('mongoose');
var log = require('debug')('app:model:auth:authorizationError');

var authorizationErrorSchema = new mongoose.Schema({
  request: {type: mongoose.Schema.Types.ObjectId, ref: 'AuthAuthorizationRequest'},
  error: String
});

authorizationErrorSchema.statics.createFromRequest = function (authorizationRequest, error, cb) {

  var err = {
    error: error
  };

  if (authorizationRequest != undefined) {
    err.request = authorizationRequest._id;
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

var authorizationErrorModel = mongoose.model('AuthAuthorizationError', authorizationErrorSchema);

module.exports = authorizationErrorModel;