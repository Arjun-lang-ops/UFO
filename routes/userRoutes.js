import { homePageRender, landingPageRender, loginRender, loginUser, otpVerification, registerOtp, registerRender, registerUser, resendOtp, updatePassword, userAddressRender, userChangePasswordRender, userLogout, userProfileRender, getMe, forgotpasswordRender, forgotOtpRender, resetPassword } from "../controller/userController.js";
import express from "express";
import { isLoggedIn } from "../middlewares/userAuth.js";
import passport from "passport";

const router = express.Router();


router.get('/', landingPageRender)
router.get('/register', registerRender);
router.get('/login', loginRender);
router.get('/home', isLoggedIn, homePageRender);
router.get('/otp', registerOtp);
router.get('/forgotPassword',forgotpasswordRender)
router.get('/forgotPassword/otp',forgotOtpRender)
router.get('/forgotPassword/otp/reset',resetPassword)

router.get('/profile', isLoggedIn, userProfileRender)
router.get('/profile/address', isLoggedIn, userAddressRender);
router.get('/profile/changePassword', isLoggedIn, userChangePasswordRender)
router.get('/logout', userLogout)

router.get('/api/me', getMe)
// router.get('/home',userHomeAuth)

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account" // optional
  })
);

router.post('/register', registerUser);
router.post('/verify-otp', otpVerification);
router.post('/resend-otp', resendOtp);
router.post('/login', loginUser)


router.put('/profile/update-password', updatePassword)



export default router;