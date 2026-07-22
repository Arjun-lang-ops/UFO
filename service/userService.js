import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import Address from "../models/userAddressModel.js";
import { generateAndSaveOtp } from "./otpService.js";
import { sendMail } from "../utils/mailer.js";
import Otp from "../models/otpModel.js";
import { generateReferralcode } from "../controller/userReferralController.js";
import Refer from "../models/referModel.js";
import Wallet from "../models/walletModel.js";

export const registerUserLogic = async (data) => {
  const { fullname, email, password, referralCode } = data;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already Exists");
  }

  let referredBy = null;
  if (referralCode) {
    const referrerReferral = await Refer.findOne({ referralCode });
    if (!referrerReferral) {
      throw new Error("Invalid referral code");
    }
    referredBy = referrerReferral.user;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullname,
    email,
    password: hashedPassword,
    isVerified: false,
    referredBy,
  });

  const referrals = await generateReferralcode();

  await Refer.create({
    user: user._id,
    referralCode: referrals,
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

//refer and earn service

export const processReferralReward = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  if (user.referredBy && !user.referralProcessed) {
    const Order = (await import("../models/orderModel.js")).default;
    const confirmedOrder = await Order.findOne({
      user: userId,
      $or: [{ orderStatus: "Confirmed" }, { paymentStatus: "Paid" }],
    });

    if (confirmedOrder) {
      const referrerId = user.referredBy;

      // Credit referrer's wallet
      let referrerWallet = await Wallet.findOne({ user: referrerId });
      if (!referrerWallet) {
        referrerWallet = await Wallet.create({ user: referrerId, balance: 0 });
      }
      referrerWallet.balance += 50;
      referrerWallet.transactions.push({
        type: "credit",
        amount: 50,
        description: `Referral bonus for inviting ${user.fullname} (First order placed)`,
        balanceAfterTransaction: referrerWallet.balance,
      });
      await referrerWallet.save();

      // Increment referrer's totalRewardsEarned in Refer model
      await Refer.updateOne(
        { user: referrerId },
        { $inc: { totalRewardsEarned: 50 } },
      );

      // Credit new user's wallet
      let newUserWallet = await Wallet.findOne({ user: user._id });
      if (!newUserWallet) {
        newUserWallet = await Wallet.create({ user: user._id, balance: 0 });
      }
      newUserWallet.balance += 50;
      newUserWallet.transactions.push({
        type: "credit",
        amount: 50,
        description: "Signup bonus via referral code (First order placed)",
        balanceAfterTransaction: newUserWallet.balance,
      });
      await newUserWallet.save();

      user.referralProcessed = true;
      await user.save();
      console.log(
        `Referral rewards processed successfully for user ${userId} and referrer ${referrerId}`,
      );
    }
  }
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
    throw new Error("Email Address not found");
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
