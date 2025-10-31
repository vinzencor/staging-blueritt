/**
 * Pexels Image Fallback Utility
 * Fetches category-based images from Pexels API when product images are missing
 * Using Pexels Photos Search API
 * API: https://api.pexels.com/v1/search
 */

// Cache for images to avoid repeated API calls
const imageCache: Record<string, string> = {};

// Pexels API configuration
const PEXELS_API_KEY = 'NWGTQYjciu6iAamexgTguvRGjnhXX4eao8HsRGh8SSCETpuP7UE78YCA';
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

/**
 * Map TikTok category names to image search queries
 */
const categoryToSearchQuery: Record<string, string> = {
  // Apparel & Fashion
  'Womenswear': 'women-fashion',
  "Women's Underwear": 'lingerie',
  'Menswear': 'men-fashion',
  "Men's Underwear": 'mens-underwear',
  'Kids Fashion': 'kids-clothing',
  'Fashion Accessories': 'fashion-accessories',
  'Shoes': 'shoes',
  'Muslim Fashion': 'modest-fashion',

  // Electronics & Tech
  'Phones & Electronics': 'smartphone',
  'Computers & Office Equipment': 'laptop',
  'Tech & Electronics': 'technology',

  // Home & Living
  'Home Supplies': 'home-decor',
  'Furniture': 'furniture',
  'Kitchenware': 'kitchen',
  'Household Appliances': 'appliances',
  'Home Improvement': 'tools',
  'Textiles & Soft Furnishings': 'textiles',

  // Beauty & Personal Care
  'Beauty & Personal Care': 'cosmetics',

  // Automotive
  'Automotive & Motorbike': 'car',
  'Vehicle & Transportation': 'vehicle',

  // Baby & Kids
  'Baby & Maternity': 'baby',
  'Baby, Kids & Maternity': 'baby-products',

  // Sports & Outdoor
  'Sports & Outdoor': 'sports',

  // Pets
  'Pet Supplies': 'pets',
  'Pets': 'pet',

  // Food & Beverage
  'Food & Beverages': 'food',
  'Food & Beverage': 'food-drink',

  // Health
  'Health': 'health',

  // Toys & Hobbies
  'Toys & Hobbies': 'toys',

  // Bags & Luggage
  'Luggage & Bags': 'luggage',

  // Jewelry
  'Jewellery, Accessories & Derivatives': 'jewelry',

  // Tools
  'Tools & Hardware': 'tools',

  // Books & Media
  'Books, Magazines & Audio': 'books',

  // Collectibles
  'Collectibles': 'vintage',

  // Virtual Products
  'Virtual Products': 'digital',

  // Apps & Games
  'Apps': 'mobile-app',
  'Games': 'gaming',

  // Services
  'Business Services': 'business',
  'Life Services': 'lifestyle',
  'Financial Services': 'finance',
  'Education': 'education',
  'News & Entertainment': 'entertainment',
  'Travel': 'travel',

  // E-Commerce
  'E-Commerce (Non-app)': 'shopping',

  // Default fallback
  'default': 'product'
};

/**
 * Extract category name from TikTok product data
 */
export const extractCategoryName = (product: any): string => {
  // Try different possible category fields
  const categoryName =
    product.category_name ||
    product.category ||
    product.third_ecom_category?.name ||
    product.third_ecom_category?.category_name ||
    'default';

  return categoryName;
};

/**
 * Get search query for image search based on category
 */
const getCategorySearchQuery = (categoryName: string): string => {
  // Try exact match first
  if (categoryToSearchQuery[categoryName]) {
    return categoryToSearchQuery[categoryName];
  }

  // Try partial match
  for (const [key, value] of Object.entries(categoryToSearchQuery)) {
    if (categoryName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(categoryName.toLowerCase())) {
      return value;
    }
  }

  // Default fallback
  return categoryToSearchQuery['default'];
};

/**
 * Fetch a random image from Pexels API for a given search query
 * @param searchQuery - The search query (can be product title, url_title, or category)
 * @param cacheKey - Optional cache key (defaults to searchQuery)
 */
export const fetchPexelsFallbackImage = async (searchQuery: string, cacheKey?: string): Promise<string> => {
  const key = cacheKey || searchQuery;

  // Check cache first
  if (imageCache[key]) {
    console.log('📦 Using cached image for:', key);
    return imageCache[key];
  }

  try {
    // Clean up the search query - remove special characters and extra spaces
    const cleanQuery = searchQuery
      .replace(/[^\w\s-]/g, ' ') // Replace special chars with space
      .replace(/\s+/g, ' ')       // Replace multiple spaces with single space
      .trim();

    console.log('🔍 Fetching Pexels image with query:', cleanQuery);

    // Call Pexels Photos Search API
    // Parameters: query (search term), per_page (number of results)
    const url = `${PEXELS_API_URL}?query=${encodeURIComponent(cleanQuery)}&per_page=15`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Extract image URL from Pexels response
    // Pexels returns data in format: { photos: [...], page, per_page, total_results }
    if (data.photos && data.photos.length > 0) {
      // Get a random image from the results
      const randomIndex = Math.floor(Math.random() * Math.min(data.photos.length, 15));
      const photo = data.photos[randomIndex];

      // Pexels photos have src object with different sizes
      // Use medium size for better quality and performance
      const imageUrl = photo?.src?.medium ||
                      photo?.src?.large ||
                      photo?.src?.original ||
                      '';

      if (imageUrl) {
        // Cache the image URL
        imageCache[key] = imageUrl;
        console.log('✅ Pexels image URL fetched:', imageUrl);
        return imageUrl;
      }
    }

    console.warn('⚠️ No images found for query:', cleanQuery);
    return '';
  } catch (error) {
    console.error('❌ Error fetching image from Pexels API:', error);
    return '';
  }
};

/**
 * Get product image URL with Pexels fallback
 * Uses product's url_title for more relevant images
 */
export const getProductImageWithFallback = async (product: any): Promise<string> => {
  // Try to get the original product image
  const originalImage =
    product.cover_url ||
    product.image_url ||
    product.product_image ||
    product.thumbnail ||
    '';

  // If original image exists and is valid, return it
  if (originalImage && originalImage.startsWith('http')) {
    return originalImage;
  }

  // Otherwise, fetch fallback from Pexels API using url_title or title
  // Priority: url_title > title > category
  const searchQuery = product.url_title || product.title || extractCategoryName(product);
  const cacheKey = `${product.id || ''}_${searchQuery}`;

  return await fetchPexelsFallbackImage(searchQuery, cacheKey);
};

/**
 * Preload images for common categories
 */
export const preloadCommonCategoryImages = async () => {
  const commonCategories = [
    'Beauty & Personal Care',
    'Fashion Accessories',
    'Phones & Electronics',
    'Home Supplies',
    'Sports & Outdoor',
    'Pet Supplies',
    'Food & Beverages',
    'Toys & Hobbies'
  ];

  console.log('🚀 Preloading images for common categories...');

  for (const category of commonCategories) {
    await fetchPexelsFallbackImage(category);
  }

  console.log('✅ Preloading complete!');
};