import Order from "../models/orderModel.js";
import {
  approveReturnService,
  orderManagementService,
  updateOrderStatusService,
} from "../service/adminOrderService.js";

export const adminOrderManagementRender = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);

    console.log("FULL QUERY:", req.query);

    const search = req.query.search || "";
    const status = req.query.status || "";

     console.log("STATUS:", status);

   

    const orderData = await orderManagementService(page, search, status);

    return res.render("adminViews/adminOrderManagement", { orderData });
  } catch (error) {
    console.log(error);

    return res.status(500).render("adminViews/adminOrderManagement", {
      orderData: {
        orders: [],
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        search: "",
        status: "",
      },
      error: "Failed to load orders",
    });
  }
};

export const orderDetailsRender = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user")
      .populate("items.product");
    if (!order) {
      return null;
    }

    const returnItems = order.items.filter((item) => item.returnRequest);
    return res.render("adminViews/adminOrderDetails", { order, returnItems });
  } catch (error) {
    console.log(error);

    res.redirect("/admin/orderManagement");
  }
};

//update order status

export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;

    const { orderStatus } = req.body;

    await updateOrderStatusService(orderId, orderStatus);

    return res.json({
      success: true,
      message: "Updated successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Server error",
    });
  }
};

export const approveReturnController = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    

    const { status } = req.body;

    await approveReturnService(orderId, itemId, status);

    return res.json({
      success: true,
      status,
    });
  } catch (error) {
    console.log(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Server error",
    });
  }
};
