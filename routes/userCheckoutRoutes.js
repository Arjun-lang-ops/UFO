import express from "express";
import { checkUserBlocked, isLoggedIn } from "../middlewares/userAuth.js";
import { checkoutRender ,editAddress, addAddress, selectAddress } from "../controller/userCheckoutController.js";


const router=express.Router();

router.get('/checkout',isLoggedIn,checkoutRender);


router.put("/edit-address/:id", isLoggedIn,checkUserBlocked, editAddress);
router.post("/checkout/address/add", isLoggedIn,checkUserBlocked, addAddress);
router.patch("/checkout/address/select/:id", isLoggedIn,checkUserBlocked, selectAddress);
export default router;
