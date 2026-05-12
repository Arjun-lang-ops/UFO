import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";

export const loadHomePage = async (req, res) => {
  try {

    if(!req.session.user){
        return res.redirect('/login')
    }
    const categories = await Category.find({ isListed: true }); 

    const search=req.query.search ||'';

    const products = await Product.find({ isActive: true , name:{$regex:search, $options:'i'}}).populate('category')
      .limit(8); 

      const filteredProducts=products.filter(p=>p.category?.isListed)

    res.render("userViews/userHomePage", { 
      categories,
      products:filteredProducts,
      query:req.query
    });

  } catch (error) {
    console.log(error);
    res.render("userViews/userHomePage", { 
      categories: [],
      products: []
    });
  }
};