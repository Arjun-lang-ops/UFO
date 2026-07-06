// services/adminCouponService.js

import Coupon from "../models/couponModel.js";

export const createCouponService = async (data) => {
  const {
    coupon_code,
    description,
    discount_type,
    discount_value,
    min_purchase,
    expiry_date,
    total_limit,
    maximum_discount,
    is_active,
  } = data;

  
  if (!coupon_code || !coupon_code.trim()) {
    const error = new Error("Coupon code is required");
    error.statusCode = 400;
    throw error;
  }

  const code = coupon_code.trim().replace(/\s+/g, "").toUpperCase();

  
  const existingCoupon = await Coupon.findOne({ code });

  if (existingCoupon) {
    const error = new Error("Coupon already exists");
    error.statusCode = 409;
    throw error;
  }

 
  if (!discount_value || Number(discount_value) <= 0) {
    const error = new Error("Invalid discount value");
    error.statusCode = 400;
    throw error;
  }

  if (discount_type === "PERCENTAGE" && Number(discount_value) > 100) {
    const error = new Error("Percentage discount cannot exceed 100%");
    error.statusCode = 400;
    throw error;
  }

  if (discount_type === "FLAT" && Number(min_purchase) <= Number(discount_value)) {
    const error = new Error("Minimum purchase must be greater than the flat discount value");
    error.statusCode = 400;
    throw error;
  }

 
  if (!expiry_date) {
    const error = new Error("Expiry date is required");
    error.statusCode = 400;
    throw error;
  }

  const expiryDate = new Date(expiry_date);

  if (expiryDate <= new Date()) {
    const error = new Error("Expiry date must be a future date");
    error.statusCode = 400;
    throw error;
  }

  // Usage limit validation
  if (total_limit && Number(total_limit) < 1) {
    const error = new Error("Usage limit must be greater than zero");
    error.statusCode = 400;
    throw error;
  }

  const coupon = await Coupon.create({
    code,

    description,

    discountType: discount_type,

    discountValue: Number(discount_value),

    minimumPurchase: Number(min_purchase) || 0,

    maximumDiscount:
      discount_type === "PERCENTAGE" ? Number(maximum_discount) || null : null,

    expiryDate,

    usageLimit: Number(total_limit) || 1,

    isActive: is_active ,
  });

  return coupon;
};


export const editCouponService=async(couponId, updateData)=>{

  const coupon= await Coupon.findById(couponId);

  if(!coupon){
    const error = new Error('Coupon not found');
    error.statusCode = 404;
    throw error;
  };

  const {
    coupon_code,
    description,
    discount_type,
    discount_value,
    min_purchase,
    expiry_date,
    total_limit,
    maximum_discount,
    is_active,
  } = updateData;

  if (!coupon_code || !coupon_code.trim()) {
    const error = new Error("Coupon code is required");
    error.statusCode = 400;
    throw error;
  }

  const code = coupon_code.trim().replace(/\s+/g, "").toUpperCase();

  if(code !== coupon.code){
    const existingCoupon=await Coupon.findOne({
      code,
      _id:{$ne:couponId},

    })

    if(existingCoupon){
      const error = new Error('Coupon already exists');
      error.statusCode = 409;
      throw error;
    }
  }

  if (!discount_value || Number(discount_value) <= 0) {
    const error = new Error("Invalid discount value");
    error.statusCode = 400;
    throw error;
  }

  if (discount_type === "PERCENTAGE" && Number(discount_value) > 100) {
    const error = new Error("Percentage discount cannot exceed 100%");
    error.statusCode = 400;
    throw error;
  }

  if (discount_type === "FLAT" && Number(min_purchase) <= Number(discount_value)) {
    const error = new Error("Minimum purchase must be greater than the flat discount value");
    error.statusCode = 400;
    throw error;
  }

  if (!expiry_date) {
    const error = new Error("Expiry date is required");
    error.statusCode = 400;
    throw error;
  }

  const expiryDate = new Date(expiry_date);

  if (expiryDate <= new Date()) {
    const error = new Error('Expiry date must be in the future');
    error.statusCode = 400;
    throw error;
  }

  if (total_limit && Number(total_limit) < 1) {
    const error = new Error("Usage limit must be greater than zero");
    error.statusCode = 400;
    throw error;
  }

  coupon.code = code;
  coupon.description = description;
  coupon.discountType = discount_type;
  coupon.discountValue = Number(discount_value);
  coupon.minimumPurchase = Number(min_purchase) || 0;
  coupon.maximumDiscount =
    discount_type === "PERCENTAGE" ? Number(maximum_discount) || null : null;
  coupon.expiryDate = expiryDate;
  coupon.usageLimit = Number(total_limit) || 1;
  coupon.isActive = is_active === true || is_active === "true" || is_active === "on";

  await coupon.save();

  return coupon;
}
