var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
const Users = mongoose.model('Users', new Schema({
  username: String,
  password: String,
  admin: Boolean,
  emails: [{
    type: String,
    trim: true,
    unique: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
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
    }
  },
  created_date: {
    type: Date,
    default: Date.now
  }
}));

module.exports = Users;
