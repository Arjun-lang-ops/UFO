import { adminLoginRender,adminHomeRender } from "../controller/adminController.js";

import express from 'express';

const router=express.Router();


router.get('/',adminLoginRender)
router.get('/home',adminHomeRender)

export default router;