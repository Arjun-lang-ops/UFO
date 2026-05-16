export const wishlistRender=async(req,res)=>{
    try {
        return res.render('userViews/userWishlistPage')
        
    } catch (error) {
        console.log(error)
    }
}