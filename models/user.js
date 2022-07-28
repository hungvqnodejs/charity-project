const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  decentralization: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  numberPhone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    // required: true
  },
  active: Boolean
});

module.exports = mongoose.model('User', userSchema);