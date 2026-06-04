import express from "express";
import { walletRender } from "../controller/userPaymentController.js";
import { isLoggedIn } from "../middlewares/userAuth.js";

const router=express.Router();

router.get('/wallet', isLoggedIn,walletRender);

export default router;