import Category from "../models/categoryModel.js";
import { productDetailsService } from "../service/userProductService.js";

export const productListRender=async (req,res)=>{
    const categories = await Category.find({ isListed: true });

  res.render('userViews/userHomePage', { categories });
}


export const productDetailsRender=async(req,res)=>{
  try {
    const productId=req.params.id
    const product=await productDetailsService(productId)
    console.log(product)
    res.render('userViews/userProductDetails',{product})
    
    
  } catch (error) {
    console.log(error);
    res.redirect('/home')

  }
}