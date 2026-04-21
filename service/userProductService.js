
import Product from "../models/productModel.js";


export const productDetailsService=async (productId)=>{
    const product=await Product.findById(productId);
    if(!product){
        throw new Error('something went wrong')
    }
    return product;
}