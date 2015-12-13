var express = require('express');
var router = express.Router();


router.get('', function(req, res, next) {
  res.render('authorize', {fname: 'Maxime', lname: 'Guedj', api: 'Facebook'});
});

module.exports = router;