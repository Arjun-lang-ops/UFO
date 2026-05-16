import express from "express";
const router=express.Router();

import { isLoggedIn } from "../middlewares/userAuth.js";
import { wishlistRender } from "../controller/userWishlistController.js";

router.get('/wishlist',isLoggedIn,wishlistRender);

export default router;