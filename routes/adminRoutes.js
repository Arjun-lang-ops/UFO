import { adminLoginRender, adminHomeRender, adminLogin, logoutAdmin, adminUserManagement, toggleBlockUser } from "../controller/adminController.js";

import express from 'express';
import { adminLoggedIn, adminLoggedOut } from "../middlewares/adminAuth.js";
import { addCategoryController, categoryRender } from "../controller/adminCategoryController.js";

const router = express.Router();


router.get('/', adminLoggedOut, adminLoginRender)
router.get('/dashboard',adminLoggedIn, adminHomeRender)
router.get('/userManagement',adminLoggedIn, adminUserManagement)
router.get('/logout', logoutAdmin)
router.get('/categories',categoryRender)

router.post('/login', adminLogin)
router.patch('/block-user/:id',adminLoggedIn, toggleBlockUser)
router.post('/addCategory',addCategoryController)

export default router;