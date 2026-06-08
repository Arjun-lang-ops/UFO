import express from "express";
import { couponAddRender, couponEditRender, couponPageRender, createCoupon, editCoupon } from "../controller/adminCouponController.js";

const router = express.Router();

router.get('/coupon', couponPageRender);
router.get('/add-coupon',couponAddRender);
router.get('/edit-coupon/:id',couponEditRender);
router.post('/coupons/add',createCoupon);
router.post('/coupon-edit-success/:id',editCoupon)

export default router;
