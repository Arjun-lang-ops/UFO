import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },
  

    isListed: {
      type: Boolean,
      default: true
    },

    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      default: null
    }
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
