import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import { addProductService, editProductService } from "../service/adminService.js";

export const productRender = async (req, res) => {

  try {
    const products = await Product.find().populate("category");
    const totalProducts = products.length;

    res.render("adminViews/adminProductManagement", {
      product: products,
      totalProducts
    });

  } catch (error) {
    console.error(error);
    res.render("adminViews/adminProductManagement", {
      product: [],
      totalProducts: 0
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


