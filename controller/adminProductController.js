import Category from "../models/categoryModel.js";
import Offer from "../models/offerModel.js";
import Product from "../models/productModel.js";
import { addProductService, editProductService,toggleProductStatusService } from "../service/adminService.js";

export const productRender = async (req, res) => {
  try {
    const { search, page = 1 } = req.query;

    const limit = 4;
    const currentPage = Number(page);
    const skip = (currentPage - 1) * limit;

    let filter = {};

    if (search && search.trim() !== "") {
      filter.name = { $regex: search, $options: "i" };
    }

    
    const products = await Product.find(filter)
      .populate("category").populate("offer").sort({createdAt:-1})
      .skip(skip)
      .limit(limit);

    
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    const productOffers = await Offer.find({
      offerType: "Product",
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).sort({ createdAt: -1 });

    res.render("adminViews/adminProductManagement", {
      product: products,
      productOffers,
      totalProducts,
      currentPage,
      totalPages,
      search: search || ""
    });

  } catch (error) {
    console.error(error);

    res.render("adminViews/adminProductManagement", {
      product: [],
      productOffers: [],
      totalProducts: 0,
      currentPage: 1,
      totalPages: 1,
      search: ""
    });
  }
};

// PUT Edit Product Controller
export const editProductController = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('Edit Body: ', req.body);
    console.log('Edit Files: ', req.files);
    
    const product = await editProductService(productId, req.body, req.files);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong during update",
    });
  }
};

export const addProduct = async (req, res) => {
  try {
    const categories = await Category.find({ isListed: true });

    console.log(categories);
    res.render("adminViews/adminProductAdd", { categories });
  } catch (error) {
    console.error(error);
    res.render("adminViews/adminProductAdd", { categories: [] });
  }
};


export const addProductController = async (req, res) => {
  try {
    console.log('Body : ', req.body)
    console.log('files : ', req.files)
    const product = await addProductService(req.body, req.files);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

// GET Edit Product Page
export const editProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId)
      .populate("category");

    const categories = await Category.find();

    res.render("adminViews/adminProductEdit", {
      product,
      categories
    });

  } catch (error) {
    console.log(error);
    res.redirect("/admin/products");
  }
};

export const toggleProductStatusController = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await toggleProductStatusService(productId);

    res.status(200).json({
      success: true,
      message: product.isActive
        ? "Product listed successfully"
        : "Product unlisted successfully",
      product,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const assignProductOfferController = async (req, res) => {
  try {
    const { id } = req.params;
    const { offerId } = req.body;

    if (offerId) {
      const offer = await Offer.findOne({
        _id: offerId,
        offerType: "Product",
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (!offer) {
        throw new Error("Please select a valid active product offer");
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { offer: offerId || null },
      { new: true }
    );

    if (!product) {
      throw new Error("Product not found");
    }

    res.status(200).json({
      success: true,
      message: offerId ? "Product offer assigned successfully" : "Product offer removed successfully",
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update product offer",
    });
  }
};
