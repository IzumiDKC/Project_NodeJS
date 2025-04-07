var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products')
let categoryModel = require('../schemas/category')
let {CreateErrorRes,
  CreateSuccessRes} = require('../utils/responseHandler')

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let products = await productModel.find({
    isDeleted:false
  }).populate("category")
  CreateSuccessRes(res,products,200);
});

// FRONTEND ROUTES
router.get('/view/all', async function(req, res, next) {
  try {
    let products = await productModel.find({ isDeleted: false }).populate('category');
    res.render('Products/indexProducts', { products });  
  } catch (error) {
    next(error);
  }
});
router.get('/view/create', async (req, res, next) => {
  try {
    const categories = await categoryModel.find({});
    res.render('Products/createProduct', { categories });
  } catch (error) {
    next(error);
  }
});

router.get('/view/edit/:id', async function(req, res, next) {
  try {
    let product = await productModel.findById(req.params.id).populate('category');
    if (!product) {
      return res.status(404).send("Product not found");
    }
    let categories = await categoryModel.find();
    res.render('Products/editProduct', { product, categories });
  } catch (error) {
    next(error);
  }
});


router.get('/:id', async function(req, res, next) {
  try {
    let product = await productModel.findOne({
      _id:req.params.id, isDeleted:false
    }
    )
    CreateSuccessRes(res,product,200);
  } catch (error) {
    next(error)
  }
});



// tương thích với form HTML gửi POST
router.post('/:id', async (req, res, next) => {
  req.method = 'PUT';
  next();
}, router.handle.bind(router));

router.put('/:id', async function(req, res, next) {
  let id = req.params.id;
  try {
    let body = req.body;
    let updatedInfo = {};

    if(body.name) updatedInfo.name = body.name;
    if(body.price) updatedInfo.price = body.price;
    if(body.quantity) updatedInfo.quantity = body.quantity;
    if(body.category) updatedInfo.category = body.category;
    if(body.description) updatedInfo.description = body.description;
    if(body.urlImg) updatedInfo.urlImg = body.urlImg;

    let updateProduct = await productModel.findByIdAndUpdate(
      id, updatedInfo, { new: true }
    );
    CreateSuccessRes(res,updateProduct,200);
  } catch (error) {
    next(error);
  }
});


// 

router.post('/', async function(req, res, next) {
  try {
    let body = req.body;

    let category = await categoryModel.findOne({
      name: body.category
    });

    if (category) {
      let newProduct = new productModel({
        name: body.name,
        price: body.price,
        quantity: body.quantity,
        category: category._id,
        urlImg: body.urlImg || "",           
        description: body.description || ""  
      });

      await newProduct.save();

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: newProduct
      });

    } else {
      throw new Error("Danh mục không tồn tại");
    }
  } catch (error) {
    next(error);
  }
});

/* router.put('/:id', async function(req, res, next) {
  let id = req.params.id;
  try {
    let body = req.body
    let updatedInfo = {};
    if(body.name){
      updatedInfo.name = body.name;
    }
    if(body.price){
      updatedInfo.price = body.price;
    }
    if(body.quantity){
      updatedInfo.quantity = body.quantity;
    }
    if(body.category){
      updatedInfo.category = body.category;
    }
    let updateProduct = await productModel.findByIdAndUpdate(
      id,updatedInfo,{new:true}
    )
    CreateSuccessRes(res,updateProduct,200);
  } catch (error) {
    next(error)
  }
}); */




router.delete('/:id', async function(req, res, next) {
  let id = req.params.id;
  try {
    let body = req.body
    let updateProduct = await productModel.findByIdAndUpdate(
      id,{
        isDeleted:true
      },{new:true}
    )
    CreateSuccessRes(res,updateProduct,200);
  } catch (error) {
    next(error)
  }
});

router.get('/:slugcategory/:slugproduct', async (req, res, next) => {
  try {
      let { slugcategory, slugproduct } = req.params;

      let category = await categoryModel.findOne({ slug: slugcategory });
      if (!category) return CreateErrorRes(res, "Category not found", 404);

      let product = await productModel.findOne({ slug: slugproduct, category: category._id });
      if (!product) return CreateErrorRes(res, "Product not found", 404);

      CreateSuccessRes(res, product, 200);
  } catch (error) {
      next(error);
  }
});

module.exports = router;
