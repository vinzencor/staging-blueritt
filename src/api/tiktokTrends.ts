/**
 * TikTok Shop Analysis API Functions
 * Implements the exact same flow as MarginMax with TikTok integration
 */

import api from './index';

// TikTok Product Interfaces
export interface TikTokTrendingProduct {
  id: string;
  title: string;
  description?: string;
  price: string;
  rating?: number;
  review_count: number;
  sales_count: number;
  likes_count: number;
  shares_count: number;
  views_count: number;
  image_url?: string;
  video_url?: string;
  trending_score: number;
  source: 'trending' | 'api';
  country: string;
  last_searched?: string;
  seller_name?: string;
  category?: string;
  commission_rate?: string;
  free_shipping?: boolean;
  stock?: number;
}

export interface TikTokSearchResponse {
  data: {
    products: TikTokTrendingProduct[];
    total: number;
    trending_count: number;
    api_count: number;
    page: number;
    limit: number;
    message: string;
  };
  remaining_quota: number;
  query: string;
  country: string;
}

export interface TikTokProductTrends {
  product_id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  currency_symbol: string;
  min_price: number;
  max_price: number;
  commission_rate: number;
  sold_count: string;
  earn_amount_usd: string;
  rating: number;
  review_count: number;
  category1: string;
  category2: string;
  category3: string;
  seller_name: string;
  seller_id: string;
  seller_avatar: string;
  product_url: string;
  country: string;
  free_shipping: boolean;
  biz_type: boolean;
  images: string[];
  detail_images: string[];
  skus: any[];
  overview: string;
  start_date: string;
  end_date: string;
  trends_period: string;
}

export interface TikTokProductTrendsResponse {
  data: TikTokProductTrends;
  remaining_quota: number;
}

export interface TikTokTrendingResponse {
  data: {
    products: TikTokTrendingProduct[];
    total: number;
    trending_count: number;
    api_count: number;
    page: number;
    limit: number;
    message: string;
  };
  country: string;
  remaining_quota: number;
}

// Supplier interfaces (reuse from Amazon)
export interface SupplierInfo {
  id: string;
  name: string;
  supplier_name?: string; // Backend compatibility
  location: string;
  verification_status: string;
  verification_badge: string;
  years_in_business: number;
  main_products: string | string[];
  certifications: string[];
  contact_method: string;
  ai_match_score: number;
  match_explanation: string;
  moq: number;
  min_order_quantity?: string; // Backend compatibility
  lead_time: string;
  estimated_price: string;
  contact_url: string;
  response_rate: string;
  trade_assurance: boolean;
  verified_supplier?: boolean; // Backend compatibility
  rating?: number; // Backend compatibility
  total_transactions?: number; // Backend compatibility
  // Additional optional properties
  price_per_unit?: string;
  minimum_order?: number;
}

export interface SupplierDiscoveryResponse {
  status: string;
  analysis_time: number;
  product_info: {
    title: string;
    category: string;
    id: string;
    price: string;
  };
  suppliers: SupplierInfo[];
  total_suppliers: number;
  analysis_summary: {
    criteria_analyzed: string[];
    top_match_score: number;
  };
  // Backend compatibility - some responses wrap data in a data property
  data?: {
    suppliers: SupplierInfo[];
    analysis_time: number;
  };
}

export interface TikTokProductDetails {
  id: string;
  title: string;
  description?: string;
  price: string;
  rating?: number;
  review_count: number;
  sales_count: number;
  category?: string;
  brand?: string;
  image_url?: string;
  video_url?: string;
  [key: string]: any; // For additional API fields
}

export interface TikTokSalesData {
  product_id: string;
  sales_data: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
  total_sales: number;
  total_revenue: number;
  period: string;
}

export interface TikTokTrendsData {
  product_id: string;
  trends_data: Array<{
    date: string;
    views: number;
    likes: number;
    shares: number;
    engagement_rate: number;
  }>;
  period: string;
}

export interface TikTokCategory {
  id: string;
  name: string;
  parent_id?: string;
}

export interface TikTokCountry {
  code: string;
  name: string;
  currency: string;
}

// Search Parameters
export interface TikTokSearchParams {
  keyword: string;
  country_code?: string;
  limit?: number;
  page?: number;
  start_product_rating?: number;
  end_product_rating?: number;
  category_id1?: string;
  category1?: string;
  shop_key_word?: string;
  ship_from?: string;
  free_shipping?: boolean;
}

// API Functions

/**
 * Search TikTok products - Main search function like MarginMax (GET method)
 */
export const searchTikTokProducts = async (params: TikTokSearchParams): Promise<TikTokSearchResponse> => {
  const searchParams = new URLSearchParams();

  searchParams.append('keyword', params.keyword);
  if (params.country_code) searchParams.append('country_code', params.country_code);
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.start_product_rating !== undefined) {
    searchParams.append('start_product_rating', params.start_product_rating.toString());
  }
  if (params.end_product_rating !== undefined) {
    searchParams.append('end_product_rating', params.end_product_rating.toString());
  }
  if (params.category_id1) searchParams.append('category_id1', params.category_id1);
  if (params.category1) searchParams.append('category1', params.category1);
  if (params.shop_key_word) searchParams.append('shop_key_word', params.shop_key_word);
  if (params.ship_from) searchParams.append('ship_from', params.ship_from);
  if (params.free_shipping !== undefined) {
    searchParams.append('free_shipping', params.free_shipping.toString());
  }

  const response = await api.get(`/products/tiktok-trends/search/?${searchParams.toString()}`);
  return response.data;
};

/**
 * Search TikTok products using POST method - Alternative search method
 */
export const searchTikTokProductsPost = async (params: {
  keyword: string;
  country_code?: string;
  page?: number;
  limit?: number;
  categoryId?: number;
  shop_key_word?: string;
  ship_from?: string;
  free_shipping?: boolean;
  start_product_rating?: number;
  end_product_rating?: number;
  category_id1?: number;
  category1?: string;
  product_status?: boolean;
}): Promise<TikTokSearchResponse> => {
  const requestData = {
    page: params.page || 1,
    limit: params.limit || 10,
    country_code: params.country_code || '',
    categoryId: params.categoryId || 0,
    shop_key_word: params.shop_key_word || '',
    ship_from: params.ship_from || '',
    free_shipping: params.free_shipping || false,
    start_product_rating: params.start_product_rating || 0,
    end_product_rating: params.end_product_rating || 5,
    keyword: params.keyword,
    category_id1: params.category_id1 || 0,
    category1: params.category1 || '',
    product_status: params.product_status || false,
  };

  const response = await api.post('/products/tiktok-trends/search-post/', requestData);
  return response.data;
};

/**
 * Get trending TikTok products without search - Updated for pagination like Amazon Trends
 */
export const getTikTokTrendingProducts = async ({
  country = 'US',
  limit = 20,
  page = 1,
  category = '',
}: {
  country?: string;
  limit?: number;
  page?: number;
  category?: string;
} = {}): Promise<TikTokTrendingResponse> => {
  const searchParams = new URLSearchParams();
  searchParams.append('country', country);
  searchParams.append('limit', limit.toString());
  searchParams.append('page', page.toString());
  if (category) searchParams.append('category', category);

  const response = await api.get(`/products/tiktok-trends/trending/?${searchParams.toString()}`);
  return response.data;
};

/**
 * Get detailed information about a specific TikTok product
 */
export const getTikTokProductDetails = async (productId: string): Promise<{
  data: TikTokProductDetails;
  remaining_quota: number;
}> => {
  const response = await api.get(`/products/tiktok-trends/product-details/${productId}/`);
  return response.data;
};

/**
 * Get product trends data for a specific TikTok product using TikTok Shop Analysis API
 */
export const getTikTokProductTrends = async (
  productId: string,
  startDate?: string,
  endDate?: string
): Promise<TikTokProductTrendsResponse> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString();
  const url = `/products/tiktok-trends/product-trends/${productId}/${queryString ? `?${queryString}` : ''}`;

  const response = await api.get(url);
  return response.data;
};

/**
 * Get sales data for a specific TikTok product
 */
export const getTikTokSalesData = async (
  productId: string,
  startDate: string,
  endDate: string
): Promise<{
  data: TikTokSalesData;
  remaining_quota: number;
  period: string;
}> => {
  const response = await api.get(
    `/products/tiktok-trends/sales-data/${productId}/?startDate=${startDate}&endDate=${endDate}`
  );
  return response.data;
};

/**
 * Get trends data for a specific TikTok product
 */
export const getTikTokTrendsData = async (
  productId: string,
  startDate: string,
  endDate: string
): Promise<{
  data: TikTokTrendsData;
  remaining_quota: number;
  period: string;
}> => {
  const response = await api.get(
    `/products/tiktok-trends/trends-data/${productId}/?startDate=${startDate}&endDate=${endDate}`
  );
  return response.data;
};

/**
 * Get available TikTok categories
 */
export const getTikTokCategories = async (): Promise<{
  data: TikTokCategory[];
  remaining_quota: number;
}> => {
  const response = await api.get('/products/tiktok-trends/categories/');
  return response.data;
};

/**
 * Get available TikTok countries
 */
export const getTikTokCountries = async (): Promise<{
  data: TikTokCountry[];
  remaining_quota: number;
}> => {
  const response = await api.get('/products/tiktok-trends/countries/');
  return response.data;
};

// Utility Functions

/**
 * Format number for display (1000 -> 1K, 1000000 -> 1M)
 */
export const formatNumber = (num: number | undefined | null): string => {
  // Handle undefined, null, or invalid numbers
  if (num === undefined || num === null || isNaN(num)) {
    return '0';
  }

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format price string
 */
export const formatPrice = (price: string | number): string => {
  if (typeof price === 'number') {
    return `$${price.toFixed(2)}`;
  }
  if (typeof price === 'string') {
    // If already formatted, return as is
    if (price.includes('$')) return price;
    // Try to parse and format
    const numPrice = parseFloat(price);
    if (!isNaN(numPrice)) {
      return `$${numPrice.toFixed(2)}`;
    }
  }
  return price?.toString() || 'N/A';
};

/**
 * Calculate engagement rate
 */
export const calculateEngagementRate = (
  likes: number,
  comments: number,
  shares: number,
  views: number
): number => {
  if (views === 0) return 0;
  return ((likes + comments + shares) / views) * 100;
};

/**
 * Format trending score for display
 */
export const formatTrendingScore = (score: number): string => {
  return score.toFixed(1);
};

/**
 * Sort products by trending score
 */
export const sortProductsByTrending = (products: TikTokTrendingProduct[]): TikTokTrendingProduct[] => {
  return [...products].sort((a, b) => b.trending_score - a.trending_score);
};

/**
 * Sort products by engagement (likes + shares + views)
 */
export const sortProductsByEngagement = (products: TikTokTrendingProduct[]): TikTokTrendingProduct[] => {
  return [...products].sort((a, b) => {
    const engagementA = a.likes_count + a.shares_count + a.views_count;
    const engagementB = b.likes_count + b.shares_count + b.views_count;
    return engagementB - engagementA;
  });
};

/**
 * Sort products by sales count
 */
export const sortProductsBySales = (products: TikTokTrendingProduct[]): TikTokTrendingProduct[] => {
  return [...products].sort((a, b) => b.sales_count - a.sales_count);
};

// Supplier Discovery for TikTok Products
export const discoverSuppliers = async (productData: {
  title: string;
  category?: string;
  id?: string;
  price?: string;
}): Promise<SupplierDiscoveryResponse> => {
  const response = await api.post('/products/suppliers/discover/', productData);
  return response.data;
};

/**
 * Filter products by price range
 */
export const filterProductsByPrice = (
  products: TikTokTrendingProduct[],
  minPrice: number,
  maxPrice: number
): TikTokTrendingProduct[] => {
  return products.filter(product => {
    const price = parseFloat(product.price.replace('$', '').replace(',', ''));
    return !isNaN(price) && price >= minPrice && price <= maxPrice;
  });
};

/**
 * Filter products by rating
 */
export const filterProductsByRating = (
  products: TikTokTrendingProduct[],
  minRating: number
): TikTokTrendingProduct[] => {
  return products.filter(product => (product.rating || 0) >= minRating);
};

/**
 * Get unique hashtags from products (for TikTok-specific functionality)
 */
export const getUniqueHashtags = (products: TikTokTrendingProduct[]): string[] => {
  const hashtags = new Set<string>();
  products.forEach(product => {
    // Extract hashtags from description if available
    if (product.description) {
      const matches = product.description.match(/#\w+/g);
      if (matches) {
        matches.forEach(tag => hashtags.add(tag));
      }
    }
  });
  return Array.from(hashtags);
};
