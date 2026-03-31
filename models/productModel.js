import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
  name: String,
  price: Number,

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },

  brand: {
    type: String,
    required:true
  },

  team: {
    type: String ,
    default:null// only for jerseys
  },
  price:Number,
  description:String,

  stock: Number,
  images: [String],
  isActive:{
    type:Boolean,
    default:true
  }
},{timestamps:true});

const Product= mongoose.model('Product',productSchema)
export default Product;