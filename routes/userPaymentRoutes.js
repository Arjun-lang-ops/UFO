import express from "express";
import { referAndEarnController, walletRender } from "../controller/userPaymentController.js";
import { isLoggedIn } from "../middlewares/userAuth.js";

const router=express.Router();

router.get('/wallet', isLoggedIn,walletRender);
router.get('/profile/refer-and-earn',isLoggedIn,referAndEarnController)

export default router;