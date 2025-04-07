const express = require('express');
const router = express.Router();
const Cart = require('../schemas/cart');
const Product = require('../schemas/products');

// Thêm vào giỏ hàng
router.post('/add/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user?._id || '660000000000000000000000'; // test cứng hoặc từ session/login

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    res.redirect('/products/view/all');
  } catch (err) {
    res.status(500).send("Lỗi khi thêm vào giỏ hàng");
  }
});

router.get('/view', async (req, res) => {
    try {
      const userId = req.user?._id || '660000000000000000000000'; // Dùng session hoặc user giả để test
  
      const cart = await Cart.findOne({ user: userId }).populate('items.product');
  
      if (!cart || cart.items.length === 0) {
        return res.render('Cart/indexCart', { cartItems: [], total: 0 });
      }
  
      const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
      res.render('Cart/indexCart', { cartItems: cart.items, total });
    } catch (err) {
      console.error(err);
      res.status(500).send("Lỗi khi tải giỏ hàng");
    }
  });
  


module.exports = router;
