
import Product from "../models/productModel.js";


export const productDetailsService=async (productId)=>{
    const product=await Product.findById(productId).populate('category').lean();
    if(!product){
        throw new Error('something went wrong')
    }
    return product;
}

export const getRelatedProducts=async(categoryId,productId)=>{
    try {
        const relatedProducts=await Product.find({
            category:categoryId,
            _id:{$ne:productId},
            isActive:true
        }).limit(4).lean();
        return relatedProducts;
    } catch (error) {
        console.log(error)
        return []
    }
}