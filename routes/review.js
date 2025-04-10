const express = require('express');
const router = express.Router();
const reviewModel = require('../schemas/review'); // model mongoose cho review
const { CreateErrorRes, CreateSuccessRes } = require('../utils/responseHandler');



router.get('/', async (req, res, next) => {
  try {
    let reviews = await reviewModel.find({ isDeleted: false })
      .populate('user_id')
      .populate('product_id');
    CreateSuccessRes(res, reviews, 200);
  } catch (error) {
    next(error);
  }
});

router.get('/product/:productId', async (req, res, next) => {
    try {
      const { productId } = req.params;
      const reviews = await reviewModel.find({
        product_id: productId,
        isDeleted: false
      }).populate('user_id');
  
      if (!reviews || reviews.length === 0) {
        return res.status(404).send('No reviews found for this product');
      }
  
      CreateSuccessRes(res, reviews, 200);
    } catch (error) {
      next(error);
    }
  });

  router.get('/view/product/:productId', async (req, res, next) => {
    try {
      const { productId } = req.params;
      const reviews = await reviewModel.find({
        product_id: productId,
        isDeleted: false
      }).populate('user_id');
  
      res.render('Review/productReview', { reviews, productId: req.params.productId, userId: req.session.user?._id });
    } catch (error) {
      next(error);
    }
  });

router.get('/view/all', async (req, res, next) => {
  try {
    let reviews = await reviewModel.find({ isDeleted: false })
      .populate('user_id', 'username')
      .populate('product_id', 'name');
    res.render('Review/indexReview', { reviews });
  } catch (error) {
    next(error);
  }
});

router.get('/create', (req, res) => {
    const userId = req.session.user?._id; // hoặc từ token nếu bạn dùng JWT
    const productId = req.query.productId;
  
    if (!userId || !productId) {
      return res.status(400).send('Thiếu userId hoặc productId');
    }
  
    res.render('Review/createReview', { userId, productId });
  });
  

router.post('/', async (req, res, next) => {
  try {
    const { user_id, product_id, comment } = req.body;
    const newReview = new reviewModel({ user_id, product_id, comment });

    await newReview.save();

    if (req.get('User-Agent')?.includes('Mozilla')) {
        return res.redirect(`/reviews/view/product/${product_id}`);
    } else {
      CreateSuccessRes(res, newReview, 200);
    }
  } catch (error) {
    next(error);
  }
});

router.get('/edit/:id', async (req, res, next) => {
  try {
    let review = await reviewModel.findOne({ _id: req.params.id, isDeleted: false });
    if (!review) return res.status(404).send('Review not found');

    res.render('Review/editReview', { review });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { comment } = req.body;
    let updatedReview = await reviewModel.findByIdAndUpdate(
      req.params.id,
      { comment },
      { new: true }
    );

    if (!updatedReview) return res.status(404).send('Review not found');

    if (req.get('User-Agent')?.includes('Mozilla')) {
        return res.redirect(`/reviews/view/product/${product_id}`);
    } else {
      CreateSuccessRes(res, updatedReview, 200);
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    let deleted = await reviewModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!deleted) return res.status(404).send('Review not found');

    if (req.get('User-Agent')?.includes('Mozilla')) {
        return res.redirect(`/reviews/view/product/${product_id}`);
    } else {
      CreateSuccessRes(res, deleted, 200);
    }
  } catch (error) {
    next(error);
  }
});

// 👉 API: Lấy 1 review theo ID
router.get('/:id', async (req, res, next) => {
  try {
    let review = await reviewModel.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('user_id').populate('product_id');

    if (!review) return res.status(404).send('Review not found');
    CreateSuccessRes(res, review, 200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
