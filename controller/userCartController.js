import { addToCartService, getCartService,removeFromCartService,updateQuantity } from "../service/userCartService.js";

export const cartRender = async (req, res) => {
  try {
    return res.render("userViews/userCartPage");
  } catch (error) {
    console.log(error);
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user?._id||req.session.user;
    const { productId, variantId, quantity } = req.body;
    if (!productId || !variantId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const cart=await addToCartService(userId,{productId, variantId, quantity:Number(quantity)});

    return res.status(200).json({
        success:true,
        message:'Product added to cart',
        cart
        
    })


  } catch (error) {
    console.log(error)
    return res.status(400).json({
      success: false,
      message: error.message || "Out of Stock"
    });
  }
};

export const getCartController = async (req, res) => {
  try {
    const userId = req.user?._id||req.session.user;

    const cart = await getCartService(userId);

    let cartTotal = 0;

    if (cart && cart.items.length > 0) {
      cart.items.forEach(item => {

        const product = item.productId;

        const variant = product?.variants?.find(v =>
          v._id.toString() === item.variantId.toString()
        );

        const isOutOfStock = !variant || variant.stock <= 0 || !product || !product.isActive;
        const price = isOutOfStock ? 0 : (variant?.discountedPrice || variant?.price || 0);

        cartTotal += price * item.quantity;
      });
    }

    res.render("userViews/userCartPage", {
      cart,
      cartTotal   
    });

  } catch (error) {
    console.log(error);
    res.redirect("/home");
  }
};



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


export const updateCartQuantity = async (req, res) => {
  try {
    const { variantId, action } = req.body;
    const userId = req.session.user;

    const updatedItem = await updateQuantity(
      userId,
      variantId,
      action
    );

    res.json({
      success: true,
      quantity: updatedItem.quantity
    });

  } catch (error) {
    res.json({ success: false });
  }
};
