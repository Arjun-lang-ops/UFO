import express from 'express';
import { adminOrderManagementRender, orderDetailsRender, updateOrderStatus } from '../controller/adminOrderController.js';
const router=express.Router();


router.get('/orderManagement',adminOrderManagementRender);
router.get('/orderManagement/:id',orderDetailsRender);
router.post('/orders/:id/status',updateOrderStatus)

export default router;