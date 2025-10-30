/**
 * Picsum Photos Image Fallback Utility
 * Fetches random placeholder images from Picsum Photos (Lorem Picsum) when product images are missing
 * Using Picsum Photos API - free, reliable, no API key required
 * API: https://picsum.photos/
 */

// Cache for Picsum images to avoid repeated API calls
const imageCache: Record<string, string> = {};

/**
 * Map TikTok category names to Unsplash search queries
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
 * Get search query for Unsplash based on category
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
 * Fetch a random image from Unsplash for a given category
 */
export const fetchPexelsFallbackImage = async (categoryName: string): Promise<string> => {
  // Check cache first
  if (imageCache[categoryName]) {
    console.log('📦 Using cached Unsplash image for category:', categoryName);
    return imageCache[categoryName];
  }

  try {
    const searchQuery = getCategorySearchQuery(categoryName);
    console.log('🔍 Fetching Unsplash image for category:', categoryName, 'with query:', searchQuery);

    // Using Unsplash Source API - simple, no API key required
    // Format: https://source.unsplash.com/400x400/?{query}
    const imageUrl = `https://source.unsplash.com/400x400/?${encodeURIComponent(searchQuery)}`;

    // Cache the image URL
    imageCache[categoryName] = imageUrl;

    console.log('✅ Unsplash image URL generated:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('❌ Error generating Unsplash image:', error);
    return '';
  }
};

/**
 * Get product image URL with Unsplash fallback
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

  // Otherwise, fetch fallback from Unsplash
  const categoryName = extractCategoryName(product);
  return await fetchPexelsFallbackImage(categoryName);
};

/**
 * Preload Unsplash images for common categories
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

  console.log('🚀 Preloading Unsplash images for common categories...');

  for (const category of commonCategories) {
    await fetchPexelsFallbackImage(category);
  }

  console.log('✅ Preloading complete!');
};