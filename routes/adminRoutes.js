import { adminLoginRender, adminHomeRender, adminLogin, logoutAdmin, adminUserManagement, toggleBlockUser, adminDashboardChartData } from "../controller/adminController.js";

import express from 'express';
import { adminLoggedIn, adminLoggedOut } from "../middlewares/adminAuth.js";
import { addCategoryController, assignCategoryOfferController, categoryRender,editCategoryController } from "../controller/adminCategoryController.js";
import { addProduct, addProductController, assignProductOfferController, editProduct, productRender, editProductController, toggleProductStatusController } from "../controller/adminProductController.js";
import { uploadVariantImages } from "../middlewares/uploadProduct.js";

const router = express.Router();


router.get('/', adminLoggedOut, adminLoginRender)
router.get('/dashboard',adminLoggedIn, adminHomeRender)
router.get('/dashboard/chart-data', adminLoggedIn, adminDashboardChartData)
router.get('/userManagement',adminLoggedIn, adminUserManagement)
router.get('/logout', logoutAdmin)
router.get('/categories',adminLoggedIn,categoryRender);
router.get('/products',adminLoggedIn,productRender);
router.get('/product-add',adminLoggedIn,addProduct)
router.get('/product-edit/:id',adminLoggedIn,editProduct)

router.post('/login', adminLogin);
router.patch('/block-user/:id',adminLoggedIn, toggleBlockUser);
router.patch('/product/toggle-status/:id',toggleProductStatusController)
//offer apply in product
router.patch('/product/:id/offer',adminLoggedIn,assignProductOfferController)
router.post('/addCategory',addCategoryController);
router.put('/editCategory/:id',editCategoryController);
//offer apply in category
router.patch('/category/:id/offer',adminLoggedIn,assignCategoryOfferController);
router.post('/product-added',uploadVariantImages,addProductController)
router.put('/product-edit/:id',uploadVariantImages, editProductController)

export default router;
