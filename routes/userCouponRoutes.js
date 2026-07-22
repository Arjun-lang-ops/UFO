import express from 'express';
import { applyCoupon } from '../controller/userCouponController.js';
import { isLoggedIn,checkUserBlocked } from '../middlewares/userAuth.js';



const router = express.Router();

router.post('/checkout/apply-coupon',isLoggedIn,checkUserBlocked, applyCoupon);

export default router;
