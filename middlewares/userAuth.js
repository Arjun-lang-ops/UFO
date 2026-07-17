import User from "../models/userModel.js";

export const isLoggedIn = (req, res, next) => {
  if (req.session.user || req.user) {
    return next();
  }

  const isAjax = req.xhr || 
                 (req.headers.accept && req.headers.accept.includes("json")) || 
                 req.get("Content-Type") === "application/json";

  if (isAjax) {
    req.session.returnTo = req.get("Referrer") || "/home";
    return res.status(200).json({
      success: false,
      redirectUrl: "/login",
      message: "Please login to continue"
    });
  }

  req.session.returnTo = req.originalUrl;
  res.redirect("/login");
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
