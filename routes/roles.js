var express = require('express');
var router = express.Router();
var roleController = require('../controllers/roles');
let { CreateErrorRes, CreateSuccessRes } = require('../utils/responseHandler');
const isBrowserRequest = require('../utils/checkBrowser');

// Get all roles
router.get('/', async function(req, res, next) {
  try {
    let roles = await roleController.GetAllRoles();
    CreateSuccessRes(res, roles, 200);
  } catch (error) {
    next(error);
  }
});

router.get('/view/all', async function(req, res, next) {
   try {
     let roles = await roleController.GetAllRoles();
 
     if (isBrowserRequest(req)) {
       res.render('Roles/indexRoles', { roles }); // Giao diện HTML
     } else {
       res.status(200).json({
         success: true,
         message: "Lấy danh sách vai trò thành công",
         data: roles
       }); // JSON cho Postman
     }
   } catch (error) {
     next(error);
   }
 });

 router.get('/view/create', async function(req, res, next) {
   try {
     if (isBrowserRequest(req)) {
       res.render('Roles/createRole');
     } else {
       const timestamp = new Date().getTime();
       const newRole = await roleController.CreateARole('auto_role_' + timestamp);
       res.status(201).json({
         success: true,
         message: "Role auto created",
         data: newRole
       });
     }
   } catch (error) {
     next(error);
   }
 });
 
 router.post('/view/create', async function(req, res, next) {
   try {
     const { name, description } = req.body;
     const newRole = await roleController.CreateARole(name, description || "");
 
     if (isBrowserRequest(req)) {
       res.redirect('/roles/view/all');
     } else {
       CreateSuccessRes(res, newRole, 201);
     }
   } catch (error) {
     next(error);
   }
 });
 

 router.get('/view/edit/:id', async function(req, res, next) {
   try {
     let role = await Role.findById(req.params.id);
     if (!role || role.isDeleted) return CreateErrorRes(res, 'Role không tồn tại', 404);
     res.render('Roles/editRole', { role });
   } catch (error) {
     next(error);
   }
 });

 router.put('/:id', async function(req, res, next) {
   try {
     let role = await Role.findByIdAndUpdate(
       req.params.id,
       {
         name: req.body.name,
         description: req.body.description
       },
       { new: true }
     );
     if (!role) return CreateErrorRes(res, 'Role không tồn tại', 404);
     res.redirect('/roles/view/all');
   } catch (error) {
     next(error);
   }
 });

// Create new role
router.post('/', async function(req, res, next) {
  try {
    let newRole = await roleController.CreateARole(req.body.name, req.body.description);
    CreateSuccessRes(res, newRole, 201);
  } catch (error) {
    next(error);
  }
});

// Get role by ID
router.get('/:id', async function(req, res, next) {
  try {
    let role = await roleController.GetRoleById(req.params.id);
    if (!role) return CreateErrorRes(res, 'Role not found', 404);
    CreateSuccessRes(res, role, 200);
  } catch (error) {
    next(error);
  }
});

// Update role
router.put('/:id', async function(req, res, next) {
  try {
    let updated = await roleController.UpdateRole(req.params.id, req.body);
    if (!updated) return CreateErrorRes(res, 'Role not found', 404);
    CreateSuccessRes(res, updated, 200);
  } catch (error) {
    next(error);
  }
});

// Soft delete role
router.delete('/:id', async function(req, res, next) {
  try {
    let deleted = await roleController.DeleteRole(req.params.id);
    if (!deleted) return CreateErrorRes(res, 'Role not found', 404);
    CreateSuccessRes(res, deleted, 200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
