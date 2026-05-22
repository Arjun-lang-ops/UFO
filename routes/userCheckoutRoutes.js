import express from "express";
import { isLoggedIn } from "../middlewares/userAuth.js";
import { checkoutRender ,editAddress } from "../controller/userCheckoutController.js";


const router=express.Router();

router.get('/checkout',isLoggedIn,checkoutRender);


router.put("/edit-address/:id", editAddress);
export default router;