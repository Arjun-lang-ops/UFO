import Product from "../models/productModel.js";
import Cart from '../models/cartModel.js';
import User from "../models/userModel.js";
import Address from "../models/userAddressModel.js";



export const checkoutRenderService=async(userId)=>{

    const cart = await Cart.findOne({ userId })
        .populate({
            path: "items.productId",
            populate: {
                path: "category"
            }
        });

        if(!cart || cart.items.length===0){
            throw new Error('cart is empty')
        }


        const validItems=cart.items.filter(items=>{
            const product=items.productId;

            if(!product || !product.isActive || !product.category?.isListed){
                return false
            }

            const variant=product.variants.find(v=>v._id.toString()===items.variantId.toString());

            if(!variant){
                return false
            };

            if(variant.stock < items.quantity) return false;

            return true;

            
        });

        if(validItems.length===0){
            throw new Error('No valid products available for checkout')
        };

        const cartItems=validItems.map(item=>{
            const product=item.productId;
            const variant =product.variants.find(v=>v._id.toString() === item.variantId.toString());

            return {
                productID:product._id,
                variantId:variant._id,
                name:product.name,
                image:variant.images?.[0]|| '',
                size:variant.size,
                color:variant.color,
                quantity:item.quantity,
                price: variant.discountedPrice || variant.price,
                total:(variant.discountedPrice || variant.price)*item.quantity

        }
        });

        const totalQuantity=cartItems.reduce((acc,item)=>{
            return acc+=item.quantity
        },0)

        const subtotal= cartItems.reduce((acc,item)=>{
            return acc+=item.total
        },0)


         const shippingCharge = 0;

        const discount = 0;

        const grandTotal =
            subtotal + shippingCharge - discount;


            const defaultAddress= await Address.findOne({user:userId,isDefault:true});

            return {
                cartItems,
                defaultAddress,
                totalQuantity,
                subtotal,
                shippingCharge,
                discount,
                grandTotal
            };

};