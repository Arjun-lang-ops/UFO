import { placeOrderService,orderHistoryService, returnService, requestReturnService, requestCancelService } from "../service/userOrderService.js";
import Order from "../models/orderModel.js";
import { processReferralReward } from "../service/userService.js";
import { orderDetailsService } from "../service/adminOrderService.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret"
});



export const orderConfirmRender = async (req, res) => {
    try {

        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate("items.product");

        if (!order) {
            return res.redirect("/home");
            console.log('asdgjnaksjvdnsvg')
        }

        return res.render(
            "userViews/userOrderConfirmationPage",
            { order }
        );

    } catch (error) {
        console.log(error);
        return res.redirect("/home");
    }
};


export const orderFailureRender=async(req,res,next)=>{
  try {

        const { id } = req.params;

    const order = await Order.findById(id).populate('items.product');

    if (!order) {
      return res.status(404).render("userViews/404");
    }

    res.render("userViews/userOrderFailurePage", {
      order,
    });


    
  } catch (error) {
    console.log(error)
    next(error)
  }
}


export const placeOrderController = async (req, res) => {
  try {
    const userId = req.session.userId || req.session.user || req.user?._id;
    console.log('userId from controller :', userId);

    const { addressId, paymentMethod, couponCode } = req.body;
    console.log(paymentMethod,' adiujffhgaksdfhbaudfjhbalfdbvajkbdvf')

    const order = await placeOrderService(userId, addressId, paymentMethod, couponCode);

    console.log(order);

    if (paymentMethod === "RAZORPAY") {
      try {
        const options = {
          amount: Math.round(order.totalAmount * 100), // in paise
          currency: "INR",
          receipt: order._id.toString()
        };
        const razorpayOrder = await razorpay.orders.create(options);

        console.log('reached here:',razorpayOrder);
        
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.json({
          success: true,
          razorpay: true,
          orderId: order._id,
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          key: process.env.RAZORPAY_KEY_ID,
          user: {
            name: req.session.user?.fullname || "Customer",
            email: req.session.user?.email || "",
            phone: order.address?.phone || ""
          }
        });
      } catch (razorpayError) {
        console.error("Razorpay order creation failed:", razorpayError);
        return res.status(400).json({
          success: false,
          message: "Failed to initiate online payment. Please try again or select another payment method."
        });
      }
    }

    return res.json({
      success: true,
      orderId: order._id
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const verifyPaymentController = async (req, res) => {
  try {
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret");
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const calculatedSignature = hmac.digest("hex");

    if (calculatedSignature === razorpay_signature) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
      order.paymentStatus = "Paid";
      order.orderStatus = "Confirmed";
      await order.save();
      
      try {
        await processReferralReward(order.user);
      } catch (referralErr) {
        console.error("Referral processing error during verify payment:", referralErr);
      }

      return res.json({ success: true });
    } else {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = "Failed";
        await order.save();
      }
      return res.status(400).json({ success: false, message: "Invalid signature, verification failed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error during verification" });
  }
};

export const retryPaymentController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentMethod !== "RAZORPAY" || order.paymentStatus !== "Pending") {
      return res.status(400).json({ success: false, message: "Only pending Razorpay orders can be retried" });
    }

    const options = {
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString()
    };

    const razorpayOrder = await razorpay.orders.create(options);
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.json({
      success: true,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      key: process.env.RAZORPAY_KEY_ID,
      user: {
        name: req.session.user?.fullname || "Customer",
        email: req.session.user?.email || "",
        phone: order.address?.phone || ""
      }
    });
  } catch (error) {
    console.error("Retry payment failed:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to initiate online payment retry" });
  }
};



export const orderHistoryRender=async(req,res)=>{
    try {
        const user=req.session.user || req.user
        const search=(req.query.search || "").trim();
        const userId=req.session.user?._id || req.session.userId || req.user?._id;
        const orders=await orderHistoryService(userId,search);

        return res.render('userViews/userOrderListing',{orders,user,search});
    } catch (error) {
        console.log(error);
        res.redirect('/profile')
    }
}


export const orderDetailsRender=async(req,res)=>{
    try {

        const orderId=req.params.id;
        console.log('OrderId:' ,orderId)
        const orderDetails=await orderDetailsService(orderId);

        if(!orderDetails){
            res.redirect("/orderHistory")
        }
        return res.render('userViews/userOrderDetails',{orderDetails})
    } catch (error) {
        console.log(error)
    }
}


export const orderReturnRender=async(req,res)=>{
    try {
        const orderId=req.params.id;

        const returnItem=await returnService(orderId);

        if(!returnItem){
         return res.redirect('/orderHistory/:id')
        }
        return res.render('userViews/userOrderReturn',{returnItem})
    } catch (error) {
        console.log(error)
    }
}


export const requestReturn = async (req, res) => {
  try {
    const userId =
      req.session.user ||
      req.session.userId ||
      req.user?._id;

    const {
      orderId,
      returnItemId,
      returnReason,
      returnComments,
      shipping_method
    } = req.body;

    console.log(req.body)

    const qty =
      req.body[`returnQuantity_${returnItemId}`];

    await requestReturnService({
      userId,
      orderId,
      returnItemId,
      quantity: Number(qty),
      reason: returnReason,
      description: returnComments,
      shippingMethod: shipping_method
    });

    return res.status(200).json({
        success:true,
        message:'Return request submitted'
    });

  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Return failed"
    });
  }
};


export const requestCancel=async(req,res)=>{
    try {

        const userId= req.session.userId || req.user?._id || req.session.user?._id;

        const {orderId,cancelItemId, cancelReason,cancelComments}=req.body;

        const qty =
        req.body[
          `cancelQuantity_${cancelItemId}`
        ];

        await requestCancelService({
        userId,
        orderId,
        cancelItemId,
        quantity:
          Number(qty),
        reason:
          cancelReason,
        description:
          cancelComments
      });

      return res.json({
        success: true,
        message:
          "Product cancelled successfully"
      });
        
    } catch (error) {
        console.log(error);
         console.log(error);

      return res
        .status(400)
        .json({
          success: false,
          message:
            error.message
        });

        
    }
}
