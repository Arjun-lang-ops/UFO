export const checkoutRender=async(req,res)=>{
    try {
        return res.render('userViews/userCheckoutPage')
    } catch (error) {
        console.log(error)
    }
}