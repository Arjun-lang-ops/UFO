import express from "express";
const router=express.Router();

import { isLoggedIn } from "../middlewares/userAuth.js";
import { addToWishlistController, removeWishlistController, wishlistRender } from "../controller/userWishlistController.js";

router.get('/wishlist',isLoggedIn,wishlistRender);
router.post('/wishlist/add',isLoggedIn,addToWishlistController);
router.post('/removeWishlist',isLoggedIn,removeWishlistController);


export default router;
