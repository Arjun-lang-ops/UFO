import { homePageRender, landingPageRender, loginRender, loginUser, otpVerification, registerOtp, registerRender, registerUser, resendOtp } from "../controller/userController.js";
import express from "express";
// import { userHomeAuth } from "../middlewares/userAuth.js";

const router = express.Router();


router.get('/', landingPageRender)
router.get('/register', registerRender);
router.get('/login', loginRender);
router.get('/home', homePageRender);
router.get('/otp', registerOtp);
// router.get('/home',userHomeAuth)

router.post('/register', registerUser);
router.post('/verify-otp', otpVerification);
router.post('/resend-otp', resendOtp);
router.post('/login',loginUser)



export default router;