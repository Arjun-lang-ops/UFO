import Category from "../models/categoryModel.js";

export const productRender=async(req,res)=>{
    return res.render('adminViews/adminProductManagement')
}




export const addProduct = async (req, res) => {
  try {
    const categories = await Category.find({ isListed: true }); 

    console.log(categories); 
    res.render("adminViews/adminProductAdd", { categories });
  } catch (error) {
    console.error(error);
    res.render("adminViews/adminProductAdd", { categories: [] });
  }
};


export const addProductController=async(req,res)=>{
    try {
        
        
    } catch (error) {
        console.log(error)
        
    }
}

export const editProduct=(req,res)=>{
    return res.render('adminViews/adminProductEdit')
}