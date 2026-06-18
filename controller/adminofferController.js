import Offer from "../models/offerModel.js";
import { offerAddService, offerEditService } from "../service/adminOfferService.js";

export const adminOfferRender=async(req,res)=>{
    try {

        const offers=await Offer.find().populate("product").populate("category");
        return res.render('adminViews/adminOfferManagement',{offers})
        
    } catch (error) {
        console.log(error)
        return res.render('adminViews/adminOfferManagement',{offers: []})
    }
}


export const adminOfferAddRender=async(req,res)=>{
    try {
        return res.render('adminViews/adminOfferAdd');
        
    } catch (error) {
        console.log(error);
        return res.render('adminViews/adminOfferAdd');
    }
}


export const adminOfferEditRender=async(req,res)=>{
    try {
        const {id}=req.params;
        const offer=await Offer.findById(id).populate("product").populate("category");
        return res.render('adminViews/adminOfferEdit',{offer})
        
    } catch (error) {
        console.log(error)
        return res.render('adminViews/adminOfferEdit',{offer:null})
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
        console.log(error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to add offer"
        });
    }
}


export const offerEdit=async(req,res)=>{
    try {
        const { id } = req.params;
        const data = req.body;
        const offer = await offerEditService(id, data);

        res.status(200).json({
            success: true,
            message: 'Offer updated successfully',
            offer
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update offer"
        });
    }
}

