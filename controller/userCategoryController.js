import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";

export const loadHomePage = async (req, res) => {
  try {

    if(!req.session.user){
        return res.redirect('/login')
    }
    const categories = await Category.find({ isListed: true });

    const products = await Product.find({ isActive: true }).populate('category')
      .limit(8); 

      const filteredProducts=products.filter(p=>p.category?.isListed)

    res.render("userViews/userHomePage", { 
      categories,
      products:filteredProducts
    });

  } catch (error) {
    console.log(error);
    res.render("userViews/userHomePage", { 
      categories: [],
      products: []
    });
  }
};