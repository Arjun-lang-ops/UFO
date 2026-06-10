import Coupon from "../models/couponModel.js";
import {
  createCouponService,
  editCouponService,
} from "../service/adminCouponService.js";

export const couponPageRender = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = 5;
    const skip = (page - 1) * limit;

    const filter = {};

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.code = {
        $regex: escapedSearch,
        $options: "i",
      };
    }
    const coupons = await Coupon.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCoupons = await Coupon.countDocuments(filter);

    const totalPages = Math.ceil(totalCoupons / limit) || 1;


    const allCouponsForStats = await Coupon.find({}, { usedCount: 1, isActive: 1, expiryDate: 1 });
    const totalActiveCoupons = allCouponsForStats.filter(coupon => coupon.isActive && (!coupon.expiryDate || coupon.expiryDate >= new Date())).length;
    const totalRedeemed = allCouponsForStats.reduce((total, coupon) => total + (coupon.usedCount || 0), 0);
    const totalCouponsGlobal = allCouponsForStats.length;

    res.render("adminViews/adminCouponManagement", {
      coupons,
      search,
      currentPage: page,
      totalPages,
      totalCoupons,
      limit,
      totalActiveCoupons,
      totalRedeemed,
      totalCouponsGlobal,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/admin/dashboard");
  }
};

export const couponAddRender = async (req, res) => {
  try {
    return res.render("adminViews/adminCouponAdd");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/coupon");
  }
};

export const couponEditRender = async (req, res) => {
  try {
    const couponId = req.params.id;

    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      return res.redirect("/admin/coupon");
    }

    return res.render("adminViews/adminCouponEdit", { coupon });
  } catch (error) {
    console.log(error);
    res.redirect("/admin/coupon");
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    await createCouponService(req.body);

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const editCoupon = async (req, res, next) => {
  try {
    const couponId = req.params.id;
    const updateData = req.body;

    const updatedCoupon = await editCouponService(couponId, updateData);

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon: updatedCoupon,
    });
  } catch (error) {
    console.log(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update coupon",
    });
  }
};
