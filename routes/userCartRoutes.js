import express from "express";
const router=express.Router();

import { addToCart, getCartController ,removeFromCartController, updateCartQuantity} from "../controller/userCartController.js";
import { checkUserBlocked, isLoggedIn } from "../middlewares/userAuth.js";
import { addToCartController } from "../controller/userProductListController.js";

router.get('/cart',isLoggedIn,checkUserBlocked,getCartController)
router.post('/add-to-cart',isLoggedIn,checkUserBlocked,addToCart)
router.post('/cart/add',isLoggedIn,checkUserBlocked,addToCartController)
router.post('/remove-from-cart',isLoggedIn,checkUserBlocked,removeFromCartController)
router.post('/update-cart',isLoggedIn,checkUserBlocked,updateCartQuantity)
export default router;