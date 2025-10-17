import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Grid, List, Star, ShoppingCart, ExternalLink, Eye, Package, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import SearchesAlert from '../../../../../@spk/uielements/SearchesAlert';
import { useUserSubscriptionAndSearchQuota } from '../../../../../hooks/useUserDetails';
import AmazonLoader from '../../../../../components/AmazonLoader';



import {
  getAmazonExplorerBestSellers,
  searchAmazonExplorerProducts,
  getAmazonExplorerProductsByCategory,
  getAmazonExplorerCategories,
  getAmazonBestSellerCategories,
  getAmazonBestSellerProducts,
  formatPrice,
  formatRating,
  formatReviewCount,
  getProductImageUrl,
  getAmazonUrl,
  type AmazonProduct,
  type AmazonExplorerResponse,
  type AmazonExplorerCategory,
  type BestSellerCategory
} from '@/api/amazonExplorer';

import {
  getAmazonProductsByCategoryDirect,
} from '@/api/amazonTrends';

import {
  loadAmazonCategories,
  getRootCategories,
  getSubcategories,
  getCategoryById,
  extractCategoryId,
  AmazonCategoryItem,
} from '@/utils/amazonCategories';

import ProductDetailsModal from './ProductDetailsModal';

interface ProductExplorerProps {}

type ViewMode = 'best-sellers' | 'search' | 'category';

// Dynamic categories are now fetched from the API

const ProductExplorer: React.FC<ProductExplorerProps> = () => {
    const { quotaDetails, updateQuota } = useUserSubscriptionAndSearchQuota('amazon_explorer_search');
  
  const [viewMode, setViewMode] = useState<ViewMode>('best-sellers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [country, setCountry] = useState('US');
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<AmazonProduct | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [bestSellerCategories, setBestSellerCategories] = useState<BestSellerCategory[]>([]);
  const [mainCategories, setMainCategories] = useState<BestSellerCategory[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [currentSubcategories, setCurrentSubcategories] = useState<BestSellerCategory[]>([]);
  const [selectedType, setSelectedType] = useState<string>('BEST_SELLERS');

  // Local Amazon categories from JSON
  const [localRootCategories, setLocalRootCategories] = useState<AmazonCategoryItem[]>([]);
  const [selectedLocalRootCategory, setSelectedLocalRootCategory] = useState<string>('');

  // Load local Amazon categories on mount
  React.useEffect(() => {
    const { rootCategories } = loadAmazonCategories();
    setLocalRootCategories(rootCategories);
    console.log('📁 Loaded local Amazon categories:', rootCategories.length);
  }, []);

  // Countries list
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'AU', name: 'Australia' },
    { code: 'BR', name: 'Brazil' },
    { code: 'CA', name: 'Canada' },
    { code: 'CN', name: 'China' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'IN', name: 'India' },
    { code: 'IT', name: 'Italy' },
    { code: 'MX', name: 'Mexico' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SG', name: 'Singapore' },
    { code: 'ES', name: 'Spain' },
    { code: 'TR', name: 'Turkey' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'JP', name: 'Japan' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'PL', name: 'Poland' },
    { code: 'SE', name: 'Sweden' },
    { code: 'BE', name: 'Belgium' },
    { code: 'EG', name: 'Egypt' },
  ];

  // Amazon Trends Types
  const amazonTrendsTypes = [
    { value: 'BEST_SELLERS', name: 'Best Sellers', description: 'Top selling products' },
    { value: 'GIFT_IDEAS', name: 'Gift Ideas', description: 'Popular gift suggestions' },
    { value: 'MOST_WISHED_FOR', name: 'Most Wished For', description: 'Most wanted items' },
    { value: 'MOVERS_AND_SHAKERS', name: 'Movers & Shakers', description: 'Trending up products' },
    { value: 'NEW_RELEASES', name: 'New Releases', description: 'Latest product releases' },
  ];

  // Best Sellers Query
  const {
    data: bestSellersData,
    isLoading: bestSellersLoading,
    error: bestSellersError,
    refetch: refetchBestSellers
  } = useQuery({
    queryKey: ['amazon-explorer-best-sellers', country, page, selectedType],
    queryFn: async () => {
      console.log('=== FRONTEND BESTSELLERS DEBUG ===');
      console.log('Fetching best sellers with params:', { country, page, type: selectedType });
      const result = await getAmazonExplorerBestSellers({ country, page, type: selectedType });
      console.log('Best sellers API response:', result);
      console.log('Products count:', result?.data?.products?.length || 0);
      if (result?.data?.products?.length > 0) {
        console.log('First product:', result.data.products[0]);
      }
      console.log('=== END FRONTEND BESTSELLERS DEBUG ===');

      // Update quota if remaining_quota is provided in response
      if (result?.remaining_quota !== undefined) {
        updateQuota(result.remaining_quota);
      }

      return result;
    },
    enabled: viewMode === 'best-sellers',
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1, // Only retry once to prevent broken pipe errors
    retryDelay: 2000, // Fixed 2 second delay
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  });

  // Search Query
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
    refetch: refetchSearch
  } = useQuery({
    queryKey: ['amazon-explorer-search', searchQuery, country, page],
    queryFn: async () => {
      const result = await searchAmazonExplorerProducts({ query: searchQuery, country, page });

      // Update quota if remaining_quota is provided in response
      if (result?.remaining_quota !== undefined) {
        updateQuota(result.remaining_quota);
      }

      return result;
    },
    enabled: false, // Manual trigger only
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1, // Only retry once
    retryDelay: 2000, // Fixed 2 second delay
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Category Query
  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
    refetch: refetchCategory
  } = useQuery({
    queryKey: ['amazon-explorer-category', selectedCategory, country, page],
    queryFn: async () => {
      const result = await getAmazonExplorerProductsByCategory({ category_id: selectedCategory, country, page });

      // Update quota if remaining_quota is provided in response
      if (result?.remaining_quota !== undefined) {
        updateQuota(result.remaining_quota);
      }

      return result;
    },
    enabled: false, // Manual trigger only
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1, // Only retry once
    retryDelay: 2000, // Fixed 2 second delay
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // We use hardcoded working categories instead of API categories

  // Best Seller Products by Category Query (for hierarchical categories)
  const {
    data: directCategoryProductsData,
    isLoading: directCategoryProductsLoading,
    error: directCategoryProductsError,
    refetch: refetchDirectCategoryProducts,
  } = useQuery({
    queryKey: ['amazon-best-seller-products-explorer', selectedCategoryId, country, page, selectedType],
    queryFn: async () => {
      console.log('🚀 Products Query Starting:', {
        categoryId: selectedCategoryId,
        country: country,
        page: page,
        type: selectedType,
        enabled: !!selectedCategoryId
      });

      // Extract actual category ID from full path (e.g., "appliances/3741261" -> "3741261")
      const actualCategoryId = extractCategoryId(selectedCategoryId);

      console.log('📦 Extracted Category ID:', {
        original: selectedCategoryId,
        extracted: actualCategoryId
      });

      // Use Real-Time Amazon Data API
      const result = await getAmazonProductsByCategoryDirect({
        categoryId: actualCategoryId,
        country: country,
        page: page,
        sortBy: 'RELEVANCE',
        productCondition: 'ALL',
        isPrime: false,
        dealsAndDiscounts: 'NONE',
      });

      console.log('🎯 Products Query Result:', {
        categoryId: selectedCategoryId,
        extractedId: actualCategoryId,
        hasResult: !!result,
        hasData: !!result?.data,
        hasProducts: !!result?.data?.products,
        isProductsArray: Array.isArray(result?.data?.products),
        productsCount: Array.isArray(result?.data?.products) ? result.data.products.length : 0,
        status: result?.status
      });

      return result;
    },
    enabled: viewMode === 'category' && !!selectedCategoryId, // Only run when in category mode and a category is selected
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1, // Only retry once
    retryDelay: 2000, // Fixed 2 second delay
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Best Seller Categories Query - Fetch hierarchical categories dynamically from API
  const {
    data: bestSellerCategoriesData,
    isLoading: bestSellerCategoriesLoading,
    error: bestSellerCategoriesError,
  } = useQuery({
    queryKey: ['amazon-explorer-best-seller-categories', country],
    queryFn: async () => {
      console.log('🔍 Fetching best seller categories for country:', country);
      const result = await getAmazonBestSellerCategories({ country });
      console.log('📋 Best Seller Categories API response:', result);
      return result;
    },
    enabled: false, // DISABLED - using local categories now
    staleTime: 1000 * 60 * 60, // 1 hour - categories don't change often
    retry: 0, // No retries since this is disabled
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Process best seller categories when data changes
  React.useEffect(() => {
    if (bestSellerCategoriesData?.data) {
      const { categories, main_categories } = bestSellerCategoriesData.data;
      setBestSellerCategories(categories || []);
      setMainCategories(main_categories || []);

      console.log('📂 Main categories found:', main_categories?.length || 0);
      console.log('� Total categories found:', categories?.length || 0);

      // If a main category is selected, update subcategories
      if (selectedMainCategory) {
        const selectedMain = main_categories?.find(cat => cat.category === selectedMainCategory);
        if (selectedMain && selectedMain.subcategories) {
          setCurrentSubcategories(selectedMain.subcategories);
          console.log(`📁 Subcategories for ${selectedMainCategory}:`, selectedMain.subcategories.length);
        }
      }
    }
  }, [bestSellerCategoriesData, selectedMainCategory]);

  // Log query results when data changes
  React.useEffect(() => {
    if (directCategoryProductsData) {
      const products = directCategoryProductsData?.data?.products;
      const isProductsArray = Array.isArray(products);

      console.log('🎉 Direct Category Products Query SUCCESS:', {
        categoryId: selectedCategoryId,
        hasData: !!directCategoryProductsData,
        hasProducts: !!products,
        isProductsArray,
        productsCount: isProductsArray ? products.length : 0,
        firstProduct: isProductsArray && products.length > 0 ? products[0]?.product_title : 'No products',
        sampleProducts: isProductsArray ? products.slice(0, 3)?.map((p: any) => p.product_title) : []
      });
    }
  }, [directCategoryProductsData, selectedCategoryId]);

  // Log query errors when error changes
  React.useEffect(() => {
    if (directCategoryProductsError) {
      console.error('❌ Direct Category Products Query ERROR:', {
        categoryId: selectedCategoryId,
        error: directCategoryProductsError.message,
        fullError: directCategoryProductsError
      });
    }
  }, [directCategoryProductsError, selectedCategoryId]);

  // Get current data based on view mode
  const getCurrentData = (): AmazonExplorerResponse | undefined => {
    switch (viewMode) {
      case 'best-sellers':
        return bestSellersData;
      case 'search':
        return searchData;
      case 'category':
        return categoryData;
      default:
        return undefined;
    }
  };

  const getCurrentLoading = (): boolean => {
    switch (viewMode) {
      case 'best-sellers':
        return bestSellersLoading;
      case 'search':
        return searchLoading;
      case 'category':
        return categoryLoading;
      default:
        return false;
    }
  };

  const getCurrentError = (): any => {
    switch (viewMode) {
      case 'best-sellers':
        return bestSellersError;
      case 'search':
        return searchError;
      case 'category':
        return categoryError;
      default:
        return null;
    }
  };

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    setViewMode('search');
    setPage(1);
    refetchSearch();
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }
    setSelectedCategory(categoryId);
    setViewMode('category');
    setPage(1);
    refetchCategory();
  };

  // Handle direct category chip selection
  const handleCategoryChipSelect = (categoryId: string) => {
    console.log('🎯 Category chip selected:', {
      categoryId,
      categoryIdType: typeof categoryId,
      isNumeric: !isNaN(Number(categoryId)),
      country,
      currentViewMode: viewMode,
      currentSelectedCategoryId: selectedCategoryId
    });

    setSelectedCategoryId(categoryId);
    setViewMode('category');
    setPage(1);

    console.log('✅ Category selection state updated:', {
      newCategoryId: categoryId,
      newViewMode: 'category',
      newPage: 1,
      willTriggerDirectQuery: true
    });

    // Force a small delay to ensure state is updated before query runs
    setTimeout(() => {
      console.log('🔄 State after category selection:', {
        selectedCategoryId: categoryId,
        viewMode: 'category',
        queryWillRun: !!categoryId
      });
    }, 100);
  };

  // Handle product details view
  const handleViewDetails = (product: AmazonProduct) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const currentData = getCurrentData();
  const isLoading = getCurrentLoading();
  const error = getCurrentError();

  // DEBUG: Log the current data structure
  console.log('=== FRONTEND DATA EXTRACTION DEBUG ===');
  console.log('View Mode:', viewMode);
  console.log('Current Data:', currentData);
  console.log('Is Loading:', isLoading);
  console.log('Error:', error);
  console.log('Data structure check:');
  console.log('  - currentData exists:', !!currentData);
  console.log('  - currentData.data exists:', !!currentData?.data);
  console.log('  - currentData.data.products exists:', !!currentData?.data?.products);
  console.log('  - currentData.data.products is array:', Array.isArray(currentData?.data?.products));
  console.log('  - products length:', currentData?.data?.products?.length || 0);
  console.log('=== END FRONTEND DATA EXTRACTION DEBUG ===');

  // Get products based on view mode and category selection
  const getProducts = () => {
    console.log('🔍 ProductExplorer getProducts Debug:', {
      viewMode,
      selectedCategoryId,
      hasDirectCategoryData: !!directCategoryProductsData,
      hasDirectCategoryProducts: !!directCategoryProductsData?.data?.products,
      directCategoryProductsCount: directCategoryProductsData?.data?.products?.length || 0,
      directCategoryProductsLoading,
      directCategoryProductsError: directCategoryProductsError?.message,
      hasCurrentData: !!currentData,
      hasCurrentDataProducts: !!currentData?.data?.products,
      currentDataProductsCount: currentData?.data?.products?.length || 0
    });

    if (viewMode === 'category' && selectedCategoryId && directCategoryProductsData?.data?.products) {
      const products = directCategoryProductsData.data.products;
      console.log('✅ Using direct category products:', products.length);
      // Ensure we return an array
      return Array.isArray(products) ? products : [];
    }

    const fallbackProducts = currentData?.data?.products || [];
    console.log('📦 Using current data products:', fallbackProducts.length);
    // Ensure we return an array
    return Array.isArray(fallbackProducts) ? fallbackProducts : [];
  };

  const getTotalProducts = () => {
    if (viewMode === 'category' && selectedCategoryId && directCategoryProductsData?.data?.products) {
      const products = directCategoryProductsData.data.products;
      return Array.isArray(products) ? products.length : 0;
    }
    return currentData?.data?.total || 0;
  };

  const getIsLoading = () => {
    if (viewMode === 'category' && selectedCategoryId) {
      return directCategoryProductsLoading;
    }
    return isLoading;
  };

  const getError = () => {
    if (viewMode === 'category' && selectedCategoryId) {
      return directCategoryProductsError;
    }
    return error;
  };

  const products = getProducts();
  const totalProducts = getTotalProducts();
  const finalIsLoading = getIsLoading();
  const finalError = getError();

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md dark:shadow-lg">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Explorer</h2>
              <p className="text-gray-600 dark:text-gray-400">Discover trending products, search by keywords, or browse by category</p>
            </div>
            
                 
            
            {/* View Mode Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => {
                  setViewMode('best-sellers');
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'best-sellers'
                    ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Best Sellers
              </button>
              <button
                onClick={() => setViewMode('search')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'search'
                    ? 'bg-white dark:bg-gray-800 text-[#ffa41c] dark:text-orange-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Search className="w-4 h-4 inline mr-2" />
                Search
              </button>
              <button
                onClick={() => setViewMode('category')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'category'
                    ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Package className="w-4 h-4 inline mr-2" />
                By Category
              </button>
            </div>
            
          </div>
           {/* Subscription Quota Alert */}
                  <div className="mb-6">
                    <SearchesAlert
                      quotaDetails={quotaDetails}
                      searchType="Amazon Trends Searches"
                      addOnName="Amazon Trends Search"
                    />
                  </div>

          {/* Best Sellers Controls */}
          {viewMode === 'best-sellers' && (
            <div className="space-y-4 mb-6">
              {/* Country, Type, and Category Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Select Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setSelectedCategoryId(''); // Reset selected category when country changes
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {countries.map((countryOption) => (
                      <option key={countryOption.code} value={countryOption.code}>
                        {countryOption.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Amazon Trends Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setPage(1);
                      if (selectedCategoryId) {
                        refetchDirectCategoryProducts();
                      } else {
                        refetchBestSellers();
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {amazonTrendsTypes.map((type) => (
                      <option key={type.value} value={type.value} title={type.description}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Select Category (Optional)
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => {
                      setSelectedCategoryId(e.target.value);
                      if (e.target.value) {
                        setViewMode('category'); // Switch to category mode when category is selected
                        setPage(1);
                        refetchDirectCategoryProducts();
                      } else {
                        setViewMode('best-sellers'); // Switch back to best-sellers when no category
                        setPage(1);
                        refetchBestSellers();
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={bestSellerCategoriesLoading}
                  >
                    <option value="">All Categories</option>
                    {bestSellerCategories.map((category, index) => (
                      <option key={category.category_path || index} value={category.category_path}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Type Description */}
              <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    {amazonTrendsTypes.find(type => type.value === selectedType)?.name}:
                  </span>
                  <span className="text-sm text-blue-700 dark:text-gray-300">
                    {amazonTrendsTypes.find(type => type.value === selectedType)?.description}
                  </span>
                </div>
              </div>

              {/* Category Loading State */}
              {bestSellerCategoriesLoading && (
                <div className="flex items-center justify-center py-4">
                  <AmazonLoader
                    size="sm"
                    text={`Loading categories for ${countries.find(c => c.code === country)?.name}...`}
                  />
                </div>
              )}

              {/* Selected Category Display */}
              {selectedCategoryId && (
                <div className="bg-orange-50 dark:bg-gray-800 border border-orange-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-semibold">
                        <span className="w-1.5 h-1.5 bg-orange-500 dark:bg-orange-400 rounded-full"></span>
                        Category Selected
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {bestSellerCategories.find(cat => cat.category_path === selectedCategoryId)?.name || 'Selected Category'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {amazonTrendsTypes.find(type => type.value === selectedType)?.name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategoryId('');
                        setViewMode('best-sellers');
                        setPage(1);
                        refetchBestSellers();
                      }}
                      className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 text-sm font-medium"
                    >
                      Clear Category
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Controls */}
          {viewMode === 'search' && (
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for products..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || searchLoading}
                className="px-6 py-2 bg-[#ffa41c] hover:bg-[#ff6201] dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          )}

          {/* Category Controls */}
          {viewMode === 'category' && (
            <div className="space-y-4 mb-6">
              {/* Country Selector */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Select Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setSelectedCategoryId(''); // Reset selected category when country changes
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {countries.map((countryOption) => (
                      <option key={countryOption.code} value={countryOption.code}>
                        {countryOption.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Chips - Using Local JSON Categories */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Amazon Categories
                  </label>
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {localRootCategories.length} main categories
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  {/* Main Categories */}
                  {!selectedLocalRootCategory && (
                    <div className="m-4">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Main Categories</h4>
                      <div className="flex flex-wrap gap-3">
                        {localRootCategories.map((category, index) => (
                          <button
                            key={category.id || index}
                            onClick={() => {
                              setSelectedLocalRootCategory(category.id);
                            }}
                            className="group relative p-2 rounded-full text-sm font-medium transition-all duration-300 text-center overflow-hidden bg-white dark:bg-gray-700 border-2 border-blue-200 dark:border-blue-800 text-gray-700 dark:text-gray-200 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg hover:transform hover:scale-102"
                          >
                            <div className="flex items-center gap-2 px-3 py-1">
                              <span className="text-xs font-bold">{category.name}</span>
                              {category.has_children && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                  {getSubcategories(category.id).length}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subcategories */}
                  {selectedLocalRootCategory && (
                    <div className="m-4">
                      <div className="flex items-center gap-2 mb-3">
                        <button
                          onClick={() => {
                            setSelectedLocalRootCategory('');
                            setSelectedCategoryId('');
                          }}
                          className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm flex items-center gap-1"
                        >
                          ← Back to Main Categories
                        </button>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        {localRootCategories.find(cat => cat.id === selectedLocalRootCategory)?.name} Subcategories
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {getSubcategories(selectedLocalRootCategory).map((category, index) => {
                          const isSelected = selectedCategoryId === category.id;
                          return (
                            <button
                              key={category.id || index}
                              onClick={() => handleCategoryChipSelect(category.id)}
                              className={`group relative p-2 rounded-full text-sm font-medium transition-all duration-300 text-center overflow-hidden ${
                                isSelected
                                  ? 'bg-green-500 dark:bg-green-600 text-white shadow-xl transform scale-105 ring-4 ring-green-200 dark:ring-green-800'
                                  : 'bg-white dark:bg-gray-700 border-2 border-blue-200 dark:border-blue-800 text-gray-700 dark:text-gray-200 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg hover:transform hover:scale-102'
                              }`}
                              title={`Click to browse ${category.name}`}
                            >
                              <div className="flex items-center gap-2 px-3 py-1">
                                <span className="text-xs font-bold">{category.name}</span>
                                {isSelected && (
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Category Display */}
              {/* {selectedCategoryId && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-green-800 mb-1">
                        Selected Category
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          ID: {selectedCategoryId}
                        </span>
                        <span className="text-sm text-gray-700 font-medium">
                          {bestSellerCategories.find(cat => cat.category_path === selectedCategoryId)?.name || 'Selected Category'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex gap-2">
                      <button
                        onClick={() => {
                          console.log('🔄 Manual API Test for category:', selectedCategoryId);
                          refetchDirectCategoryProducts();
                        }}
                        className="w-8 h-8 bg-blue-500/20 hover:bg-blue-500/40 rounded-full flex items-center justify-center transition-colors group"
                        title="Test API call"
                      >
                        <svg className="w-4 h-4 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSelectedCategoryId('')}
                        className="w-8 h-8 bg-white/50 hover:bg-white/80 rounded-full flex items-center justify-center transition-colors group"
                        title="Clear selection"
                      >
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )} */}
            </div>
          )}

          {/* Results Summary */}
          {!isLoading && products.length > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>
                Showing {products.length} of {totalProducts.toLocaleString()} products
              </span>
              <span>
                Page {page}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        {finalIsLoading ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center py-8">
              <AmazonLoader
                size="lg"
                text={`Loading ${viewMode === 'search' ? 'Amazon search results' :
                      viewMode === 'best-sellers' ? 'Amazon best sellers' :
                      viewMode === 'category' ? 'Amazon category products' : 'Amazon products'}...`}
              />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : finalError ? (
          <div className="p-12 text-center">
            <div className="text-red-500 dark:text-red-400 mb-4">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Error Loading Products</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {finalError?.message || 'Failed to load products. Please try again.'}
              </p>
              <button
                onClick={() => {
                  if (viewMode === 'best-sellers') refetchBestSellers();
                  else if (viewMode === 'search') refetchSearch();
                  else if (viewMode === 'category') refetchCategory();
                }}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Products Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {viewMode === 'search'
                ? 'Try adjusting your search terms or browse our best sellers.'
                : viewMode === 'category'
                ? 'No products found in this category. Try selecting a different categorys.'
                : 'No best sellers available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="p-6 bg-black">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: any, index: number) => (
                <ProductCard
                  key={`${product.asin}-${index}`}
                  product={product}
                  onViewDetails={() => handleViewDetails(product)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

// Product Card Component
interface ProductCardProps {
  product: AmazonProduct;
  onViewDetails: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-300">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-50 dark:bg-gray-900">
        <img
          src={getProductImageUrl(product)}
          alt={product.product_title}
          className="w-full h-full object-contain p-4"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-product.png';
          }}
        />
        {product.is_best_seller && (
          <div className="absolute top-2 left-2 bg-[#d14901] text-white text-xs px-2 py-1 rounded-md">
            Best Seller
          </div>
        )}
        {product.is_amazon_choice && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            Choice
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white hover:text-[#de7a22] dark:hover:text-orange-400 text-sm line-clamp-2 mb-2">
          {product.product_title}
        </h3>

        {/* Price and Rating */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatPrice(product.product_price || '')}
          </span>
          {product.product_star_rating && (
            <div className="flex items-center text-sm text-[#2262a1] dark:text-blue-400">
              <Star className="w-4 h-4 text-[#de7a22] dark:text-orange-400 fill-current mr-1" />
              <span className=''>{formatRating(product.product_star_rating)}</span>
              <span className="ml-1">({formatReviewCount(product.product_num_ratings || 0)})</span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.is_prime && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">Prime</span>
          )}
          {product.climate_pledge_friendly && (
            <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-1 rounded">Climate Pledge</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onViewDetails}
            className="flex-1 bg-[#fc8804] dark:bg-orange-600 text-white py-2 px-3 rounded-lg hover:bg-[#ff6201] dark:hover:bg-orange-700 transition-colors text-sm flex items-center justify-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <a
            href={getAmazonUrl(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductExplorer;
