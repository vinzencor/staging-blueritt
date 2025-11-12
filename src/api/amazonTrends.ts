/**
 * Amazon Trends API functions for Social Pulse module
 * Integrates with all Amazon API endpoints with caching and trending functionality
 */

import api from "./index";

// Types for Amazon Trends API responses
export interface AmazonTrendingProduct {
  asin: string;
  product_title: string;
  product_price?: string;
  product_star_rating?: string;
  product_num_ratings?: number;
  product_url: string;
  product_photo?: string;
  is_prime: boolean;
  is_amazon_choice: boolean;
  is_best_seller: boolean;
  trending_score: number;
  search_count: number;
  brand?: string;
  category?: string;
  category_path?: string;
  climate_pledge_friendly?: boolean;
  source: 'trending' | 'api';
  last_searched?: string;
}

export interface AmazonTrendsSearchResponse {
  status: string;
  data: {
    products: AmazonTrendingProduct[];
    total: number;
    trending_count: number;
    api_count: number;
    query: string;
    country: string;
    page: number;
  };
  remaining_quota?: number;
}

export interface AmazonTrendingResponse {
  data: {
    products: AmazonTrendingProduct[];
    total: number;
    trending_count?: number;
    api_count?: number;
    page?: number;
    country?: string;
  };
  remaining_quota?: number;
  cache_hit?: boolean;  // ✅ Indicates if data was loaded from 7-day cache (no quota deduction)
}

export interface AmazonBestSeller {
  rank: number;
  asin: string;
  product_title: string;
  product_price: string;
  product_star_rating: string;
  product_num_ratings: number;
  product_url: string;
  product_photo: string;
  rank_change_label?: string;
}

export interface AmazonBestSellersResponse {
  data: {
    best_sellers: AmazonBestSeller[];
    total: number;
    page?: number;
    country?: string;
  };
  remaining_quota?: number;
}

export interface AmazonDeal {
  deal_id: string;
  deal_type: string;
  deal_title: string;
  deal_photo: string;
  deal_state: string;
  deal_url: string;
  deal_price: {
    amount: string;
    currency: string;
  };
  list_price: {
    amount: string;
    currency: string;
  };
  savings_percentage: number;
  deal_badge: string;
  product_asin: string;
}

export interface AmazonDealsResponse {
  data: {
    deals: AmazonDeal[];
    total: number;
    country?: string;
  };
  remaining_quota?: number;
}

// Amazon Trends Search API
// ✅ FIXED: Uses /products/amazon-trends/search/ endpoint with separate amazon_trends_search quota
export const amazonTrendsSearch = async ({
  query,
  country = 'US',
  page = 1,
  sort_by = 'RELEVANCE',
  product_condition = 'ALL',
  is_prime = false,
  deals_and_discounts = 'NONE',
  min_price,
  max_price,
  brand,
  category_id,
  category,
  seller_id,
  four_stars_and_up,
  language,
}: {
  query: string;
  country?: string;
  page?: number;
  sort_by?: string;
  product_condition?: string;
  is_prime?: boolean;
  deals_and_discounts?: string;
  min_price?: number;
  max_price?: number;
  brand?: string;
  category_id?: string;
  category?: string;
  seller_id?: string;
  four_stars_and_up?: boolean;
  language?: string;
}): Promise<AmazonTrendsSearchResponse> => {
  const params: any = {
    query,
    country,
    page,
    sort_by,
    product_condition,
    is_prime,
    deals_and_discounts,
  };

  // Add optional parameters only if they have values
  if (min_price && min_price > 0) params.min_price = min_price;
  if (max_price && max_price > 0) params.max_price = max_price;
  if (brand && brand.trim()) params.brand = brand.trim();
  if (category_id && category_id.trim()) params.category_id = category_id.trim();
  if (category && category.trim()) params.category = category.trim();
  if (seller_id && seller_id.trim()) params.seller_id = seller_id.trim();
  if (four_stars_and_up !== undefined) params.four_stars_and_up = four_stars_and_up;
  if (language && language.trim()) params.language = language.trim();

  // ✅ Use separate amazon-trends/search/ endpoint with separate quota
  const response = await api.get('/products/amazon-trends/search/', {
    params,
  });
  return response.data;
};

// Get Trending Products (without search)
export const getTrendingProducts = async ({
  country = 'US',
  limit = 20,
  category = '',
  page = 1,
}: {
  country?: string;
  limit?: number;
  category?: string;
  page?: number;
} = {}): Promise<AmazonTrendingResponse> => {
  const response = await api.get('/products/amazon-trends/trending/', {
    params: {
      country,
      limit,
      category,
      page,
    },
  });
  console.log('📊 getTrendingProducts response:', response.data);
  return response.data;
};

// Amazon Best Sellers with Trending (Enhanced)
export const getAmazonTrendsBestSellers = async ({
  category = '',
  type = 'BEST_SELLERS',
  country = 'US',
  page = 1,
  language,
}: {
  category?: string;
  type?: string;
  country?: string;
  page?: number;
  language?: string;
} = {}): Promise<AmazonBestSellersResponse> => {
  const params: any = {
    type,
    country,
    page,
  };

  // Only add category if it's provided and not empty
  if (category && category.trim()) {
    params.category = category.trim();
  }

  // Add language if provided
  if (language && language.trim()) {
    params.language = language.trim();
  }

  const response = await api.get('/products/amazon-trends/best-sellers/', {
    params,
  });
  console.log('📊 getAmazonTrendsBestSellers response:', response.data);
  return response.data;
};

// Legacy Amazon Best Sellers (for backward compatibility)
export const getAmazonBestSellers = getAmazonTrendsBestSellers;

// Amazon Deals
export const getAmazonDeals = async ({
  country = 'US',
  min_product_star_rating = 'ALL',
  price_range = 'ALL',
  discount_range = 'ALL',
}: {
  country?: string;
  min_product_star_rating?: string;
  price_range?: string;
  discount_range?: string;
} = {}): Promise<AmazonDealsResponse> => {
  const response = await api.get('/products/amazon-trends/deals/', {
    params: {
      country,
      min_product_star_rating,
      price_range,
      discount_range,
    },
  });
  console.log('📊 getAmazonDeals response:', response.data);
  return response.data;
};

// Amazon Products by Category with Trending
export const getAmazonTrendsProductsByCategory = async ({
  category_id = '281407',
  country = 'US',
  page = 1,
  sort_by = 'RELEVANCE',
  product_condition = 'ALL',
  is_prime = false,
  deals_and_discounts = 'NONE',
  min_price,
  max_price,
  brand,
  four_stars_and_up = false,
}: {
  category_id?: string;
  country?: string;
  page?: number;
  sort_by?: string;
  product_condition?: string;
  is_prime?: boolean;
  deals_and_discounts?: string;
  min_price?: number;
  max_price?: number;
  brand?: string;
  four_stars_and_up?: boolean;
} = {}): Promise<AmazonTrendingResponse> => {
  const params: any = {
    category_id,
    country,
    page,
    sort_by,
    product_condition,
    is_prime: is_prime.toString(),
    deals_and_discounts,
    four_stars_and_up: four_stars_and_up.toString(),
  };

  if (min_price && min_price > 0) params.min_price = min_price;
  if (max_price && max_price > 0) params.max_price = max_price;
  if (brand && brand.trim()) params.brand = brand.trim();

  const response = await api.get('/products/amazon-trends/products-by-category/', {
    params,
  });
  console.log('📊 getAmazonTrendsProductsByCategory response:', response.data);
  return response.data;
};

// Amazon Product Details with Trending
// ✅ Using the same endpoint as BlueRitt Explorer for consistency
export const getAmazonTrendsProductDetails = async ({
  asin,
  country = 'US',
  source,
}: {
  asin: string;
  country?: string;
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

// Amazon Product Reviews with Trending (Enhanced)
export const getAmazonTrendsProductReviews = async ({
  asin,
  country = 'US',
  page = 1,
  sort_by = 'TOP_REVIEWS',
  star_rating = 'ALL',
  verified_purchases_only = false,
  images_or_videos_only = false,
  current_format_only = false,
}: {
  asin: string;
  country?: string;
  page?: number;
  sort_by?: string;
  star_rating?: string;
  verified_purchases_only?: boolean;
  images_or_videos_only?: boolean;
  current_format_only?: boolean;
}) => {
  const response = await api.get('/products/amazon-trends/product-reviews/', {
    params: {
      asin,
      country,
      page,
      sort_by,
      star_rating,
      verified_purchases_only: verified_purchases_only.toString(),
      images_or_videos_only: images_or_videos_only.toString(),
      current_format_only: current_format_only.toString(),
    },
  });
  return response.data;
};

// Legacy Extended Product Reviews (for backward compatibility)
export const getAmazonProductReviewsExtended = getAmazonTrendsProductReviews;

// Amazon Product Offers with Trending (Enhanced)
export const getAmazonTrendsProductOffers = async ({
  asin,
  country = 'US',
  limit = 100,
  page = 1,
}: {
  asin: string;
  country?: string;
  limit?: number;
  page?: number;
}) => {
  const response = await api.get('/products/amazon-trends/product-offers/', {
    params: {
      asin,
      country,
      limit,
      page,
    },
  });
  return response.data;
};

// Legacy Product Offers (for backward compatibility)
export const getAmazonProductOffers = getAmazonTrendsProductOffers;

// Seller Profile
export const getAmazonSellerProfile = async ({
  seller_id,
  country = 'US',
}: {
  seller_id: string;
  country?: string;
}) => {
  const response = await api.get('/products/amazon-trends/seller-profile/', {
    params: {
      seller_id,
      country,
    },
  });
  return response.data;
};

// Influencer Profile
export const getAmazonInfluencerProfile = async ({
  influencer_name,
  country = 'US',
}: {
  influencer_name: string;
  country?: string;
}) => {
  const response = await api.get('/products/amazon-trends/influencer-profile/', {
    params: {
      influencer_name,
      country,
    },
  });
  return response.data;
};

// Amazon Category List
export interface AmazonCategory {
  id: string;
  name: string;
  url: string;
  parent_id?: string;
}

export const getAmazonCategoryList = async ({
  country = 'US',
}: {
  country?: string;
} = {}) => {
  const response = await api.get('/products/amazon-trends/category-list/', {
    params: {
      country,
    },
  });
  return response.data;
};

// Get Amazon category list via backend API
export const getAmazonCategoryListDirect = async ({
  country = 'US',
}: {
  country?: string;
} = {}) => {
  // ✅ Call backend endpoint instead of RapidAPI directly
  const response = await api.get('/products/amazon-trends/category-list/', {
    params: { country }
  });
  return response.data;
};

// Products by category - Uses backend API with quota deduction and 7-day caching
// ✅ Updated to use the correct endpoint: /products/products-by-category/
export const getAmazonProductsByCategoryDirect = async ({
  categoryId,
  country = 'US',
  page = 1,
  sortBy = 'RELEVANCE',
  productCondition = 'NEW',
  isPrime = false,
  dealsAndDiscounts = 'NONE',
  minPrice,
  maxPrice,
}: {
  categoryId: string;
  country?: string;
  page?: number;
  sortBy?: 'RELEVANCE' | 'LOWEST_PRICE' | 'HIGHEST_PRICE' | 'REVIEWS' | 'NEWEST' | 'BEST_SELLERS';
  productCondition?: 'ALL' | 'NEW' | 'USED' | 'RENEWED' | 'COLLECTIBLE';
  isPrime?: boolean;
  dealsAndDiscounts?: 'NONE' | 'ALL_DISCOUNTS' | 'TODAYS_DEALS';
  minPrice?: number;
  maxPrice?: number;
}): Promise<AmazonTrendingResponse> => {
  console.log('🔍 Amazon Products by Category API Call (via backend):', {
    endpoint: '/products/amazon-trends/products-by-category/',
    categoryId,
    country,
    page,
    sortBy,
    productCondition,
    isPrime,
    dealsAndDiscounts
  });

  const params: any = {
    category_id: categoryId,
    country,
    sort_by: sortBy,
    product_condition: productCondition,
    deals_and_discounts: dealsAndDiscounts,
    min_star_rating: 0,
    min_reviews: 0,
    max_star_rating: 5,
    max_reviews: 99999990,
    max: 99999990,
  };

  // Add optional price filters
  if (minPrice !== undefined) {
    params.min_price = minPrice;
  }
  if (maxPrice !== undefined) {
    params.max_price = maxPrice;
  }

  // ✅ FIXED: Use Amazon Trends endpoint with 7-day caching and cache_hit response
  const response = await api.get('/products/amazon-trends/products-by-category/', {
    params,
  });

  console.log('✅ Amazon Products by Category Response:', {
    categoryId,
    country,
    page,
    totalProducts: response.data?.data?.products?.length || 0,
    hasData: !!response.data?.data,
    cache_hit: response.data?.cache_hit,
    remaining_quota: response.data?.remaining_quota,
    fullResponse: response.data
  });

  return response.data;
};

// Utility functions for parsing Amazon data
export const parseAmazonPrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  const numericValue = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(numericValue) || 0;
};

export const formatTrendingScore = (score: number): string => {
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}K`;
  }
  return score.toFixed(1);
};

export const getTrendingBadge = (product: AmazonTrendingProduct): string => {
  if (product.is_best_seller) return 'Best Seller';
  if (product.is_amazon_choice) return "Amazon's Choice";
  if (product.is_prime) return 'Prime';
  if (product.trending_score > 100) return 'Trending';
  return '';
};

export const sortProductsByTrending = (products: AmazonTrendingProduct[]): AmazonTrendingProduct[] => {
  return products.sort((a, b) => {
    // Trending products first
    if (a.source === 'trending' && b.source !== 'trending') return -1;
    if (b.source === 'trending' && a.source !== 'trending') return 1;

    // Then by trending score
    if (a.trending_score !== b.trending_score) {
      return b.trending_score - a.trending_score;
    }

    // Then by search count
    return b.search_count - a.search_count;
  });
};

// Influencer types
export interface InfluencerProfile {
  influencer_name: string;
  followers?: number;
  engagement_rate?: number;
  bio?: string;
  profile_image?: string;
  verified?: boolean;
  follower_count?: string;
  following_count?: string;
  post_count?: string;
  [key: string]: any;
}

export interface InfluencerResponse {
  status: string;
  data?: InfluencerProfile;
  error?: string;
}

// Get influencer profile via backend API
export const getInfluencerProfile = async (influencerName: string, country: string = 'US'): Promise<InfluencerResponse> => {
  try {
    // ✅ Call backend endpoint instead of RapidAPI directly
    const response = await api.get('/products/amazon-trends/influencer-profile/', {
      params: {
        influencer_name: influencerName,
        country
      }
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching influencer ${influencerName}:`, error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Get all top influencers
export const getTopInfluencers = async (country: string = 'US'): Promise<InfluencerProfile[]> => {
  const influencerNames = [
    'kylerichards18',
    'paige_desorbo',
    'jdroberto',
    'kandionline',
    'makhondlovu',
    '_giagiudice',
    'madison.lecroy',
    'lalakent',
    'harryjowsey'
  ];

  try {
    const promises = influencerNames.map(name => getInfluencerProfile(name, country));
    const results = await Promise.all(promises);

    return results
      .filter(result => result.status === 'success' && result.data)
      .map(result => ({
        ...result.data,
        influencer_name: result.data?.influencer_name || ''
      }));
  } catch (error) {
    console.error('Error fetching influencers:', error);
    return [];
  }
};
