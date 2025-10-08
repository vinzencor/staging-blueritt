import React from "react";
import { type TAmazonProduct } from "@/types/product";
import SpkbgCards from "@/@spk/uielements/spkbgcards";
import { getProcessedProductData } from "@/api/product";

type TAmazonCardProps = {
  amazonProduct: TAmazonProduct;
};

const AmazonCard: React.FC<TAmazonCardProps> = ({ amazonProduct }) => {
  // Transform amazonProduct data to match SpkbgCards props
  const transformedAmazonProduct = getProcessedProductData(amazonProduct, amazonProduct.parameters.country);
  const spkbgProps = {
    mode: "basic" as const,
    Title: amazonProduct.data.product_title,
    Price: transformedAmazonProduct.price,
    Imgsrc: amazonProduct.data.product_photo,
    Asin: amazonProduct.data.asin,
    Currency: transformedAmazonProduct.currency,
    originalPrice: transformedAmazonProduct.originalPrice,
    StarRating: amazonProduct.data.product_star_rating?.toString() || "0",
    BestSeller: amazonProduct.data.is_best_seller,
    AmazonChoice: amazonProduct.data.is_amazon_choice,
    SalesVolume: transformedAmazonProduct.salesVolume.toLocaleString(),
    ratingCount: amazonProduct.data.product_num_ratings,
    IsPrime: amazonProduct.data.is_prime,
    IsClimateFriendly: amazonProduct.data.climate_pledge_friendly,
    productOffers: amazonProduct.data.product_num_offers,
    deliveryPrice: amazonProduct.offer?.delivery_price,
    productNumRatings: amazonProduct.data.product_num_ratings,
    sellerName: amazonProduct.offer?.seller,
    sellerId: amazonProduct.offer?.seller_id,
    sellerRating: amazonProduct.offer?.seller_star_rating,
    sellerCountry: amazonProduct.data.country,
    sellerDeliveryTime: amazonProduct.offer?.delivery_time,
    itemWeight:
      amazonProduct.data.product_information?.["Item Weight"] || "N/A",
    sellerShipsFrom: amazonProduct.offer?.ships_from,
    buttonCheck: false,
    dimensions:
      amazonProduct.data.product_information?.[
        Object.keys(amazonProduct.data.product_information).find((key) =>
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
