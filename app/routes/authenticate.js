// app/routes/login.js
var auth = require('./../auth/auth')
module.exports = function(router) {
  'use strict';
  router.route('/')
    .post((req, res, next) => {
      console.log("=> ",req)
      return auth.login(req, res, next)
    })
};
