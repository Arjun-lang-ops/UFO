import express from 'express';
import { orderConfirmRender, placeOrderController } from '../controller/userOrderController.js';

const router=express.Router();

router.get('/orderConfirm/:orderId',orderConfirmRender);
router.post('/checkout/confirm',placeOrderController)

export default router;