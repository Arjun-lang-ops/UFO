import User from "../models/userModel.js";
import Otp from "../models/otpModel.js";
import { generateAndSaveOtp, verifyOtp } from "../service/otpService.js";
import { sendEmailChangeOtp } from "../utils/mailer.js";


export const emailOtpRender = (req, res) => {
  return res.render("userViews/emailOtpPage")
};

export const emailOtpSend = async (req, res) => {
  try {

    const userId = req.session.user;
    const { newEmail } = req.body;

    const existingUser = await User.findOne({ email: newEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      })
    }

    const otp = await generateAndSaveOtp(newEmail);

    await sendEmailChangeOtp(newEmail, otp);
    req.session.newEmail = newEmail;
    res.status(200).json({
      success: true,
      redirectUrl: "/profile/email-otp"
    });



  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
}

export const verifyEmailOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.session.user;
    const newEmail = req.session.newEmail;

    if (!newEmail) {
      return res.status(400).json({
        success: false,
        message: 'Session expired. Please try again.'
      });
    }

    // Verify OTP
    await verifyOtp(newEmail, otp);

    await User.findByIdAndUpdate(userId, {
      email: newEmail
    });

    req.session.newEmail = null;

    res.status(200).json({
      success: true,
      message: "Email updated successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }


}

export const resendEmailOtp = async (req, res) => {
  try {
    const newEmail = req.session.newEmail;

    if (!newEmail) {
      return res.status(400).json({
        success: false,
        message: 'Session expired. Please try again.'
      });
    }

    const otp = await generateAndSaveOtp(newEmail);
    await sendEmailChangeOtp(newEmail, otp);

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}