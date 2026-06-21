import Coupon from "../models/couponModel.js";
import { checkoutRenderService } from "./userCheckoutService.js";

export const applyCouponService = async (userId, couponCode) => {
  if (!couponCode || !couponCode.trim()) {
    const error = new Error("Coupon code is required");
    error.statusCode = 400;
    throw error;
  }

  const code = couponCode.trim().replace(/\s+/g, "").toUpperCase();
  const checkoutData = await checkoutRenderService(userId);
  const subtotal = checkoutData.subtotal;

  const coupon = await Coupon.findOne({ code });

  if (!coupon) {
    const error = new Error("Invalid coupon");
    error.statusCode = 404;
    throw error;
  }

  if (!coupon.isActive) {
    const error = new Error("Coupon disabled");
    error.statusCode = 400;
    throw error;
  }

  if (coupon.expiryDate < new Date()) {
    const error = new Error("Coupon expired");
    error.statusCode = 400;
    throw error;
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    const error = new Error("Coupon usage limit reached");
    error.statusCode = 400;
    throw error;
  }

  if (subtotal < coupon.minimumPurchase) {
    const error = new Error(`Minimum purchase Rs. ${coupon.minimumPurchase}`);
    error.statusCode = 400;
    throw error;
  }

  let discount = 0;

  if (coupon.discountType === "PERCENTAGE") {
    discount = (subtotal * coupon.discountValue) / 100;

    if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
      discount = coupon.maximumDiscount;
    }
  } else {
    discount = Math.min(coupon.discountValue, subtotal);
  }

  const shippingCharge = checkoutData.shippingCharge;
  const grandTotal = subtotal + shippingCharge - discount;

  return {
    couponCode: coupon.code,
    discount,
    shippingCharge,
    subtotal,
    grandTotal,
  };
};
