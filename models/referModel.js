import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    referralCode: {
      type: String,
      required: true,
      unique: true,
    },

    totalRewardsEarned: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Refer= mongoose.model("Referral", referralSchema);
export default Refer