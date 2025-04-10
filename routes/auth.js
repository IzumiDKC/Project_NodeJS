var express = require('express');
var router = express.Router();
var userController = require('../controllers/users')
let { CreateSuccessRes, CreateErrorRes } = require('../utils/responseHandler');
let jwt = require('jsonwebtoken')
let constants = require('../utils/constants')
let { check_authentication } = require('../utils/check_auth')
let { validate, validatorLogin, validatorForgotPassword, validatorChangePassword } = require('../utils/validators')
let crypto = require('crypto')
let isBrowserRequest = require('../utils/checkBrowser')
let {sendmail} = require('../utils/sendmail')
let multer = require('multer')


/* GET home page. */
router.get('/login', (req, res) => {
    res.render('Auth/login', { error: null });
});

router.get('/signup', (req, res) => {
    res.render('Auth/signup', { error: null });
});


router.get('/logout', (req, res) => {
    res.clearCookie('token');
    req.session.destroy();
    res.redirect('/Auth/login'); 
});

router.post('/login', async function (req, res, next) {
    try {
      const { username, password } = req.body;
      const userID = await userController.CheckLogin(username, password);
      const user = await userController.GetUserByID(userID);
  
      req.session.user = user;   
      if (isBrowserRequest(req)) {
        return res.redirect('/products/view/all');
      }
      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      return res.render('Auth/login', { error: error.message || "Đăng nhập thất bại" });
    }
  });
  
  
  router.post('/signup', validatorLogin, validate, async function (req, res, next) {
    try {
      const body = req.body;
      const newUser = await userController.CreateAnUser(
        body.username, body.password, body.email, 'user'
      );
      req.session.user = newUser;
  
      if (isBrowserRequest(req)) {
        return res.redirect('/products/view/all');
      }
  
      res.status(201).json({
        success: true,
        message: "Đăng ký thành công",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email
        }
      });
    } catch (error) {
      return res.render('Auth/signup', { 
        error: error.message || "Đăng ký thất bại",
        username: req.body.username,
        email: req.body.email
      });
    }
  });


router.get('/me', check_authentication, async function (req, res, next) {
    console.log(req.user);
    CreateSuccessRes(res, req.user, 200)
})

router.post('/forgotpassword', validatorForgotPassword, validate, async function (req, res, next) {
    try {
        let email = req.body.email;
        let user = await userController.GetUserByEmail(email);
        if (user) {
            user.resetPasswordToken = crypto.randomBytes(24).toString('hex')
            user.resetPasswordTokenExp = (new Date(Date.now() + 10 * 60 * 1000)).getTime();
            await user.save();
            let url = `http://localhost:3000/auth/reset_password/${user.resetPasswordToken}`
            await sendmail(user.email,"bam vao day di anh chai",url)
            CreateSuccessRes(res, {
                url: url
            }, 200)
            
        } else {
            throw new Error("email khong ton tai")
        } 
    } catch (error) {
        next(error)
    }
})

//cai 2 thu vien: nodemailer, multer

router.post('/reset_password/:token', validatorChangePassword, 
validate, async function (req, res, next) {
    try {
        let token = req.params.token;
        let user = await userController.GetUserByToken(token);
        if (user) {
            let newpassword = req.body.password;
            user.password = newpassword;
            user.resetPasswordToken= null;
            user.resetPasswordTokenExp = null;
            await user.save();
            CreateSuccessRes(res, user, 200)
        } else {
            throw new Error("email khong ton tai")
        }
    } catch (error) {
        next(error)
    }
})




//67de10517282904fbca502ae
module.exports = router;
