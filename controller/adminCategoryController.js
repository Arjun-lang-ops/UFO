// controllers/categoryController.js

import Category from "../models/categoryModel.js";
import Offer from "../models/offerModel.js";
import { addCategoryService, editCategoryService, getAllCategoriesService, getAllCategoriesPaginatedService } from "../service/adminCategoryService.js";

export const categoryRender = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const search = req.query.search || '';

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const result = await getAllCategoriesPaginatedService({ filter, page, limit });
    const categoryOffers = await Offer.find({
      offerType: "Category",
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).sort({ createdAt: -1 });

    return res.render('adminViews/adminCategoryManagement', {
      categories: result.data,
      categoryOffers,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      totalCategories: result.totalCategories,
      limit,
      search
    });

  } catch (error) {
    console.error(error);

    res.render("adminViews/adminCategoryManagement", {
      categories: [],
      categoryOffers: [],
      totalPages: 1,
      currentPage: 1,
      totalCategories: 0,
      limit: 4,
      search: ''
    });
  }
};


export const addCategoryController = async (req, res) => {
  try {
    let { name, description, isListed } = req.body;

    const result = await addCategoryService(name, description, isListed);

    return res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

export const editCategoryController=async(req,res)=>{
    try {

        const {id}=req.params;
        const {name,description,isListed}=req.body;
        await editCategoryService(id,name,description,isListed);

        res.json({
            success:true,
            message:'Category updated successfully'
        })
        
    } catch (error) {
        console.log(error)
        res.json({
            success:false,
            message:error.message
        })
        
    }
}

export const assignCategoryOfferController = async (req, res) => {
  try {
    const { id } = req.params;
    const { offerId } = req.body;

    if (offerId) {
      const offer = await Offer.findOne({
        _id: offerId,
        offerType: "Category",
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (!offer) {
        throw new Error("Please select a valid active category offer");
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { offer: offerId || null },
      { new: true }
    );

    if (!category) {
      throw new Error("Category not found");
    }

    res.status(200).json({
      success: true,
      message: offerId ? "Category offer assigned successfully" : "Category offer removed successfully",
      category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update category offer",
    });
  }
}
