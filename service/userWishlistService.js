import Wishlist from "../models/userWishlistModel.js";
import Product from "../models/productModel.js";

export const getWishlistItems = async (userId) => {
    if (!userId) return [];

    const wishlist = await Wishlist.findOne({ userId });

    return wishlist?.products.map(item => ({
        productId: item.product.toString(),
        variantId: item.variant.toString()
    })) || [];
}

export const addToWishlistService=async(userId,productId,variantId)=>{
    if (!userId) {
        throw new Error('Please login to use wishlist')
    }

    const product=await Product.findById(productId);

    if(!product){
        throw new Error('Product not found')
    }


    const variantExists = product.variants.some(
    variant => variant._id.toString() === variantId
  );

  if (!variantExists) {
    throw new Error("Variant not found");
  }

    let wishlist= await Wishlist.findOne({userId});

    if(!wishlist){
        wishlist=new Wishlist({
            userId,
            products:[]
        })
    }

    const alreadyExisting=wishlist.products.some(item=>item.product.toString()===productId && item.variant.toString()===variantId);

    if(alreadyExisting){
        throw new Error('Product already in wishlist')
    }

    wishlist.products.push({
        product:productId,
        variant:variantId
    });

    await wishlist.save();
    return wishlist
}


export const removeWishlistService=async(userId,productId,variantId)=>{
    if (!userId) {
        throw new Error('Please login to use wishlist')
    }

    const wishlist=await Wishlist.findOne({userId});

    if(!wishlist){
        throw new Error('Wishlist not found')
    };

    wishlist.products=wishlist.products.filter(item=>{
        const sameProduct= item.product.toString()===productId;


        const sameVariant=item.variant.toString()===variantId;


        return !(sameProduct && sameVariant)
    });

    await wishlist.save();

    return wishlist

}
