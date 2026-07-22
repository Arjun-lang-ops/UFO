import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import Wallet from "../models/walletModel.js";

const orderStatusFlow = ["Pending", "Confirmed", "Shipped", "Delivered"];
const terminalOrderStatus = ["Cancelled", "Returned"];
const validOrderStatus = [...orderStatusFlow, ...terminalOrderStatus];

const createServiceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const orderManagementService = async (page, search, status) => {
  const limit = 10;

  const skip = (page - 1) * limit;

  const filter = {};

  const validStatuses = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Returned",
    "Return Requests",
  ];

  const selectedStatus = validStatuses.includes(status) ? status : "";

  if (selectedStatus) {
    if (selectedStatus === "Return Requests") {
      filter.items = {
        $elemMatch: {
          returnRequest: true,
          returnStatus: "Pending",
        },
      };
    } else {
      filter.orderStatus = selectedStatus;
    }
  }

  //returning id of each users

  if (search && search.trim()) {
    const trimmedSearch = search.trim();
    const escapedSearch = trimmedSearch.replace(
      /[-\/\\^$*+?.()|[\]{}]/g,
      "\\$&",
    );

    const users = await User.find(
      {
        $or: [
          {
            fullname: {
              $regex: escapedSearch,
              $options: "i",
            },
          },
          {
            email: {
              $regex: escapedSearch,
              $options: "i",
            },
          },
        ],
      },
      "_id",
    );

    console.log("users :", users);

    //taking ids of the users

    const userIds = users.map((user) => user._id);

    filter.$or = [
      {
        orderNumber: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
      {
        user: {
          $in: userIds,
        },
      },
      {
        "address.fullname": {
          $regex: escapedSearch,
          $options: "i",
        },
      },
      {
        "address.phone": {
          $regex: escapedSearch,
          $options: "i",
        },
      },
    ];
  }

  console.log("afdgnalkdfg", filter);

  const orders = await Order.find(filter)
    .populate("user", "fullname email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalOrders = await Order.countDocuments(filter);

  const totalPages = Math.ceil(totalOrders / limit);

  return {
    orders,
    currentPage: Number(page),
    totalPages,
    totalOrders,
    search,
    status: selectedStatus,
  };
};

export const orderDetailsService = async (orderId) => {
  const orderDetails = await Order.findById(orderId).populate("items.product");
  return orderDetails;
};

export const updateOrderStatusService = async (orderId, nextStatus) => {
  if (!validOrderStatus.includes(nextStatus)) {
    throw createServiceError("Invalid order status", 400);
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw createServiceError("Order not found", 404);
  }

  const currentStatus = order.orderStatus;

  if (currentStatus === nextStatus) {
    return order;
  }

  if (terminalOrderStatus.includes(currentStatus)) {
    throw createServiceError(
      `Cannot update an order that is already ${currentStatus}`,
      400,
    );
  }

  const currentIndex = orderStatusFlow.indexOf(currentStatus);
  const nextIndex = orderStatusFlow.indexOf(nextStatus);

  if (currentIndex !== -1 && nextIndex !== -1 && nextIndex < currentIndex) {
    throw createServiceError(
      `Cannot move order status back from ${currentStatus} to ${nextStatus}`,
      400,
    );
  }

  if (nextStatus === "Delivered") {
    order.paymentStatus = "Paid";
  }

  order.orderStatus = nextStatus;

  await order.save();

  return order;
};

//refund approval service

export const approveReturnService = async (orderId, itemId, status) => {
  if (!["Approved", "Rejected"].includes(status)) {
    const error = new Error("Invalid return status");
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  console.log(order.user);
  console.log(
    typeof order.user,
  );
  const customerId = order.user;

  console.log("type of  :", typeof customerId);

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }
  await order.populate("items.product");
  const item = order.items.id(itemId);
  

  if (!item || !item.returnRequest) {
    const error = new Error("Return request not found");
    error.statusCode = 404;
    throw error;
  }

  const alreadyApproved = item.returnStatus === "Approved";

  if (status === "Approved" && !alreadyApproved) {
    await Product.updateOne(
      {
        _id: item.product,
        "variants._id": item.variant,
      },
      {
        $inc: {
          "variants.$.stock": item.returnQuantity,
        },
      },
    );
  }

  item.returnStatus = status;
  item.returnedAt = new Date();

  if (status === "Approved" && !alreadyApproved) {
    // Subtract proportional coupon discount from the refund amount.
    // The coupon discount is spread across all items proportionally by their value.
    const grossRefund = item.price * item.returnQuantity;
    let couponShare = 0;
    if (order.discount > 0 && order.subTotal > 0) {
      couponShare = (item.price * item.returnQuantity / order.subTotal) * order.discount;
    }
    const refundAmount = Math.max(0, grossRefund - couponShare);

    let wallet = await Wallet.findOne({ user: customerId });

    if (!wallet) {
      wallet = await Wallet.create({
        user: customerId,
        balance: 0,
        transactions: [],
      });
    }

    wallet.balance += refundAmount;

    const updatedBalance = wallet.balance;

    wallet.transactions.push({
      type: "credit",
      amount: refundAmount,
      description: `Refund for ${item.product?.name}`,
      order: order._id,
      createdAt: new Date(),
      balanceAfterTransaction: updatedBalance,
    });

    await wallet.save();
  }

  await order.save();

  return order;
};
