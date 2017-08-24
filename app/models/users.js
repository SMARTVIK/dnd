var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
const Users = mongoose.model('Users', new Schema({
  username: String,
  emails: [{
    _id: String,
    address: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    verified: {
      type: Boolean,
      required: true
    },
    otp: {
      type: Number
    }
  }],
  profile: {
    first_name: String,
    last_name: String
  },
  services: {
    facebook: {
      type: Schema.Types.Mixed,
      required: false
    },
    google: {
      id: String,
      required: false
    },
    password: {
      bcrypt: String
    },
    resume: {
      loginTokens: [{
        when: {
          type: Date,
          default: Date.now
        },
        hashedToken: String
      }]
    }
  },
  created_date: {
    type: Date,
    default: Date.now
  }
}));

module.exports = Users;
