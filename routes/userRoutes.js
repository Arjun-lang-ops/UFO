import { googleRender, homePageRender, landingPageRender, loginRender, loginUser, otpVerification, registerOtp, registerRender, registerUser, resendOtp, userAddressRender, userChangePasswordRender, userLogout, userProfileRender } from "../controller/userController.js";
import express from "express";
import { isLoggedIn } from "../middlewares/userAuth.js";

const router = express.Router();


router.get('/', landingPageRender)
router.get('/register', registerRender);
router.get('/login', loginRender);
router.get('/home', homePageRender,isLoggedIn);
router.get('/otp', registerOtp);
router.get('/google',googleRender)
router.get('/profile',userProfileRender)
router.get('/profile/address',userAddressRender);
router.get('/profile/changePassword',userChangePasswordRender)
router.get('/logout',userLogout)
// router.get('/home',userHomeAuth)

router.post('/register', registerUser);
router.post('/verify-otp', otpVerification);
router.post('/resend-otp', resendOtp);
router.post('/login',loginUser)



export default router;