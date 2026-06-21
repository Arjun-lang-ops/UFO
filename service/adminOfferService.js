import Offer from "../models/offerModel.js";

export const offerAddService = async (data) => {
  const {
    name,
    offerType,
    offerMode,
    discountValue,
    maxDiscount,
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

  if (maxDiscount != null && maxDiscount < 0) {
    throw new Error("Maximum discount value must be a non-negative number");
  }

  const offer = await Offer.create({
    name: name.trim(),
    offerType,
    offerMode,
    discountValue,
    maxDiscount: maxDiscount != null ? maxDiscount : null,
    product: null,
    category: null,
    startDate: start,
    endDate: end,
    isActive: isActive ?? true,
  });

  return offer;
};





export const offerEditService = async (id, data) => {
  const {
    name,
    offerType,
    offerMode,
    discountValue,
    maxDiscount,
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

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new Error("End date must be greater than start date");
  }

  if (offerMode === "PERCENTAGE") {
    if (discountValue < 1 || discountValue > 90) {
      throw new Error("Percentage discount must be between 1 and 90");
    }
  }

  if (maxDiscount != null && maxDiscount < 0) {
    throw new Error("Maximum discount value must be a non-negative number");
  }

  const updatedOffer = await Offer.findByIdAndUpdate(
    id,
    {
      name: name.trim(),
      offerType,
      offerMode,
      discountValue,
      maxDiscount: maxDiscount != null ? maxDiscount : null,
      product: null,
      category: null,
      startDate: start,
      endDate: end,
      isActive: isActive ?? true,
    },
    { new: true }
  );

  if (!updatedOffer) {
    throw new Error("Offer not found");
  }

  return updatedOffer;
};
