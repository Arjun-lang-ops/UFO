
import { adminLoginService, userLoad, userLoadPaginated } from "../service/adminService.js";
import User from "../models/userModel.js";

export const adminLoginRender = (req, res) => {
     res.render('adminViews/adminLoginPage')
}

export const adminHomeRender = (req, res) => {
     res.render('adminViews/adminHome')
}

export const adminUserManagement = async (req, res) => {
     const page = parseInt(req.query.page) || 1;
     const limit = 4;

     const result = await userLoadPaginated({ page, limit });

     if (!result.success) {
          return res.redirect('/admin');
     }

     return res.render('adminViews/adminUserManagement', {
          data: result.data,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          totalUsers: result.totalUsers,
          limit
     });
}

export const adminLogin = async (req, res) => {
     try {
          await adminLoginService(req.body);

          req.session.admin = true

          res.status(200).json({
               success: true,
               message: 'Admin login successfully'
          })

     } catch (error) {
          res.status(401).json({
               success: false,
               message: error.message

          })

     }
}

export const toggleBlockUser = async (req, res) => {
     try {


          const { userId } = req.body
          const user = await User.findById({ _id: userId });

          if (!user) {
               return res.json({
                    success: false,
                    message: "Error"
               })

          }

          user.isBlocked = !user.isBlocked;
          await user.save();
          res.json({
               success: true,
               isBlocked: user.isBlocked,
               redirect: '/admin/userManagement'
          });

     } catch (error) {
          console.log(error);
          res.redirect("/admin/users");

     }
}

export const searchUsers = async (req, res) => {
     try {
          const q = req.query.q || '';
          const result = await searchUsersService(q);
          if (!result.success) {
               return res.json({ success: false, data: [] });
          }
          return res.json({ success: true, data: result.data });
     } catch (error) {
          console.log(error);
          return res.status(500).json({ success: false, data: [] });
     }
};

export const logoutAdmin = (req, res) => {
     req.session.destroy((err) => {
          if (err) {
               res.redirect('/admin')
          }
          res.clearCookie('connect.sid');
          res.redirect('/admin');
     })
}