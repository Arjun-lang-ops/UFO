import Cart from "../models/cartModel.js";

export const cartCountMiddleware=async(req,res,next)=>{
    try {

       const userId=req.user?._id||req.session.user;
       if(!userId){
        res.locals.cartCount=0;
        return next()
       }

        const cart=await Cart.findOne({userId});

        let count=0;

        if(cart && cart.items.length>0){
            cart.items.forEach(item=>{

                count+=item.quantity

            })
        }
        res.locals.cartCount = count;

        next();
        
 
    } catch (error) {
        console.log(error)
        res.locals.cartCount = 0;
        next()
    }
}