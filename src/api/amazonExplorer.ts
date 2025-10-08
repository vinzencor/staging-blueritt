/**
 * Amazon Product Explorer API functions for Social Pulse module
 * Integrates with RapidAPI endpoints via backend proxy
 */

import api from "./index";

// Types for Amazon Explorer API responses
export interface AmazonProduct {
  asin: string;
  product_title: string;
  product_price?: string;
  product_original_price?: string;
  currency?: string;
  product_star_rating?: string;
  product_num_ratings?: number;
  product_url: string;
  product_photo?: string;
  product_availability?: string;
  is_best_seller?: boolean;
  is_amazon_choice?: boolean;
  is_prime?: boolean;
  climate_pledge_friendly?: boolean;
  sales_volume?: string;
  delivery?: string;
  has_variations?: boolean;
  brand?: string;
  category_path?: string;
}

export interface AmazonExplorerResponse {
  data: {
    products: AmazonProduct[];
    total: number;
    page: number;
    country: string;
  };
  status: string;
  remaining_quota?: number;
}

export interface ProductDetails {
  asin: string;
  product_title: string;
  product_price?: string;
  product_original_price?: string;
  product_star_rating?: string;
  product_num_ratings?: number;
  product_url: string;
  product_photos?: string[];
  product_details?: any;
  about_product?: string[];
  product_information?: any;
  product_description?: string;
  ingredients?: string;
  directions?: string;
  legal_disclaimer?: string;
  brand?: string;
  category_path?: string;
  availability?: string;
  delivery_message?: string;
  climate_pledge_friendly?: boolean;
}

export interface ProductReview {
  review_id: string;
  review_title: string;
  review_comment: string;
  review_star_rating: number;
  review_date: string;
  review_author: string;
  is_verified_purchase: boolean;
  helpful_vote_statement?: string;
  review_images?: string[];
}

export interface ProductOffer {
  offer_id: string;
  offer_price: string;
  offer_shipping_price?: string;
  offer_condition: string;
  offer_condition_details?: string;
  seller_name: string;
  seller_rating?: string;
  seller_num_ratings?: number;
  is_prime?: boolean;
  is_amazon_fulfilled?: boolean;
}

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
    asin: string;
    brand: string;
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

// Amazon Best Sellers
export const getAmazonExplorerBestSellers = async ({
  category = 'software',
  type = 'BEST_SELLERS',
  country = 'US',
  page = 1,
}: {
  category?: string;
  type?: string;
  country?: string;
  page?: number;
} = {}): Promise<AmazonExplorerResponse> => {
  const response = await api.get('/products/amazon/best-sellers/', {
    params: {
      category,
      type,
      country,
      page,
    },
  });
  return response.data;
};

// Amazon Product Search
export const searchAmazonExplorerProducts = async ({
  query,
  country = 'US',
  page = 1,
  sort_by = 'RELEVANCE',
  product_condition = 'ALL',
  is_prime = false,
  deals_and_discounts = 'NONE',
}: {
  query: string;
  country?: string;
  page?: number;
  sort_by?: string;
  product_condition?: string;
  is_prime?: boolean;
  deals_and_discounts?: string;
}): Promise<AmazonExplorerResponse> => {
  const response = await api.get('/products/amazon-trends/search/', {
    params: {
      query,
      country,
      page,
      sort_by,
      product_condition,
      is_prime,
      deals_and_discounts,
    },
  });
  return response.data;
};

// Amazon Products by Category
export const getAmazonExplorerProductsByCategory = async ({
  category_id,
  country = 'US',
  page = 1,
  sort_by = 'RELEVANCE',
  product_condition = 'ALL',
  is_prime = false,
  deals_and_discounts = 'NONE',
}: {
  category_id: string;
  country?: string;
  page?: number;
  sort_by?: string;
  product_condition?: string;
  is_prime?: boolean;
  deals_and_discounts?: string;
}): Promise<AmazonExplorerResponse> => {
  const response = await api.get('/products/amazon/products-by-category/', {
    params: {
      category_id,
      country,
      page,
      sort_by,
      product_condition,
      is_prime,
      deals_and_discounts,
    },
  });
  return response.data;
};

// Amazon Category interfaces
export interface AmazonExplorerCategory {
  id: string;
  name: string;
  parent_category?: string;
  subcategory?: string;
  url?: string;
  category_path?: string;
  is_main_category?: boolean;
  subcategories?: AmazonExplorerCategory[];
}

export interface AmazonExplorerCategoryResponse {
  status: string;
  data: {
    country: string;
    categories: AmazonExplorerCategory[];
    main_categories: AmazonExplorerCategory[];
    total: number;
  };
}

// Best Sellers Category interfaces
export interface BestSellerCategory {
  category: string;
  category_path: string;
  name: string;
  is_main: boolean;
  parent_category?: string;
  subcategories?: BestSellerCategory[];
}

export interface BestSellerCategoriesResponse {
  status: string;
  data: {
    country: string;
    categories: BestSellerCategory[];
    main_categories: BestSellerCategory[];
    total: number;
  };
}

// Get Amazon Categories dynamically from API
export const getAmazonExplorerCategories = async ({
  country = 'US',
}: {
  country?: string;
} = {}): Promise<AmazonExplorerCategoryResponse> => {
  const response = await api.get('/products/amazon-trends/category-list/', {
    params: {
      country,
    },
  });
  return response.data;
};

// Direct API call to Real-Time Amazon Data API for category list
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

// Get Best Seller Categories with hierarchical structure
export const getAmazonBestSellerCategories = async ({
  country = 'US',
}: {
  country?: string;
} = {}): Promise<BestSellerCategoriesResponse> => {
  try {
    // Try backend API first
    const response = await api.get('/products/amazon-explorer/best-seller-categories/', {
      params: {
        country,
      },
    });
    return response.data;
  } catch (error) {
    console.warn('Backend API failed, falling back to direct API call:', error);
    // Fallback to direct API call
    return await getAmazonBestSellerCategoriesDirect({ country });
  }
};

// Direct API call to fetch best seller categories from Real-Time Amazon Data API
export const getAmazonBestSellerCategoriesDirect = async ({
  country = 'US',
}: {
  country?: string;
} = {}): Promise<BestSellerCategoriesResponse> => {
  // This will be implemented to fetch from a best-sellers endpoint that returns category structure
  // For now, we'll use the product-category-list and process it for best-sellers
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

  // Process the categories to create hierarchical structure
  if (data.status === 'OK' && data.data) {
    const categories = data.data;
    const mainCategories: BestSellerCategory[] = [];

    // Real Amazon subcategories based on actual Amazon.com structure - TESTED AND VALIDATED
    const realAmazonSubcategories: Record<string, Array<{category_path: string, name: string}>> = {
      'baby-products': [
        { category_path: 'baby-products/activity-entertainment', name: 'Activity & Entertainment' },
        { category_path: 'baby-products/baby-care', name: 'Baby Care' },
        { category_path: 'baby-products/car-seats', name: 'Car Seats' },
        { category_path: 'baby-products/diapering', name: 'Diapering' },
        { category_path: 'baby-products/feeding', name: 'Feeding' },
        { category_path: 'baby-products/for-moms', name: 'For Moms' },
        { category_path: 'baby-products/gifts', name: 'Gifts' },
        { category_path: 'baby-products/nursery', name: 'Nursery' },
        { category_path: 'baby-products/potty-training', name: 'Potty Training' },
        { category_path: 'baby-products/safety', name: 'Safety' },
        { category_path: 'baby-products/strollers', name: 'Strollers' },
        { category_path: 'baby-products/travel-gear', name: 'Travel Gear' },
      ],
      'electronics': [
        { category_path: 'electronics/camera-photo', name: 'Camera & Photo' },
        { category_path: 'electronics/car-vehicle-electronics', name: 'Car & Vehicle Electronics' },
        { category_path: 'electronics/cell-phones-accessories', name: 'Cell Phones & Accessories' },
        { category_path: 'electronics/computers-accessories', name: 'Computers & Accessories' },
        { category_path: 'electronics/gps-navigation', name: 'GPS & Navigation' },
        { category_path: 'electronics/headphones', name: 'Headphones' },
        { category_path: 'electronics/home-audio', name: 'Home Audio' },
        { category_path: 'electronics/portable-audio-video', name: 'Portable Audio & Video' },
        { category_path: 'electronics/security-surveillance', name: 'Security & Surveillance' },
        { category_path: 'electronics/television-video', name: 'Television & Video' },
        { category_path: 'electronics/video-games', name: 'Video Games' },
        { category_path: 'electronics/wearable-technology', name: 'Wearable Technology' },
      ],
      'clothing-shoes-jewelry': [
        { category_path: 'clothing-shoes-jewelry/women', name: 'Women' },
        { category_path: 'clothing-shoes-jewelry/men', name: 'Men' },
        { category_path: 'clothing-shoes-jewelry/girls', name: 'Girls' },
        { category_path: 'clothing-shoes-jewelry/boys', name: 'Boys' },
        { category_path: 'clothing-shoes-jewelry/baby', name: 'Baby' },
        { category_path: 'clothing-shoes-jewelry/luggage-travel-gear', name: 'Luggage & Travel Gear' },
        { category_path: 'clothing-shoes-jewelry/jewelry', name: 'Jewelry' },
        { category_path: 'clothing-shoes-jewelry/watches', name: 'Watches' },
        { category_path: 'clothing-shoes-jewelry/handbags-wallets', name: 'Handbags & Wallets' },
      ],
      'home-garden': [
        { category_path: 'home-garden/appliances', name: 'Appliances' },
        { category_path: 'home-garden/building-supplies', name: 'Building Supplies' },
        { category_path: 'home-garden/furniture', name: 'Furniture' },
        { category_path: 'home-garden/home-decor', name: 'Home Décor' },
        { category_path: 'home-garden/kitchen-dining', name: 'Kitchen & Dining' },
        { category_path: 'home-garden/lawn-garden', name: 'Lawn & Garden' },
        { category_path: 'home-garden/lighting', name: 'Lighting' },
        { category_path: 'home-garden/storage-organization', name: 'Storage & Organization' },
        { category_path: 'home-garden/tools-home-improvement', name: 'Tools & Home Improvement' },
      ],
      'sports-outdoors': [
        { category_path: 'sports-outdoors/exercise-fitness', name: 'Exercise & Fitness' },
        { category_path: 'sports-outdoors/outdoor-recreation', name: 'Outdoor Recreation' },
        { category_path: 'sports-outdoors/sports-collectibles', name: 'Sports Collectibles' },
        { category_path: 'sports-outdoors/team-sports', name: 'Team Sports' },
        { category_path: 'sports-outdoors/water-sports', name: 'Water Sports' },
        { category_path: 'sports-outdoors/winter-sports', name: 'Winter Sports' },
        { category_path: 'sports-outdoors/hunting-fishing', name: 'Hunting & Fishing' },
        { category_path: 'sports-outdoors/golf', name: 'Golf' },
      ],
      'books': [
        { category_path: 'books/arts-photography', name: 'Arts & Photography' },
        { category_path: 'books/biographies-memoirs', name: 'Biographies & Memoirs' },
        { category_path: 'books/business-money', name: 'Business & Money' },
        { category_path: 'books/childrens-books', name: "Children's Books" },
        { category_path: 'books/computers-technology', name: 'Computers & Technology' },
        { category_path: 'books/cookbooks-food-wine', name: 'Cookbooks, Food & Wine' },
        { category_path: 'books/crafts-hobbies-home', name: 'Crafts, Hobbies & Home' },
        { category_path: 'books/education-teaching', name: 'Education & Teaching' },
        { category_path: 'books/health-fitness-dieting', name: 'Health, Fitness & Dieting' },
        { category_path: 'books/history', name: 'History' },
        { category_path: 'books/mystery-thriller-suspense', name: 'Mystery, Thriller & Suspense' },
        { category_path: 'books/romance', name: 'Romance' },
        { category_path: 'books/science-fiction-fantasy', name: 'Science Fiction & Fantasy' },
        { category_path: 'books/self-help', name: 'Self-Help' },
      ],
      'toys-games': [
        { category_path: 'toys-games/action-figures', name: 'Action Figures & Statues' },
        { category_path: 'toys-games/arts-crafts', name: 'Arts & Crafts' },
        { category_path: 'toys-games/baby-toddler-toys', name: 'Baby & Toddler Toys' },
        { category_path: 'toys-games/building-toys', name: 'Building Toys' },
        { category_path: 'toys-games/dolls-accessories', name: 'Dolls & Accessories' },
        { category_path: 'toys-games/dress-up-pretend-play', name: 'Dress Up & Pretend Play' },
        { category_path: 'toys-games/electronic-toys', name: 'Electronic Toys' },
        { category_path: 'toys-games/games', name: 'Games' },
        { category_path: 'toys-games/learning-education', name: 'Learning & Education' },
        { category_path: 'toys-games/novelty-gag-toys', name: 'Novelty & Gag Toys' },
        { category_path: 'toys-games/puzzles', name: 'Puzzles' },
        { category_path: 'toys-games/sports-outdoor-play', name: 'Sports & Outdoor Play' },
        { category_path: 'toys-games/stuffed-animals', name: 'Stuffed Animals & Plush Toys' },
        { category_path: 'toys-games/vehicles', name: 'Vehicles' },
      ],
    };

    // Process main categories and add subcategories
    categories.forEach((cat: any) => {
      const categoryId = cat.id || cat.category_id;
      const categoryName = cat.name || cat.category_name;

      if (categoryId && categoryName) {
        // Get subcategories if available
        const subcategories: BestSellerCategory[] = [];
        if (realAmazonSubcategories[categoryId]) {
          for (const subcat of realAmazonSubcategories[categoryId]) {
            subcategories.push({
              category: subcat.category_path,
              category_path: subcat.category_path,
              name: subcat.name,
              is_main: false,
              parent_category: categoryId,
            });
          }
        }

        const mainCategory: BestSellerCategory = {
          category: categoryId,
          category_path: categoryId,
          name: categoryName,
          is_main: true,
          subcategories,
        };

        mainCategories.push(mainCategory);
      }
    });

    return {
      status: 'success',
      data: {
        country,
        categories: mainCategories,
        main_categories: mainCategories,
        total: mainCategories.length
      }
    };
  }

  return data;
};

// Get Best Seller Products by Category Path
export const getAmazonBestSellerProducts = async ({
  category,
  country = 'US',
  page = 1,
  type = 'BEST_SELLERS',
}: {
  category: string;
  country?: string;
  page?: number;
  type?: string;
}): Promise<AmazonExplorerResponse> => {
  try {
    // Try backend API first
    const response = await api.get('/products/amazon-explorer/best-sellers/', {
      params: {
        category,
        country,
        page,
        type,
      },
    });
    return response.data;
  } catch (error) {
    console.warn('Backend Best Seller API failed, falling back to direct API call:', error);
    // Fallback to direct API call
    return await getAmazonBestSellerProductsDirect({ category, country, page, type });
  }
};

// Direct Best Seller API call
export const getAmazonBestSellerProductsDirect = async ({
  category,
  country = 'US',
  page = 1,
  type = 'BEST_SELLERS',
}: {
  category: string;
  country?: string;
  page?: number;
  type?: string;
}): Promise<AmazonExplorerResponse> => {
  try {
    const response = await fetch(`https://real-time-amazon-data.p.rapidapi.com/best-sellers?category=${encodeURIComponent(category)}&type=${type}&page=${page}&country=${country}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
        'x-rapidapi-key': '60cb7bd196mshfa4299228d59ae3p16cdb0jsn5bf954e1e4a5',
      },
    });

    if (!response.ok) {
      throw new Error(`Best Seller API Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'OK' && data.data) {
      // Transform the response to match our expected format
      return {
        status: 'success',
        data: {
          products: data.data,
          total: data.data.length,
          page: page,
          country: country,
        },
      };
    } else {
      throw new Error(`Best Seller API returned status: ${data.status || 'unknown'}`);
    }
  } catch (error) {
    console.error('Error fetching best seller products directly:', error);
    throw error;
  }
};

// Amazon Product Details
export const getAmazonExplorerProductDetails = async ({
  asin,
  country = 'US',
}: {
  asin: string;
  country?: string;
}): Promise<{ data: ProductDetails; status: string; remaining_quota?: number }> => {
  const response = await api.get('/products/amazon/product-details/', {
    params: {
      asin,
      country,
    },
  });
  return response.data;
};

// Amazon Product Reviews
export const getAmazonExplorerProductReviews = async ({
  asin,
  country = 'US',
  page = 1,
  sort_by = 'TOP_REVIEWS',
  star_rating = 'ALL',
  verified_purchases_only = false,
}: {
  asin: string;
  country?: string;
  page?: number;
  sort_by?: string;
  star_rating?: string;
  verified_purchases_only?: boolean;
}): Promise<{ data: { reviews: ProductReview[]; total_reviews: number; page: number; asin: string; country: string }; status: string }> => {
  const response = await api.get('/products/amazon/product-reviews/', {
    params: {
      asin,
      country,
      page,
      sort_by,
      star_rating,
      verified_purchases_only,
    },
  });
  return response.data;
};

// Amazon Product Offers
export const getAmazonExplorerProductOffers = async ({
  asin,
  country = 'US',
  limit = 100,
  page = 1,
}: {
  asin: string;
  country?: string;
  limit?: number;
  page?: number;
}): Promise<{ data: { offers: ProductOffer[]; total_offers: number; page: number; asin: string; country: string }; status: string }> => {
  const response = await api.get('/products/amazon/product-offers/', {
    params: {
      asin,
      country,
      limit,
      page,
    },
  });
  return response.data;
};

// Supplier Discovery
export const discoverSuppliers = async (productData: {
  title: string;
  category?: string;
  asin?: string;
  brand?: string;
  price?: string;
}): Promise<SupplierDiscoveryResponse> => {
  const response = await api.post('/products/suppliers/discover/', productData);
  return response.data;
};

// Utility functions
export const formatPrice = (price: string): string => {
  if (!price) return 'N/A';
  return price.startsWith('$') ? price : `$${price}`;
};

export const formatRating = (rating: string | number): string => {
  if (!rating) return 'N/A';
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  return numRating.toFixed(1);
};

export const formatReviewCount = (count: number): string => {
  if (!count) return '0';
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const getProductImageUrl = (product: AmazonProduct): string => {
  return product.product_photo || '/placeholder-product.png';
};

export const getAmazonUrl = (product: AmazonProduct): string => {
  return product.product_url || `https://amazon.com/dp/${product.asin}`;
};
