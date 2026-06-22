import Offer from "../models/offerModel.js";
import { offerAddService, offerEditService } from "../service/adminOfferService.js";

export const adminOfferRender = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const status = (req.query.status || "").trim(); // 'active' | 'inactive' | 'expired' | ''
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = 3;
    const skip = (page - 1) * limit;

    const filter = {};

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = { $regex: escapedSearch, $options: "i" };
    }

    const now = new Date();

    if (status === "active") {
      filter.isActive = true;
      filter.endDate = { $gte: now };
    } else if (status === "inactive") {
      filter.isActive = false;
    } else if (status === "expired") {
      filter.endDate = { $lt: now };
    }

    const offers = await Offer.find(filter)
      .populate("product")
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOffers = await Offer.countDocuments(filter);
    const totalPages = Math.ceil(totalOffers / limit) || 1;

    return res.render("adminViews/adminOfferManagement", {
      offers,
      search,
      status,
      currentPage: page,
      totalPages,
      totalOffers,
      limit,
    });
  } catch (error) {
    console.log(error);
    return res.render("adminViews/adminOfferManagement", {
      offers: [],
      search: "",
      status: "",
      currentPage: 1,
      totalPages: 1,
      totalOffers: 0,
      limit: 5,
    });
  }
};


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
        console.log("===OFFER FETCHED FOR EDIT PAGE===", offer);
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
        console.log("===REQ BODY===", data)
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

