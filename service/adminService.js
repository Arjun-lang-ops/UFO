// import bcrypt from 'bcrypt';

import User from "../models/userModel.js";
import Product from "../models/productModel.js";

// import Admin from '../models/adminModel';
export const userLoad = async (filter = {}) => {
  try {

    let user = await User.find(filter)
      .sort({ createdAt: -1 })

    if (!user) {
      return {
        success: false,
        message: "Error"
      }
    }
    return {
      success: true,
      data: user
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
      message: "Server error"
    }
  }
}

// Paginated 
export const userLoadPaginated = async ({ filter = {}, page = 1, limit = 4 } = {}) => {
  try {
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return {
      success: true,
      data: users,
      totalUsers,
      totalPages,
      currentPage: page
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Server error"
    };
  }
};

export const adminLoginService = async (data) => {

  const { email, password } = data

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (email !== adminEmail) {
    throw new Error("Invalid admin email");
  }

  if (password !== adminPassword) {
    throw new Error("Invalid admin password");
  }

  return true;

};



// CREATE PRODUCT
export const addProductService = async (data, files) => {
  try {
    const variants = [];

    let i = 1;

    while (data[`sku_${i}`]) {
      const variantImages = files[`variantImages_${i}`] || [];

      variants.push({
        sku: data[`sku_${i}`],
        color: data[`color_${i}`],
        size: data[`size_${i}`],
        price: Number(data[`price_${i}`]),
        discountedPrice: data[`discountedPrice_${i}`]
          ? Number(data[`discountedPrice_${i}`])
          : null,
        stock: Number(data[`stock_${i}`]),
        images: variantImages.map((file) => file.path),
      });

      i++;
    }

    const product = await Product.create({
      name: data.name,
      category: data.category,
      description: data.description,
      variants,
    });
    console.log(product)

    return product;


  } catch (error) {
    console.log(error)
    throw new Error(error.message);
  }
};
