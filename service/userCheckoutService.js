import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import User from "../models/userModel.js";
import Address from "../models/userAddressModel.js";
import Coupon from "../models/couponModel.js";
import { getVariantOfferPricing } from "./offerhelper.js";

export const checkoutRenderService = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate({
    path: "items.productId",
    populate: [
      { path: "offer" },
      {
        path: "category",
        populate: {
          path: "offer",
        },
      },
    ],
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("cart is empty");
  }

  const validItems = cart.items.filter((items) => {
    const product = items.productId;

    if (!product || !product.isActive || !product.category?.isListed) {
      return false;
    }

    const variant = product.variants.find(
      (v) => v._id.toString() === items.variantId.toString(),
    );

    if (!variant) {
      return false;
    }

    if (variant.stock < items.quantity) return false;

    return true;
  });

  if (validItems.length === 0) {
    throw new Error("No valid products available for checkout");
  }

  const cartItems = validItems.map((item) => {
    const product = item.productId;
    const variant = product.variants.find(
      (v) => v._id.toString() === item.variantId.toString(),
    );

    const pricing = getVariantOfferPricing(variant, product);

    return {
      productID: product._id,
      variantId: variant._id,
      name: product.name,
      image: variant.images?.[0] || "",
      size: variant.size,
      color: variant.color,
      quantity: item.quantity,
      originalPrice: pricing.originalPrice,
      basePrice: pricing.basePrice,
      price: pricing.finalPrice,
      offerDiscount: pricing.offerDiscount,
      offerName: pricing.appliedOffer?.name || "",
      totalOfferDiscount: pricing.offerDiscount * item.quantity,
      total: pricing.finalPrice * item.quantity,
    };
  });

  const totalQuantity = cartItems.reduce((acc, item) => {
    return (acc += item.quantity);
  }, 0);

  const subtotal = cartItems.reduce((acc, item) => {
    return (acc += item.total);
  }, 0);

  const offerDiscount = cartItems.reduce((acc, item) => {
    return (acc += item.totalOfferDiscount);
  }, 0);

  const shippingCharge = subtotal > 3999 ? 0 : 50;

  const discount = 0;

  const grandTotal = subtotal + shippingCharge - discount;

  let defaultAddress = await Address.findOne({ user: userId, isDefault: true });

  if (!defaultAddress) {
    defaultAddress = await Address.findOne({ user: userId });

    if (defaultAddress) {
      defaultAddress.isDefault = true;
      await defaultAddress.save();
    }
  }

  const addresses = await Address.find({ user: userId }).sort({
    isDefault: -1,
    createdAt: -1,
  });


//coupons

  const availableCoupons = await Coupon.find({
    isActive: true,
    expiryDate: { $gt: new Date() },
    $expr: { $lt: ["$usedCount", "$usageLimit"] },
  }).sort({ expiryDate: 1 });

  const eligibleCoupons = availableCoupons.filter(
    (coupon) => subtotal >= coupon.minimumPurchase,
  );

  return {
    cartItems,
    defaultAddress,
    addresses,
    totalQuantity,
    subtotal,
    offerDiscount,
    shippingCharge,
    discount,
    grandTotal,
    coupons: eligibleCoupons,
  };
};

export const updateAddressService = async (id, userId, body) => {
  const existingAddress = await Address.findOne({ _id: id, user: userId });

  if (!existingAddress) {
    return {
      success: false,
      status: 404,
      message: "Address not found",
    };
  }

  const shouldBeDefault =
    body.isDefault === true ||
    body.isDefault === "true" ||
    existingAddress.isDefault;

  const addressData = {
    fullname: body.fullname,
    phone: body.phone,
    country: body.country,
    state: body.state,
    street: body.street,
    apartment: body.apartment,
    pincode: body.pincode,
    isDefault: shouldBeDefault,
  };

  if (addressData.isDefault) {
    await Address.updateMany(
      {
        user: userId,
        _id: { $ne: id },
      },
      {
        $set: { isDefault: false },
      },
    );
  }

  const updatedAddress = await Address.findOneAndUpdate(
    {
      _id: id,
      user: userId,
    },
    {
      $set: addressData,
    },
    {
      new: true,
    },
  );

  return {
    success: true,
    address: updatedAddress,
  };
};

export const addAddressService = async (userId, body) => {
  const hasAddress = await Address.exists({
    user: userId,
  });

  const shouldBeDefault =
    !hasAddress || body.isDefault === true || body.isDefault === "true";

  if (shouldBeDefault) {
    await Address.updateMany(
      {
        user: userId,
      },
      {
        $set: { isDefault: false },
      },
    );
  }

  const address = await Address.create({
    user: userId,
    fullname: body.fullname,
    phone: body.phone,
    country: body.country,
    state: body.state,
    street: body.street,
    apartment: body.apartment,
    pincode: body.pincode,
    isDefault: shouldBeDefault,
  });

  return {
    success: true,
    message: "Address added successfully",
    address,
  };
};
