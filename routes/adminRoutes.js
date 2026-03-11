import { adminLoginRender, adminHomeRender, adminLogin, logoutAdmin, adminUserManagement, toggleBlockUser } from "../controller/adminController.js";

import express from 'express';
import { adminLoggedIn, adminLoggedOut } from "../middlewares/adminAuth.js";

const router = express.Router();


router.get('/', adminLoggedOut, adminLoginRender)
router.get('/dashboard',adminLoggedIn, adminHomeRender)
router.get('/userManagement',adminLoggedIn, adminUserManagement)
router.get('/logout', logoutAdmin)

router.post('/login', adminLogin)
router.patch('/block-user/:id', toggleBlockUser)

export default router;