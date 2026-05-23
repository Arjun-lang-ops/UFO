import express from "express";
import { isLoggedIn } from "../middlewares/userAuth.js";
import { checkoutRender ,editAddress, addAddress, selectAddress } from "../controller/userCheckoutController.js";


const router=express.Router();

router.get('/checkout',isLoggedIn,checkoutRender);


router.put("/edit-address/:id", isLoggedIn, editAddress);
router.post("/checkout/address/add", isLoggedIn, addAddress);
router.patch("/checkout/address/select/:id", isLoggedIn, selectAddress);
export default router;
