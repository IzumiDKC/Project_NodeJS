const express = require('express');
const router = express.Router();
const Cart = require('../schemas/cart');
const Product = require('../schemas/products');
const check_auth = require('../utils/check_auth');
const Voucher = require('../schemas/voucher');
const Order = require('../schemas/orders');
const OrderDetail = require('../schemas/orderDetails');
const mongoose = require('mongoose');
const check_authentication = require('../utils/check_auth').check_authentication;


router.use(check_auth.check_authentication);
// Middleware kiểm tra User-Agent
function isBrowser(req) {
  return req.get('User-Agent')?.includes('Mozilla');
}

router.post('/add/:productId', async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.productId;
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

router.get('/view', async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    const cartItems = cart?.items || [];

    let total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    let discount = 0;
    let voucherData = null;

    if (req.session.voucher) {
      const voucher = await Voucher.findById(req.session.voucher._id);
      if (voucher) {
        discount = (total * voucher.discount) / 100;
        voucherData = voucher;
      }
    }

    let finalTotal = total - discount;

    if (isBrowser(req)) {
      res.render('Cart/indexCart', { cartItems, total, discount, finalTotal, voucher: voucherData });
    } else {
      res.status(200).json({
        cartItems: cartItems.map(item => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity
        })),
        total,
        discount,
        finalTotal,
        voucher: voucherData
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

router.put('/update/:productId', async (req, res) => {
  try {
    const userId = req.user._id;
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

router.delete('/remove/:productId', async (req, res) => {
  try {
    const userId = req.user._id;
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

router.delete('/clear', async (req, res) => {
  try {
    const userId = req.session.user._id;
    await Cart.findOneAndDelete({ user: userId });

    res.status(200).json({ message: "Đã xoá toàn bộ giỏ hàng" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xoá giỏ hàng" });
  }
});
router.post('/voucher/apply', async (req, res) => {
  const { code } = req.body;
  const voucher = await Voucher.findOne({ code });

  if (!voucher) {
    return res.redirect('/cart/view'); // Không có mã
  }

  req.session.voucher = { _id: voucher._id };  
  res.redirect('/cart/view');
});

router.get('/checkout', check_authentication, async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.redirect('/cart/view'); 
    }

    const products = cart.items.map(item => ({
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));

    const totalPrice = products.reduce((total, item) => total + item.price * item.quantity, 0);

    let discount = 0;
    let finalPrice = totalPrice;
    let voucher = null;

    if (req.session.voucher) {
      voucher = await Voucher.findById(req.session.voucher._id);
      if (voucher && voucher.discount) {
        discount = voucher.discount;
        finalPrice = totalPrice * (1 - discount / 100);
      }
    }

    res.render('Cart/checkout', {
      products,
      totalPrice,
      discount,
      finalPrice,
      voucher
    });

  } catch (error) {
    next(error);
  }
});



router.post('/checkout', check_authentication, async (req, res, next) => {
  try {
    const { shippingAddress, notes } = req.body;
    const userId = req.session.user._id;
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    const products = cart.items.map(item => ({
      productId: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const totalPrice = products.reduce((total, item) => total + item.quantity * item.price, 0);

    let discount = 0;
    let finalPrice = totalPrice;
    let voucher = null;

    if (req.session.voucher) {
      voucher = await Voucher.findById(req.session.voucher._id);
      if (voucher && voucher.discount) {
        discount = voucher.discount;
        finalPrice = totalPrice * (1 - discount / 100);
      }
    }

    const newOrder = new Order({
      userId,
      products,
      totalPrice,
      discount,
      finalPrice,
      shippingAddress,
      notes,
      isDeleted: false
    });

    const savedOrder = await newOrder.save();

    const orderDetails = products.map(p => ({
      orderId: savedOrder._id,
      productId: p.productId,
      quantity: p.quantity,
      price: p.price
    }));
    await OrderDetail.insertMany(orderDetails);

    await Cart.findOneAndDelete({ user: userId });
    delete req.session.voucher; // Xoá voucher sau khi thanh toán

    const isBrowser = (req.headers['user-agent'] || '').includes('Mozilla');
    if (isBrowser) {
      return res.redirect('/Cart/success');
    } else {
      return res.status(200).json({ message: 'Checkout thành công', order: savedOrder });
    }

  } catch (error) {
    next(error);
  }
});


router.get('/success', (req, res) => {
  res.render('Cart/success');
});
module.exports = router;
