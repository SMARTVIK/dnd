import User from './../../models/user' // get our mongoose model

module.exports.facebook = function() {
  var facebookReqBody = req.body;

  if (!facebookReqBody.accessToken) {
    res.json({
      success: false,
      message: 'Login token required!'
    });
  }

  FB.setAccessToken(facebookReqBody.accessToken);
  return new Promise((resolve, reject) => {
    FB.api("/me", {
        fields: ['id', 'name', "first_name", "last_name", "email"]
      },
      function(result) {
        resolver(result)
      });
  })
  return new Promise(() => {
    if (fbResult.error || fbResult.id != facebookReqBody.id) {
      res.json({
        code: 400,
        success: false,
        message: 'Network Error / Authentication Failed'
      });
    }

    User.findOne({
      "services.facebook.id": facebookReqBody.id
    }, function(err, user) {
      if (!user) {
        if (fbResult.email) {
          // email
          User.findOne({
            emails: fbResult.email
          }, (err, user) => {
            if (user) {
              user.services.facebook = {
                id: facebookReqBody.id
              };
              User.save(user, () => {
                var token = jwt.sign({
                  _id: user._id,
                  created_date: user.created_date
                }, app.get('superSecret'), {
                  expiresIn: 86400 // expires in 24 hours
                });

                res.json({
                  success: true,
                  message: 'Login successfully!',
                  token: token
                });

              })
            }
          })
        }
        console.log("new user");
        User.save((err) => {
          if (err) {
            console.log(err);
            res.json({
              code: 403,
              success: false,
              message: 'Something went wrong'
            });
          }

        })
      }
      console.log("old user");
    });
    res.json({
      success: false,
      message: 'Login token required!'
    });
  })



};
