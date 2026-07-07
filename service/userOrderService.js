import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Address from "../models/userAddressModel.js";
import Wallet from "../models/walletModel.js";
import Coupon from "../models/couponModel.js";
import { applyCouponService } from "./userCouponService.js";
import { processReferralReward } from "./userService.js";
import { getVariantOfferPricing } from "./offerhelper.js";

export const generateOrderNumber = () => {
  return `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
};

export const placeOrderService = async (
  userId,
  addressId,
  paymentMethod,
  couponCode,
) => {
  console.log(userId);
  //cart
  const cart = await Cart.findOne({ userId: userId }).populate({
    path: "items.productId",
    populate: [
      { path: "offer" },
      {
        path: "category",
        populate: { path: "offer" },
      },
    ],
  });

  console.log(cart);

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new Error("cart is empty");
  }

  //address

  const selectedAddress = await Address.findOne({
    _id: addressId,

    user: userId,
  });

  if (!selectedAddress) {
    throw new Error("Address not found");
  }

  //order items

  let subTotal = 0;

  const orderItems = [];

  for (const item of cart.items) {
    const product = item.productId;

    if (!product) {
      throw new Error("Product not found");
    }

    //embedded variant

    const variant = product.variants.id(item.variantId);

    if (!variant) {
      throw new Error("variant not found");
    }

    //stock check

    if (variant.stock < item.quantity) {
      throw new Error(`${product.name} is out of stock`);
    }

    const pricing = getVariantOfferPricing(variant, product);
    const price = pricing.finalPrice;

    const totalPrice = price * item.quantity;

    subTotal += totalPrice;

    //push items

    orderItems.push({
      product: product._id,
      variant: variant._id,
      quantity: item.quantity,
      price,
      totalPrice,
    });
  }

  //totals

  const deliveryCharge = subTotal > 3999 ? 0 : 50;
  let discount = 0;
  let appliedCouponCode = "";

  if (couponCode && couponCode.trim()) {
    const couponResult = await applyCouponService(userId, couponCode);
    discount = couponResult.discount;
    appliedCouponCode = couponResult.couponCode;
  }

  const totalAmount = subTotal - discount + deliveryCharge;


 let wallet=null;

if (paymentMethod === "WALLET") {
   wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
  wallet = await Wallet.create({
    user: userId,
    balance: 0,
    transactions: [],
  });
}

  if (wallet.balance < totalAmount) {
    throw new Error("Insufficient wallet balance");
  }
}

  let paymentStatus = "Pending";

  if (paymentMethod === "WALLET") {
    paymentStatus = "Paid";
  }

  const deliveryDate = new Date();

  deliveryDate.setDate(deliveryDate.getDate() + 5);

  //create order

  const order = await Order.create({
    user: userId,
    items: orderItems,
    address: {
      fullname: selectedAddress.fullname,
      phone: selectedAddress.phone,
      country: selectedAddress.country,
      state: selectedAddress.state,
      street: selectedAddress.street,
      apartment: selectedAddress.apartment,
      pincode: selectedAddress.pincode,
    },

    paymentMethod,
    paymentStatus,
    orderStatus: paymentMethod === "RAZORPAY" ? "Pending" : "Confirmed",
    orderNumber: generateOrderNumber(),
    subTotal,
    discount,
    deliveryCharge,
    totalAmount,
    couponCode: appliedCouponCode,
    estimatedDelivery: deliveryDate,
  });



  if (paymentMethod === "WALLET") {
  wallet.balance -= totalAmount;

  wallet.transactions.push({
    type: "debit",
    amount: totalAmount,
    description: `Payment for Order #${order.orderNumber}`,
    orderId: order._id,
    balanceAfterTransaction: wallet.balance,
  });

  await wallet.save();
}

  //reduce Stock

  for (const item of cart.items) {
    await Product.updateOne(
      {
        _id: item.productId._id,
        "variants._id": item.variantId,
      },
      {
        $inc: {
          "variants.$.stock": -item.quantity,
        },
      },
    );
  }

  //clear cart

  cart.items = [];

  await cart.save();

  if (appliedCouponCode) {
    await Coupon.updateOne(
      { code: appliedCouponCode },
      { $inc: { usedCount: 1 } },
    );
  }

  if (paymentMethod !== "RAZORPAY") {
    try {
      await processReferralReward(userId);
    } catch (referralErr) {
      console.error("Referral processing error:", referralErr);
    }
  }

  return order;
};

export const orderHistoryService = async (userId, search) => {
  const keyword = (search || "").trim().toLowerCase();
  const orders = await Order.find({ user: userId })
    .populate("items.product")
    .populate("user")
    .sort({ createdAt: -1 });

  if (!keyword) {
    return orders;
  }

  return orders.filter(
    (order) =>
      order.orderNumber?.toLowerCase().includes(keyword) ||
      order.orderStatus?.toLowerCase().includes(keyword) ||
      order.items.some((item) =>
        item.product?.name?.toLowerCase().includes(keyword),
      ),
  );
};

export const returnService = async (orderId) => {
  const returnItem = await Order.findById(orderId)
    .populate("items.product")
    .populate("user");
  return returnItem;
};

export const requestReturnService = async ({
  userId,
  orderId,
  returnItemId,
  quantity,
  reason,
  description,
  shippingMethod,
}) => {
  const order = await Order.findOne({ _id: orderId, user: userId });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.orderStatus !== "Delivered") {
    throw new Error("Return allowed only after delivery");
  }

  const item = order.items.id(returnItemId);
  if (!item) {
    throw new Error("Item not found");
  }

  if (item.returnRequest) {
    throw new Error("Return already requested");
  }

  if (!quantity || quantity < 1 || quantity > item.quantity) {
    throw new Error("Invalid quantity");
  }

  item.returnRequest = true;
  item.returnQuantity = quantity;
  item.returnReason = reason;
  item.returnDescription = description || "";

  item.returnStatus = "Pending";
  item.requestedAt = new Date();
  await order.save();

  return order;
};

export const requestCancelService = async ({
  userId,
  orderId,
  cancelItemId,
  quantity,
  reason,
  description,
}) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  

  }

  if (!order) {
    throw new Error("Order not found");
  }

  
  if (["Shipped", "Delivered", "Returned", "Cancelled"].includes(order.orderStatus)) {
    throw new Error("Cannot cancel this order");
  }

  const item = order.items.id(cancelItemId);

  if (!item) {
    throw new Error("Item not found");
  }

  if (item.cancelRequest || item.cancelStatus === "Cancelled") {
    throw new Error("Item already cancelled");
  }

  if (!quantity || quantity < 1 || quantity > item.quantity) {
    throw new Error("Invalid quantity");
  }

  

  item.cancelRequest = true;
  item.cancelQuantity = quantity;
  item.cancelReason = reason;
  item.cancelDescription = description || "";
  item.cancelStatus = "Cancelled";
  item.cancelledAt = new Date();

  // Subtract proportional coupon discount from the refund amount.
  // The coupon discount is spread across all items proportionally by their value.
  const grossItemAmount = (item.price || 0) * quantity;
  let couponShare = 0;
  if (order.discount > 0 && order.subTotal > 0) {
    // Share of coupon that belongs to this specific item's cancelled quantity
    couponShare = (item.price * quantity / order.subTotal) * order.discount;
  }
  item.refundAmount = Math.max(0, grossItemAmount - couponShare);

  const refundAmount = item.refundAmount;

// Refund only for prepaid orders
if (
  refundAmount > 0 &&
  ["RAZORPAY", "WALLET"].includes(order.paymentMethod)
) {
  let wallet = await Wallet.findOne({ user: userId });


  const products= await Order.find({user:userId}).populate('items.product');

  if(products.offer && products.couponCode && products.stock<5 ){
    wallet.transactions.push({
    type: "credit",
    amount: refundAmount/25,
    description: `Refund for cancelled item in Order #${order.orderNumber}`,
    orderId: order._id,
    balanceAfterTransaction: wallet.balance,
  });

  if (!wallet) {
    wallet = await Wallet.create({
      user: userId,
      balance: 0,
      transactions: [],
    });
  }

  wallet.balance += refundAmount;

  wallet.transactions.push({
    type: "credit",
    amount: refundAmount,
    description: `Refund for cancelled item in Order #${order.orderNumber}`,
    orderId: order._id,
    balanceAfterTransaction: wallet.balance,
  });

  await wallet.save();
}

  await Product.updateOne(
    {
      _id: item.product,
      "variants._id": item.variant,
    },
    {
      $inc: {
        "variants.$.stock": quantity,
      },
    },
  );

  const allItemsCancelled = order.items.every(
    (orderItem) =>
      orderItem.cancelRequest &&
      ["Cancelled", "Approved"].includes(orderItem.cancelStatus),
  );

  if (allItemsCancelled) {
    order.orderStatus = "Cancelled";
  }

  await order.save();

  return order;
};
