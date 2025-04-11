var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products')
let categoryModel = require('../schemas/category')
let brandModel = require('../schemas/brands')
let {CreateErrorRes,
  CreateSuccessRes} = require('../utils/responseHandler')
const isBrowserRequest = require('../utils/checkBrowser'); 


/* GET users listing. */
router.get('/', async function(req, res, next) {
  let products = await productModel.find({
    isDeleted:false
  }).populate("category")
  .populate("brand")
  CreateSuccessRes(res,products,200);
});

router.get('/view/all', async function(req, res, next) {
  try {
    let products = await productModel.find({ isDeleted: false })
      .populate('category')
      .populate('brand');

    if (isBrowserRequest(req)) {
      res.render('Products/indexProducts', { products }); 
    } else {
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách sản phẩm thành công',
        data: products
      }); 
    }

  } catch (error) {
    next(error);
  }
});
router.get('/view/create', async (req, res, next) => {
  try {
    const categories = await categoryModel.find({});
    const brands = await brandModel.find({});
    res.render('Products/createProduct', { categories, brands });
  } catch (error) {
    next(error);
  }
});

router.get('/view/edit/:id', async function(req, res, next) {
  try {
    let product = await productModel.findById(req.params.id).populate('category').populate('brand');
    if (!product) {
      return res.status(404).send("Product not found");
    }
    let categories = await categoryModel.find();
    let brands = await brandModel.find();
    res.render('Products/editProduct', { product, categories, brands });
  } catch (error) {
    next(error);
  }
});

router.get('/view/detail/:id', async function(req, res, next) {
  try {
    let product = await productModel.findById(req.params.id)
      .populate('category')
      .populate('brand');

    if (!product) {
      return isBrowserRequest(req)
        ? res.status(404).render('404')
        : CreateErrorRes(res, "Product not found", 404);
    }
    const reviews = await Review.find({ product_id: product._id, isDeleted: false })
    .populate('user_id', 'username')
    .sort({ created_at: -1 });

    res.render('Products/detailProduct', {
      product,
      reviews,
      user: req.session.user
    });
    if (isBrowserRequest(req)) {
      res.render('Products/detailProduct', { product });
    } else {
      CreateSuccessRes(res, product, 200);
    }

  } catch (error) {
    next(error);
  }
});

router.get('/delete/:id', async function(req, res, next) {
  let id = req.params.id;
  try {
    let deleted = await productModel.findByIdAndUpdate(id, {
      isDeleted: true
    }, { new: true });

    if (!deleted) {
      return res.status(404).send("Product not found");
    }

    res.redirect('/products/view/all');
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



router.post('/:id', async (req, res, next) => {
  req.method = 'PUT';
  next();
}, router.handle.bind(router));

router.put('/:id', async function(req, res, next) {
  let id = req.params.id;
  try {
    let body = req.body;
    let updatedInfo = {};

    if (body.name) updatedInfo.name = body.name;
    if (body.price) updatedInfo.price = body.price;
    if (body.quantity) updatedInfo.quantity = body.quantity;
    if (body.category) updatedInfo.category = body.category;
    if (body.brand) updatedInfo.brand = body.brand;
    if (body.description) updatedInfo.description = body.description;
    if (body.urlImg) updatedInfo.urlImg = body.urlImg;

    let updateProduct = await productModel.findByIdAndUpdate(
      id,
      updatedInfo,
      { new: true }
    );
    if (!updateProduct) {
      return isBrowserRequest(req)
        ? res.status(404).render('404')
        : CreateErrorRes(res, "Product not found", 404);
    }
    if (isBrowserRequest(req)) {
      return res.redirect('/products/view/all');
    } else {
      return CreateSuccessRes(res, updateProduct, 200);
    }

  } catch (error) {
    next(error);
  }
});

router.post('/', async function(req, res, next) {
  try {
    let body = req.body;

    let category = await categoryModel.findOne({
      name: body.category
    });
    let brand = await brandModel.findOne({
      name: body.brand
    });

    if (category, brand) {
      let newProduct = new productModel({
        name: body.name,
        price: body.price,
        quantity: body.quantity,
        category: category._id,
        brand: brand._id,
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

router.get('/:slugcategory/:slugbrand/:slugproduct', async (req, res, next) => {
  try {
      let { slugcategory, slugbrand, slugproduct } = req.params;

      let category = await categoryModel.findOne({ slug: slugcategory });
      if (!category) return CreateErrorRes(res, "Category not found", 404);

      let brand = await brandModel.findOne({ slug: slugbrand });
      if (!brand) return CreateErrorRes(res, "Brand not found", 404);

      let product = await productModel.findOne({ slug: slugproduct, category: category._id, brand: brand._id });
      if (!product) return CreateErrorRes(res, "Product not found", 404);

      CreateSuccessRes(res, product, 200);
  } catch (error) {
      next(error);
  }
});


module.exports = router;
