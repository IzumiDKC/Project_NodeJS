const express = require('express');
const router = express.Router();  // Khai báo router
const Menu = require('../schemas/menu'); // Đảm bảo đã import model Menu

// Endpoint để lấy menu
router.get('/', async (req, res) => {
    try {
        let menus = await Menu.find();  // Lấy dữ liệu từ menu collection
        let menuTree = buildMenuTree(menus);  // Tạo cấu trúc cây
        res.json(menuTree);  // Trả về kết quả dạng JSON
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Hàm để xây dựng cây menu
function buildMenuTree(menus, parentId = null) {
    return menus
        .filter(menu => String(menu.parent) === String(parentId))
        .map(menu => ({
            text: menu.text,
            url: menu.url,
            children: buildMenuTree(menus, menu._id)  // Đệ quy
        }));
}

// Route hiển thị view
router.get('/view', async (req, res) => {
    try {
        let menus = await Menu.find();  // Lấy từ MongoDB
        let menuTree = buildMenuTree(menus);  // Tạo cây
        res.render('menu', { menu: menuTree });  // Gửi qua EJS view
    } catch (err) {
        res.status(500).send('Lỗi khi hiển thị menu');
    }
});


// Xuất router để sử dụng trong app.js
module.exports = router;
