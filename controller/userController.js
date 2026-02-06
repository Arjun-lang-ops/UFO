import { registerUserLogic, verifyUserOtp } from "../service/userService.js";
import { generateAndSaveOtp, verifyOtp } from "../service/otpService.js";
import { sendMail } from "../utils/mailer.js";

// REGISTER + SEND OTP
export const registerUser = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Create user (unverified)
    await registerUserLogic(req.body);

    // 2️⃣ Generate OTP
    const otp = await generateAndSaveOtp(email);
    console.log(otp);

    // 3️⃣ Send email
    await sendMail(email, otp);

    res.status(201).json({
      success: true,
      message: "OTP sent to your email"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// VERIFY OTP
export const otpVerification = async (req, res) => {
  try {
    const { email, otp } = req.body;

    await verifyOtp(email, otp);
    await verifyUserOtp(email);

    res.json({
      success: true,
      message: "Account verified successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// RESEND OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = await generateAndSaveOtp(email);
    
    await sendMail(email, otp);

    res.json({
      success: true,
      message: "OTP resent successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// RENDER PAGES
export const registerRender = (req, res) =>
  res.render('userViews/userRegisterPage');

export const loginRender = (req, res) =>
  res.render('userViews/userLoginPage');

export const landingPageRender = (req, res) =>
  res.render('userViews/userLandingPage');

export const homePageRender = (req, res) =>
  res.render('userViews/userHomePage');

export const registerOtp = (req, res) =>
  res.render('userViews/registerOtpPage');
