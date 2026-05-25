import { placeOrderService } from "../service/userOrderService.js";
import Order from "../models/orderModel.js";
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
}