import { registerUserLogic, verifyUserOtp, userLoginLogic, changePasswordService } from "../service/userService.js";
import { generateAndSaveOtp, verifyOtp } from "../service/otpService.js";
import { sendMail } from "../utils/mailer.js";




// Render pages
export const registerRender = (req, res) =>
  res.render('userViews/userRegisterPage');

export const loginRender = (req, res) =>
  res.render('userViews/userLoginPage');

export const landingPageRender = (req, res) =>
  res.render('userViews/userLandingPage');

export const homePageRender = (req, res) =>{
  if(!req.session.user){
   return res.redirect('/login')
  }
  res.render('userViews/userHomePage');
}
  

export const registerOtp = (req, res) =>
  res.render('userViews/registerOtpPage');



// Register and sending otp
export const registerUser = async (req, res) => {
  try {
    const { email } = req.body;

    await registerUserLogic(req.body);

    const otp = await generateAndSaveOtp(email);
    console.log(otp);

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

// Verify otp
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

// Resending otp
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

//login user
export const loginUser=async (req,res)=>{

  try {
    
    const user=await userLoginLogic(req.body);
    req.session.userId=user._id;
    req.session.user=true
    
    res.status(200).json({
      success:true,
      message:"login successfully",
      redirectUrl: "/home"
    })
  } catch (error) {
    res.status(400).json({
      success:false,
      message:error.message
    })
  }
}

export const userProfileRender=(req,res)=>
  res.render('userViews/userProfile')

export const userAddressRender=(req,res)=>
  res.render('userViews/userAddress')


export const userChangePasswordRender=(req,res)=>
  res.render('userViews/userChangePassword')




export const updatePassword=async (req,res)=>{
  try {
    const userId=req.session.userId;
    console.log('session: ' ,req.session)
    const {currentPassword,newPassword,confirmNewPassword}=req.body;

    const message= await changePasswordService(userId,currentPassword,newPassword,confirmNewPassword);

    res.status(200).json({
      success:true,
      message

    })

  } catch (error) {
    return res.status(400).json({
      success:false,
      message:error.message
    })
    
  }
}

export const userLogout=(req,res)=>{
  req.session.destroy((err)=>{
    if(err){
      return res.redirect('/')
    }
    res.redirect('/login')
  })
}