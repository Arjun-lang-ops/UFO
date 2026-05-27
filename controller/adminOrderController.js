import Order from "../models/orderModel.js";
import { orderManagementService } from "../service/adminOrderService.js";

export const adminOrderManagementRender = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);

    const search = req.query.search || "";
    const status = req.query.status || "";

    const orderData = await orderManagementService(page, search, status);

    return res.render("adminViews/adminOrderManagement", { orderData });
  } catch (error) {
    console.log(error);

    return res.status(500).render("adminViews/orderManagement", {
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

    const returnItems=order.items.filter(item=>item.returnRequest)
    return res.render("adminViews/adminOrderDetails", { order,returnItems });
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

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    if(orderStatus==='Delivered'){
        order.paymentStatus= "Paid"
    }

    order.orderStatus = orderStatus;

    await order.save();

    return res.json({
      success: true,
      message: "Updated successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




