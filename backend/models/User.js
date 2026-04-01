const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'student'
  },
  progress: {
    type: Map,
    of: Boolean,
    default: {}
  },
  bookmarks: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
