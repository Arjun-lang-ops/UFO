import Category from "../models/categoryModel.js";

export const loadHomePage=async (req,res)=>{
    try {
        const categories=await Category.find({isListed:true});
        res.render('userViews/userHomePage',{categories})
        
    } catch (error) {
        console.log(error);
         res.render("user/home", { categories: [] });
        
    }
}