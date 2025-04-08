var express = require('express');
var router = express.Router();
let brandModel = require('../schemas/brands')
let {CreateErrorRes,
  CreateSuccessRes} = require('../utils/responseHandler')

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let brands = await brandModel.find({
    isDeleted:false
  })
  CreateSuccessRes(res,brands,200);
});

router.get('/view/all', async function(req, res, next) {
  try {
      let brands = await brandModel.find({ isDeleted: false });
      res.render('Brands/indexBrand', { brands });  
    } catch (error) {
      next(error);
    }
});

router.get('/create', function(req, res) {
  res.render('Brands/createBrand'); 
});

router.get('/:id', async function(req, res, next) {
  try {
    let brand = await brandModel.findOne({
      _id:req.params.id, isDeleted:false
    }
    )
    CreateSuccessRes(res,brand,200);
  } catch (error) {
    next(error)
  }
});
router.post('/', async function(req, res, next) {
  try {
    let body = req.body;
    let newBrand = new brandModel({
      name: body.name,
      description: body.description
    });
    
    await newBrand.save();

    if (req.get('User-Agent') && req.get('User-Agent').includes('Mozilla')) {
      return res.redirect('/Brands/view/all');
    } else {
        return res.status(200).json({ message: 'Brand created successfully', brand: newBrand });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/edit/:id', async function(req, res, next) {
  try {
    let brand = await brandModel.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!brand) {
      return res.status(404).send('Brand not found');
    }

    res.render('Brands/editBrand', { brand });
  } catch (error) {
    next(error);
  }
});


router.put('/:id', async function(req, res, next) {
  let id = req.params.id;
  try {
    let body = req.body
    let updatedInfo = {};
    if(body.name){
      updatedInfo.name = body.name;
    }
    if(body.description){
      updatedInfo.description = body.description;
    }
    let updatedBrand = await brandModel.findByIdAndUpdate(
      id,updatedInfo,{new:true}
    )
    if (!updatedBrand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    if (req.get('User-Agent') && req.get('User-Agent').includes('Mozilla')) {
      return res.redirect('/Brands/view/all');
    } else {
      CreateSuccessRes(res, updatedBrand, 200);
    }
  } catch (error) {
    next(error);
  }
});
router.delete('/:id', async function(req, res, next) {
  let id = req.params.id;
  try {
    let updatedBrand = await brandModel.findByIdAndUpdate(
      id, 
      { isDeleted: true }, 
      { new: true }
    );
    
    if (!updatedBrand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    
    if (req.get('User-Agent') && req.get('User-Agent').includes('Mozilla')) {
      return res.redirect('/Brands/view/all');
    } else {
      return res.status(200).json({ message: 'Brand deleted successfully', brand: updatedBrand });
    }
  } catch (error) {
    next(error);
  }
});


module.exports = router;
