import { adminLoginRender, adminHomeRender, adminLogin, logoutAdmin, adminUserManagement, toggleBlockUser } from "../controller/adminController.js";

import express from 'express';
import { adminLoggedIn, adminLoggedOut } from "../middlewares/adminAuth.js";
import { addCategoryController, categoryRender,editCategoryController } from "../controller/adminCategoryController.js";
import { AddProduct, editProduct, productRender } from "../controller/adminProductController.js";

const router = express.Router();


router.get('/', adminLoggedOut, adminLoginRender)
router.get('/dashboard',adminLoggedIn, adminHomeRender)
router.get('/userManagement',adminLoggedIn, adminUserManagement)
router.get('/logout', logoutAdmin)
router.get('/categories',adminLoggedIn,categoryRender);
router.get('/products',adminLoggedIn,productRender);
router.get('/product-add',adminLoggedIn,AddProduct)
router.get('/product-edit',adminLoggedIn,editProduct)

router.post('/login', adminLogin);
router.patch('/block-user/:id',adminLoggedIn, toggleBlockUser);
router.post('/addCategory',addCategoryController);
router.put('/editCategory/:id',editCategoryController);

export default router;