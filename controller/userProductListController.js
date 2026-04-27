import Category from "../models/categoryModel.js";
import { productDetailsService } from "../service/userProductService.js";
import Product from "../models/productModel.js";

export const productListRender = async (req, res) => {
  try {
    const categories = await Category.find({ isListed: true });
    const products = await Product.find({}).lean();

    let productList = [];
    let sizes = [];

    products.forEach(product => {
      product.variants.forEach(variant => {

        // collect sizes
        sizes.push(variant.size);

        // 🔥 flatten each variant
        productList.push({
          productId: product._id,
          name: product.name,
          category: product.category,
          variantId: variant._id,
          size: variant.size,
          price: variant.price,
          images: variant.images,
          stock: variant.stock
        });

      });
    });

    const uniqueSizes = [...new Set(sizes)];

    res.render('userViews/userProductList', {
      categories,
      products: productList,   // ✅ IMPORTANT: send flattened list
      sizes: uniqueSizes
    });

  } catch (error) {
    console.log(error);
  }
};


export const productDetailsRender = async (req, res) => {
  try {
    const productId = req.params.id;
    const variantId = req.query.variant;

    const product = await productDetailsService(productId);

    // ✅ find selected variant
    let selectedVariant;

    if (variantId) {
      selectedVariant = product.variants.find(
        v => v._id.toString() === variantId
      );
    }

    // ✅ fallback
    if (!selectedVariant) {
      selectedVariant = product.variants[0];
    }

    res.render('userViews/userProductDetails', {
      product,
      selectedVariant   // 🔥 IMPORTANT
    });

  } catch (error) {
    console.log(error);
    res.redirect('/home');
  }
};