import { checkoutRenderService } from "../service/userCheckoutService.js";
import Address from "../models/userAddressModel.js";



export const checkoutRender=async(req,res)=>{
    try {
         const userId=req.session.userId || req.user?._id;
         const checkoutData= await checkoutRenderService(userId);
         return res.render('userViews/userCheckoutPage',{checkoutData})

    } catch (error) {
        console.log(error);

        return res.status(400).render('userViews/userCheckoutPage',{
            cartItems:[],
            defaultAddress:null,
            totalQuantity:0,
            subtotal: 0,
            shippingCharge: 0,
            discount: 0,
            grandTotal: 0,
            error: error.message
        })
    }
};


export const editAddress = async (req, res) => {

    try {

        const { id } = req.params;

        await Address.findByIdAndUpdate(id, req.body);

        res.json({
            success: true
        });

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: "Address update failed"
        });

    }

};