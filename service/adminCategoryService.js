
import Category from "../models/categoryModel.js";

export const getAllCategoriesService = async () => {
  const categories = await Category.find().sort({ createdAt: -1 });
  return categories;
};


export const getAllCategoriesPaginatedService = async ({ filter, page, limit }) => {
  const skip = (page - 1) * limit;

  const [categories, totalCategories] = await Promise.all([
    Category.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Category.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalCategories / limit);

  return {
    success: true,
    data: categories,
    totalCategories,
    totalPages,
    currentPage: page
  };
};

export const addCategoryService = async (name, description, isListed) => {

  if (!name || !description) {
    throw new Error("Name and description are required");
  }

  name = name.trim();
  description = description.trim();

  const existingCategory = await Category.findOne({
    name: { $regex: `^${name}$`, $options: "i" }
  });

  if (existingCategory) {
    throw new Error("Category already exists");
  }

  const newCategory = new Category({
    name,
    description,
    isListed
  });

  await newCategory.save();

  return {
    message: "Category added successfully"
  };
};


export const editCategoryService = async (id, name, description, isListed) => {
   

    try {
      const existing = await Category.findOne({
        name:{$regex:`^${name}$`,$options:'i'},
        _id: { $ne: id } 
    });

    if (existing) {
        throw new Error('Category Already Exists');
    }

    const updated = await Category.findByIdAndUpdate(
        id,
        { name, description, isListed },
        { new: true }
    );

   

    if (!updated) {
        throw new Error('Category not found');
    }

    return updated;
    } catch (error) {
      if (error.code === 11000) {
      throw new Error("Category already exists");
    }

    throw error;
      
    }
};