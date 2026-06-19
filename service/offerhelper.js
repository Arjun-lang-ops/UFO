export const isOfferActive = (offer, now = new Date()) => {
  if (!offer || !offer.isActive) return false;

  const startDate = offer.startDate ? new Date(offer.startDate) : null;
  const endDate = offer.endDate ? new Date(offer.endDate) : null;

  if (startDate && startDate > now) return false;
  if (endDate && endDate < now) return false;

  return true;
};

const roundAmount = (amount) => Math.round((Number(amount) || 0) * 100) / 100;

const getOfferDiscount = (sellingPrice, offer) => {
  if (!isOfferActive(offer)) return 0;

  const price = Number(sellingPrice) || 0;
  const discountValue = Number(offer.discountValue) || 0;

  if (offer.offerMode === "PERCENTAGE") {
    return roundAmount((price * discountValue) / 100);
  }

  return roundAmount(discountValue);
};

export const calculateBestOfferPrice = (
  sellingPrice,
  productOffer,
  categoryOffer,
) => {
  const price = Number(sellingPrice) || 0;
  const productDiscount = getOfferDiscount(price, productOffer);
  const categoryDiscount = getOfferDiscount(price, categoryOffer);

  const bestDiscount = Math.min(
    price,
    Math.max(productDiscount, categoryDiscount),
  );

  let appliedOffer = null;

  if (bestDiscount > 0) {
    appliedOffer =
      productDiscount >= categoryDiscount ? productOffer : categoryOffer;
  }

  return {
    bestDiscount: roundAmount(bestDiscount),
    finalPrice: roundAmount(Math.max(0, price - bestDiscount)),
    appliedOffer,
    productDiscount: roundAmount(productDiscount),
    categoryDiscount: roundAmount(categoryDiscount),
  };
};

export const getVariantOfferPricing = (variant, product) => {
  const originalPrice = Number(variant?.price) || 0;
  const discountedPrice =
    variant?.discountedPrice !== null && variant?.discountedPrice !== undefined
      ? Number(variant.discountedPrice)
      : null;
  const basePrice = discountedPrice || originalPrice;

  const offerResult = calculateBestOfferPrice(
    basePrice,
    product?.offer,
    product?.category?.offer,
  );

  return {
    originalPrice: roundAmount(originalPrice),
    basePrice: roundAmount(basePrice),
    finalPrice: offerResult.finalPrice,
    offerDiscount: offerResult.bestDiscount,
    appliedOffer: offerResult.appliedOffer,
  };
};
