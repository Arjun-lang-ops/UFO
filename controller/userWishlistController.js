import Wishlist from "../models/userWishlistModel.js";
import { addToWishlistService, removeWishlistService } from "../service/userWishlistService.js";

const getCurrentUserId = (req) => {
  const sessionUser = req.session?.user;

  return req.session?.userId || req.user?._id || sessionUser?._id || sessionUser;
};

export const wishlistRender = async (req, res) => {
  try {

    const userId = getCurrentUserId(req);

    const wishlist = await Wishlist.findOne({ userId })
      .populate({path:"products.product",populate:{path:'category'}});

      console.log(JSON.stringify(wishlist, null, 2));

    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        item => item.product
      );
    }

    return res.render("userViews/userWishlistPage", {
      wishlist: wishlist || { products: [] }
    });

  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};


export const addToWishlistController=async(req,res)=>{
        try {
                const userId=getCurrentUserId(req);

                const {productId , variantId}=req.body;
                await addToWishlistService(userId,productId,variantId);
                console.log("product added to wishlist")

                return res.json({
                        success:true,
                        message:'Added to wishlist'
                })

                
                
        } catch (error) {
             console.log(error)
             res.status(400).json({
                success:false,
                message:error.message
             })   
        }
}


export const removeWishlistController=async(req,res)=>{
    try {
        const userId=getCurrentUserId(req);

        const {productId,variantId}=req.body;


        await removeWishlistService(userId,productId,variantId);

        return res.json({
            success:true,
            message:"Product removed from wishlist"
        })
    } catch (error) {
        console.log(error);

        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}
