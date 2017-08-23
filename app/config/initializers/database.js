// config/initializers/database.js
var mongoose = require('mongoose');
var MONGO_URL = process.env.MONGO_URL || "mongodb://localhost/sotd";
mongoose.connect(MONGO_URL, {
  useMongoClient: true
});

module.exports = function(cb) {
  'use strict';


  // Initialize the component here then call the callback
  // More logic
  //
  // Return the call back
  cb();
};
