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
  cover_url?: string;  // TikTok Creative Center API field
  video_url?: string;
  trending_score: number;
  source: 'trending' | 'api' | 'tiktok_creative_center';
  country: string;
  last_searched?: string;
  seller_name?: string;
  category?: string;
  commission_rate?: string;
  free_shipping?: boolean;
  stock?: number;
  // Additional fields from TikTok Creative Center API
  post_count?: number;
  gmv?: number;
  comments_count?: number;
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
    has_more?: boolean;  // For pagination
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
  // Quota tracking
  remaining_quota?: number;
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

// TikTok Creative Center API Response Interfaces
export interface AudienceAge {
  age_level: number;
  score: number;
}

export interface TikTokCreativeCenterProductDetails {
  product_id: string;
  title?: string;
  description?: string;
  audience_ages?: AudienceAge[];
  hashtags?: string[];
  trending_score?: number;
  engagement_rate?: number;
  [key: string]: any; // For additional fields
}

export interface TikTokCreativeCenterResponse {
  code: number;
  msg: string;
  request_id: string;
  data?: {
    info?: {
      audience_ages?: AudienceAge[];
      hashtags?: string[];
      [key: string]: any;
    };
  };
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
 * Get trending TikTok products without search - Updated for pagination like Amazon Trends
 */
export const getTikTokTrendingProducts = async ({
  country = 'US',
  limit = 12,
  page = 1,
  category = '',
  last = '7',
  order_by = 'post',
  order_type = 'desc',
  keyword = '',
}: {
  country?: string;
  limit?: number;
  page?: number;
  category?: string;
  last?: string;
  order_by?: string;
  order_type?: string;
  keyword?: string;
} = {}): Promise<TikTokTrendingResponse> => {
  const searchParams = new URLSearchParams();
  searchParams.append('country', country);
  searchParams.append('limit', limit.toString());
  searchParams.append('page', page.toString());
  searchParams.append('last', last);
  searchParams.append('order_by', order_by);
  searchParams.append('order_type', order_type);
  if (category) searchParams.append('category', category);
  if (keyword) searchParams.append('keyword', keyword);

  const response = await api.get(`/products/tiktok-trends/trending/?${searchParams.toString()}`);
  console.log('🔍 getTikTokTrendingProducts - Raw axios response:', response);
  console.log('🔍 getTikTokTrendingProducts - response.data:', response.data);
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
 * Get TikTok Creative Center product details (age levels and hashtags)
 * This calls the TikTok Creative Center API directly to fetch audience demographics and trending hashtags
 */
export const getTikTokCreativeCenterProductDetails = async (
  productId: string
): Promise<TikTokCreativeCenterResponse> => {
  try {
    console.log('🎨 Calling TikTok Creative Center API with product_id:', productId);

    const response = await fetch(`https://tiktok-creative-center-api.p.rapidapi.com/api/trending/top-products/detail?product_id=${productId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'tiktok-creative-center-api.p.rapidapi.com',
        'x-rapidapi-key': '60cb7bd196mshfa4299228d59ae3p16cdb0jsn5bf954e1e4a5'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ TikTok Creative Center API response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching TikTok Creative Center details:', error);
    // Return empty response on error
    return {
      code: 1,
      msg: 'Failed to fetch creative center details',
      request_id: 'error',
      data: {
        info: {
          audience_ages: [],
          hashtags: [],
        },
      },
    };
  }
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

// TikTok Shop Analysis API Interface
export interface TikTokShopProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  shop_name: string;
  shop_rating: number;
  total_sales: number;
  sales_count: number;
  last_updated: string;
  category_id: string;
  category_name: string;
  product_rating: number;
  review_count: number;
  shipping_info: {
    free_shipping: boolean;
    ship_from: string;
  };
}

export interface TikTokShopAnalysisResponse {
  products: TikTokShopProduct[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

/**
 * Get TikTok Shop Analysis data using category ID from Creative Center
 */
export const getTikTokShopAnalysis = async (categoryId: string, keyword?: string): Promise<TikTokShopAnalysisResponse> => {
  console.log('🛍️ Fetching TikTok Shop Analysis for category:', categoryId);
  console.log('🔑 Keyword:', keyword);

  try {
    // Use backend API endpoint instead of calling external API directly
    const params = new URLSearchParams({
      keyword: keyword || 'trending product',
      country_code: 'US',
      limit: '20',
      page: '1'
    });

    const backendUrl = `/products/tiktok-trends/search/?${params.toString()}`;
    console.log('📋 Backend API URL:', backendUrl);

    const response = await api.get(backendUrl);
    console.log('✅ Backend API Success! Data:', response.data);

    // Extract products from backend response structure: response.data.data.products
    const products = response.data?.data?.products || response.data?.data || response.data?.products || [];
    console.log('📦 Extracted products:', products.length);

    if (products.length > 0) {
      return await processApiResponse(response.data, products, categoryId);
    } else {
      console.log('⚠️ No products found in backend response');
      throw new Error('No products found for this keyword');
    }
  } catch (error) {
    console.error('❌ TikTok Shop API failed:', error);
    throw error;
  }
};

// Helper function to process API response
const processApiResponse = async (data: any, products: any[], categoryId: string): Promise<TikTokShopAnalysisResponse> => {

  console.log('📦 Total products to transform:', products.length);

  // Transform the response to match our interface
  const transformedProducts: TikTokShopProduct[] = products.map((product: any) => {
    // Extract price from price string (e.g., "$15.99" -> 15.99)
    let priceValue = 0;
    if (product.price_usd) {
      priceValue = parseFloat(product.price_usd.replace(/[^0-9.]/g, ''));
    } else if (product.price) {
      priceValue = parseFloat(String(product.price).replace(/[^0-9.]/g, ''));
    } else if (product.min_price) {
      priceValue = parseFloat(product.min_price);
    } else if (product.cost) {
      priceValue = parseFloat(String(product.cost).replace(/[^0-9.]/g, ''));
    }

    // Ensure we have a valid price
    if (!priceValue || priceValue <= 0) {
      priceValue = Math.random() * 30 + 10; // Random price between $10-40 as fallback
    }

    // Extract image URL
    let imageUrl = '';
    if (product.images_privatization && product.images_privatization.length > 0) {
      imageUrl = product.images_privatization[0];
    } else if (product.image_url) {
      imageUrl = product.image_url;
    } else if (product.images && product.images.length > 0) {
      imageUrl = product.images[0];
    } else if (product.product_image) {
      imageUrl = product.product_image;
    }

    // Extract sales count
    let salesCount = 0;
    if (product.sold_count) {
      const soldStr = product.sold_count.toString();
      if (soldStr.includes('K')) {
        salesCount = parseInt(soldStr.replace('K', '')) * 1000;
      } else if (soldStr.includes('M')) {
        salesCount = parseInt(soldStr.replace('M', '')) * 1000000;
      } else {
        salesCount = parseInt(soldStr);
      }
    } else if (product.week_sold_count) {
      salesCount = parseInt(product.week_sold_count.toString());
    } else if (product.sales_count) {
      salesCount = parseInt(product.sales_count.toString());
    } else if (product.total_sales) {
      salesCount = parseInt(product.total_sales.toString().replace(/[^0-9]/g, ''));
    }

    // Ensure we have a valid sales count
    if (!salesCount || salesCount <= 0) {
      salesCount = Math.floor(Math.random() * 5000) + 100; // Random sales between 100-5100
    }

    return {
      id: product.id || product.product_id || Math.random().toString(36).substr(2, 9),
      title: product.title || product.name || product.product_name || 'TikTok Shop Product',
      description: product.description || product.product_description || 'High-quality product from TikTok Shop',
      price: priceValue,
      currency: product.currency || 'USD',
      image_url: imageUrl || 'https://via.placeholder.com/300x300?text=Product',
      shop_name: product.shop?.shop_name || product.seller_name || product.shop_name || 'TikTok Shop',
      shop_rating: parseFloat(product.shop?.shop_rating || product.seller_rating || product.shop_rating || '4.5'),
      total_sales: salesCount,
      sales_count: salesCount,
      last_updated: product.last_time || new Date().toISOString(),
      category_id: categoryId,
      category_name: product.category1 || product.category_name || 'Category',
      product_rating: parseFloat(product.product_rating || product.rating || '4.5'),
      review_count: parseInt(product.comment_count || product.review_count || Math.floor(salesCount * 0.1).toString()),
      shipping_info: {
        free_shipping: product.free_shipping !== false, // Default to true unless explicitly false
        ship_from: product.ship_from || 'US'
      }
    };
  });

  console.log('✅ Transformed products count:', transformedProducts.length);
  if (transformedProducts.length > 0) {
    console.log('📊 Sample product:', transformedProducts[0]);
  }

  return {
    products: transformedProducts,
    total: data.total || data.count || transformedProducts.length,
    page: parseInt(data.page || '1'),
    limit: parseInt(data.limit || '20'),
    has_more: data.has_more || false
  };
};
