import {  landingPageRender, loginRender, loginUser, otpVerification, registerOtp, registerRender, registerUser, resendOtp, updatePassword, userChangePasswordRender, userLogout, userProfileRender, getMe, forgotpasswordRender, resetPassword } from "../controller/userController.js";
import express from "express";
import { checkUserBlocked, isLoggedIn, isLoggedOut } from "../middlewares/userAuth.js";
import passport from "passport";
import { emailOtpRender, emailOtpSend, resendEmailOtp, verifyEmailOtp } from "../controller/userEmailChangeController.js";
import { addAddressController, editAddressRender,userAddressRender,removeAddressController, updateAddressController, setDefaultAddressController } from "../controller/userAddressController.js";
import { upload } from "../middlewares/upload.js";
import { updateProfilePhotoController } from "../controller/userProfileController.js";
import { forgotPasswordVerify,resendOtpReset,resetSendMail, setPassword, verifyForgotOtp } from "../controller/userForgotPasswordController.js";
import { googleAuthCallback } from "../controller/authController.js";
import { loadHomePage } from "../controller/userCategoryController.js";
const router = express.Router();


router.get('/', landingPageRender)
router.get('/register',isLoggedOut, registerRender);
router.get('/login',isLoggedOut, loginRender);
router.get('/home', isLoggedIn,checkUserBlocked,loadHomePage);
router.get('/otp', registerOtp);
router.get('/forgotPassword', forgotpasswordRender)

//router.get('/forgotPassword/otp', forgotOtpRender)

router.get('/forgotPassword/otp', resetPassword)
router.get('/forgotPassword/verify',forgotPasswordVerify)

router.get('/profile', isLoggedIn,checkUserBlocked, userProfileRender)
router.get('/profile/address', isLoggedIn,checkUserBlocked, userAddressRender);
router.get('/profile/address/edit/:id',isLoggedIn,checkUserBlocked,editAddressRender)
router.get('/profile/email-otp', isLoggedIn,checkUserBlocked, emailOtpRender);
router.get('/profile/changePassword', isLoggedIn,checkUserBlocked, userChangePasswordRender)
router.get('/logout', userLogout)

router.get('/api/me', getMe)
// router.get('/home',userHomeAuth)

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account" 
  })
);


router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login"
  }),
  googleAuthCallback
);

router.post('/register', registerUser);
router.post('/verify-otp', otpVerification);
router.post('/resend-otp', resendOtp);
router.post('/login', loginUser)
router.post('/forgotPassword', resetSendMail);
router.post('/resend-forgot-otp', resendOtpReset);
router.post('/verify-forgot-otp',verifyForgotOtp);
router.post('/reset-forgot',setPassword)
router.post('/profile/change-email', emailOtpSend);
router.post('/profile/email-otp', verifyEmailOtp);
router.post('/profile/resend-email-otp', resendEmailOtp);
router.post('/profile/address/add',addAddressController)
router.post(
  "/profile/upload",
  isLoggedIn,
  upload.single("profileImage"),
  updateProfilePhotoController
);


router.put('/profile/address/update/:id',updateAddressController)
router.patch('/profile/address/default/:id', isLoggedIn, checkUserBlocked, setDefaultAddressController);
router.put('/profile/update-password', updatePassword);
router.delete('/profile/address/remove/:id',removeAddressController)



export default router;