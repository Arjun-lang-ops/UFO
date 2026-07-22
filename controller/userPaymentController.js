import Wallet from "../models/walletModel.js";
import Refer from "../models/referModel.js";
import User from "../models/userModel.js";
import { generateReferralcode } from "./userReferralController.js";

export const walletRender = async (req, res) => {
  try {
    const userId = req.session.user?._id || req.session.user || req.session.userId || req.user?._id;

    if (!userId) {
      return res.redirect("/login");
    }

    let wallet = await Wallet.findOne({ user: userId })
      .populate("transactions.orderId")
      .lean();

    if (!wallet) {
      try {
        const createdWallet = await Wallet.create({ user: userId, balance: 0, transactions: [] });
        wallet = createdWallet.toObject ? createdWallet.toObject() : createdWallet;
      } catch (createErr) {
        wallet = { balance: 0, transactions: [] };
      }
    }

    return res.render("userViews/userWallet", { wallet, user: userId });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};




export const referAndEarnController = async (req, res) => {
  try {
    const userId = req.session.user?._id || req.session.user || req.session.userId || req.user?._id;
    const user = await User.findById(userId);

    let referral = await Refer.findOne({
      user: userId,
    });

    if (!referral) {
      const code = await generateReferralcode();
      referral = await Refer.create({
        user: userId,
        referralCode: code,
      });
    }

    const referralLink =
      `${req.protocol}://${req.get("host")}/register?ref=${referral.referralCode}`;

    res.render("userViews/userReferAndEarn", {
      referral,
      referralLink,
      user,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }

};
