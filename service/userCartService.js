import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

export const addToCartService = async (userId, { productId, variantId, quantity }) => {

  const MAX_QTY_PER_PRODUCT = 10;

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }
  if (!product.isActive) {
    throw new Error("Product is not available");
  }

  const variant = product.variants.id(variantId);
  if (!variant) {
    throw new Error("Variant not found");
  }

  if (quantity > MAX_QTY_PER_PRODUCT) {
    throw new Error(`You can only add up to ${MAX_QTY_PER_PRODUCT} items`);
  }

  if (variant.stock <= 0) {
    throw new Error("Product is out of stock");
  }

  if (variant.stock < quantity) {
    throw new Error("Insufficient stock");
  }

  if (quantity > variant.stock) {
    throw new Error(`Only ${variant.stock} items available`);
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

    if (existingItem.quantity + quantity > MAX_QTY_PER_PRODUCT) {
      throw new Error(`Maximum ${MAX_QTY_PER_PRODUCT} items allowed per product`);
    }

    if (existingItem.quantity + quantity > variant.stock) {
      throw new Error(`Only ${variant.stock} items available`);
    }

    existingItem.quantity += quantity;

  } else {

    cart.items.push({ productId, variantId, quantity });
  }

  await cart.save();
  return cart;
};


export const getCartService = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate('items.productId');
  
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


export const updateQuantity = async (userId, variantId, action) => {

  const cart = await Cart.findOne({ userId }).populate('items.productId');

  const item = cart.items.find(
    i => i.variantId?.toString() === variantId
  );

  if(!item){
    throw new Error('cart item not found')
  }

  const product = item.productId;

  if(!product){
    throw new Error('Product no longer exists')
  }
  const variant = product.variants.id(variantId)

  if(!variant){
    throw new Error('variants not found')
  }

  if (  variant.stock <= 0  || !product.isActive) {
    throw new Error("Product is out of stock")
  }

  const max_Qty=10;


  if (action === "increase") {
    if (item.quantity + 1 > variant.stock) {
      throw new Error(`Only ${variant.stock} items available`);

    }else if(item.quantity +1 > max_Qty){
      throw new Error(`maximum ${max_Qty} can be added to cart`)
    }
    item.quantity += 1;
  };

  if (action === "decrease" && item.quantity > 1) {
    item.quantity -= 1;
  }
  
  await cart.save();

  return item;
};