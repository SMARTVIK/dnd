var jwt = require('jsonwebtoken');
const Users = require('./../models/users');
var FB = require('fb');

var auth = {
  login: function(req, res) {
    console.log("login function call");
    //login with facebook
    if (req.body.facebook) {
      // res.json({
      //   success:1
      // })
      // console.log(auth);
      var facebook = req.body.facebook;

      facebookLoginValidation(facebook).then((result) => {
        console.log("result", result);
        res.json(result);
      }).catch((err) => {
        res.json(err);
      })

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
        "message": "Invalid credentials."
      });
    }

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

function facebookLoginValidation(facebookObject) {
  facebookObject = JSON.parse(facebookObject);
  return new Promise((resolve, reject) => {
    if (!facebookObject.accessToken) {
      reject({
        "error": 1,
        "status": 403,
        "message": "Access token required"
      })
    }
    FB.setAccessToken(facebookObject.accessToken);

    FB.api("/me", {
        fields: ['id', 'name', "first_name", "last_name", "email"]
      },
      function(result) {
        resolve(facebookCallback(result))
      }
    );
  })
}

function facebookCallback(facebookResult) {
  //user not valid or sent some worng data
  return new Promise((resolve, reject) => {
    if (!facebookResult || facebookResult.error) {
      reject({
        "status": 400,
        "message": "Authentication Failed",
        "error": err
      })
    }
    resolve(findFbAccountOrCreate(facebookResult))
  });
}

function findFbAccountOrCreate(facebookObject) {
  console.log("90");
  return new Promise((resolve, reject) => {
    Users.findOne({
      "services.facebook.id": facebookObject.id
    }, '_id profile', (err, user) => {
      if (err) {
        console.log("102");
        reject({
          "status": 400,
          "message": "Authentication Failed",
          "error": err
        })
      }
      //if user exists
      if (user) {
        console.log("63");
        resolve(genToken(user))
      }
      var userDoc = new Users({
        "services": {
          "facebook": facebookObject
        },
        "profile": {
          first_name: facebookObject.first_name,
          last_name: facebookObject.first_name
        }
      })

      userDoc.save((err, savedUser) => {
        if (err) {
          reject(err)
        }
        resolve(genToken(savedUser))
      })
    })
  })
}
// private method
function genToken(user) {
  var expires = expiresIn(1); // 1 days
  var token = jwt.sign({
    exp: expires
  }, require('./../config/config').secret);
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
