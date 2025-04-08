const express = require('express');
const router = express.Router();
const Cart = require('../schemas/cart');
const Product = require('../schemas/products');

// Middleware kiểm tra User-Agent
function isBrowser(req) {
  return req.get('User-Agent')?.includes('Mozilla');
}

// CREATE - Thêm sản phẩm vào giỏ
router.post('/add/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user?._id || '660000000000000000000000';

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

    if (isBrowser(req)) {
      res.redirect('/products/view/all');
    } else {
      res.status(201).json({
        message: 'Thêm vào giỏ hàng thành công',
        productId: productId,
        cartItem: {
          product: productId,
          quantity: 1
        }
      });
          }
  } catch (err) {
    res.status(500).send("Lỗi khi thêm vào giỏ hàng");
  }
});

// READ - Xem giỏ hàng
router.get('/view', async (req, res) => {
  try {
    const userId = req.user?._id || '660000000000000000000000';

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    const cartItems = cart?.items || [];

    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    if (isBrowser(req)) {
      res.render('Cart/indexCart', { cartItems, total });
    } else {
      res.status(200).json({
        cartItems: cartItems.map(item => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity
        })),
        total
      });
    }
  } catch (err) {
    if (isBrowser(req)) {
      res.status(500).render('error', { message: "Lỗi khi tải giỏ hàng" });
    } else {
      res.status(500).json({ error: "Lỗi khi tải giỏ hàng" });
    }
  }
});

// UPDATE - Cập nhật số lượng sản phẩm trong giỏ
router.put('/update/:productId', async (req, res) => {
  try {
    const userId = req.user?._id || '660000000000000000000000';
    const productId = req.params.productId;
    const { quantity } = req.body;

    if (quantity < 1) return res.status(400).json({ error: "Số lượng phải >= 1" });

    const cart = await Cart.findOne({ user: userId });

    if (!cart) return res.status(404).json({ error: "Không tìm thấy giỏ hàng" });

    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) return res.status(404).json({ error: "Sản phẩm không tồn tại trong giỏ" });

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ message: "Cập nhật số lượng thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi cập nhật giỏ hàng" });
  }
});

// DELETE - Xoá 1 sản phẩm khỏi giỏ
router.delete('/remove/:productId', async (req, res) => {
  try {
    const userId = req.user?._id || '660000000000000000000000';
    const productId = req.params.productId;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) return res.status(404).json({ error: 'Giỏ hàng không tồn tại' });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    res.status(200).json({ message: 'Đã xoá sản phẩm khỏi giỏ' });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xoá sản phẩm" });
  }
});

// DELETE - Xoá toàn bộ giỏ hàng
router.delete('/clear', async (req, res) => {
  try {
    const userId = req.user?._id || '660000000000000000000000';
    await Cart.findOneAndDelete({ user: userId });

    res.status(200).json({ message: "Đã xoá toàn bộ giỏ hàng" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xoá giỏ hàng" });
  }
});

module.exports = router;
