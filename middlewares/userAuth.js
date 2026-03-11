export const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

export const isLoggedOut=(req,res,next)=>{
  if(req.session.user){
    return res.redirect('/home');
  }
  next();
}
