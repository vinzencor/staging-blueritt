/**
 * Amazon Categories Utility
 * Loads and processes Amazon categories from the simplified JSON file
 */

import amazonCategoriesData from '../../amazon_categories_simplified.json';

export interface AmazonCategoryItem {
  id: string;
  name: string;
  is_root: boolean;
  has_children: boolean;
  parent_id: string | null;
  parent_name: string | null;
  url: string;
  subcategories?: AmazonCategoryItem[];
}

export interface AmazonCategoryTree {
  rootCategories: AmazonCategoryItem[];
  allCategories: AmazonCategoryItem[];
  categoryMap: Map<string, AmazonCategoryItem>;
}

/**
 * Load and process Amazon categories from JSON file
 */
export const loadAmazonCategories = (): AmazonCategoryTree => {
  const categories = amazonCategoriesData as AmazonCategoryItem[];
  
  // Create a map for quick lookup
  const categoryMap = new Map<string, AmazonCategoryItem>();
  categories.forEach(cat => {
    categoryMap.set(cat.id, cat);
  });

  // Separate root categories
  const rootCategories = categories.filter(cat => cat.is_root);

  // Build category tree by adding subcategories to root categories
  const categoriesWithSubcategories = rootCategories.map(rootCat => {
    const subcategories = categories.filter(cat => 
      !cat.is_root && cat.parent_id === rootCat.id
    );
    
    return {
      ...rootCat,
      subcategories: subcategories.length > 0 ? subcategories : undefined
    };
  });

  return {
    rootCategories: categoriesWithSubcategories,
    allCategories: categories,
    categoryMap
  };
};

/**
 * Get root categories only
 */
export const getRootCategories = (): AmazonCategoryItem[] => {
  const { rootCategories } = loadAmazonCategories();
  return rootCategories;
};

/**
 * Get subcategories for a specific parent category
 */
export const getSubcategories = (parentId: string): AmazonCategoryItem[] => {
  const categories = amazonCategoriesData as AmazonCategoryItem[];
  return categories.filter(cat => !cat.is_root && cat.parent_id === parentId);
};

/**
 * Get category by ID
 */
export const getCategoryById = (categoryId: string): AmazonCategoryItem | undefined => {
  const { categoryMap } = loadAmazonCategories();
  return categoryMap.get(categoryId);
};

/**
 * Search categories by name
 */
export const searchCategories = (searchTerm: string): AmazonCategoryItem[] => {
  const categories = amazonCategoriesData as AmazonCategoryItem[];
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return categories.filter(cat => 
    cat.name.toLowerCase().includes(lowerSearchTerm)
  );
};

/**
 * Get category path (breadcrumb)
 */
export const getCategoryPath = (categoryId: string): AmazonCategoryItem[] => {
  const { categoryMap } = loadAmazonCategories();
  const path: AmazonCategoryItem[] = [];
  
  let currentCat = categoryMap.get(categoryId);
  
  while (currentCat) {
    path.unshift(currentCat);
    if (currentCat.parent_id) {
      currentCat = categoryMap.get(currentCat.parent_id);
    } else {
      break;
    }
  }
  
  return path;
};

/**
 * Extract category ID from full category ID (e.g., "appliances/3741261" -> "3741261")
 */
export const extractCategoryId = (fullCategoryId: string): string => {
  const parts = fullCategoryId.split('/');
  return parts[parts.length - 1];
};

/**
 * Get parent category ID from full category ID (e.g., "appliances/3741261" -> "appliances")
 */
export const getParentCategoryId = (fullCategoryId: string): string | null => {
  const parts = fullCategoryId.split('/');
  return parts.length > 1 ? parts[0] : null;
};

/**
 * Format category for display
 */
export const formatCategoryDisplay = (category: AmazonCategoryItem): string => {
  if (category.parent_name) {
    return `${category.parent_name} > ${category.name}`;
  }
  return category.name;
};

/**
 * Get popular/featured categories (first 20 root categories)
 */
export const getFeaturedCategories = (): AmazonCategoryItem[] => {
  const { rootCategories } = loadAmazonCategories();
  return rootCategories.slice(0, 20);
};

/**
 * Group categories by parent
 */
export const groupCategoriesByParent = (): Map<string, AmazonCategoryItem[]> => {
  const categories = amazonCategoriesData as AmazonCategoryItem[];
  const grouped = new Map<string, AmazonCategoryItem[]>();
  
  categories.forEach(cat => {
    if (!cat.is_root && cat.parent_id) {
      const existing = grouped.get(cat.parent_id) || [];
      existing.push(cat);
      grouped.set(cat.parent_id, existing);
    }
  });
  
  return grouped;
};

/**
 * Get total category count
 */
export const getTotalCategoryCount = (): { total: number; root: number; subcategories: number } => {
  const categories = amazonCategoriesData as AmazonCategoryItem[];
  const rootCount = categories.filter(cat => cat.is_root).length;
  const subcategoryCount = categories.filter(cat => !cat.is_root).length;
  
  return {
    total: categories.length,
    root: rootCount,
    subcategories: subcategoryCount
  };
};

