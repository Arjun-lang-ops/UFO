import { adminLoginRender,adminHomeRender, adminLogin, logoutAdmin, adminUserManagement, toggleBlockUser } from "../controller/adminController.js";

import express from 'express';
import { adminLoggedIn } from "../middlewares/adminAuth.js";

const router=express.Router();


router.get('/',adminLoggedIn,adminLoginRender)
router.get('/dashboard',adminHomeRender)
router.get('/userManagement',adminUserManagement)
router.get('/logout',logoutAdmin)

router.post('/login',adminLogin)
router.patch('/block-user/:id',toggleBlockUser)

export default router;