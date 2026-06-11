import Offer from "../models/offerModel.js";

export const offerAddService = async (data) => {
  const {
    name,
    offerType,
    offerMode,
    discountValue,
    product,
    category,
    startDate,
    endDate,
    isActive,
  } = data;

  if (
    !name ||
    !offerType ||
    !offerMode ||
    !discountValue ||
    !startDate ||
    !endDate
  ) {
    throw new Error("All required fields must be provided");
  }

  if (offerType === "Product" && !product) {
    throw new Error("Please select a product");
  }

  if (offerType === "Category" && !category) {
    throw new Error("Please select a category");
  }

  // Prevent duplicate active product offer
  if (offerType === "Product") {
    const existingProductOffer = await Offer.findOne({
      product,
      isActive: true,
      endDate: { $gte: new Date() },
    });

    if (existingProductOffer) {
      throw new Error("An active offer already exists for this product");
    }
  }

  // Prevent duplicate active category offer
  if (offerType === "Category") {
    const existingCategoryOffer = await Offer.findOne({
      category,
      isActive: true,
      endDate: { $gte: new Date() },
    });

    if (existingCategoryOffer) {
      throw new Error("An active offer already exists for this category");
    }
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new Error("End date must be greater than start date");
  }

  if (offerMode === "PERCENTAGE") {
    if (discountValue < 1 || discountValue > 90) {
      throw new Error(
        "Percentage discount must be between 1 and 90"
      );
    }
  }

  const offer = await Offer.create({
    name: name.trim(),
    offerType,
    offerMode,
    discountValue,
    product: offerType === "Product" ? product : null,
    category: offerType === "Category" ? category : null,
    startDate: start,
    endDate: end,
    isActive: isActive ?? true,
  });

  return offer;
};