const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const isBrowserRequest = require('../utils/checkBrowser');
const { CreateSuccessRes, CreateErrorRes } = require('../utils/responseHandler');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage: storage });

  router.get('/view/all', async (req, res, next) => {
    try {
      let banners = await bannerController.GetAllBanners();
  
      if (isBrowserRequest(req)) {
        res.render('Banners/indexBanner', { banners });
      } else {
        CreateSuccessRes(res, banners, 200);
      }
    } catch (err) {
      next(err);
    }
  });
  

router.get('/view/create', (req, res) => {
  res.render('Banners/createBanner');
});

router.post('/view/create', upload.single('imageFile'), async (req, res, next) => {
    try {
      let img_url = req.body.imageUrl;
      if (req.file) {
        img_url = '/uploads/' + req.file.filename;
      }
  
      const newBanner = await bannerController.CreateBanner(img_url, req.body.title || "");
  
      if (isBrowserRequest(req)) {
        res.redirect('/banners/view/all');
      } else {
        CreateSuccessRes(res, newBanner, 201);
      }
    } catch (error) {
      next(error);
    }
  });
  

router.get('/view/edit/:id', async (req, res, next) => {
  try {
    const banner = await bannerController.GetBannerById(req.params.id);
    if (!banner) return CreateErrorRes(res, "Banner không tồn tại", 404);
    res.render('Banners/editBanner', { banner });
  } catch (err) {
    next(err);
  }
});


router.get('/view/detail/:id', async (req, res, next) => {
    try {
      const banner = await bannerController.GetBannerById(req.params.id);
      if (!banner) return CreateErrorRes(res, "Banner không tồn tại", 404);
      res.render('Banners/detailBanner', { banner });
    } catch (err) {
      next(err);
    }
  });

router.post('/view/edit/:id', async (req, res, next) => {
  try {
    const { img_url, title } = req.body;
    await bannerController.UpdateBanner(req.params.id, { img_url, title });
    res.redirect('/banners/view/all');
  } catch (err) {
    next(err);
  }
});

// Xóa mềm

router.get('/view/delete/:id', async (req, res, next) => {
  try {
    const deletedBanner = await bannerController.DeleteBanner(req.params.id);

    if (!deletedBanner) {
      return CreateErrorRes(res, 'Banner không tồn tại', 404);
    }

    if (isBrowserRequest(req)) {
      res.redirect('/banners/view/all');
    } else {
      CreateSuccessRes(res, deletedBanner, 200);
    }
  } catch (err) {
    next(err);
  }
});


router.put('/view/edit/:id', upload.single('imageFile'), async function(req, res, next) {
    try {
      const bannerId = req.params.id;
      const { title, img_url } = req.body;
      let updatedImgUrl = img_url;
  
      if (req.file) {
        updatedImgUrl = `/uploads/${req.file.filename}`;
      }
  
      const updatedBanner = await bannerController.UpdateBanner(bannerId, {
        title,
        img_url: updatedImgUrl
      });
  
      if (!updatedBanner) return CreateErrorRes(res, 'Banner không tồn tại', 404);
  
      if (isBrowserRequest(req)) {
        res.redirect('/banners/view/all');
      } else {
        CreateSuccessRes(res, updatedBanner, 200);
      }
    } catch (error) {
      next(error);
    }
  });
  

module.exports = router;
