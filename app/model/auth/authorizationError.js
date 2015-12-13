var mongoose = require('mongoose');

var authorizationErrorSchema = new mongoose.Schema({
  requestId: {type: mongoose.Schema.Types.ObjectId, ref: 'AuthorizationRequest'},
  error: String
});

authorizationErrorSchema.statics.createFromRequest = function (authorizationRequest, error, cb) {
  authorizationErrorModel.create({
    requestId: authorizationRequest._id,
    error: error
  }, cb);
};

var authorizationErrorModel = mongoose.model('AuthorizationError', authorizationErrorSchema);

module.exports = authorizationErrorModel;