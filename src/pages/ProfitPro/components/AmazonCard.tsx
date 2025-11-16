import React from "react";
import { type TAmazonProduct } from "@/types/product";
import SpkbgCards from "@/@spk/uielements/spkbgcards";
import { getProcessedProductData } from "@/api/product";

type TAmazonCardProps = {
  amazonProduct: TAmazonProduct;
};

const AmazonCard: React.FC<TAmazonCardProps> = ({ amazonProduct }) => {
  // ✅ Handle both old saved format (fields on root) and new format (fields in data)
  const productData = amazonProduct.data || (amazonProduct as any);

  // 🔍 Detect if this is a TikTok product (has TikTok-specific fields)
  const isTikTokProduct = !!(
    (productData as any).shop_product_title || // TikTok-specific field
    (productData as any).shop_price || // TikTok-specific field
    (productData as any).shop_analysis || // TikTok-specific field
    ((productData as any).source === 'tiktok_trends') ||
    ((amazonProduct as any).source === 'tiktok_trends')
  );

  // 🔍 Enhanced rating extraction with comprehensive fallbacks
  const getRating = () => {
    // For TikTok products, check shop_analysis first
    if (isTikTokProduct && (productData as any).shop_analysis?.rating) {
      return (productData as any).shop_analysis.rating.toString();
    }

    // Try all possible rating field locations (Amazon and TikTok formats)
    const rating =
      productData.product_star_rating ||
      (productData as any).rating ||
      (productData as any).product_rating ||
      (productData as any).star_rating ||
      (productData as any).shop_rating ||
      (amazonProduct as any).product_star_rating ||
      (amazonProduct as any).rating ||
      "0";

    // Don't show 0 rating for TikTok products
    if (isTikTokProduct && rating === "0") {
      return "N/A";
    }

    return rating?.toString() || "0";
  };

  // 🔍 Enhanced review count extraction with comprehensive fallbacks
  const getReviewCount = () => {
    // For TikTok products, check shop_analysis first
    if (isTikTokProduct && (productData as any).shop_analysis?.reviews) {
      return (productData as any).shop_analysis.reviews;
    }

    const count =
      productData.product_num_ratings ||
      (productData as any).reviews ||
      (productData as any).review_count ||
      (productData as any).product_num_reviews ||
      (productData as any).num_ratings ||
      (productData as any).rating_count ||
      (amazonProduct as any).product_num_ratings ||
      (amazonProduct as any).reviews ||
      0;

    return count;
  };

  // 🔍 Get title with TikTok fallbacks
  const getTitle = () => {
    return (productData as any).shop_product_title || // TikTok field
           productData.product_title ||
           (productData as any).title ||
           (productData as any).name ||
           (productData as any).url_title || // TikTok field
           "No name available";
  };

  // 🔍 Get price with TikTok fallbacks
  const getPrice = () => {
    // For TikTok products, price might be a number or string
    const price = (productData as any).shop_price || // TikTok field
                  (productData as any).price ||
                  productData.product_price ||
                  0;

    // Convert to number if it's a string
    if (typeof price === 'string') {
      return parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    }
    return price || 0;
  };

  // 🔍 Get image with TikTok fallbacks
  const getImage = () => {
    return (productData as any).cover_url || // TikTok field
           productData.product_photo ||
           (productData as any).image ||
           (productData as any).image_url ||
           "";
  };

  // 🔍 Get sales volume with TikTok fallbacks
  const getSalesVolume = () => {
    // For TikTok products, check shop_analysis first
    if (isTikTokProduct && (productData as any).shop_analysis?.sales) {
      return (productData as any).shop_analysis.sales;
    }

    return productData.sales_volume ||
           (productData as any).sales_count ||
           (productData as any).sold_count ||
           (productData as any).total_sales ||
           (productData as any).post || // TikTok field (post count)
           0;
  };

  // Get country from parameters or default to 'US'
  const country = amazonProduct.parameters?.country ||
                  (amazonProduct.parameters as any)?.searchCountry ||
                  productData?.country ||
                  'US';

  // ✅ Wrap old format in data structure for getProcessedProductData
  const normalizedProduct = amazonProduct.data
    ? amazonProduct
    : { data: amazonProduct as any, parameters: { country } };

  // Transform amazonProduct data to match SpkbgCards props
  const transformedAmazonProduct = getProcessedProductData(normalizedProduct as TAmazonProduct, country);

  // 🔍 Get currency with TikTok fallbacks
  const getCurrency = () => {
    return transformedAmazonProduct.currency ||
           productData.currency ||
           (productData as any).currency_symbol ||
           "$";
  };

  // 🔍 Get currency symbol for TikTok
  const getCurrencySymbol = () => {
    if (isTikTokProduct) {
      return (productData as any).shop_currency || "$";
    }
    return getCurrency();
  };

  const spkbgProps = {
    mode: "basic" as const,
    Title: getTitle(),
    Price: isTikTokProduct ? getPrice() : transformedAmazonProduct.price,
    Imgsrc: getImage(),
    Asin: isTikTokProduct ? "" : (productData.asin || ""), // Hide ASIN for TikTok products
    Currency: getCurrencySymbol(),
    originalPrice: isTikTokProduct ? getPrice() : transformedAmazonProduct.originalPrice,
    StarRating: getRating(),
    BestSeller: productData.is_best_seller || false,
    AmazonChoice: productData.is_amazon_choice || false,
    SalesVolume: (isTikTokProduct ? getSalesVolume() : transformedAmazonProduct.salesVolume)?.toLocaleString() || "0",
    ratingCount: getReviewCount(),
    IsPrime: productData.is_prime || false,
    IsClimateFriendly: productData.climate_pledge_friendly || false,
    productOffers: productData.product_num_offers || 0,
    deliveryPrice: amazonProduct.offer?.delivery_price || "N/A",
    productNumRatings: getReviewCount(),
    sellerName: amazonProduct.offer?.seller || (productData as any).shop_name || (productData as any).seller_name || "N/A",
    sellerId: amazonProduct.offer?.seller_id || "N/A",
    sellerRating: amazonProduct.offer?.seller_star_rating || "N/A",
    sellerCountry: productData.country || "N/A",
    sellerDeliveryTime: amazonProduct.offer?.delivery_time || "N/A",
    itemWeight: productData.product_information?.["Item Weight"] || "N/A",
    sellerShipsFrom: amazonProduct.offer?.ships_from || "N/A",
    buttonCheck: false,
    dimensions:
      productData.product_information?.[
        Object.keys(productData.product_information || {}).find((key) =>
          key.toLowerCase().includes("dimensions")
        ) || "Item Dimensions"
      ] || "N/A",
  };

  return (
    <>
      <SpkbgCards {...spkbgProps} />
    </>
  );
};

export default AmazonCard;
