var mongoose = require('mongoose');
var sha1 = require('sha1');

var userSchema = new mongoose.Schema({
  email: String,
  password: String,
  lastName: String,
  firstName: String,
  registrationDate: Date
});


userSchema.statics.createNewUser = function(email, password, lastName, firstName, cb) {
  var now = new Date();

  userModel.create({
    email: email,
    password: sha1(password + email),
    lastName: lastName,
    firstName: firstName,
    registrationDate: now
  }, cb);
};

userSchema.statics.getUser = function (email, password, cb) {
  var cryptedPassword = sha1(password + email);

  userModel.findOne({email: email, password: cryptedPassword}, '', cb);
};


var userModel = mongoose.model('User', userSchema);

module.exports = userModel;