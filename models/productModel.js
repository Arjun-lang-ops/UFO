import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true
  },

  color: {
    type: String,
    required: true
  },

  size: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  discountedPrice: {
    type: Number
  },

  stock: {
    type: Number,
    required: true
  },

  images: [String] 
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  description: {
    type: String,
    required: true
  },

  variants: [variantSchema], 

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;