import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

export const addToCartService = async (userId, {productId, variantId, quantity}) => {


  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }


  const variant = product.variants.id(variantId);
  if (!variant) {
    throw new Error("Variant not found");
  }

  if (variant.stock < quantity) {
    throw new Error("Insufficient stock");
  }

  
  let cart = await Cart.findOne({ userId });

 
  if (!cart) {
    cart = new Cart({
      userId,
      items: [{ productId, variantId, quantity }],
    });

    await cart.save();
    return cart;
  }

  
  const existingItem = cart.items.find(
    item => item.variantId.toString() === variantId
  );

  if (existingItem) {
    
    if (existingItem.quantity + quantity > variant.stock) {
      throw new Error("Stock limit exceeded");
    }

    existingItem.quantity += quantity;

  } else {
    
    cart.items.push({ productId, variantId, quantity });
  }

  await cart.save();
  return cart;
};


export const getCartService=async(userId)=>{
    const cart=await Cart.findOne({userId}).populate('items.productId');
    if (!cart) return null;

    return cart;
}



export const removeFromCartService = async (userId, variantId) => {

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  
  cart.items = cart.items.filter(
    item => item.variantId.toString() !== variantId
  );

  await cart.save();

  return cart;
};