import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    offerType: {
      type: String,
      enum: ["Product", "Category"],
      required: true,
    },

    offerMode: {
      type: String,
      enum: ["PERCENTAGE", "FLAT"],
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 1,
    },

    maxDiscount: {
      type: Number,
      default: null,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
