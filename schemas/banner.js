const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  img_url: {
    type: String,
    required: true
  },
  title: String,
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Banner', bannerSchema);
