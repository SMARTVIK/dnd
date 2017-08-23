var jwt = require('jsonwebtoken');

const User = require('./../models/users');
var FB = require('fb');

var auth = {
  login: function(req, res) {
    console.log("login function call");
    //login with facebook
    console.log(req.body);

    if (req.body.facebook) {
      // res.json({
      //   success:1
      // })
      // console.log(auth);
      var result = auth.facebookLoginValidation(req.body.facebook);
      console.log(result);
      res.json(result);
    }
    //login with google
    else if (req.body.google) {
      res.json({
        error: 1
      })
    }
    //login with password
    else {
      res.json({
        success: false,
        message: 'Failed to authenticate token.'
      })
    }
  },
  loginWithToken(req, res) {
    if (!req.body.loginToken) {
      res.json({
        "status": 401,
        "message": "Invalid credentials"
      });
    }

  },
  facebookLoginValidation(facebookObject) {

    if (!facebookObject.accessToken) {
      return {
        "error": 1,
        "status": 403,
        "message": "Access token required"
      }
    }
    FB.setAccessToken(facebookObject.accessToken);

    return new Promise((resolve, reject) => {
      FB.api("/me", {
          fields: ['id', 'name', "first_name", "last_name", "email"]
        },
        function(result) {
          console.log(result);
          resolve(result)
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
            reject({
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
        }, (err, savedUser) => {
          resolve(genToken(savedUser))
        })
      })
    })
  },
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
  validateToken(token) {
    return new Promise((resolve, reject) => {
      if (token) {
        reject({
          success: false,
          message: 'No token provided.'
        })
      }
      jwt.verify(token, require('../config/secret')(), function(err, decoded) {
        if (err) {
          reject({
            success: false,
            message: 'Failed to authenticate token.'
          })
        } else {
          // if everything is good, save to request for use in other routes
          resolve(decoded)
        }
      });
    })
  }
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
