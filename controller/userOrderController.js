import { placeOrderService,orderHistoryService, returnService } from "../service/userOrderService.js";
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

        const userId=req.session.user || req.session.userId || req.user?._id;
        const orders=await orderHistoryService(userId);

        return res.render('userViews/userOrderListing',{orders});
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
