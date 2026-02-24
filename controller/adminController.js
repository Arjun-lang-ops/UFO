import { adminLoginService } from "../service/adminService.js"

export const adminLoginRender=(req,res)=>{
     res.render('adminViews/adminLoginPage')
}

export const adminHomeRender=(req,res)=>{
     res.render('adminViews/adminHome')
}

export const adminLogin=async(req,res)=>{
     const admin= await adminLoginService(req.body);

     if(admin){

     }
}