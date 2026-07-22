import express from "express";
import { referAndEarnController, walletRender } from "../controller/userPaymentController.js";
import { checkUserBlocked, isLoggedIn } from "../middlewares/userAuth.js";

const router = express.Router();

router.get("/wallet", isLoggedIn, checkUserBlocked, walletRender);
router.get(
  "/profile/refer-and-earn",
  isLoggedIn,
  checkUserBlocked,
  referAndEarnController,
);

export default router;