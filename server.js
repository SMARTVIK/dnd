// // =================================================================
// // get the packages we need ========================================
// // =================================================================
// var express = require('express');
// var app = express();
// var bodyParser = require('body-parser');
// var morgan = require('morgan');
// var mongoose = require('mongoose');
//
// var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
// var config = require('./config'); // get our config file
// var User = require('./app/models/user'); // get our mongoose model
//
// // =================================================================
// // configuration ===================================================
// // =================================================================
// var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
// mongoose.connect(config.database); // connect to database
// app.set('superSecret', config.secret); // secret variable
//
//
//
// require('../../app/routes/index')(app);
//
// // use body parser so we can get info from POST and/or URL parameters
// app.use(bodyParser.urlencoded({
//   extended: false
// }));
// app.use(bodyParser.json());
//
// // use morgan to log requests to the console
// app.use(morgan('dev'));
//
// // basic route (http://localhost:8080)
// app.get('/', function(req, res) {
//   res.send('Hello! The API is at http://localhost:' + port + '/api');
// });
//
// // ---------------------------------------------------------
// // get an instance of the router for api routes
// // ---------------------------------------------------------
// var apiRoutes = express.Router();
//
//
// app.all('/*', function(req, res, next) {
//   // CORS headers
//   res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//   // Set custom headers for CORS
//   res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
//   if (req.method == 'OPTIONS') {
//     res.status(200).end();
//   } else {
//     next();
//   }
// });
// // ---------------------------------------------------------
// // authentication (no middleware necessary since this isnt authenticated)
// // ---------------------------------------------------------
// // http://localhost:8080/api/authenticate
// apiRoutes.post('/authenticate', function(req, res) {
//
//   if (req.body.type == "facebook") {
//     return facebooLogin(req, res);
//   } else if (eq.body.type == "google") {
//
//   }
//
// });
//
//
// function facebooLogin(req, res) {
//   var facebookReqBody = req.body;
//
//   if (!facebookReqBody.accessToken) {
//     res.json({
//       success: false,
//       message: 'Login token required!'
//     });
//   }
//
//
//   FB.setAccessToken(facebookReqBody.accessToken);
//
//   FB.api("/me", {
//       fields: ['id', 'name', "first_name", "last_name", "email"]
//     },
//     function(result) {
//
//     });
//
//   User.findOne({
//     "services.facebook.id": facebookReqBody.accessToken
//   }, function(err, user) {
//     if (!user) {
//       console.log("new user");
//
//     }
//     console.log("old user");
//   });
//   res.json({
//     success: false,
//     message: 'Login token required!'
//   });
// }
// // ---------------------------------------------------------
// // route middleware to authenticate and check token
// // ---------------------------------------------------------
// apiRoutes.use(function(req, res, next) {
//   // check header or url parameters or post parameters for token
//   var token = req.body.token || req.param('token') || req.headers['x-access-token'];
//   // decode token
//   if (token) {
//     // verifies secret and checks exp
//     jwt.verify(token, app.get('superSecret'), function(err, decoded) {
//       if (err) {
//         return res.json({
//           success: false,
//           message: 'Failed to authenticate token.'
//         });
//       } else {
//         // if everything is good, save to request for use in other routes
//         req.decoded = decoded;
//         next();
//       }
//     });
//
//   } else {
//
//     // if there is no token
//     // return an error
//     return res.status(403).send({
//       success: false,
//       message: 'No token provided.'
//     });
//
//   }
//
// });
//
// // ---------------------------------------------------------
// // authenticated routes
// // ---------------------------------------------------------
// apiRoutes.get('/', function(req, res) {
//   res.json({
//     message: 'Welcome to the coolest API on earth!'
//   });
// });
//
//
// app.use('/api', apiRoutes);
//
// // =================================================================
// // start the server ================================================
// // =================================================================
// app.listen(port);
// console.log('Magic happens at http://localhost:' + port);
