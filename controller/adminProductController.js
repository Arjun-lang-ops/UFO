import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import { addProductService } from "../service/adminService.js";

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

export const editProduct = (req, res) => {
  return res.render('adminViews/adminProductEdit')
}