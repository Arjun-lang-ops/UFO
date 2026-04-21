import { forgotUserService, resetPasswordService } from "../service/userService.js";
import { generateAndSaveOtp, verifyOtp } from "../service/otpService.js";
import { sendForgotPasswordMail } from "../utils/mailer.js";
import Otp from "../models/otpModel.js";



export const forgotPasswordVerify=async(req,res)=>{
  
    return res.render('userViews/userForgotPasswordVerify')
}

//sending otp for forgot password
export const resetSendMail = async (req, res) => {
  try {
    const { email } = req.body;
    await forgotUserService(req.body);
    const otp = await generateAndSaveOtp(email);
    console.log(otp);
    await sendForgotPasswordMail(email, otp);

    res.status(201).json({
      success: true,
      message: "Otp send to your mail"
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })

  }
}

export const resendOtpReset = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = await generateAndSaveOtp(email );
    await sendForgotPasswordMail( email, otp );
    res.status(201).json({
      success: true,
      message: "Otp resend succesfully"
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

export const verifyForgotOtp=async(req,res)=>{
  try {
    const {otp,email}=req.body;
    console.log('otp :',otp,email)
    await verifyOtp(email,otp);
    req.session.isOtpVerified = true;
    req.session.resetEmail = email;
    res.status(200).json({
      success:true,
      message:'verified'
    })
    
    
  } catch (error) {
    console.log(error);
    res.json({
      success:false,
      message:error.message
    })
    
  }
}

export const setPassword=async (req,res)=>{
  try {
    const {email,newPassword,confirmPassword}=req.body;
    console.log(newPassword)
    await resetPasswordService(email,newPassword,confirmPassword);

    res.json({
      success:true,
      message:'Password reset succesfully'
    })
    
  } catch (error) {
    res.json({
      success:false,
      message:error.message
    })
  }
}