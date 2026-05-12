import User from "../models/userModel.js";

export const isLoggedIn = (req, res, next) => {
  if (req.session.user||req.user) {
    return next()
  }
  res.redirect('/login')
};

export const isLoggedOut=(req,res,next)=>{
  if(req.session.user|| req.user){
    return res.redirect('/home');
  }
  next();
}

export const checkUserBlocked = async (req, res, next) => {
  try {
    
    const userId = req.session.user || req.user?._id;

    if (!userId) {
      return res.redirect("/login");
    }

    const user = await User.findById(userId);

    
    if (!user || user.isBlocked) {
      req.session.destroy(() => {
        return res.redirect("/login");
      });
      return;
    }

    
    req.session.user = user;

    next();

  } catch (error) {
    console.log(error);
    return res.redirect("/login");
  }
};
