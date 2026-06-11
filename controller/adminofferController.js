import Offer from "../models/offerModel.js";
import { offerAddService } from "../service/adminOfferService.js";

export const adminOfferRender=async(req,res)=>{
    try {

        const offers=await Offer.find();
        return res.render('adminViews/adminOfferManagement',{offers})
        
    } catch (error) {
        console.log(error)
    }
}


export const adminOfferAddRender=async(req,res)=>{
    try {

        return res.render('adminViews/adminOfferAdd')
        
    } catch (error) {
        console.log(error)
    }
}


export const offerAdd=async(req,res,next)=>{
    try {

        const data=req.body;
        const offer=await offerAddService(data);

        res.status(201).json({
            success:true,
            message:"Offer Added Successfully",
            offer
        })

        
    } catch (error) {
        console.log(error)
        next()
    }
}

