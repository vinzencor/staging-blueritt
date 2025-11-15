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

  const spkbgProps = {
    mode: "basic" as const,
    Title: productData.product_title || (productData as any).title || "No name available",
    Price: transformedAmazonProduct.price,
    Imgsrc: productData.product_photo || (productData as any).image || "",
    Asin: productData.asin || "",
    Currency: transformedAmazonProduct.currency,
    originalPrice: transformedAmazonProduct.originalPrice,
    StarRating: productData.product_star_rating?.toString() || (productData as any).rating?.toString() || "0",
    BestSeller: productData.is_best_seller || false,
    AmazonChoice: productData.is_amazon_choice || false,
    SalesVolume: transformedAmazonProduct.salesVolume?.toLocaleString() || "0",
    ratingCount: productData.product_num_ratings || (productData as any).reviews || 0,
    IsPrime: productData.is_prime || false,
    IsClimateFriendly: productData.climate_pledge_friendly || false,
    productOffers: productData.product_num_offers || 0,
    deliveryPrice: amazonProduct.offer?.delivery_price || "N/A",
    productNumRatings: productData.product_num_ratings || 0,
    sellerName: amazonProduct.offer?.seller || "N/A",
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
