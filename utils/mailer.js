import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "LOADED" : "MISSING");


// CREATE TRANSPORTER
const transporter = nodemailer.createTransport({
  host:"smtp.gmail.com",
  port:587,
  secure:false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// verifying the email is ready to send
transporter.verify((error, success) => {
  if (error) {
    console.error("Mail transporter error:", error);
  } else {
    console.log("Mail server is ready to send emails");
  }
});

// Send mail function
export const sendMail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"Urban Football" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Verify your Urban Football account",
      text: `
Hi there,

Welcome to Urban Football! 

Your One-Time Password (OTP) to verify your email address is:

${otp}

This OTP is valid for 1 minute.
Please do not share this code with anyone for security reasons.

If you did not create an account with Urban Football, you can safely ignore this email.

Thanks & regards,
Urban Football Team
`,
    });

    console.log(" OTP email sent to:", to);
  } catch (error) {
    console.error(" Error sending OTP email:", error.message);
    throw error;
  }
};
