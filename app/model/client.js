var mongoose = require('mongoose');
var sha1 = require('sha1');

var clientSchema = new mongoose.Schema({
  developerId: {type: mongoose.Schema.Types.ObjectId},
  clientId: String,
  clientType: String,
  applicationName: String,
  clientSecret: String,
  redirectUris: [String],
  javascriptOrigins: [String],
  creationDate: Date,
  activated: Boolean
});

clientSchema.statics.createNewClient = function(developerId, clientType, applicationName, redirectUris, javascriptOrigins, func) {
  var now = new Date();

  clientModel.create({
    developerId: developerId,
    clientId: sha1(developerId + applicationName + now.getTime()),
    clientType: clientType,
    applicationName: applicationName,
    clientSecret: sha1(developerId + now.toTimeString() + developerId),
    redirectUris: redirectUris,
    javascriptOrigins: javascriptOrigins,
    creationDate: now,
    activated: false
  }, func);
};

clientSchema.statics.getActivatedClient = function (clientId, func) {
  clientModel.findOne({clientId: clientId, activated: true}, func);
};

clientSchema.statics.authenticateClient = function (clientId, clientSecret, cb) {
  clientModel.findOne({clientId: clientId, clientSecret: clientSecret, activated: true}, cb);
};

var clientModel = mongoose.model('Client', clientSchema);

module.exports = clientModel;