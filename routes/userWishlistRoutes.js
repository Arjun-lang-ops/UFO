import express from "express";
const router = express.Router();

import {
  isLoggedIn,
  checkUserBlocked,
} from "../middlewares/userAuth.js";
import {
  addToWishlistController,
  removeWishlistController,
  wishlistRender,
} from "../controller/userWishlistController.js";

router.get(
  "/wishlist",
  isLoggedIn,
  checkUserBlocked,
  wishlistRender,
);
router.post(
  "/wishlist/add",
  isLoggedIn,
  checkUserBlocked,
  addToWishlistController,
);
router.post(
  "/removeWishlist",
  isLoggedIn,
  checkUserBlocked,
  removeWishlistController,
);


export default router;
