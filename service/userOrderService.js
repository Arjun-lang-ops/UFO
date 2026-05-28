import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Address from "../models/userAddressModel.js";

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
  const cart = await Cart.findOne({ userId: userId }).populate(
    "items.productId",
  );

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

    //DB price

    const price = variant.discountedPrice ?? variant.price;

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

  const discount = 0;

  const deliveryCharge = subTotal > 3999 ? 0 : 50;
  const totalAmount = subTotal - discount + deliveryCharge;

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
    orderStatus: "Confirmed",
    orderNumber: generateOrderNumber(),
    subTotal,
    discount,
    deliveryCharge,
    totalAmount,
    couponCode,
    estimatedDelivery: deliveryDate,
  });

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

  if (!order) {
    throw new Error("Order not found");
  }

  
  if (["Delivered", "Returned", "Cancelled"].includes(order.orderStatus)) {
    throw new Error("Cannot cancel this order");
  }

  const item = order.items.id(cancelItemId);

  if (!item) {
    throw new Error("Item not found");
  }

  if (item.cancelRequest) {
    throw new Error("Cancellation already requested");
  }

  if (!quantity || quantity < 1 || quantity > item.quantity) {
    throw new Error("Invalid quantity");
  }

  item.cancelRequest = true;

  item.cancelQuantity = quantity;

  item.cancelReason = reason;

  item.cancelDescription = description || "";

  item.cancelStatus = "Pending";

  item.cancelledAt = new Date();

  await order.save();

  return order;
};
