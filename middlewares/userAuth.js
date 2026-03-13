export const isLoggedIn = (req, res, next) => {
  if (req.session.user||req.user) {
    return next()
  }
  res.redirect('/login')
};

export const isLoggedOut=(req,res,next)=>{
  if(req.session.user){
    return res.redirect('/home');
  }
  next();
}
