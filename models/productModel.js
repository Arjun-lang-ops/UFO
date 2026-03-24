import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
  name: String,
  price: Number,

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },

  brand: {
    type: String
  },

  team: {
    type: String // only for jerseys
  },

  stock: Number,
  images: [String]
});

const Product= mongoose.model('Product',productSchema)
export default Product;