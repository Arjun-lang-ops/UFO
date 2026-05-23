import { checkoutRenderService,updateAddressService ,addAddressService } from "../service/userCheckoutService.js";
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


export const editAddress=async(req,res)=>{
    try {

        const {id}=req.params;

        const userId=req.session.user || req.session.userId || req.user?._id;

        const result = await updateAddressService(id,userId,req.body);

        if(!result.success){
            return res.status(result.status).json({
                success:false,
                message:result.message
            })
        };

        res.json({
            success:true,
            address:result.address
        })
        
    } catch (error) {
         console.log(error);

        res.status(500).json({
            success: false,
            message: "Address update failed"
        });
    }
}

export const addAddress = async (req, res) => {

    try {

        const userId =
            req.session.user ||
            req.session.userId ||
            req.user?._id;

        const result = await addAddressService(
            userId,
            req.body
        );

        res.status(201).json({
            success: result.success,
            message: result.message,
            address: result.address
        });

    } catch (error) {

        console.log(error);

        res.status(400).json({
            success: false,
            message: "Address add failed"
        });

    }

};

export const selectAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.user || req.session.userId || req.user?._id;

        const address = await Address.findOne({ _id: id, user: userId });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        await Address.updateMany(
            { user: userId },
            { $set: { isDefault: false } }
        );

        address.isDefault = true;
        await address.save();

        res.json({
            success: true,
            message: "Delivery address selected",
            address
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Address selection failed"
        });
    }
};
