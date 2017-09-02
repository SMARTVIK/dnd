var changeCase = require('change-case');
var express = require('express');
var routes = require('require-dir')();
var mongoose = require('mongoose');
module.exports = function (app, multer) {
  'use strict';

  // Initialize all routes
  Object.keys(routes).forEach(function (routeName) {
    var router = express.Router();
    // You can add some middleware here
    // router.use(someMiddleware);

    // Initialize the route to add its functionality to router
    require('./' + routeName)(router);

    // Add router to the speficied route name in the app
    app.use('/' + changeCase.paramCase(routeName), router);
  });



  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      // console.log(file);
      var fileObj = {
        "image/png": ".png",
        "image/jpeg": ".jpeg",
        "image/jpg": ".jpg"
      };
      if (fileObj[file.mimetype] == undefined) {
        cb(new Error("file format not valid"));
      } else {
        var id = mongoose.Types.ObjectId();
        cb(null, id + fileObj[file.mimetype])
      }
    }
  })

  var upload = multer({ storage: storage })
  var cpUpload = upload.fields([
    {
      name: 'avatar',
      maxCount: 1
    }, {
      name: 'gallery',
      maxCount: 8
    }
  ])


  app.post("/upload-image", cpUpload, function (req, res) {
    if (req.files) {
      res.json({
        success: 1,
        filename: req.files.avatar[0].filename,
        message: "image upload successfully"
      })
    } else {
      res.json({
        success: 0,
        message: "Please upload valid file"
      })
    }

  });
};
