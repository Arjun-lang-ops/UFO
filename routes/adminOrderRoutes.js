import express from 'express';
import { adminOrderManagementRender, orderDetailsRender, updateOrderStatus } from '../controller/adminOrderController.js';
import { downloadInvoice } from '../config/pdf.js';
const router=express.Router();


router.get('/orderManagement',adminOrderManagementRender);
router.get('/orderManagement/:id',orderDetailsRender);
router.post('/orders/:id/status',updateOrderStatus);
router.get('/invoice/:id/download',downloadInvoice)


export default router;