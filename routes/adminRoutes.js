import { adminLoginRender, adminHomeRender, adminLogin, logoutAdmin, adminUserManagement, toggleBlockUser } from "../controller/adminController.js";

import express from 'express';
import { adminLoggedIn, adminLoggedOut } from "../middlewares/adminAuth.js";
import { addCategoryController, categoryRender,editCategoryController } from "../controller/adminCategoryController.js";
import { addProduct, addProductController, editProduct, productRender } from "../controller/adminProductController.js";
import { uploadVariantImages } from "../middlewares/uploadProduct.js";

const router = express.Router();


router.get('/', adminLoggedOut, adminLoginRender)
router.get('/dashboard',adminLoggedIn, adminHomeRender)
router.get('/userManagement',adminLoggedIn, adminUserManagement)
router.get('/logout', logoutAdmin)
router.get('/categories',adminLoggedIn,categoryRender);
router.get('/products',adminLoggedIn,productRender);
router.get('/product-add',adminLoggedIn,addProduct)
router.get('/product-edit/:id',adminLoggedIn,editProduct)

router.post('/login', adminLogin);
router.patch('/block-user/:id',adminLoggedIn, toggleBlockUser);
router.post('/addCategory',addCategoryController);
router.put('/editCategory/:id',editCategoryController);
router.post('/product-added',uploadVariantImages,addProductController)


export default router;