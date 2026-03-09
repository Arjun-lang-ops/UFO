
import { adminLoginService, userLoad } from "../service/adminService.js";
import User from "../models/userModel.js";

export const adminLoginRender=(req,res)=>{
     res.render('adminViews/adminLoginPage')
}

export const adminHomeRender=(req,res)=>{
     res.render('adminViews/adminHome')
}

export const adminUserManagement = async(req,res)=>{
     let user = await userLoad({})
     console.log(user)
     if(!user.success){
          return res.redirect('/admin')
     }
     return res.render('adminViews/adminUserManagement',{
          data:user.data
     })
}

export const adminLogin=async(req,res)=>{
    try {
      await adminLoginService(req.body);

     req.session.admin=true

     res.status(200).json({
          success:true,
          message:'Admin login successfully'
     })
     
    } catch (error) {
     res.status(401).json({
          success:false,
          message:error.message

     })
     
    }
}

export const toggleBlockUser=async(req,res)=>{
     try {

          
          const {userId} = req.body 
     const user= await User.findById({_id:userId});

          if(!user){
               return res.json({
                    success:false,
                    message:"Error"
               })

          }

          user.isBlocked=!user.isBlocked;
          await user.save();
          res.json({
               success:true,
               isBlocked:user.isBlocked,
               redirect:'/admin/userManagement'
          });
          
     } catch (error) {
          console.log(error);
          res.redirect("/admin/users");
          
     }
}

export const logoutAdmin=(req,res)=>{
     req.session.destroy((err)=>{
          if(err){
               res.redirect('/admin')
          }
          res.clearCookie('connect.sid');
          res.redirect('/admin');
     })
}