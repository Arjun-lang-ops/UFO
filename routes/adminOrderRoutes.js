import express from 'express';
import { adminOrderManagementRender, orderDetailsRender } from '../controller/adminOrderController.js';
const router=express.Router();


router.get('/orderManagement',adminOrderManagementRender);
router.get('/orderManagement/:id',orderDetailsRender);

export default router;