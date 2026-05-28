import { placeOrderService,orderHistoryService, returnService, requestReturnService, requestCancelService } from "../service/userOrderService.js";
import Order from "../models/orderModel.js";
import { orderDetailsService } from "../service/adminOrderService.js";
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


export const placeOrderController=async(req,res)=>{
    try {

        const userId= req.session.userId || req.session.user || req.user?._id;
        console.log('userId from controller :' , userId )

        const {addressId, paymentMethod, couponCode}=req.body;

        const order = await placeOrderService(userId,addressId,paymentMethod, couponCode);

        console.log(order)

        return res.json({
            success:true,
            orderId:order._id
        })
        
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success:false,
            message:error.message
        })
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
          "Cancellation request submitted"
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
