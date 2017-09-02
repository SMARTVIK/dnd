// config/initializers/server.js
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var logger = require('winston');

var multer  = require('multer')
var app;

var node_post = process.env.NODE_PORT || 8080

var start = function(cb) {
  'use strict';
  // Configure express
  app = express();

  app.use(morgan('common'));
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json({
    // type: '*/*'
  }));

  logger.info('[SERVER] Initializing routes');
  require('./../../routes/index')(app,multer);


  app.use(express.static(path.join(__dirname, 'public')));

  // Error handler
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: (process.env.NODE_ENV === 'development' ? err : {})
    });
    next(err);
  });



  app.listen(node_post);
  logger.info('[SERVER] Listening on port ' + node_post);

  if (cb) {
    return cb();
  }
};

module.exports = start;
