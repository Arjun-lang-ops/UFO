import Category from "../models/categoryModel.js";
import { productDetailsService } from "../service/userProductService.js";
import Product from "../models/productModel.js";

// export const productListRender = async (req, res) => {
//   try {
//     const categories = await Category.find({ isListed: true });
//     const products = await Product.find({}).lean();

//     let productList = [];
//     let sizes = [];

//     products.forEach((product) => {
//       product.variants.forEach((variant) => {
//         sizes.push(variant.size);

//         productList.push({
//           productId: product._id,
//           name: product.name,
//           category: product.category,
//           variantId: variant._id,
//           size: variant.size,
//           price: variant.price,
//           images: variant.images,
//           stock: variant.stock,
//         });
//       });
//     });

//     const uniqueSizes = [...new Set(sizes)];

//     res.render("userViews/userProductList", {
//       categories,
//       products: productList,
//       sizes: uniqueSizes,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

export const productDetailsRender = async (req, res) => {
  try {
    const productId = req.params.id;
    const variantId = req.query.variant;

    const product = await productDetailsService(productId);

    let selectedVariant;

    if (variantId) {
      selectedVariant = product.variants.find(
        (v) => v._id.toString() === variantId,
      );
    }

    if (!selectedVariant) {
      selectedVariant = product.variants[0];
    }

    res.render("userViews/userProductDetails", {
      product,
      selectedVariant,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/home");
  }
};


export const getProducts = async (req, res) => {
  try {
    console.log("QUERY:", req.query);

    const categories = [].concat(req.query.category || []);
    const sizes = [].concat(req.query.size || []);
    const { minPrice, maxPrice,sort } = req.query;
    const search = req.query.search || "";
    const page=Number(req.query.page);
    const limit=8;

    let filter = {};

    
    if (categories.length && !categories.includes("all")) {
      filter.category = { $in: categories };
    }

    // search
if (search) {
  filter.name = { $regex: search, $options: "i" };
}

    
    if (sizes.length || minPrice || maxPrice) {
      filter.variants = { $elemMatch: {} };

      if (sizes.length) {
        filter.variants.$elemMatch.size = { $in: sizes };
      }

      if (minPrice || maxPrice) {
        filter.variants.$elemMatch.price = {};
        if (minPrice) filter.variants.$elemMatch.price.$gte = Number(minPrice);
        if (maxPrice) filter.variants.$elemMatch.price.$lte = Number(maxPrice);
      }
    }

   
    const products = await Product.find(filter).lean();

    
    let productList = [];
    let sizesList = [];

    products.forEach((product) => {
      product.variants.forEach((variant) => {

        
        if (
          (sizes.length && !sizes.includes(variant.size)) ||
          (minPrice && variant.price < Number(minPrice)) ||
          (maxPrice && variant.price > Number(maxPrice))
        ) {
          return;
        }

        sizesList.push(variant.size);

        productList.push({
          productId: product._id,
          name: product.name,
          category: product.category,
          variantId: variant._id,
          size: variant.size,
          price: variant.price,
          images: variant.images,
          stock: variant.stock,
        });
      });
    });

    if (sort) {
      console.log(sort)
  switch (sort) {

    case "priceLow":
      productList.sort(( a,b) => a.price - b.price);
      console.log('hits')
      break;

    case "priceHigh":
      productList.sort((a, b) => b.price - a.price);
      break;

    case "az":
      productList.sort((a, b) => a.name.localeCompare(b.name));
      break;

    case "za":
      productList.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }
}

    const totalProducts = productList.length;
    const totalPages = Math.ceil(totalProducts / limit);

    const startIndex = (page - 1) * limit;
    const paginatedProducts = productList.slice(startIndex, startIndex + limit);

    const uniqueSizes = [...new Set(sizesList)];

    console.log("FINAL COUNT:", productList.length);

    res.render("userViews/userProductList", {
      products: productList, 
      categories: await Category.find({ isListed: true }),
      sizes: uniqueSizes,
      query:req.query,
      selectedValue:sort,
      currentPage:page,
      totalPages,
      totalProducts,
      limit
    });

  } catch (error) {
    console.log(error);
  }
};