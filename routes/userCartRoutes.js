import express from "express";
const router=express.Router();

import { addToCart, getCartController ,removeFromCartController} from "../controller/userCartController.js";
import { isLoggedIn } from "../middlewares/userAuth.js";

router.get('/cart',isLoggedIn,getCartController)
router.post('/add-to-cart',isLoggedIn,addToCart)
router.post('/remove-from-cart',isLoggedIn,removeFromCartController)

export default router;