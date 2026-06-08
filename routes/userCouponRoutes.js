import express from 'express';
import { applyCoupon } from '../controller/userCouponController.js';



const router = express.Router();

router.post('/checkout/apply-coupon', applyCoupon);

export default router;
