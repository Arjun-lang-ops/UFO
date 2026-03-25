// controllers/categoryController.js

import { addCategoryService, editCategoryService, getAllCategoriesService } from "../service/adminCategoryService.js";

export const categoryRender = async (req, res) => {
  try {
    const categories = await getAllCategoriesService();

    return res.render('adminViews/adminCategoryManagement', { categories });

  } catch (error) {
    console.error(error);

    res.render("adminViews/categoryPage", {
      categories: []
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