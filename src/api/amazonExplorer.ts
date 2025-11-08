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
  cache_hit?: boolean;  // ✅ Indicates if data was loaded from 7-day cache (no quota deduction)
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
  // ✅ Colorful Badge Properties - EXACT COPY from BlueRitt Explorer
  is_gold?: boolean; // Gold Supplier badge
  verified_pro?: boolean; // Verified Pro badge
  alibaba_guaranteed?: boolean; // Alibaba Guaranteed badge
  is_assessed?: boolean; // Assessed Supplier badge
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
  // Quota tracking
  remaining_quota?: number;
}

// Amazon Best Sellers
export const getAmazonExplorerBestSellers = async ({
  category = 'software',
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
} = {}): Promise<AmazonExplorerResponse> => {
  const params: any = {
    category,
    type,
    country,
    page,
  };

  // Add language if provided
  if (language && language.trim()) {
    params.language = language.trim();
  }

  const response = await api.get('/products/amazon/best-sellers/', {
    params,
  });
  return response.data;
};

// Amazon Product Search
// ✅ Using the same endpoint as BlueRitt Explorer for consistency and multi-country support
export const searchAmazonExplorerProducts = async ({
  query,
  country = 'US',
  page = 1,
  sort_by = 'RELEVANCE',
  product_condition = 'ALL',
  is_prime = false,
  deals_and_discounts = 'NONE',
  min_star_rating = 0,
  max_star_rating = 5,
  min_reviews = 0,
  max_reviews = 99999990,
  min_price,
  max_price,
}: {
  query: string;
  country?: string;
  page?: number;
  sort_by?: string;
  product_condition?: string;
  is_prime?: boolean;
  deals_and_discounts?: string;
  min_star_rating?: number;
  max_star_rating?: number;
  min_reviews?: number;
  max_reviews?: number;
  min_price?: number;
  max_price?: number;
}): Promise<AmazonExplorerResponse> => {
  const params: any = {
    query,
    country,
    sort_by,
    product_condition,
    deals_and_discounts,
    min_star_rating,
    max_star_rating,
    min_reviews,
    max_reviews,
  };

  // Add optional price filters
  if (min_price !== undefined) {
    params.min = min_price;
  }
  if (max_price !== undefined) {
    params.max = max_price;
  }
  if (is_prime !== undefined) {
    params.is_prime = is_prime;
  }

  // ✅ Use the same endpoint as BlueRitt Explorer
  const response = await api.get('/products/amazon-search/', {
    params,
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

// Fetch best seller categories via backend API (secure - no exposed API keys)
export const getAmazonBestSellerCategoriesDirect = async ({
  country = 'US',
}: {
  country?: string;
} = {}): Promise<BestSellerCategoriesResponse> => {
  // ✅ Call backend endpoint instead of RapidAPI directly - SECURITY FIX
  const response = await api.get('/products/amazon-trends/category-list/', {
    params: { country }
  });

  const data = response.data;

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

// Get Amazon best sellers via backend API
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
    // ✅ Call backend endpoint instead of RapidAPI directly
    const response = await api.get('/products/amazon-trends/best-sellers-by-category/', {
      params: {
        category,
        country,
        page: page.toString(),
        type
      }
    });

    const data = response.data;

    if (data.status === 'OK' && data.data) {
      // Transform the response to match our expected format
      return {
        status: 'success',
        data: {
          products: data.data.best_sellers || data.data,
          total: (data.data.best_sellers || data.data).length,
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
// ✅ Using the same endpoint as BlueRitt Explorer for consistency
export const getAmazonExplorerProductDetails = async ({
  asin,
  country = 'US',
  source,
}: {
  asin: string;
  country?: string;
  source?: string;
}): Promise<{ data: ProductDetails; status: string; remaining_quota?: number }> => {
  const response = await api.get(
    `/products/amazon-product-detail/${asin}/?country=${country}${source ? '&search_type=' + source : ''}`
  );
  if (!response?.data?.data?.asin) {
    throw new Error("Product not found");
  }
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
  // ✅ Call backend endpoint with params (AlibabaProductMatcher expects 'query' and 'asin')
  // Use URLSearchParams to ensure consistent encoding with + for spaces
  const params = new URLSearchParams({
    query: productData.title,  // Backend expects 'query' not 'title'
    asin: productData.asin || 'UNKNOWN',  // ASIN is required by backend
    country: 'US',  // Default country
  });

  console.log('🔍 Amazon Supplier Discovery Request:', `/products/suppliers/discover/?${params.toString()}`);

  try {
    const response = await api.get(`/products/suppliers/discover/?${params.toString()}`);

    // ✅ Check if backend returned an error (even with HTTP 200)
    if (response.data?.error) {
      console.error('❌ Amazon Supplier Discovery API error:', response.data.error);
      console.error('❌ Error message:', response.data.message);
      console.error('❌ Status code:', response.data.status_code);

      // Throw error with backend message
      throw new Error(response.data.message || response.data.error);
    }

    // ✅ Transform AlibabaProductMatcher response format to frontend format
    const backendData = response.data;
    const suppliersArray = backendData.suppliers || backendData.products || [];

  // Transform each supplier from backend format to frontend format
  const transformedSuppliers = suppliersArray.map((supplierData: any) => {
    const item = supplierData.item || {};
    const seller = item.seller_store || {};
    const company = item.company_details || item.company || {};

    // 🔍 DEBUG: Log the actual structure
    console.log('🔍 Amazon Supplier Data Structure:', {
      item_keys: Object.keys(item),
      seller_keys: Object.keys(seller),
      company_keys: Object.keys(company),
      seller_full: seller,
      company_full: company,
    });

    // Extract SKU data for price and MOQ
    const sku = item.sku || {};
    const skuDef = sku.def || {};
    const priceModule = skuDef.priceModule || {};
    const quantityModule = skuDef.quantityModule || {};
    const minOrder = quantityModule.minOrder || {};

    // Get price from priceList or fallback to sku_listing
    const priceList = priceModule.priceList || [];
    const firstPrice = priceList[0] || {};
    const skuListing = item.sku_listing || {};
    const skuListingPrice = skuListing.def?.priceModule || {};

    // Extract company details
    const companyName = company.companyName || '';
    const companyType = company.companyType || '';

    // ✅ Extract years in business from seller.storeAge (e.g., "5 YRS" or "5")
    const storeAge = seller.storeAge || companyType || '';
    const yearsMatch = storeAge.match(/(\d+)/);
    let yearsInBusiness = yearsMatch ? parseInt(yearsMatch[1]) : 0;

    // ✅ If years is still 0, try to extract from company establishment year
    if (yearsInBusiness === 0 && company.companyEstablishmentYear) {
      const currentYear = new Date().getFullYear();
      const establishmentYear = parseInt(company.companyEstablishmentYear);
      if (!isNaN(establishmentYear) && establishmentYear > 1900 && establishmentYear <= currentYear) {
        yearsInBusiness = currentYear - establishmentYear;
      }
    }

    // ✅ Extract rating from seller.storeEvaluates
    const storeEvaluates = seller.storeEvaluates || [];
    let rating = 0;
    let responseRate = 'N/A';
    let totalTransactions = 0;

    console.log('🔍 Store Evaluates:', storeEvaluates);

    // Parse storeEvaluates for rating, response rate, and transactions
    storeEvaluates.forEach((evaluate: any) => {
      const title = evaluate.title?.toLowerCase() || '';
      const score = evaluate.score || '';

      console.log('🔍 Evaluate:', { title, score });

      if (title.includes('rating') || title.includes('score')) {
        // Extract rating (e.g., "4.5/5.0" or "4.5")
        const ratingMatch = score.match(/([\d.]+)/);
        if (ratingMatch) {
          rating = parseFloat(ratingMatch[1]);
        }
      } else if (title.includes('response') || title.includes('reply')) {
        // Extract response rate (e.g., "95%" or "95")
        responseRate = score.includes('%') ? score : `${score}%`;
      } else if (title.includes('transaction') || title.includes('order')) {
        // Extract total transactions (e.g., "1,234" or "1234")
        const transactionMatch = score.replace(/,/g, '').match(/(\d+)/);
        if (transactionMatch) {
          totalTransactions = parseInt(transactionMatch[1]);
        }
      }
    });

    return {
      id: item.itemId || item.id || '',
      name: companyName || 'Unknown Supplier',
      supplier_name: companyName,
      location: company.companyAddress?.country || 'China',
      verification_status: company.status?.gold ? 'Gold Supplier' : (company.status?.verified ? 'Verified' : 'Standard'),
      verification_badge: company.status?.gold ? 'Gold Supplier' : (company.status?.verified ? 'Verified Supplier' : ''),
      years_in_business: yearsInBusiness,
      main_products: item.title || '',
      certifications: item.description?.certifications || [],
      contact_method: item.itemUrl || '',
      ai_match_score: supplierData.score || 0,
      match_explanation: `AI Match Score: ${(supplierData.score || 0).toFixed(2)}%`,
      moq: minOrder.quantity || 0,
      min_order_quantity: minOrder.quantityFormatted || `${minOrder.quantity || 0} ${minOrder.unit || 'Pieces'}`,
      lead_time: 'Contact supplier', // Not available in API response
      estimated_price: firstPrice.priceFormatted || skuListingPrice.priceFormatted || priceModule.priceFormatted || 'Contact supplier',
      contact_url: item.itemUrl || '',
      response_rate: responseRate,
      trade_assurance: company.status?.tradeAssurance || company.status?.assessed || false,
      verified_supplier: company.status?.verified || false,
      rating: rating,
      total_transactions: totalTransactions,
      price_per_unit: firstPrice.priceFormatted || priceModule.priceFormatted,
      minimum_order: minOrder.quantity,
      // ✅ Colorful Badge Properties - EXACT COPY from BlueRitt Explorer
      is_gold: company.status?.gold || false,
      verified_pro: false, // Not available in Alibaba API
      alibaba_guaranteed: false, // Not available in Alibaba API
      is_assessed: company.status?.assessed || false,
      // Keep raw item data for reference
      _raw_item: item,
      _raw_seller: seller,
      _raw_company: company,
      _raw_sku: sku,
    };
  });

    return {
      status: 'success',
      analysis_time: 0,
      product_info: {
        title: productData.title,
        category: productData.category || '',
        asin: productData.asin || '',
        brand: productData.brand || '',
        price: productData.price || '',
      },
      suppliers: transformedSuppliers,
      total_suppliers: transformedSuppliers.length,
      analysis_summary: {
        criteria_analyzed: ['AI Matching', 'Verification Status', 'Trade Assurance'],
        top_match_score: transformedSuppliers[0]?.ai_match_score || 0,
      },
      remaining_quota: backendData.remaining_quota,
    };
  } catch (error: any) {
    console.error('❌ Amazon Supplier Discovery failed:', error);

    // Re-throw with more context
    throw new Error(error.message || 'Failed to discover suppliers. Please try again.');
  }
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
  // Try multiple image fields with fallbacks
  const productAny = product as any;

  // Check all possible image field names from Amazon API
  const imageUrl = product.product_photo ||
                   productAny.product_main_image_url ||
                   productAny.product_photo_url ||
                   productAny.image ||
                   productAny.image_url ||
                   productAny.main_image ||
                   (productAny.product_photos && productAny.product_photos.length > 0 ? productAny.product_photos[0] : null) ||
                   (productAny.images && productAny.images.length > 0 ? productAny.images[0] : null) ||
                   'https://via.placeholder.com/300x300?text=No+Image';

  // Log if using placeholder
  if (imageUrl === 'https://via.placeholder.com/300x300?text=No+Image') {
    console.warn('⚠️ No image found for product:', product.product_title?.substring(0, 40), 'Available fields:', Object.keys(productAny).filter(k => k.toLowerCase().includes('image') || k.toLowerCase().includes('photo')));
  }

  return imageUrl;
};

/**
 * Map country codes to Amazon domain extensions
 */
const getAmazonDomain = (countryCode: string): string => {
  const domainMap: { [key: string]: string } = {
    'US': 'com',
    'CA': 'ca',
    'MX': 'com.mx',
    'BR': 'com.br',
    'GB': 'co.uk',
    'AU': 'com.au',
    'FR': 'fr',
    'DE': 'de',
    'SE': 'se',
    'PL': 'pl',
    'TR': 'com.tr',
    'AE': 'ae',
    'IN': 'in',
    'IT': 'it',
    'ES': 'es',
    'JP': 'co.jp',
    'SG': 'sg',
    'SA': 'sa',
    'NL': 'nl',
  };

  return domainMap[countryCode.toUpperCase()] || 'com';
};

export const getAmazonUrl = (product: AmazonProduct, countryCode: string = 'US'): string => {
  // If product already has a valid product_url, use it
  if (product.product_url && product.product_url.includes('amazon')) {
    return product.product_url;
  }

  // Otherwise, construct URL with correct country domain
  const domain = getAmazonDomain(countryCode);
  return `https://amazon.${domain}/dp/${product.asin}`;
};
