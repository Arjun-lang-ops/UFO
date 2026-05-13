import express from "express";
const router=express.Router();

import { addToCart, getCartController ,removeFromCartController, updateCartQuantity} from "../controller/userCartController.js";
import { isLoggedIn } from "../middlewares/userAuth.js";
import { addToCartController } from "../controller/userProductListController.js";

router.get('/cart',isLoggedIn,getCartController)
router.post('/add-to-cart',isLoggedIn,addToCart)
router.post('/cart/add',isLoggedIn,addToCartController)
router.post('/remove-from-cart',isLoggedIn,removeFromCartController)
router.post('/update-cart',updateCartQuantity)
export default router;