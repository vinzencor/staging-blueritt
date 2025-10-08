import { TAmazonProduct } from "@/types/product";
import api from ".";
const _mapQueryParams = ({
  searchString,
  category,
  categoryId,
  maxPrice,
  minPrice,
  maxStarRating,
  minStarRating,
  maxNumOfRating,
  minNumOfRating,
  isPrime,
  country,
  isAmazonChoice,
}: {
  searchString?: string;
  category?: string;
  categoryId?: string;
  maxPrice: number;
  minPrice: number;
  maxStarRating: number;
  minStarRating: number;
  maxNumOfRating: number;
  minNumOfRating: number;
  isPrime?: boolean;
  country: string;
  isAmazonChoice?: boolean;
}) => {
  let params: any = {
    sort_by: "RELEVANCE",
    country: "US",

    product_condition: "ALL",
    deals_and_discounts: "NONE",

    min_star_rating: 0,
    min_reviews: 0,

    max_star_rating: 5,
    max_reviews: 10000000,
  };
  if (categoryId) {
    params.category_id = categoryId;
  }
  if (searchString) {
    params.query = searchString;
  }
  if (maxPrice && maxPrice !== Infinity) {
    params.max = maxPrice;
  }
  if (minPrice) {
    params.min = minPrice;
  }
  if (country) {
    params.country = country;
  }
  if (maxNumOfRating) {
    params.max_reviews = maxNumOfRating;
  }
  if (minNumOfRating) {
    params.min_reviews = minNumOfRating;
  }
  if (maxStarRating) {
    params.max_star_rating = maxStarRating;
  }
  if (minStarRating) {
    params.min_star_rating = minStarRating;
  }
  if (isAmazonChoice !== undefined) {
    params.is_amazon_choice = isAmazonChoice;
  }
  if (isPrime !== undefined) {
    params.is_prime = isPrime;
  }
  if (category) {
    params.category = category;
  }

  if (categoryId) {
     params = {
      category_id: categoryId,
      sort_by: "RELEVANCE",
      country: country,
      product_condition: "NEW",
      deals_and_discounts: "NONE",
      min_star_rating: minStarRating,
      min_reviews: minNumOfRating,
      max_star_rating: maxStarRating,
      max_reviews: maxNumOfRating,
      is_amazon_choice: isAmazonChoice,
    };
  
    if (maxPrice && maxPrice !== Infinity) {
      params.max = maxPrice;
    }
    if (minPrice) {
      params.min = minPrice;
    }
    if (country) {
      params.country = country;
    }
    if (maxNumOfRating) {
      params.max_reviews = maxNumOfRating;
    }
    if (minNumOfRating) {
      params.min_reviews = minNumOfRating;
    }
    if (maxStarRating) {
      params.max_star_rating = maxStarRating;
    }
    if (minStarRating) {
      params.min_star_rating = minStarRating;
    }
    if (isAmazonChoice !== undefined) {
      params.is_amazon_choice = isAmazonChoice;
    }
    if (isPrime !== undefined) {
      params.is_prime = isPrime;
    }
    }

  return params;
};

const amazonProductSearch = ({
  searchString,
  maxPrice,
  minPrice,
  maxStarRating,
  minStarRating,
  maxNumOfRating,
  minNumOfRating,
  isPrime,
  country,
  category,
  isAmazonChoice,
}: {
  searchString: string;
  maxPrice: number;
  minPrice: number;
  maxStarRating: number;
  minStarRating: number;
  maxNumOfRating: number;
  minNumOfRating: number;
  isPrime?: boolean;
  country: string;
  category: string;
  isAmazonChoice?: boolean;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any = {
    query: searchString,

    sort_by: "RELEVANCE",
    country: "US",

    product_condition: "ALL",
    deals_and_discounts: "NONE",

    min_star_rating: 0,
    min_reviews: 0,

    max_star_rating: 5,
    max_reviews: 10000000,
  };
  if (maxPrice && maxPrice !== Infinity) {
    params.max = maxPrice;
  }
  if (minPrice) {
    params.min = minPrice;
  }
  if (country) {
    params.country = country;
  }
  if (maxNumOfRating) {
    params.max_reviews = maxNumOfRating;
  }
  if (minNumOfRating) {
    params.min_reviews = minNumOfRating;
  }
  if (maxStarRating) {
    params.max_star_rating = maxStarRating;
  }
  if (minStarRating) {
    params.min_star_rating = minStarRating;
  }
  if (category) {
    params.category = category;
  }
  if (isAmazonChoice !== undefined) {
    params.is_amazon_choice = isAmazonChoice;
  }
  if (isPrime !== undefined) {
    params.is_prime = isPrime;
  }
  return api.get("/products/amazon-search/", {
    params: params,
  });
};

const amazonProductSearchByCategory = ({
  categoryId,
  maxPrice,
  minPrice,
  maxStarRating,
  minStarRating,
  maxNumOfRating,
  minNumOfRating,
  isPrime,
  country,
  isAmazonChoice,
}: {
  categoryId: string;
  maxPrice: number;
  minPrice: number;
  maxStarRating: number;
  minStarRating: number;
  maxNumOfRating: number;
  minNumOfRating: number;
  isPrime?: boolean;
  country: string;
  isAmazonChoice?: boolean;
}) => {
  const params: any = {
    category_id: categoryId,
    sort_by: "RELEVANCE",
    country: country,
    product_condition: "NEW",
    deals_and_discounts: "NONE",
    min_star_rating: minStarRating,
    min_reviews: minNumOfRating,
    max_star_rating: maxStarRating,
    max_reviews: maxNumOfRating,
    is_amazon_choice: isAmazonChoice,
  };

  if (maxPrice && maxPrice !== Infinity) {
    params.max = maxPrice;
  }
  if (minPrice) {
    params.min = minPrice;
  }
  if (country) {
    params.country = country;
  }
  if (maxNumOfRating) {
    params.max_reviews = maxNumOfRating;
  }
  if (minNumOfRating) {
    params.min_reviews = minNumOfRating;
  }
  if (maxStarRating) {
    params.max_star_rating = maxStarRating;
  }
  if (minStarRating) {
    params.min_star_rating = minStarRating;
  }
  if (isAmazonChoice !== undefined) {
    params.is_amazon_choice = isAmazonChoice;
  }
  if (isPrime !== undefined) {
    params.is_prime = isPrime;
  }
  return api.get("/products/products-by-category/", {
    params: params,
  });
};

const getAmazonProductDetail = async ({
  asin,
  country,
  source,
}: {
  asin: string;
  country: string;
  source?: string;
}) => {
  const response = await api.get(
    `/products/amazon-product-detail/${asin}/?country=${country}${source ? '&search_type=' + source : ''}`
  );
  if (!response?.data?.data?.asin) {
    throw new Error("Product not found");
  }
  return response.data;
};

const getAmazonProductReviews = async ({
  asin,
  country,
  pageNumber,
}: {
  asin: string;
  country: string;
  pageNumber?: number;
}) => {
  const response = await api.get(
    `/products/amazon-product-reviews/${asin}/?country=${country}&page=${
      pageNumber || 1
    }`
  );
  return response.data;
};

const getAmazonSearchInsights = async ({
  searchString,
  maxPrice,
  minPrice,
  maxStarRating,
  minStarRating,
  maxNumOfRating,
  minNumOfRating,
  isPrime,
  country,
  category,
  isAmazonChoice,
  categoryId,
}: {
  searchString: string;
  maxPrice: number;
  minPrice: number;
  maxStarRating: number;
  minStarRating: number;
  maxNumOfRating: number;
  minNumOfRating: number;
  isPrime?: boolean;
  country: string;
  category: string;
  isAmazonChoice?: boolean;
  categoryId?: string;
}) => {
  const params = _mapQueryParams({
    searchString,
    maxPrice,
    minPrice,
    maxStarRating,
    minStarRating,
    maxNumOfRating,
    minNumOfRating,
    isPrime,
    country,
    category,
    isAmazonChoice,
    categoryId,
  });
  
  return api.get("/products/amazon-product-insights/", {
    params: params,
  });
};

const aliBabaProductMatcher = async ({
  asin,
  title,
  country,
}: {
  asin: string;
  title: string;
  country: string;
}) => {
  return api.get("/products/alibaba-search/", {
    params: {
      asin: asin,
      query: title,
      country: country,
    },
  });
};

const getAmazonCategories = () => {
  return api.get("/products/amazon-product-category/");
};
const getAmazonTopProducts = () => {
  return api.get("/products/amazon-top-products/");
};

const getAmazonCategoriesandSubcategories = (country: string = "US") => {
  return api.get(`/products/categories/?country=${country}`);
};

export type RegionCurrencyMap = {
  [key: string]: string;
};

const Currencies = {
  US: "$",
  CA: "$",
  AU: "$",
  MX: "$",
  BR: "R$",
  GB: "£",
  DE: "€",
  FR: "€",
  IT: "€",
  ES: "€",
  NL: "€",
  JP: "¥",
  CN: "¥",
  KR: "₩",
  SE: "kr",
  PL: "zł",
  TR: "TL",
  AE: "AED",
  IN: "₹",
};

const parsePrice = (
  price: string | null,
  searchCountry: string
): { value: number; currency: string } => {
  const regionCurrencies: RegionCurrencyMap = Currencies;

  const currencySymbol = regionCurrencies[searchCountry];

  if (currencySymbol) {
    // Remove currency symbol and any spaces
    const cleanedPrice = handleDifferentPriceFormats(price, currencySymbol);

    const value = parseFloat(cleanedPrice);

    return { value, currency: currencySymbol };
  }

  return { value: NaN, currency: "" };
};

const extractNumberFromSalesVolume = (volume: string): number => {
  if (!volume) return 0;

  const match = volume.match(/(\d+(\.\d+)?)([KM]?)/i);

  if (!match) return 0;

  let number = parseFloat(match[1]);
  const suffix = match[3]?.toUpperCase();
  if (suffix === "K") number *= 1000;
  else if (suffix === "M") number *= 1000000;

  return number;
};

const getProcessedProductData = (
  apiData: TAmazonProduct,
  searchCountry: string
) => {
  let parsedPrice = parsePrice(apiData.data.product_price, searchCountry);
  const parsedOriginalPrice = parsePrice(
    apiData.data.product_original_price || "$0",
    searchCountry
  );

  // If price parsing failed, try with fallback methods
  if (isNaN(parsedPrice.value)) {
    parsedPrice = parsePrice(apiData.offer?.product_price || "$0", searchCountry);
  }

  // Additional fallback for TikTok products or when country-specific parsing fails
  if (isNaN(parsedPrice.value) && apiData.data.product_price) {
    // Try to extract number directly from price string
    const priceMatch = apiData.data.product_price.match(/[\d,]+\.?\d*/);
    if (priceMatch) {
      const numericValue = parseFloat(priceMatch[0].replace(/,/g, ''));
      if (!isNaN(numericValue)) {
        parsedPrice = {
          value: numericValue,
          currency: apiData.data.product_price.replace(/[\d,.\s]/g, '') || '$'
        };
      }
    }
  }
  return {
    asin: apiData.data.asin,
    name: apiData.data.product_title,
    price: parsedPrice.value,
    originalPrice: parsedOriginalPrice.value,
    image: apiData.data.product_photo,
    rating: apiData.data.product_star_rating
      ? parseFloat(apiData.data.product_star_rating)
      : null,
    numRatings: apiData.data.product_num_ratings,
    availability: apiData.data.product_availability,
    currency: parsedPrice.currency,
    isBestSeller: apiData.data.is_best_seller || false,
    isAmazonChoice: apiData.data.is_amazon_choice || false,
    isPrime: apiData.data.is_prime || false,
    salesVolume: extractNumberFromSalesVolume(apiData.data.sales_volume),
    productOffers: apiData.data.product_num_offers,
    deliveryPrice: apiData.offer?.delivery_price || (apiData.data.free_shipping ? "Free Shipping" : "Standard Shipping"),
    productNumRatings: apiData.data.product_num_ratings,
    categoryPath: apiData.data.category_path?.[0]?.name,
    itemWeight: apiData.data.product_information?.["Item Weight"],
    dimensions: apiData.data.product_information?.["Product Dimensions"],
    delivery: apiData.data.delivery,
    bestSellerRank: apiData.data.product_information?.["Best Sellers Rank"],
    customerReviews: apiData.data.customers_say,
    IsClimateFriendly: apiData.data.climate_pledge_friendly || false,
    sellerName: apiData.offer?.seller || apiData.data.seller_name || "N/A",
    sellerId: apiData.offer?.seller_id || apiData.data.asin || "N/A",
    sellerRating: apiData.offer?.seller_star_rating
      ? parseFloat(apiData.offer.seller_star_rating)
      : apiData.data.product_star_rating
      ? parseFloat(apiData.data.product_star_rating)
      : null,
    sellerNumRatings: apiData.offer?.seller_star_rating_info
      ? parseInt(apiData.offer.seller_star_rating_info)
      : apiData.data.product_num_ratings || null,
    sellerCountry: apiData.data.seller_country || apiData.data.country || "N/A",
    sellerDeliveryTime: apiData.data.primary_delivery_time || "Standard Delivery",
    sellerShipsFrom: apiData.offer?.ships_from || apiData.data.seller_country || apiData.data.country || "N/A",
    sellerLink: apiData.offer?.seller_link || apiData.data.product_url || "N/A",
    productUrl: apiData.data?.product_url || "",
  };
};

const handleDifferentPriceFormats = (
  price: string | null,
  currencySymbol: string
): string => {
  if (!price) {
    return "";
  }
  let priceWithoutSymbol = price.replace(currencySymbol, "").trim();

    // Remove any non-breaking spaces
    priceWithoutSymbol = priceWithoutSymbol.replace(/\u00A0/g, " ");

    // Remove any spaces between digits (e.g., "20 000,50" -> "20000,50")
    priceWithoutSymbol = priceWithoutSymbol.replace(/(\d)\s+(\d)/g, "$1$2");

    // Detect decimal and thousand separators
    // If both ',' and '.' exist, decide which is decimal
    if (priceWithoutSymbol.includes(",") && priceWithoutSymbol.includes(".")) {
      // If last ',' is after last '.', ',' is decimal (e.g., "20.000,50")
      if (priceWithoutSymbol.lastIndexOf(",") > priceWithoutSymbol.lastIndexOf(".")) {
        // Remove all '.' (thousand sep), replace ',' with '.'
        priceWithoutSymbol = priceWithoutSymbol.replace(/\./g, "").replace(",", ".");
      } else {
        // US style: ',' is thousand, '.' is decimal, remove ','
        priceWithoutSymbol = priceWithoutSymbol.replace(/,/g, "");
      }
    } else if (priceWithoutSymbol.includes(",")) {
      // If only ',' exists, assume it's decimal if there are exactly 2 digits after it
      const parts = priceWithoutSymbol.split(",");
      if (parts.length === 2 && parts[1].length <= 2) {
        priceWithoutSymbol = priceWithoutSymbol.replace(",", ".");
      } else {
        // Otherwise, remove all ',' (thousand sep)
        priceWithoutSymbol = priceWithoutSymbol.replace(/,/g, "");
      }
    } else if (priceWithoutSymbol.includes(".")) {
      // If only '.' exists, check if it's decimal (2 digits after)
      const parts = priceWithoutSymbol.split(".");
      if (parts.length === 2 && parts[1].length <= 2) {
        // US style, do nothing
      } else {
        // Otherwise, remove all '.' (thousand sep)
        priceWithoutSymbol = priceWithoutSymbol.replace(/\./g, "");
      }
    }
    return priceWithoutSymbol;
}

export {
  amazonProductSearch,
  getAmazonProductDetail,
  getAmazonProductReviews,
  getAmazonSearchInsights,
  aliBabaProductMatcher,
  getAmazonCategories,
  getAmazonCategoriesandSubcategories,
  amazonProductSearchByCategory,
  getAmazonTopProducts,
  getProcessedProductData,
  parsePrice,
  extractNumberFromSalesVolume,
};

