import { addToCartService, getCartService,removeFromCartService } from "../service/userCartService.js";

export const cartRender = async (req, res) => {
  try {
    return res.render("userViews/userCartPage");
  } catch (error) {
    console.log(error);
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, variantId, quantity } = req.body;
    if (!productId || !variantId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const cart=await addToCartService(userId,{productId, variantId, quantity});

    return res.status(200).json({
        success:true,
        message:'Product added to cart',
        cart
    })


  } catch (error) {
    console.log(error)
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong"
    });
  }
};

export const getCartController=async(req,res)=>{
    try {
        const userId=req.user._id;
        const cart=await getCartService(userId);
        res.render('userViews/userCartPage',{cart})
        
    } catch (error) {
        console.log(error);
        res.redirect('/home')
    }
}


export const removeFromCartController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { variantId } = req.body;

    await removeFromCartService(userId, variantId);

    res.json({ success: true });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
