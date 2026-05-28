import Order from "../models/orderModel.js";
import User from "../models/userModel.js";

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
    "Old Orders",
  ];

  const selectedStatus = validStatuses.includes(status) ? status : "";

  if (selectedStatus && selectedStatus !== "Old Orders") {
    filter.orderStatus = selectedStatus;
  }

  if (search && search.trim()) {
    const users = await User.find(
      {
        fullname: {
          $regex: search,
          $options: "i",
        },
      },
      "_id",
    );

    const userIds = users.map((user) => user._id);

    filter.$or = [
      {
        orderNumber: {
          $regex: search,
          $options: "i",
        },
      },
      {
        user: {
          $in: userIds,
        },
      },
    ];
  }

  const sortOptions =
    selectedStatus === "Old Orders" ? { createdAt: 1 } : { createdAt: -1 };

  const orders = await Order.find(filter)
    .populate("user", "fullname email")
    .sort(sortOptions)
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



export const approveCancelService = async (orderId, itemId, status) => {
  if (!["Approved", "Rejected"].includes(status)) {
    throw new Error("Invalid cancel status");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  const item = order.items.id(itemId);

  if (!item || !item.cancelRequest) {
    throw new Error("Cancellation request not found");
  }

  item.cancelStatus = status;

  // approved
  if (status === "Approved") {
    item.cancelledAt = new Date();

    const qty = item.cancelQuantity || item.quantity || 1;

    item.refundAmount = (item.price || 0) * qty;

    // restore stock
    await Product.updateOne(
      {
        _id: item.product,
        "variants._id": item.variant,
      },
      {
        $inc: {
          "variants.$.stock": qty,
        },
      },
    );

    // check if all items cancelled
    const allItemsCancelled = order.items.every(
      (orderItem) =>
        orderItem.cancelRequest && orderItem.cancelStatus === "Approved",
    );

    if (allItemsCancelled) {
      order.orderStatus = "Cancelled";
    }
  }

  // rejected
  if (status === "Rejected") {
    item.adminCancelRemark = "Cancellation rejected";
  }

  await order.save();

  return {
    success: true,
    status,
  };
};
