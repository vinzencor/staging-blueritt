import SpkbgCards from "@/@spk/uielements/spkbgcards";
import { getProcessedProductData } from "@/api/product";
import { TAmazonProduct } from "@/types/product";

const AmazonCard: React.FC<{ amazonProduct: TAmazonProduct }> = ({
  amazonProduct,
}) => {
  // 🔍 Console log to debug the structure
  console.log('🔍 AmazonCard - amazonProduct structure:', {
    amazonProduct,
    hasParameters: !!amazonProduct.parameters,
    parameters: amazonProduct.parameters,
    hasData: !!amazonProduct.data,
    data: amazonProduct.data,
  });

  // ✅ Handle both old saved format (fields on root) and new format (fields in data)
  // Check if data exists, otherwise use root level fields
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

  const transformedAmazonProduct = getProcessedProductData(normalizedProduct as TAmazonProduct, country);

  return (
    <SpkbgCards
      key={`amazon-${productData.asin || 'unknown'}`}
      mode="basic"
      Title={productData.product_title || (productData as any).title || "No name available"}
      Price={transformedAmazonProduct.price || 0}
      Imgsrc={productData.product_photo || (productData as any).image || ""}
      Asin={productData.asin || ""}
      Currency={transformedAmazonProduct.currency || productData.currency || ""}
      StarRating={productData.product_star_rating?.toString() || (productData as any).rating?.toString() || "0"}
      ratingCount={productData.product_num_ratings || (productData as any).reviews || 0}
      BestSeller={productData.is_best_seller || false}
      AmazonChoice={productData.is_amazon_choice || false}
      SalesVolume={`${transformedAmazonProduct.salesVolume || 0}`}
      IsPrime={productData.is_prime || false}
      IsClimateFriendly={productData.climate_pledge_friendly || false}
      productOffers={productData.product_num_offers || 0}
      buttonCheck={false}
      Loading={false}
    />
  );
};

export default AmazonCard;
