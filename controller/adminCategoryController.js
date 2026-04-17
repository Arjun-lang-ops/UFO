// controllers/categoryController.js

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

    return res.render('adminViews/adminCategoryManagement', {
      categories: result.data,
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