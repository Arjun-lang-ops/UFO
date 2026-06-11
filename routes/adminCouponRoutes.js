import express from "express";
import { couponAddRender, couponEditRender, couponPageRender, createCoupon, editCoupon } from "../controller/adminCouponController.js";
import { adminLoggedIn } from "../middlewares/adminAuth.js";
const router = express.Router();

router.get('/coupon', adminLoggedIn,couponPageRender);
router.get('/add-coupon',adminLoggedIn,couponAddRender);
router.get('/edit-coupon/:id',adminLoggedIn,couponEditRender);
router.post('/coupons/add',adminLoggedIn,createCoupon);
router.post('/coupon-edit-success/:id',adminLoggedIn,editCoupon)

export default router;
