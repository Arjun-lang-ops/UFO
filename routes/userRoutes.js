import { homePageRender, landingPageRender, loginRender, otpVerification, registerOtp, registerRender, registerUser } from "../controller/userController.js";
import express from "express";
import { registerUserLogic } from "../service/userService.js";

const router=express.Router();


router.get('/',landingPageRender)
router.get('/register',registerRender);
router.get('/login',loginRender);
router.get('/home',homePageRender);
router.get('/otp',registerOtp);

router.post('/register',registerUser);
router.post('verify-otp',otpVerification);


export default router;