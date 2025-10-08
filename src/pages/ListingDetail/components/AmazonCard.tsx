import SpkbgCards from "@/@spk/uielements/spkbgcards";
import { getProcessedProductData } from "@/api/product";
import { TAmazonProduct } from "@/types/product";

import type { TAlibabaProduct } from "@/types/product";

// Updated product type to match the API response you provided
type TProduct = {
  id: string;
  name: string;
  description: string;
  selling_price: string;
  gross_profit?: number;
  net_profit?: number;
  percentage_gross_profit?: number;
  percentage_net_profit?: number;
  created_at?: string;
  modified_at?: string;
  amazon_product?: any; // Changed to any to handle different structures
  alibaba_product?: TAlibabaProduct;
};

const AmazonCard: React.FC<{ amazonProduct: TAmazonProduct }> = ({
  amazonProduct,
}) => {
  const transformedAmazonProduct = getProcessedProductData(amazonProduct, amazonProduct.parameters.country);
  return (
    <SpkbgCards
      key={`amazon-${amazonProduct.data.asin}`}
      mode="basic"
      Title={amazonProduct.data.product_title || "No name available"}
      Price={transformedAmazonProduct.price || 0}
      Imgsrc={amazonProduct.data.product_photo || ""}
      Asin={amazonProduct.data.asin || ""}
      Currency={transformedAmazonProduct.currency || ""}
      StarRating={amazonProduct.data.product_star_rating.toString() || "0"}
      ratingCount={amazonProduct.data.product_num_ratings}
      BestSeller={amazonProduct.data.is_best_seller || false}
      AmazonChoice={amazonProduct.data.is_amazon_choice || false}
      SalesVolume={`${transformedAmazonProduct.salesVolume}`}
      IsPrime={amazonProduct.data.is_prime || false}
      IsClimateFriendly={amazonProduct.data.climate_pledge_friendly || false}
      productOffers={amazonProduct.data.product_num_offers}
      buttonCheck={false}
      Loading={false}
    />
  );
};

export default AmazonCard;
