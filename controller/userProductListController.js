import Category from "../models/categoryModel.js";
import { getRelatedProducts, productDetailsService } from "../service/userProductService.js";
import Product from "../models/productModel.js";
import { addToCartService } from "../service/userCartService.js";
import Wishlist from "../models/userWishlistModel.js";
import { getVariantOfferPricing } from "../service/offerhelper.js";
import Order from "../models/orderModel.js";

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
    const userId = req.session?.user || req.session?.userId || req.user?._id;

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

    product.variants = product.variants.map((variant) => ({
      ...variant,
      offerPricing: getVariantOfferPricing(variant, product),
    }));

    selectedVariant = product.variants.find(
      (variant) => variant._id.toString() === selectedVariant._id.toString(),
    );

    product.activeOffer = selectedVariant?.offerPricing?.appliedOffer || null;

    const relatedProducts=await getRelatedProducts(product.category._id,product._id)
    console.log(relatedProducts)

    const sameCategoryProducts = await Product.find({
  category: product.category._id
});

const wishlist = userId ? await Wishlist.findOne({ userId }) : null;

const wishlistItems = wishlist?.products.map(item => ({
        productId: item.product.toString(),
        variantId: item.variant.toString()
    })) || [];

console.log("Same category count:", sameCategoryProducts.length);
console.log("Products:", sameCategoryProducts.map(p => ({
  id: p._id,
  name: p.name,
  category: p.category
})));

const productCount=await Order.countDocuments({
  paymentStatus:"Paid",
  orderStatus:{$ne: "Cancelled"},
  'items.product':productId
})

    res.render("userViews/userProductDetails", {
      product,
      selectedVariant,
      query:req.query,
      relatedProducts,
      wishlistItems,
      productCount
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
    const page=Number(req.query.page)||1;
    const limit=4;

    let filter = {isActive:true};

    const userId = req.session?.user || req.session?.userId || req.user?._id;
    
    if (categories.length && !categories.includes("all")) {
      filter.category = { $in: categories };
    }

    const categoryDocs = await Category.find({ isListed: true });

const categoryMap = {};
categoryDocs.forEach(cat => {
  categoryMap[cat._id.toString()] = cat.name;
});

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

   
    const products = await Product.find(filter)
      .populate("offer")
      .populate({
        path: "category",
        populate: {
          path: "offer"
        }
      })
      .lean();

    
    let productList = [];
    let sizesList = [];
    const now = new Date();
    const isActiveOffer = (offer) => {
      return offer &&
        offer.isActive &&
        new Date(offer.startDate) <= now &&
        new Date(offer.endDate) >= now;
    };

    products.forEach((product) => {
      product.variants.forEach((variant) => {

        
        if (
          (sizes.length && !sizes.includes(variant.size)) ||
          (minPrice && variant.price < Number(minPrice)) ||
          (maxPrice && variant.price > Number(maxPrice))
        ) {
          return;
        }

        const pricing = getVariantOfferPricing(variant, product);

        sizesList.push(variant.size);

        productList.push({
          productId: product._id,
          name: product.name,
          category: product.category,
          variantId: variant._id,
          size: variant.size,
          price: pricing.finalPrice,
          originalPrice: pricing.originalPrice,
          basePrice: pricing.basePrice,
          offerDiscount: pricing.offerDiscount,
          images: variant.images,
          stock: variant.stock,
          color:variant.color,
          offer: pricing.appliedOffer ? {
            name: pricing.appliedOffer.name,
            offerMode: pricing.appliedOffer.offerMode,
            discountValue: pricing.appliedOffer.discountValue
          } : null
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
console.log(productList)

    const totalProducts = productList.length;
    const totalPages = Math.ceil(totalProducts / limit);

    const startIndex = (page - 1) * limit;
    const paginatedProducts = productList.slice(startIndex, startIndex + limit);

    const uniqueSizes = [...new Set(sizesList)];

    console.log("FINAL COUNT:", productList.length);

  const wishlist = userId ? await Wishlist.findOne({ userId }) : null;
    const wishlistItems = wishlist?.products.map(item => ({
        productId: item.product.toString(),
        variantId: item.variant.toString()
    })) || [];

    res.render("userViews/userProductList", {
      products: paginatedProducts, 
      categories: categoryDocs,
      categoryMap,
      sizes: uniqueSizes,
      query:req.query,
      selectedValue:sort,
      currentPage:page,
      totalPages,
      totalProducts,
      limit,
      wishlistItems
    });

  } catch (error) {
    console.log(error);
  }
};


export const addToCartController=async(req,res)=>{
  try {
    const userId=req.session.user|| req.user?._id;
    const { productId, variantId, quantity } = req.body;
    const cart=await addToCartService(userId,{productId, variantId, quantity:Number(quantity)})
    let cartCount=0;
    cart.items.forEach(item=>{
      cartCount+=item.quantity
    })
    console.log('add to cart from product listing')
    res.json({
      success:true,
      cartCount
    })
  } catch (error) {
    res.status(400).json({
      success:false,
      message:error.message
    })
  }
}
