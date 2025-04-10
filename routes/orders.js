const express = require('express');
const router = express.Router();
const orderModel = require('../schemas/orders');
const OrderDetail = require('../schemas/orderDetails');
const { CreateErrorRes, CreateSuccessRes } = require('../utils/responseHandler');
const { check_authentication } = require('../utils/check_auth');
const mongoose = require('mongoose');

// Lấy tất cả đơn hàng dưới dạng JSON
router.get('/', check_authentication, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await orderModel.find({ userId, isDeleted: false });
    CreateSuccessRes(res, orders, 200);
  } catch (error) {
    next(error);
  }
});

// Hiển thị tất cả đơn hàng dạng view
router.get('/view/all', check_authentication, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await orderModel.find({ userId, isDeleted: false }).populate('userId', 'email');
    res.render('Orders/indexOrder', { orders });
  } catch (error) {
    next(error);
  }
});

// Lấy đơn hàng theo ID
router.get('/:id', check_authentication, async (req, res, next) => {
  try {
    const order = await orderModel.findOne({ _id: req.params.id, isDeleted: false });
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    CreateSuccessRes(res, order, 200);
  } catch (error) {
    next(error);
  }
});

// Tạo đơn hàng mới (không cần nhập voucher hay discount)
router.post('/', check_authentication, async (req, res, next) => {
  try {
    const body = req.body;
    const userId = req.user.id;
    const products = body.products;

    const totalPrice = products.reduce((total, item) => total + item.quantity * item.price, 0);
    const finalPrice = totalPrice; // Không áp dụng giảm giá

    const newOrder = new orderModel({
      userId,
      products,
      totalPrice,
      finalPrice,
      shippingAddress: body.shippingAddress,
      notes: body.notes || '',
      isDeleted: false
    });

    const savedOrder = await newOrder.save();

    // Tạo chi tiết đơn hàng
    const orderDetails = products.map(item => ({
      orderId: savedOrder._id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    }));

    await OrderDetail.insertMany(orderDetails);

    if (req.get('User-Agent')?.includes('Mozilla')) {
      return res.redirect(`/Orders/user/${userId}/view/all`);
    } else {
      return res.status(200).json({ message: 'Đơn hàng đã được tạo thành công', order: newOrder });
    }
  } catch (error) {
    next(error);
  }
});

// Trang chỉnh sửa đơn hàng
router.get('/edit/:id', check_authentication, async (req, res, next) => {
  try {
    const order = await orderModel.findOne({ _id: req.params.id, isDeleted: false });
    if (!order) return res.status(404).send('Không tìm thấy đơn hàng');
    res.render('Orders/editOrder', { order });
  } catch (error) {
    next(error);
  }
});

// Cập nhật đơn hàng
router.put('/:id', check_authentication, async (req, res, next) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const updatedInfo = {};

    if (body.status) updatedInfo.status = body.status;
    if (body.shippingAddress) updatedInfo.shippingAddress = body.shippingAddress;
    if (body.notes) updatedInfo.notes = body.notes;

    const updatedOrder = await orderModel.findByIdAndUpdate(id, updatedInfo, { new: true });

    if (!updatedOrder || updatedOrder.isDeleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (req.get('User-Agent')?.includes('Mozilla')) {
      return res.redirect(`/Orders/view/all`);
    } else {
      CreateSuccessRes(res, updatedOrder, 200);
    }
  } catch (error) {
    next(error);
  }
});

// Xóa đơn hàng (soft delete)
router.delete('/:id', check_authentication, async (req, res, next) => {
  try {
    const id = req.params.id;
    const deletedOrder = await orderModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (req.get('User-Agent')?.includes('Mozilla')) {
      return res.redirect(`/Orders/view/all`);
    } else {
      return res.status(200).json({ message: 'Đơn hàng đã được xóa thành công', order: deletedOrder });
    }
  } catch (error) {
    next(error);
  }
});

// Xem chi tiết đơn hàng
router.get('/:id/detail', check_authentication, async (req, res) => {
  const orderId = req.params.id;
  const order = await orderModel.findById(orderId).populate('userId');
  const orderDetails = await OrderDetail.find({ orderId: new mongoose.Types.ObjectId(orderId) }).populate('productId');

  if (req.get('User-Agent')?.includes('Mozilla')) {
    return res.render('Orders/orderDetail', { order, orderDetails });
  } else {
    CreateSuccessRes(res, orderDetails, 200);
  }
});

module.exports = router;
