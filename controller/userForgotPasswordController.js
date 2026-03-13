import { forgotUserService } from "../service/userService.js";
import { generateAndSaveOtp } from "../service/otpService.js";
import { sendForgotPasswordMail } from "../utils/mailer.js";
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
    const otp = await generateAndSaveOtp({ email });
    await sendForgotPasswordMail({ email, otp });
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