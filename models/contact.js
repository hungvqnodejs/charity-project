const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const contactSchema = new Schema({
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  numberPhone: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Contact', contactSchema);