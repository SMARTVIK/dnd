var jwt = require('jwt');
import User from '../models/user';
var FB = require('fb');

var auth = {
  login: function(req, res) {
    var username = req.body.username || '';
    var password = req.body.password || '';
    if (username == '' || password == '') {
      res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid credentials"
      });
      return;
    }
    // Fire a query to your DB and check if the credentials are valid
    var dbUserObj = auth.validate(username, password);
    if (!dbUserObj) { // If authentication fails, we send a 401 back
      res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid credentials"
      });
      return;
    }
    if (dbUserObj) {
      // If authentication is success, we will generate a token
      // and dispatch it to the client
      res.json(genToken(dbUserObj));
    }
  },
  facebookLogin(facebookObject) {
    auth.facebookObject(facebookObject)
  },
  facebookLoginValidation(facebookObject) {

    FB.setAccessToken(facebookObject.accessToken);

    return new Promise((resolve, reject) => {
      FB.api("/me", {
          fields: ['id', 'name', "first_name", "last_name", "email"]
        },
        function(result) {
          resolver(result)
        });
    }).then((facebookResult) => {
      return new Promise((resolve, reject) => {

        //user not valid or sent some worng data
        if (facebookResult.id != loginServices.facebook.id || !facebookResult || facebookResult.error) {
          reject({
            "status": 400,
            "message": "Authentication Failed",
            "error": err
          })
        }
        //if user not given email permisstion
        if (!facebookResult.email) {
          auth.findFbAccountOrCreate(facebookObject).then((user) => {
            resolve(user)
          }).catch((err) => {
            rreject({
              "status": 400,
              "message": "Authentication Failed",
              "error": err
            })
          })
        }
      })
    })
  },
  findFbAccountOrCreate(facebookObject) {
    return new Promise((resolve, reject) => {
      Users.findOne({
        "services.facebook.id": facebookObject.id
      }, '_id profile', (err, user) => {
        if (err) {
          reject({
            "status": 400,
            "message": "Authentication Failed",
            "error": err
          })
        }
        //if user exists
        if (user) {
          resolve(genToken(user))
        }

        User.save({
          "services": {
            "facebook": facebookObject
          },
          "profile": {
            first_name: facebookObject.first_name,
            last_name: facebookObject.first_name
          }
        })
      })
    })
  }
  validate: function(username, password) {
    // spoofing the DB response for simplicity
    var dbUserObj = { // spoofing a userobject from the DB.
      name: 'arvind',
      role: 'admin',
      username: 'arvind@myapp.com'
    };
    return dbUserObj;
  },
  validateUser: function(username) {
    // spoofing the DB response for simplicity
    var dbUserObj = { // spoofing a userobject from the DB.
      name: 'arvind',
      role: 'admin',
      username: 'arvind@myapp.com'
    };
    return dbUserObj;
  },
}
// private method
function genToken(user) {
  var expires = expiresIn(1); // 1 days
  var token = jwt.encode({
    exp: expires
  }, require('../config/secret')());
  return {
    token: token,
    expires: expires,
    user: user
  };
}

function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}
module.exports = auth;
