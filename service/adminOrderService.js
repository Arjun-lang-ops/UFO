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
   
  ];

  const selectedStatus = validStatuses.includes(status) ? status : "";

  

  //returning id of each users

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

    console.log('users :',users)


    //taking ids of the users

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

  console.log(filter);

  

  const orders = await Order.find(filter)
    .populate("user", "fullname email")
    .sort({createdAt:-1})
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
