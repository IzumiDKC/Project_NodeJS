const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
  items: [
    {
      product: { type: mongoose.Types.ObjectId, ref: 'product', required: true },
      quantity: { type: Number, default: 1, min: 1 }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('cart', cartSchema);
