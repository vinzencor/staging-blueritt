/**
 * Pexels Image Fallback Utility
 * Fetches category-based fallback images from Pexels API when product images are missing
 *
 * To get a FREE Pexels API key:
 * 1. Go to https://www.pexels.com/api/
 * 2. Click "Get Started" and create a free account
 * 3. Copy your API key and replace the value below
 */

const PEXELS_API_KEY = 'YOUR_PEXELS_API_KEY_HERE'; // Replace with your actual Pexels API key from https://www.pexels.com/api/

// Cache for Pexels images to avoid repeated API calls
const imageCache: Record<string, string> = {};

/**
 * Map TikTok category names to Pexels search queries
 */
const categoryToSearchQuery: Record<string, string> = {
  // Apparel & Fashion
  'Womenswear': 'women fashion clothing',
  'Menswear': 'men fashion clothing',
  'Kids Fashion': 'kids children clothing',
  'Fashion Accessories': 'fashion accessories jewelry',
  'Shoes': 'shoes footwear',
  'Muslim Fashion': 'modest fashion hijab',

  // Electronics & Tech
  'Phones & Electronics': 'smartphone electronics gadgets',
  'Computers & Office Equipment': 'laptop computer office',
  'Tech & Electronics': 'technology electronics devices',

  // Home & Living
  'Home Supplies': 'home decor supplies',
  'Furniture': 'modern furniture interior',
  'Kitchenware': 'kitchen utensils cookware',
  'Household Appliances': 'home appliances kitchen',
  'Home Improvement': 'home improvement tools',
  'Textiles & Soft Furnishings': 'textiles fabrics home',

  // Beauty & Personal Care
  'Beauty & Personal Care': 'beauty cosmetics skincare',

  // Automotive
  'Automotive & Motorbike': 'car automotive vehicle',
  'Vehicle & Transportation': 'vehicle transportation car',

  // Baby & Kids
  'Baby & Maternity': 'baby products maternity',
  'Baby, Kids & Maternity': 'baby kids products',

  // Sports & Outdoor
  'Sports & Outdoor': 'sports outdoor fitness',

  // Pets
  'Pet Supplies': 'pet supplies dog cat',
  'Pets': 'pet products animals',

  // Food & Beverage
  'Food & Beverages': 'food beverage products',
  'Food & Beverage': 'food drink products',

  // Health
  'Health': 'health wellness fitness',

  // Toys & Hobbies
  'Toys & Hobbies': 'toys games hobbies',

  // Bags & Luggage
  'Luggage & Bags': 'luggage bags travel',

  // Jewelry
  'Jewellery, Accessories & Derivatives': 'jewelry accessories',

  // Tools
  'Tools & Hardware': 'tools hardware equipment',

  // Books & Media
  'Books, Magazines & Audio': 'books reading literature',

  // Collectibles
  'Collectibles': 'collectibles vintage items',

  // Virtual Products
  'Virtual Products': 'digital products technology',

  // Apps & Games
  'Apps': 'mobile apps technology',
  'Games': 'video games gaming',

  // Services
  'Business Services': 'business office professional',
  'Life Services': 'lifestyle services',
  'Financial Services': 'finance money banking',
  'Education': 'education learning books',
  'News & Entertainment': 'entertainment media news',
  'Travel': 'travel vacation tourism',

  // E-Commerce
  'E-Commerce (Non-app)': 'online shopping ecommerce',

  // Default fallback
  'default': 'product shopping retail'
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
 * Get search query for Pexels based on category
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
 * Fetch a random image from Pexels for a given category
 */
export const fetchPexelsFallbackImage = async (categoryName: string): Promise<string> => {
  // Check cache first
  if (imageCache[categoryName]) {
    console.log('📦 Using cached Pexels image for category:', categoryName);
    return imageCache[categoryName];
  }

  try {
    const searchQuery = getCategorySearchQuery(categoryName);
    console.log('🔍 Fetching Pexels image for category:', categoryName, 'with query:', searchQuery);

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=15&orientation=square`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      // Get a random image from the results
      const randomIndex = Math.floor(Math.random() * Math.min(data.photos.length, 10));
      const imageUrl = data.photos[randomIndex].src.medium;

      // Cache the image URL
      imageCache[categoryName] = imageUrl;

      console.log('✅ Pexels image fetched successfully:', imageUrl);
      return imageUrl;
    } else {
      console.warn('⚠️ No Pexels images found for category:', categoryName);
      return '';
    }
  } catch (error) {
    console.error('❌ Error fetching Pexels image:', error);
    return '';
  }
};

/**
 * Get product image URL with Pexels fallback
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

  // Otherwise, fetch fallback from Pexels
  const categoryName = extractCategoryName(product);
  return await fetchPexelsFallbackImage(categoryName);
};

/**
 * Preload Pexels images for common categories
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

  console.log('🚀 Preloading Pexels images for common categories...');

  for (const category of commonCategories) {
    await fetchPexelsFallbackImage(category);
  }

  console.log('✅ Preloading complete!');
};