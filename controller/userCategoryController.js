import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import Wishlist from "../models/userWishlistModel.js";

export const loadHomePage = async (req, res) => {
  try {

    const userId=req.session.userId || req.user?._id;

    if(!req.session.user){
        return res.redirect('/login')
    }
    const categories = await Category.find({ isListed: true }); 

    const search=req.query.search ||'';

    const products = await Product.find({ isActive: true , name:{$regex:search, $options:'i'}}).populate('category')
      .limit(8); 

      const filteredProducts=products.filter(p=>p.category?.isListed)


      const wishlist = await Wishlist.findOne({ userId });

      const wishlistItems = wishlist?.products.map(item => ({
        productId: item.product.toString(),
        variantId: item.variant.toString()
    })) || [];

    res.render("userViews/userHomePage", { 
      categories,
      products:filteredProducts,
      query:req.query,
      wishlistItems
    });

  } catch (error) {
    console.log(error);
    res.render("userViews/userHomePage", { 
      categories: [],
      products: [],
      query:{},
      wishlist:[]
    });
  }
};