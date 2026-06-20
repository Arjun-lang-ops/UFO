
import { adminLoginService, userLoad, userLoadPaginated } from "../service/adminService.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

const getChartData = async (filter) => {
  let labels = [];
  let revenue = [];
  
  if (filter === "weekly") {
    const startOfLast7Days = new Date();
    startOfLast7Days.setDate(startOfLast7Days.getDate() - 6);
    startOfLast7Days.setHours(0, 0, 0, 0);

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLast7Days },
          orderStatus: { $ne: "Cancelled" }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
      labels.push(dateStr);
      
      const match = revenueData.find(item => 
        item._id.day === d.getDate() && 
        item._id.month === (d.getMonth() + 1) && 
        item._id.year === d.getFullYear()
      );
      revenue.push(match ? match.revenue : 0);
    }
  } else if (filter === "monthly") {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          orderStatus: { $ne: "Cancelled" }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          revenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      labels.push(`Day ${i}`);
      const match = revenueData.find(item => item._id === i);
      revenue.push(match ? match.revenue : 0);
    }
  } else if (filter === "yearly") {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear },
          orderStatus: { $ne: "Cancelled" }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 1; i <= 12; i++) {
      labels.push(months[i - 1]);
      const match = revenueData.find(item => item._id === i);
      revenue.push(match ? match.revenue : 0);
    }
  }

  return { labels, revenue };
};

export const adminDashboardChartData = async (req, res) => {
  try {
    const filter = req.query.filter || "weekly";
    const { labels, revenue } = await getChartData(filter);
    return res.json({ success: true, labels, revenue });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminHomeRender = async(req, res,next) => {
     try {
    const totalSalesResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalSales = totalSalesResult[0]?.total || 0;

    const totalOrders = await Order.countDocuments({ orderStatus: { $ne: "Cancelled" } });
    const activeUsers = await User.countDocuments({ isBlocked: false });
    const conversionRate = activeUsers > 0 ? ((totalOrders / activeUsers) * 100).toFixed(2) : 0;

    const bestSellingProducts = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.totalPrice" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" }
    ]);

    const bestSellingCategories = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.totalPrice" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      { $unwind: "$categoryDetails" }
    ]);

    const { labels, revenue } = await getChartData("weekly");

    res.render("adminViews/adminHome", {
      labels,
      revenue,
      totalSales,
      totalOrders,
      activeUsers,
      conversionRate,
      bestSellingProducts,
      bestSellingCategories
    });

  } catch (error) {
    next(error);
  }
}

export const adminLoginRender = (req, res) => {
     res.render('adminViews/adminLoginPage')
}

export const adminUserManagement = async (req, res) => {
     const page = parseInt(req.query.page) || 1;
     const limit = 4;
     const search = req.query.search || '';

     const filter = {};
     if (search) {
          filter.$or = [
               { fullname: { $regex: search, $options: 'i' } },
               { email: { $regex: search, $options: 'i' } }
          ];
     }

     const result = await userLoadPaginated({ filter, page, limit });

     if (!result.success) {
          return res.redirect('/admin');
     }

     return res.render('adminViews/adminUserManagement', {
          data: result.data,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          totalUsers: result.totalUsers,
          limit,
          search
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