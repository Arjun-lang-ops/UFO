import { applyCouponService } from "../service/userCouponService.js";

export const applyCoupon=async(req,res)=>{
    try {

        const userId=req.session.user || req.session?.userId || req.user?._id;

        const {couponCode}=req.body;

        const result=await applyCouponService(userId,couponCode);

        return res.json({
            success:true,
            ...result
        })
        
    } catch (error) {
        console.log(error)
        return res.status(error.statusCode || 400).json({
            success:false,
            message:error.message || "Failed to apply coupon"
        })
    }
}
