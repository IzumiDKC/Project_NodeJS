const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const voucherModel = require('../schemas/voucher');
const { CreateErrorRes, CreateSuccessRes } = require('../utils/responseHandler');

// API GET ALL VOUCHER
router.get('/', async (req, res, next) => {
  try {
    const vouchers = await voucherModel.find({ isDeleted: false });
    CreateSuccessRes(res, vouchers, 200);
  } catch (error) {
    next(error);
  }
});

// VIEW LIST
router.get('/view/all', async (req, res, next) => {
  try {
    const vouchers = await voucherModel.find({ isDeleted: false });
    res.render('Voucher/indexVoucher', { vouchers });
  } catch (error) {
    next(error);
  }
});

// VIEW CREATE FORM
router.get('/view/create', (req, res) => {
  res.render('Voucher/createVoucher');
});

// VIEW EDIT FORM (Check id hợp lệ)
router.get('/view/edit/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return CreateErrorRes(res, 'Id không hợp lệ', 400);
    }

    const voucher = await voucherModel.findById(id);
    if (!voucher || voucher.isDeleted) {
      return CreateErrorRes(res, 'Voucher không tồn tại', 404);
    }

    res.render('Voucher/editVoucher', { voucher });
  } catch (error) {
    next(error);
  }
});

// API GET DETAIL
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return CreateErrorRes(res, 'Id không hợp lệ', 400);
    }

    const voucher = await voucherModel.findById(id);
    if (!voucher || voucher.isDeleted) {
      return CreateErrorRes(res, 'Voucher không tồn tại', 404);
    }

    CreateSuccessRes(res, voucher, 200);
  } catch (error) {
    next(error);
  }
});


router.post('/', async (req, res, next) => {
  try {
    let body = req.body;
    let newVoucher = new voucherModel({
      code: body.code,
      discount: body.discount,
      quantity: body.quantity,
      startDate: body.startDate,
      endDate: body.endDate
    });
    await newVoucher.save();
    CreateSuccessRes(res, newVoucher, 201);
  } catch (error) {
    next(error);
  }
});


// API UPDATE
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return CreateErrorRes(res, 'Id không hợp lệ', 400);
    }

    const updatedVoucher = await voucherModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedVoucher) {
      return CreateErrorRes(res, 'Voucher không tồn tại', 404);
    }

    CreateSuccessRes(res, updatedVoucher, 200);
  } catch (error) {
    next(error);
  }
});

// API DELETE (Soft Delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return CreateErrorRes(res, 'Id không hợp lệ', 400);
    }

    const deletedVoucher = await voucherModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!deletedVoucher) {
      return CreateErrorRes(res, 'Voucher không tồn tại', 404);
    }

    CreateSuccessRes(res, deletedVoucher, 200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
