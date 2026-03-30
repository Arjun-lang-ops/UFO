import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import Address from "../models/userAddressModel.js";
import { generateAndSaveOtp } from "./otpService.js";
import { sendMail } from "../utils/mailer.js";
import Otp from "../models/otpModel.js";

export const registerUserLogic = async (data) => {
  const { fullname, email, password } = data;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already Exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullname,
    email,
    password: hashedPassword,
    isVerified: false,
  });

  return user;
};

// export const resendOtpLogic = async (email) => {
//     const user = await User.findOne({ email });

//     if (!user) throw new Error('User not found');
//     if (user.isVerified) throw new Error('User already verified');

//     return true;
// };

export const verifyUserOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("user not found");
  }

  user.isVerified = true;

  await user.save();
  return true;
};

//user login
export const userLoginLogic = async (data) => {
  const { email, password } = data;
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw new Error("user not found");
  }

  if (existingUser.isBlocked) {
    throw new Error("Your account has been blocked by admin");
  }
  if (!existingUser.password) {
    throw new Error("Please login using Google");
  }
  const passwordMatch = await bcrypt.compare(password, existingUser.password);
  if (!passwordMatch) {
    throw new Error("Invalid Password");
  }

  if (!existingUser.isVerified) {
    throw new Error("User not verified with OTP");
  }

  return existingUser;
};

export const forgotUserService = async (data) => {
  const { email } = data;
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw new Error("Invalid Email Address");
  }

  return existingUser;
};

export const resetPasswordService = async (
  email,
  newPassword,
  confirmPassword,
) => {
  console.log(email);
  console.log(newPassword, confirmPassword);

  if (!newPassword || !confirmPassword) {
    throw new Error("All fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const user = await User.findOne({ email });
  console.log(user);

  if (!user) {
    throw new Error("User not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;

  await user.save();

  return true;
};

export const changePasswordService = async (
  userId,
  currentPassword,
  newPassword,
) => {
  if (!userId) {
    throw new Error("Unauthorized Access");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("user not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    throw new Error("New password cannot be same as old password");
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  return "password updated successfully";
};
