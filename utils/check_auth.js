let jwt = require('jsonwebtoken')
let constants = require('../utils/constants')
let userController = require('../controllers/users');
const e = require('express');
module.exports = {
    check_authentication: async function (req, res, next) {
            try {
                let token = null;
    
                if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
                    token = req.headers.authorization.split(" ")[1];
                } 
                else if (req.cookies.token) {
                    token = req.cookies.token;
                }
        
                if (!token) {
                    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
                }
        
                const result = jwt.verify(token, constants.SECRET_KEY);
        
                if (result.expire <= Date.now()) {
                    return res.status(401).json({ message: "Token đã hết hạn" });
                }
        
                const user = await userController.GetUserByID(result.id);
                if (!user) {
                    return res.status(401).json({ message: "Người dùng không tồn tại" });
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
                console.log(object);
                let roleOfUser = req.user.role.name;
                if (roles.includes(roleOfUser)) {
                    next();
                } else {
                    throw new Error("ban khong co quyen")
                }
            } catch (error) {
                next(error)
            }
        }
    }
}