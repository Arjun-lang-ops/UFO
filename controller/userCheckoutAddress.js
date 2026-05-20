export const checkoutAddressRender=async(req,res)=>{
    try {
        return res.render('userViews/userCheckoutAddressSelectPage')
    } catch (error) {
        console.log(error)
    }
}