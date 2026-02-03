import { registerUserLogic,verifyUserOtp } from "../service/userService.js";
import { verifyOtp } from "../service/otpService.js";


export const registerUser=async (req,res)=>{
    try {
        await registerUserLogic(req.body);

        res.status(201).json({
            success:true,
            message:"OTP sent to your email"
        })
    } catch (error) {
        res.status(400).json({
            success:true,
            message:error.message
        })
        
    }
}

export const otpVerification=async (req,res)=>{
    try {
        const {email,otp}=req.body;

        await verifyOtp(email,otp);
        await verifyUserOtp(email);

        res.json({
            success:true,
            message:"Account verified successfully"
        })
        
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}


export const registerRender=async(req,res)=>{
    return res.render('userViews/userRegisterPage');
}

export const loginRender=async(req,res)=>{
    return res.render('userViews/userLoginPage')
}

export const landingPageRender=async (req,res)=>{
    return res.render('userViews/userLandingPage')
}

export const homePageRender= async (req,res)=>{
    return res.render('userViews/userHomePage');
}

export const registerOtp= async (req,res)=>{
    return res.render('userViews/registerOtpPage')
}