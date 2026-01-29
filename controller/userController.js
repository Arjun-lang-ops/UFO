export const registerRender=async(req,res)=>{
    return res.render('userViews/userRegisterPage');
}

export const loginRender=async(req,res)=>{
    return res.render('userViews/userLoginPage')
}

export const landingPageRender=async (req,res)=>{
    return res.render('userViews/userLandingPage')
}

export const homePageRender= async (req,res)=>{
    return res.render('userViews/userHomePage');
}

export const registerOtp= async (req,res)=>{
    return res.render('userViews/registerOtpPage')
}