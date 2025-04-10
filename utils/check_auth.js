let jwt = require('jsonwebtoken')
let constants = require('../utils/constants')
let userController = require('../controllers/users');
const e = require('express');
module.exports = {
    check_authentication: async function (req, res, next) {
      try {
        if (!req.session.user) {
          if (req.accepts('html')) {
            return res.status(401).render('errors/401', { message: "Bạn chưa đăng nhập" });
          } else {
            return res.status(401).json({ message: "Bạn chưa đăng nhập" });
          }
        }
  
        req.user = user; 
        next();
      } catch (error) {
        console.error("Auth Error:", error.message);
        return res.status(401).json({ message: "Xác thực thất bại" });
      }
    },
  
    check_authorization: function (roles) {
      return async function (req, res, next) {
        try {
          const roleOfUser = req.user.role.name;
          if (roles.includes(roleOfUser)) {
            next();
          } else {
            throw new Error("Bạn không có quyền truy cập");
          }
        } catch (error) {
          next(error);
        }
      }
    }
  };