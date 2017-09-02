var jwt = require('jsonwebtoken');
const Users = require('./../models/users');
var FB = require('fb');
var SHA256 = require('sha256');
var bcrypt = require("bcrypt");

var auth = {
  login: function(req, res) {
    console.log("login function call");
    //login with facebook
    if (req.body.facebook) {
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
      var google = req.body.google;
      googleLoginValidation(google).then((result) => {
        res.json(result);
      }).catch((err) => {
        res.json(err);
      })
    }
    //login with password
    else {
      // var email = req.body.email;
      loginWithEmail(req.body).then((result) => {
        console.log("result", result);
        res.json(result);
      }).catch((err) => {
        res.json(err);
      })
      // res.json({
      //   success: false,
      //   message: 'Failed to authenticate token.'
      // })
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

function googleLoginValidation(googleObject) {
  googleObject = JSON.parse(googleObject);

}

function facebookLoginValidation(facebookObject) {
  facebookObject = JSON.parse(facebookObject);
  return new Promise((resolve, reject) => {
    if (!facebookObject.accessToken) {
      reject({
        "success": 0,
        "status": 403,
        "message": "Access token required"
      })
    }
    FB.setAccessToken(facebookObject.accessToken);

    FB.api("/me", {
        fields: ['id', 'name', "first_name", "last_name", "email"]
      },
      function(result) {
        facebookCallback(result).then((result) => {
          resolve(result)
        })
      }
    );
  })
}

var getPasswordString = function(password) {
  console.log(typeof password);
  if (typeof password === "string") {
    password = SHA256(password);
  } else { // 'password' is an object
    // if (password.algorithm !== "sha-256") {
    //   throw new Error("Invalid password hash algorithm. " +
    //     "Only 'sha-256' is allowed.");
    // }
    password = password.digest;
  }
  return password;
};


var hashPassword = function(password) {
  password = getPasswordString(password);
  return bcrypt.hash(password, 10)
};

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
    findFbAccountOrCreate(facebookResult).then((result) => {
      resolve(result);
    })

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
          last_name: facebookObject.last_name
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


function loginWithEmail(options) {
  console.log(options);
  return new Promise((resolve, reject) => {
    if (!options.email) {
      reject({
        success: 0,
        message: "Email id required",
        code: 403
      })
      console.log("reject");
      return;
    }

    Users.findOne({
      "emails": {
        "$elemMatch": {
          "address": options.email,
          "verified": true
        }
      }
    }, '_id profile emails', (err, user) => {
      if (err) {
        reject({
          success: 0,
          message: err,
          code: 400
        })
      }

      //old user
      if (user) {
        resolve(genToken(user))
      }

      if (options.otp) {

        if (!options.password) {
          reject({
            success: 0,
            message: "Password required",
            code: 403
          })
        }

        Users.findOne({
            emails: {
              $elemMatch: {
                address: options.email,
                otp: options.otp,
              }
            }
          })
          .select({
            emails: {
              $elemMatch: {
                address: options.email,
                otp: options.otp,
              }
            },
            created_date: 0
          })
          .exec((err, doc) => {
            if (doc) {
              hashPassword(options.password)
                .then((token) => {
                  Users.update({
                    _id: doc._id,
                    emails: {
                      $elemMatch: {
                        address: options.email,
                        otp: options.otp
                      }
                    }
                  }, {
                    $set: {
                      "emails.$.verified": true,
                      "profile.first_name": options.first_name,
                      "profile.last_name": options.last_name,
                      "services.password": {
                        bcrypt: token
                      }
                    },
                    $unset: {
                      "emails.$.otp": 1
                    }
                  }, {}, (err, result) => {
                    if (err) {
                      reject({
                        success: 0,
                        message: err || " Otp not valid, Please try again later",
                        code: 400
                      })
                    }
                    resolve(genToken(doc))
                  })
                })
              // doc.emails[0].verified = true,
              //   delete doc.emails[0].otp;
              // doc.profile = {
              //   first_name: options.first_name,
              //   last_name: options.last_name
              // }
              //
              // if (!doc.services) {
              //   doc.services = {}
              // }
              //
              // hashPassword(options.password)
              //   .then((token) => {
              //     doc.services.password = {
              //       bcrypt: token
              //     }
              //     doc.save((err, result) => {
              //       if (err) {
              //         reject({
              //           success: 0,
              //           message: err || " Otp not valid, Please try again later",
              //           code: 400
              //         })
              //       }
              //       resolve(genToken(doc))
              //     })
              //   })
            }

            if (err) {
              reject({
                success: 0,
                message: err || " Otp not valid, Please try again later",
                code: 400
              })
            }
          })
      } else {


        console.log("298");
        //new user
        var code = getRandomCode(6);
        console.log(code);
        var email = options.email
        var newUser = new Users({
          emails: [{
            "address": options.email,
            "verified": false,
            "otp": code
          }]
        })

        console.log(newUser);

        newUser.save((err) => {
          console.log(err);
          resolve({
            success: 0,
            message: "Otp sent successfully",
            code: 100
          })
        })
        //Send email with otp
        resolve({
          success: 0,
          message: "Otp sent successfully",
          code: 100
        })
      }

    })
  })

}

var getRandomCode = function(length) {
  length = length || 4
  var output = ''
  while (length-- > 0) {
    output += getRandomDigit()
  }
  return output
}


// var options = {}
// options.phone = "9211978861"
// Meteor.loginWithPhone(options)
/**
 * Return random 1-9 digit
 * @returns {number}
 */
var getRandomDigit = function() {
  return Math.floor((Math.random() * 9) + 1)
}

// private method
function genToken(user) {
  var expires = expiresIn(1); // 1 days
  var token = jwt.sign({
    exp: expires
  }, require('./../config/config').secret);
  return {
    success: 1,
    token: token,
    expires: expires,
    user_profile: user.profile || {}
  };
}

function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}
module.exports = auth;
