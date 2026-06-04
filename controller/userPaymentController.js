import Wallet from "../models/walletModel.js";

export const walletRender = async (req, res) => {
  try {
    const userId = req.session.user || req.session.userId || req.user?._id;

    const wallet = await Wallet.findOne({ user: req.session.user._id })
      .populate("transactions.orderId")
      .lean();



    console.log(wallet);

    return res.render("userViews/userWallet", { wallet });
  } catch (error) {
    console.log(error);
  }
};
