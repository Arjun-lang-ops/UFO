// import { registerUserLogic,verifyUserOtp } from "../service/userService";
// import { verifyOtp } from "../service/otpService";


// export const registerUser=async (req,res)=>{
//     try {
//         await registerUserLogic(req.body);

        
//     } catch (error) {
        
//     }
// }


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