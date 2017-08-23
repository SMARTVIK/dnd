// /index.js
'use strict';

var server = require('./app/config/initializers/server');
var async = require('async');
var logger = require('winston');

// Load Environment variables from .env file
require('dotenv').load();
var node_env = process.env.NODE_ENV || "development";
// Load config file for the environment
require('./app/config/environments/' + node_env);

logger.info('[APP] Starting server initialization');

// Initialize Modules
async.series([
  function initializeDBConnection(callback) {
    require('./app/config/initializers/database')(callback);
  },
  function startServer(callback) {
    server(callback);
  }], function(err) {
    if (err) {
      logger.error('[APP] initialization failed', err);
    } else {
      logger.info('[APP] initialized SUCCESSFULLY');
    }
  }
);
