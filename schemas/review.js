const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
  comment: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true }); 

module.exports = mongoose.model('review', reviewSchema);
