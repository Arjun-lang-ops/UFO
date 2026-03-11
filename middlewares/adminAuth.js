export const adminLoggedIn = (req, res, next) => {
     if (!req.session.admin) {
          return res.redirect('/admin');
     }
     next();
};

export const adminLoggedOut=(req,res,next)=>{
     if(req.session.admin){
          return res.redirect('/admin/dashboard')
     }
     next();
}