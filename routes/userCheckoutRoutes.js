import express from "express";
import { isLoggedIn } from "../middlewares/userAuth.js";
import { checkoutRender } from "../controller/userCheckoutController.js";
import { checkoutAddressRender } from "../controller/userCheckoutAddress.js";

const router=express.Router();

router.get('/checkout',isLoggedIn,checkoutRender);
router.get('/checkout/address',isLoggedIn,checkoutAddressRender)

export default router;