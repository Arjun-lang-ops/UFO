import Category from "../models/categoryModel.js";

export const productListRender=async (req,res)=>{
    const categories = await Category.find({ isListed: true });

  res.render('userViews/userHomePage', { categories });
}