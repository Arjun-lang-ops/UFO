import { homePageRender, landingPageRender, loginRender, otpVerification, registerOtp, registerRender, registerUser, resendOtp } from "../controller/userController.js";
import express from "express";

const router = express.Router();


router.get('/', landingPageRender)
router.get('/register', registerRender);
router.get('/login', loginRender);
router.get('/home', homePageRender);
router.get('/otp', registerOtp);

router.post('/register', registerUser);
router.post('/verify-otp', otpVerification);
router.post('/resend-otp', resendOtp);


export default router;