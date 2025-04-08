var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category')
let {CreateErrorRes,
  CreateSuccessRes} = require('../utils/responseHandler')

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let categories = await categoryModel.find({
    isDeleted:false
  })
  CreateSuccessRes(res,categories,200);
});

router.get('/view/all', async function(req, res, next) {
  try {
      let categories = await categoryModel.find({ isDeleted: false });
      res.render('Categories/indexCategory', { categories });  
    } catch (error) {
      next(error);
    }
});

router.get('/create', function(req, res) {
  res.render('Categories/createCategory'); 
});

router.get('/:id', async function(req, res, next) {
  try {
    let category = await categoryModel.findOne({
      _id:req.params.id, isDeleted:false
    }
    )
    CreateSuccessRes(res,category,200);
  } catch (error) {
    next(error)
  }
});
router.post('/', async function(req, res, next) {
  try {
    let body = req.body;
    let newCategory = new categoryModel({
      name: body.name,
      description: body.description
    });
    
    await newCategory.save();

    if (req.get('User-Agent') && req.get('User-Agent').includes('Mozilla')) {
      return res.redirect('/Categories/view/all');
    } else {
      return res.status(200).json({ message: 'Category create successfully', category: newCategory });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/edit/:id', async function(req, res, next) {
  try {
    let category = await categoryModel.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!category) {
      return res.status(404).send('Category not found');
    }

    res.render('Categories/editCategory', { category });
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
    let updatedCategory = await categoryModel.findByIdAndUpdate(
      id,updatedInfo,{new:true}
    )
    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (req.get('User-Agent') && req.get('User-Agent').includes('Mozilla')) {
      return res.redirect('/Categories/view/all');
    } else {
      CreateSuccessRes(res, updatedCategory, 200);
    }
  } catch (error) {
    next(error);
  }
});
router.delete('/:id', async function(req, res, next) {
  let id = req.params.id;
  try {
    let updatedCategory = await categoryModel.findByIdAndUpdate(
      id, 
      { isDeleted: true }, 
      { new: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    if (req.get('User-Agent') && req.get('User-Agent').includes('Mozilla')) {
      return res.redirect('/Categories/view/all');
    } else {
      return res.status(200).json({ message: 'Category deleted successfully', category: updatedCategory });
    }
  } catch (error) {
    next(error);
  }
});


module.exports = router;
