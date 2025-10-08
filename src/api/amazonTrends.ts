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

// Amazon Trends Search API
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
} = {}) => {
  const response = await api.get('/products/amazon-trends/trending/', {
    params: {
      country,
      limit,
      category,
      page,
    },
  });
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
} = {}) => {
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
} = {}) => {
  const response = await api.get('/products/amazon-trends/deals/', {
    params: {
      country,
      min_product_star_rating,
      price_range,
      discount_range,
    },
  });
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
} = {}) => {
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
  return response.data;
};

// Amazon Product Details with Trending
export const getAmazonTrendsProductDetails = async ({
  asin,
  country = 'US',
}: {
  asin: string;
  country?: string;
}) => {
  const response = await api.get('/products/amazon-trends/product-details/', {
    params: {
      asin,
      country,
    },
  });
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

// Direct Amazon API call for category list
export const getAmazonCategoryListDirect = async ({
  country = 'US',
}: {
  country?: string;
} = {}) => {
  const response = await fetch(`https://real-time-amazon-data.p.rapidapi.com/product-category-list?country=${country}`, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
      'x-rapidapi-key': '60cb7bd196mshfa4299228d59ae3p16cdb0jsn5bf954e1e4a5'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

// Direct Amazon API call for products by category
export const getAmazonProductsByCategoryDirect = async ({
  categoryId,
  country = 'US',
  page = 1,
  sortBy = 'RELEVANCE',
  productCondition = 'ALL',
  isPrime = false,
  dealsAndDiscounts = 'NONE',
}: {
  categoryId: string;
  country?: string;
  page?: number;
  sortBy?: 'RELEVANCE' | 'LOWEST_PRICE' | 'HIGHEST_PRICE' | 'REVIEWS' | 'NEWEST' | 'BEST_SELLERS';
  productCondition?: 'ALL' | 'NEW' | 'USED' | 'RENEWED' | 'COLLECTIBLE';
  isPrime?: boolean;
  dealsAndDiscounts?: 'NONE' | 'ALL_DISCOUNTS' | 'TODAYS_DEALS';
}) => {
  // Build the URL with all required parameters
  const params = new URLSearchParams({
    category_id: categoryId,
    page: page.toString(),
    country: country,
    sort_by: sortBy,
    product_condition: productCondition,
    is_prime: isPrime.toString(),
    deals_and_discounts: dealsAndDiscounts,
  });

  const url = `https://real-time-amazon-data.p.rapidapi.com/products-by-category?${params.toString()}`;

  console.log('🔍 Amazon Products by Category API Call:', {
    url,
    categoryId,
    country,
    page,
    sortBy,
    productCondition,
    isPrime,
    dealsAndDiscounts
  });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
      'x-rapidapi-key': '60cb7bd196mshfa4299228d59ae3p16cdb0jsn5bf954e1e4a5'
    }
  });

  if (!response.ok) {
    console.error('❌ Amazon Products by Category API Error:', {
      status: response.status,
      statusText: response.statusText,
      url
    });
    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();

  console.log('✅ Amazon Products by Category API Response:', {
    categoryId,
    country,
    page,
    totalProducts: data?.data?.products?.length || 0,
    hasData: !!data?.data,
    dataStructure: {
      hasData: !!data?.data,
      hasProducts: !!data?.data?.products,
      productsIsArray: Array.isArray(data?.data?.products),
      productsLength: data?.data?.products?.length || 0,
      firstProduct: data?.data?.products?.[0] ? {
        asin: data.data.products[0].asin,
        title: data.data.products[0].product_title?.substring(0, 50) + '...',
        hasImage: !!data.data.products[0].product_photo
      } : null
    }
  });

  return data;
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
