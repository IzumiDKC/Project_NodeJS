const express = require('express');
const router = express.Router(); 
const Menu = require('../schemas/menu');

router.get('/', async (req, res) => {
    try {
        let menus = await Menu.find(); 
        let menuTree = buildMenuTree(menus);  
        res.json(menuTree); 
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

function buildMenuTree(menus, parentId = null) {
    return menus
        .filter(menu => String(menu.parent) === String(parentId))
        .map(menu => ({
            text: menu.text,
            url: menu.url,
            children: buildMenuTree(menus, menu._id)  // Đệ quy
        }));
}

router.get('/view', async (req, res) => {
    try {
        let menus = await Menu.find();  
        let menuTree = buildMenuTree(menus);  
        res.render('menu', { menu: menuTree });  
    } catch (err) {
        res.status(500).send('Lỗi khi hiển thị menu');
    }
});

module.exports = router;
