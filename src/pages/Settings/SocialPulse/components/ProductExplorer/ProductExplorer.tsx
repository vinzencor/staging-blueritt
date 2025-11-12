import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Grid, List, Star, ShoppingCart, ExternalLink, Eye, Package, TrendingUp, Zap, X, CheckCircle, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useUserSubscriptionAndSearchQuota } from '../../../../../hooks/useUserDetails';
import AmazonLoader from '../../../../../components/AmazonLoader';
import { QuotaNames } from '../../../../../enum';

import api from '@/api';

import {
  getAmazonExplorerBestSellers,
  searchAmazonExplorerProducts,
  getAmazonExplorerProductsByCategory,
  getAmazonBestSellerCategories,
  getAmazonBestSellerProducts,
  formatPrice,
  formatRating,
  formatReviewCount,
  getProductImageUrl,
  getAmazonUrl,
  type AmazonProduct,
  type AmazonExplorerResponse,
  type AmazonExplorerCategory
} from '@/api/amazonExplorer';

// Import keyword filtering utility
import { checkForBlockedKeywords, getBlockedContentMessage } from '../../../../../utils/keywordFilter';

import {
  getAmazonProductsByCategoryDirect,
} from '@/api/amazonTrends';

import ProductDetailsModal from './ProductDetailsModal';
import AddOnsChoiceModalAmazon from './AddOnChoiceModalAmazon';

interface ProductExplorerProps { }

type ViewMode = 'best-sellers' | 'search' | 'category';

// ✅ Amazon Trends - Only 6 Supported Countries
const AMAZON_COUNTRIES = [
  { value: 'US', label: 'United States', languages: ['en_US', 'es_US'] },
  { value: 'CA', label: 'Canada', languages: ['en_CA', 'fr_CA'] },
  { value: 'MX', label: 'Mexico', languages: ['es_MX'] },
  { value: 'BR', label: 'Brazil', languages: ['pt_BR'] },
  { value: 'GB', label: 'United Kingdom', languages: ['en_GB'] },
  { value: 'AU', label: 'Australia', languages: ['en_AU'] },
  { value: 'FR', label: 'France', languages: ['fr_FR'] },
  { value: 'DE', label: 'Germany', languages: ['de_DE'] },
  { value: 'SE', label: 'Sweden', languages: ['sv_SE'] },
  { value: 'PL', label: 'Poland', languages: ['pl_PL'] },
  { value: 'TR', label: 'Turkey', languages: ['tr_TR'] },
  { value: 'AE', label: 'UAE', languages: ['ar_AE', 'en_AE'] },
  { value: 'IN', label: 'India', languages: ['en_IN', 'hi_IN'] },
];

// Helper function to get default language for a country
const getDefaultLanguage = (countryCode: string): string => {
  const country = AMAZON_COUNTRIES.find(c => c.value === countryCode);
  return country?.languages[0] || 'en_US';
};

// Dynamic categories are now fetched from the API

const ProductExplorer: React.FC<ProductExplorerProps> = () => {
  // ✅ Backend quota management for BlueRitt Explorer search (SEPARATE from Amazon Trends)
  // Uses amazon_search quota (backend: AmazonDataAPI)
  const { quotaDetails: amazonSearchQuotaDetails, updateQuota: updateAmazonSearchQuota } = useUserSubscriptionAndSearchQuota(QuotaNames.AmazonSearch);

  // Backend quota management for supplier discovery (shared with BlueRitt Explorer and TikTok Trends)
  const { quotaDetails: supplierQuotaDetails, updateQuota: updateSupplierQuota } = useUserSubscriptionAndSearchQuota(QuotaNames.SupplierDiscovery);

  // For displaying plan name (use amazonSearchQuotaDetails as the main quota details)
  const quotaDetails = amazonSearchQuotaDetails;


  const [viewMode, setViewMode] = useState<ViewMode>('best-sellers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [country, setCountry] = useState('US'); // ✅ Default to United States
  const [language, setLanguage] = useState('en_US'); // ✅ Default language
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<AmazonProduct | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [autoStartSupplierDiscovery, setAutoStartSupplierDiscovery] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('BEST_SELLERS');
  const [showAddOnsChoiceModalAmazon, setShowAddOnsChoiceModalAmazon] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // API-based categories (fetched dynamically based on country)
  const [mainCategories, setMainCategories] = useState<any[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [currentSubcategories, setCurrentSubcategories] = useState<any[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string>(''); // Store full category path for display

  // ✅ Fetch categories from backend API based on country (same as BlueRitt Explorer)
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ['amazon-categories', country],
    queryFn: async () => {
      console.log('🌍 Fetching Amazon categories for country:', country);
      const response = await api.get('/products/categories/', {
        params: { country }
      });
      console.log('✅ Categories fetched for country:', country, 'Response:', response.data);
      return response.data;
    },
    enabled: true,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Update main categories when API data changes
  React.useEffect(() => {
    if (categoriesData?.res) {
      setMainCategories(categoriesData.res);
      console.log('📂 Updated main categories from API:', categoriesData.res.length);
      console.log('📂 Full categories data:', JSON.stringify(categoriesData.res, null, 2));
    }
  }, [categoriesData]);

  // Update subcategories when main category changes
  React.useEffect(() => {
    if (selectedMainCategory) {
      const mainCat = mainCategories.find((cat: any) => cat.category === selectedMainCategory);
      if (mainCat && mainCat.subcategories) {
        setCurrentSubcategories(mainCat.subcategories);
        console.log('📂 Updated subcategories for:', selectedMainCategory, 'Total:', mainCat.subcategories.length);
      } else {
        setCurrentSubcategories([]);
      }
    } else {
      setCurrentSubcategories([]);
    }
    // Reset subcategory selection when main category changes
    setSelectedSubcategory('');
    setSelectedCategoryId('');
    setSelectedCategoryPath('');
  }, [selectedMainCategory, mainCategories]);

  // Reset category selection when country changes
  React.useEffect(() => {
    setSelectedMainCategory('');
    setSelectedSubcategory('');
    setSelectedCategoryId('');
    setSelectedCategoryPath('');
    setCurrentSubcategories([]);
    // Update language to default for the new country
    const defaultLang = getDefaultLanguage(country);
    setLanguage(defaultLang);
    console.log('🌍 Country changed to:', country, '- Language:', defaultLang, '- Resetting category selection');
  }, [country]);

  // Amazon Trends Types
  const amazonTrendsTypes = [
    { value: 'BEST_SELLERS', name: 'Trending Products', description: 'Top selling products' },
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
    queryKey: ['amazon-explorer-best-sellers', country, language, page, selectedType],
    queryFn: async () => {
      console.log('=== FRONTEND BESTSELLERS DEBUG ===');
      console.log('Fetching best sellers with params:', { country, language, page, type: selectedType });

      try {
        // ✅ Fetch from selected country with language
        const result = await getAmazonExplorerBestSellers({
          country: country, // ✅ Use selected country
          language: language, // ✅ Use selected language
          page: 1,
          type: selectedType
        });

        console.log('✅ Best sellers response:', result);

        // Update quota if remaining_quota is provided in response
        if (result?.remaining_quota !== undefined) {
          console.log('🔄 Updating Amazon Search quota:', result.remaining_quota);
          updateAmazonSearchQuota(result.remaining_quota);
        }

        console.log('Best sellers products fetched:', result?.data?.products?.length || 0);
        console.log('=== END FRONTEND BESTSELLERS DEBUG ===');

        return result;
      } catch (error) {
        console.error('❌ Error fetching best sellers:', error);
        throw error;
      }
    },
    enabled: false, // ✅ CRITICAL: Disable ALL automatic fetching - only fetch when button is clicked
    staleTime: 1000 * 60 * 10, // 10 minutes - cache for 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes - prevent garbage collection refetches
    retry: 1, // Only retry once to prevent broken pipe errors
    retryDelay: 2000, // Fixed 2 second delay
    refetchOnWindowFocus: false, // ✅ Never refetch on window focus
    refetchOnMount: false, // ✅ Never refetch on mount
    refetchOnReconnect: false, // ✅ Never refetch on reconnect
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
      try {
        console.log('🔍 Fetching search results:', { country, query: searchQuery });

        // ✅ Fetch from selected country
        const result = await searchAmazonExplorerProducts({
          query: searchQuery,
          country: country, // ✅ Use selected country
          page: 1
        });

        console.log('✅ Search response:', result);
        console.log('💾 Cache Hit Status:', result?.cache_hit);
        console.log('📊 Remaining Quota:', result?.remaining_quota);

        // Update quota if remaining_quota is provided in response
        if (result?.remaining_quota !== undefined) {
          console.log('🔄 Updating Amazon Search quota:', result.remaining_quota);
          updateAmazonSearchQuota(result.remaining_quota);
        }

        console.log('Search products fetched:', {
          totalProducts: result?.data?.products?.length || 0,
          cacheHit: result?.cache_hit,
          remainingQuota: result?.remaining_quota
        });

        return result;
      } catch (error) {
        console.error('❌ Error fetching search results:', error);
        throw error;
      }
    },
    enabled: false, // ✅ CRITICAL: Manual trigger only - no automatic fetching
    staleTime: 0, // ✅ FIXED: Always fetch fresh data to check backend cache
    gcTime: 1000 * 60 * 30, // 30 minutes - prevent garbage collection refetches
    retry: 1, // Only retry once
    retryDelay: 2000, // Fixed 2 second delay
    refetchOnWindowFocus: false, // ✅ Never refetch on window focus
    refetchOnMount: false, // ✅ Never refetch on mount
    refetchOnReconnect: false, // ✅ Never refetch on reconnect
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
      try {
        console.log('📦 Fetching category products:', { country, category: selectedCategory });

        // ✅ Fetch from selected country
        const result = await getAmazonExplorerProductsByCategory({
          category_id: selectedCategory,
          country: country, // ✅ Use selected country
          page: 1
        });

        console.log('✅ Category response:', result);
        console.log('💾 Cache Hit Status:', result?.cache_hit);
        console.log('📊 Remaining Quota:', result?.remaining_quota);

        // Update quota if remaining_quota is provided in response
        if (result?.remaining_quota !== undefined) {
          console.log('🔄 Updating Amazon Search quota:', result.remaining_quota);
          updateAmazonSearchQuota(result.remaining_quota);
        }

        console.log('Category products fetched:', {
          totalProducts: result?.data?.products?.length || 0,
          cacheHit: result?.cache_hit,
          remainingQuota: result?.remaining_quota
        });

        return result;
      } catch (error) {
        console.error('❌ Error fetching category products:', error);
        throw error;
      }
    },
    enabled: false, // ✅ CRITICAL: Manual trigger only - no automatic fetching
    staleTime: 0, // ✅ FIXED: Always fetch fresh data to check backend cache
    gcTime: 1000 * 60 * 30, // 30 minutes - prevent garbage collection refetches
    retry: 1, // Only retry once
    retryDelay: 2000, // Fixed 2 second delay
    refetchOnWindowFocus: false, // ✅ Never refetch on window focus
    refetchOnMount: false, // ✅ Never refetch on mount
    refetchOnReconnect: false, // ✅ Never refetch on reconnect
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
        enabled: !!selectedCategoryId,
        timestamp: new Date().toISOString()
      });

      console.log('📦 Using Category ID:', {
        selectedCategoryId,
        categoryIdType: typeof selectedCategoryId,
        country: country,
        selectedMainCategory,
        selectedSubcategory,
        selectedCategoryPath
      });

      try {
        // ✅ Fetch from selected country - selectedCategoryId is already the subcategory_id
        const result = await getAmazonProductsByCategoryDirect({
          categoryId: selectedCategoryId, // ✅ Use selectedCategoryId directly (it's the subcategory_id)
          country: country, // ✅ Use selected country
          page: 1,
          sortBy: 'RELEVANCE',
          productCondition: 'NEW',
          isPrime: false,
          dealsAndDiscounts: 'NONE',
        });

        console.log('✅ Category products response:', result);
        console.log('💾 Cache Hit Status:', result?.cache_hit);
        console.log('📊 Remaining Quota:', result?.remaining_quota);

        // Update quota if remaining_quota is provided in response
        if (result?.remaining_quota !== undefined) {
          console.log('🔄 Updating Amazon Search quota:', result.remaining_quota);
          updateAmazonSearchQuota(result.remaining_quota);
        }

        console.log('🎯 Products Fetched:', {
          categoryId: selectedCategoryId,
          totalProducts: result?.data?.products?.length || 0,
          cacheHit: result?.cache_hit,
          remainingQuota: result?.remaining_quota
        });

        // Return the result with shuffled products
        return result;
      } catch (error) {
        console.error('❌ Error fetching products:', error);
        throw error;
      }
    },
    enabled: false, // ✅ CRITICAL: Disable ALL automatic fetching - only fetch when button is clicked
    staleTime: 0, // ✅ FIXED: Always fetch fresh data to check backend cache
    gcTime: 1000 * 60 * 30, // 30 minutes - prevent garbage collection refetches
    retry: 1, // Only retry once
    retryDelay: 2000, // Fixed 2 second delay
    refetchOnWindowFocus: false, // ✅ Never refetch on window focus
    refetchOnMount: false, // ✅ Never refetch on mount
    refetchOnReconnect: false, // ✅ Never refetch on reconnect
  });

  // No longer fetching categories from API - using local JSON for all countries

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

  // Handle search with keyword filtering
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    // Check for blocked keywords
    const keywordCheck = checkForBlockedKeywords(searchQuery);
    if (keywordCheck.isBlocked) {
      toast.error(`Keyword blocked: ${getBlockedContentMessage(keywordCheck.category)}`);
      console.warn('Blocked search attempt:', {
        query: searchQuery,
        matchedKeywords: keywordCheck.matchedKeywords,
        category: keywordCheck.category
      });
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
      willTriggerDirectQuery: false // Changed to false - wait for button click
    });

    // Don't auto-fetch - wait for user to click Discover Products button
  };

  // Handle Discover Products button click
  const handleDiscoverProducts = () => {
    console.log('🔍 Discover Products clicked:', {
      viewMode,
      selectedCategoryId,
      country,
      selectedType
    });

    if (selectedCategoryId) {
      // If a category is selected, fetch category products
      console.log('📦 Fetching category products...');
      refetchDirectCategoryProducts();
    } else {
      // If no category selected, fetch best sellers
      console.log('🏆 Fetching best sellers...');
      refetchBestSellers();
    }
  };

  // Handle product details view
  const handleViewDetails = (product: AmazonProduct) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  // Handle discover suppliers from product card - opens modal and starts discovery
  const handleDiscoverSuppliersFromCard = async (product: AmazonProduct) => {
    console.log('🚀 Starting discover suppliers from card for Amazon Explorer product:', product.product_title);

    // Set the product and open modal with auto-start flag
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
    setAutoStartSupplierDiscovery(true);
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

    // Show category products if a category is selected (regardless of view mode)
    if (selectedCategoryId && directCategoryProductsData?.data?.products) {
      const products = directCategoryProductsData.data.products;
      console.log('✅ Using direct category products:', products.length);
      // Ensure we return an array
      return Array.isArray(products) ? products : [];
    }

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
    // Show category product count if a category is selected (regardless of view mode)
    if (selectedCategoryId && directCategoryProductsData?.data?.products) {
      const products = directCategoryProductsData.data.products;
      return Array.isArray(products) ? products.length : 0;
    }

    if (viewMode === 'category' && selectedCategoryId && directCategoryProductsData?.data?.products) {
      const products = directCategoryProductsData.data.products;
      return Array.isArray(products) ? products.length : 0;
    }
    return currentData?.data?.total || 0;
  };

  const getIsLoading = () => {
    // Show loading state if a category is selected (regardless of view mode)
    if (selectedCategoryId) {
      return directCategoryProductsLoading;
    }

    if (viewMode === 'category' && selectedCategoryId) {
      return directCategoryProductsLoading;
    }
    return isLoading;
  };

  const getError = () => {
    // Show error state if a category is selected (regardless of view mode)
    if (selectedCategoryId) {
      return directCategoryProductsError;
    }

    if (viewMode === 'category' && selectedCategoryId) {
      return directCategoryProductsError;
    }
    return error;
  };

  // ✅ Get cache hit status from current data source
  const getCacheHitStatus = (): boolean | undefined => {
    // Check direct category products first (when category is selected)
    if (selectedCategoryId && directCategoryProductsData) {
      console.log('🔍 Cache Hit Check (Category):', {
        selectedCategoryId,
        cache_hit: directCategoryProductsData.cache_hit,
        fullData: directCategoryProductsData
      });
      return directCategoryProductsData.cache_hit;
    }

    // Otherwise check current data based on view mode
    console.log('🔍 Cache Hit Check (Other):', {
      viewMode,
      cache_hit: currentData?.cache_hit,
      fullData: currentData
    });
    return currentData?.cache_hit;
  };

  // ✅ Get remaining quota from current data source
  const getRemainingQuota = (): number | undefined => {
    // Check direct category products first (when category is selected)
    if (selectedCategoryId && directCategoryProductsData) {
      return directCategoryProductsData.remaining_quota;
    }

    // Otherwise check current data based on view mode
    return currentData?.remaining_quota;
  };

  const products = getProducts();
  const totalProducts = getTotalProducts();
  const finalIsLoading = getIsLoading();
  const finalError = getError();
  const cacheHit = getCacheHitStatus();
  const remainingQuota = getRemainingQuota();

  console.log('📊 Final Display Values:', {
    cacheHit,
    remainingQuota,
    productsCount: products.length,
    selectedCategoryId,
    viewMode
  });

  // Pagination calculations
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  // Reset to page 1 when products change
  useEffect(() => {
    setCurrentPage(1);
  }, [products.length, viewMode, selectedCategoryId]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md dark:shadow-lg">
        <div className="p-6">
          <h2 className="text-3xl font-bold text-blue-900 dark:text-white mb-2">BlueRitt SocialPulse</h2>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-[orange]" />
                Amazon Trends
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Discover trending products, search by keywords, or browse by category</p>
            </div>



            {/* ✅ Removed tabs - only Best Sellers view now */}

          </div>
          {/* Subscription Quota Alert */}
          {/* <div className="mb-6">
                    <SearchesAlert
                      quotaDetails={quotaDetails}
                      searchType="Amazon Trends Searches"
                      addOnName="Amazon Trends Search"
                    />
                  </div> */}

          <div className="mt-4 mb-4">
            {quotaDetails ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-blue-900 dark:text-blue-200 text-sm font-semibold mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      {quotaDetails.packageName} Plan Features
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Amazon Searches */}
                      <div className="bg-white  dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-blue-700">
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Amazon Trend Searches</div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                          {amazonSearchQuotaDetails.quotaValue === -1 ? '∞' : amazonSearchQuotaDetails.quotaValue}
                        </div>
                      </div>

                      {/* Supplier Discoveries */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-100 dark:border-purple-700">
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Supplier Discoveries</div>
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">
                          {supplierQuotaDetails.quotaValue === -1 ? '∞' : supplierQuotaDetails.quotaValue}
                        </div>
                      </div>

                      {/* Add-ons Button */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-3 border border-green-200 dark:border-green-700 flex flex-col justify-center items-center cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setShowAddOnsChoiceModalAmazon(true)}>
                        <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400 mb-1" />
                        <div className="text-xs text-green-700 dark:text-green-300 font-semibold text-center">Add-ons</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm">Loading subscription details...</p>
              </div>
            )}
          </div>


          {/* Search and Filter Controls - Always Visible */}
          <div className="space-y-4 mb-6">
            {/* Country, Type, and Category Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Select Country
                  </label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setSelectedCategoryId(''); // Reset selected category when country changes
                      }}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer"
                    >
                      {AMAZON_COUNTRIES.map((countryOption) => (
                        <option key={countryOption.value} value={countryOption.value}>
                          {countryOption.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Trend Type
                  </label>
                  <div className="relative">
                    <select
                      value={selectedType}
                      onChange={(e) => {
                        setSelectedType(e.target.value);
                        setPage(1);
                        // ✅ Don't auto-fetch - only fetch when "Discover Products" button is clicked
                      }}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer"
                    >
                      {amazonTrendsTypes.map((type) => (
                        <option key={type.value} value={type.value} title={type.description}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  </div>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Select Category (Optionalll)
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
                </div> */}

                {/* Main Category Dropdown - Dynamically loaded from API */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Main Category {categoriesLoading && <span className="text-xs text-gray-500">(Loading...)</span>}
                  </label>
                  <div className="relative">
                    <select
                      value={selectedMainCategory}
                      onChange={(e) => {
                        setSelectedMainCategory(e.target.value);
                        setPage(1);
                        // Don't auto-fetch - wait for user to select subcategory and click Discover Products button
                      }}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer"
                      disabled={categoriesLoading}
                    >
                      <option value="">Select Main Category</option>
                      {mainCategories.map((category: any, index: number) => (
                        <option
                          key={category.category || index}
                          value={category.category}
                        >
                          {category.category}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Subcategory Dropdown - Shows when main category is selected */}
              {selectedMainCategory && currentSubcategories.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Subcategory
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSubcategory}
                      onChange={(e) => {
                        const subcategoryName = e.target.value;
                        setSelectedSubcategory(subcategoryName);

                        // Find the subcategory to get the actual category ID
                        const subcat = currentSubcategories.find((sub: any) => sub.subcategory_name === subcategoryName);
                        if (subcat) {
                          // Extract the subcategory_id from the ids object
                          // Format: { category_id: "gift-cards", subcategory_id: "120225710011" }
                          let subcategoryId = '';

                          if (typeof subcat.ids === 'object' && subcat.ids !== null) {
                            // Extract subcategory_id from the ids object
                            subcategoryId = subcat.ids.subcategory_id || subcat.ids.id || subcat.ids.category_id || '';
                          } else if (typeof subcat.ids === 'string') {
                            subcategoryId = subcat.ids;
                          } else {
                            subcategoryId = String(subcat.ids);
                          }

                          setSelectedCategoryId(subcategoryId);
                          setSelectedCategoryPath(`${selectedMainCategory} > ${subcategoryName}`);
                          console.log('✅ Subcategory selected:', {
                            subcategoryName,
                            subcatObject: subcat,
                            idsField: subcat.ids,
                            idsType: typeof subcat.ids,
                            extractedSubcategoryId: subcategoryId,
                            path: `${selectedMainCategory} > ${subcategoryName}`
                          });
                        }

                        setPage(1);
                        // Don't auto-fetch - wait for user to click Discover Products button
                      }}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="">Select Subcategory</option>
                      {currentSubcategories.map((subcategory: any, index: number) => (
                        <option
                          key={subcategory.subcategory_name || index}
                          value={subcategory.subcategory_name}
                        >
                          {subcategory.subcategory_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* ✅ Search Input - Added below category selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Search Products (Optional)
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setSearchQuery(newValue);

                        // Real-time keyword checking for immediate feedback
                        if (newValue.trim()) {
                          const keywordCheck = checkForBlockedKeywords(newValue);
                          if (keywordCheck.isBlocked) {
                            // Visual feedback for blocked content
                            e.target.style.borderColor = '#ef4444';
                          } else {
                            e.target.style.borderColor = '';
                          }
                        } else {
                          e.target.style.borderColor = '';
                        }
                      }}
                      placeholder="Search for products..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!searchQuery.trim()) {
                        toast.error('Please enter a search query');
                        return;
                      }

                      // Check for blocked keywords before searching
                      const keywordCheck = checkForBlockedKeywords(searchQuery);
                      if (keywordCheck.isBlocked) {
                        toast.error(`Blocked content detected: ${keywordCheck.matchedKeywords.join(', ')}`);
                        return;
                      }

                      // Check backend quota before searching
                      if (amazonSearchQuotaDetails.quotaValue <= 0) {
                        setShowAddOnsChoiceModalAmazon(true);
                        return;
                      }

                      console.log('🔍 Search button clicked:', { searchQuery, country });
                      setPage(1);
                      setViewMode('search'); // ✅ Switch to search view mode
                      refetchSearch();
                    }}
                    disabled={!searchQuery.trim()}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </div>
              </div>

              {/* Discover Products Button */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleDiscoverProducts}
                  disabled={bestSellersLoading || directCategoryProductsLoading || !selectedCategoryId}
                  className="bg-gradient-to-r from-[#ffa41c] to-[#ff6201] dark:bg-orange-600 text-white py-3 px-6 rounded-lg hover:from-[#ffa41c] hover:to-[#ff6201] dark:hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  {selectedCategoryId ? 'Discover Trending Products' : 'Discover Trending Products'}
                </button>
              </div>

              {/* Type Description */}
              {/* <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    {amazonTrendsTypes.find(type => type.value === selectedType)?.name}:
                  </span>
                  <span className="text-sm text-blue-700 dark:text-gray-300">
                    {amazonTrendsTypes.find(type => type.value === selectedType)?.description}
                  </span>
                </div>
              </div> */}

              {/* Category Loading State - No longer needed as categories load from local JSON */}

              {/* Selected Category Display */}
              {selectedCategoryId && (
                <div className="bg-orange-50 dark:bg-gray-800 border border-orange-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-semibold">
                        <span className="w-1.5 h-1.5 bg-orange-500 dark:bg-orange-400 rounded-full"></span>
                        Category Selected
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {selectedCategoryPath || 'Selected Category'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {AMAZON_COUNTRIES.find(c => c.value === country)?.label || country}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {amazonTrendsTypes.find(type => type.value === selectedType)?.name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMainCategory('');
                        setSelectedSubcategory('');
                        setSelectedCategoryId('');
                        setSelectedCategoryPath('');
                        setCurrentSubcategories([]);
                        setViewMode('best-sellers');
                        setPage(1);
                        // ✅ Don't auto-fetch - user needs to click "Discover Products" button
                      }}
                      className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 text-sm font-medium"
                    >
                      Clear Category
                    </button>
                  </div>
                </div>
              )}
          </div>




        </div>
      </div>

      {/* Product Count and Products Grid */}
      <div className="">
        {!isLoading && products.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
            <span>
              Showing {startIndex + 1}-{Math.min(endIndex, products.length)} of {products.length} products
            </span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}

        {/* ✅ Cache Hit Indicator - Shows when data is from 7-day cache */}
        {!finalIsLoading && products.length > 0 && cacheHit === true && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-4 border border-green-200 dark:border-green-700 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Loaded from Saved Results - Quota Not Deducted
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Quota Not Deducted. This data will remain available for 7 days from the first search.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Fresh Data Indicator - Shows when data is from API (quota deducted) */}
        {!finalIsLoading && products.length > 0 && cacheHit === false && remainingQuota !== undefined && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  New Search – Quota Deducted
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  New data fetched from Amazon. 1 search quota deducted. Results cached for 7 days. Remaining searches: {remainingQuota}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          {finalIsLoading ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center py-8">
              <AmazonLoader
                size="lg"
                text={`Loading ${viewMode === 'search' ? 'Amazon search results' :
                  viewMode === 'best-sellers' ? 'Amazon Trending Products' :
                    viewMode === 'category' ? 'Amazon category products' : 'Amazon products'}...`}
              />
            </div>
            <div className="p-3 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-6">
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
          <div className="p-3 sm:p-6 bg-white dark:bg-gray-800 ">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-10">
              {paginatedProducts.map((product: any, index: number) => (
                <ProductCard
                  key={`${product.asin}-${index}`}
                  product={product}
                  onViewDetails={() => handleViewDetails(product)}
                  onDiscoverSuppliers={() => handleDiscoverSuppliersFromCard(product)}
                  country={country}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <button
                        onClick={() => setCurrentPage(1)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        1
                      </button>
                      <span className="text-gray-500 dark:text-gray-400">...</span>
                    </>
                  )}

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(pageNum => {
                      return pageNum === currentPage ||
                        pageNum === currentPage - 1 ||
                        pageNum === currentPage + 1 ||
                        (currentPage <= 2 && pageNum <= 3) ||
                        (currentPage >= totalPages - 1 && pageNum >= totalPages - 2);
                    })
                    .map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-[#ffa41c] to-[#ff6201] text-white border-transparent'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                  {/* Last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      <span className="text-gray-500 dark:text-gray-400">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          isOpen={isDetailsModalOpen}
          autoStartSupplierDiscovery={autoStartSupplierDiscovery}
          country={country}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedProduct(null);
            setAutoStartSupplierDiscovery(false);
          }}
        />
      )}

      {/* Add-ons Modal */}
      {showAddOnsChoiceModalAmazon && (
        <AddOnsChoiceModalAmazon
          isOpen={showAddOnsChoiceModalAmazon}
          onClose={() => setShowAddOnsChoiceModalAmazon(false)}
        />
      )}
    </div>
  );
};

// Product Card Component
interface ProductCardProps {
  product: AmazonProduct;
  onViewDetails: () => void;
  onDiscoverSuppliers: () => void;
  country: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, onDiscoverSuppliers, country }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
        <img
          src={getProductImageUrl(product)}
          alt={product.product_title}
          className="w-full h-full object-contain p-[6px]"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            // Prevent infinite loop by checking if we've already tried the placeholder
            if (!img.src.includes('placeholder-product.png')) {
              img.src = '/placeholder-product.png';
            }
          }}
        />
        {product.is_best_seller && (
          <div className="absolute top-2 left-2 bg-[#ff6201] text-white text-xs px-2 py-1 rounded-md">
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
      <div className="p-4 flex flex-col flex-1">
        {/* Content that grows */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white hover:text-[#de7a22] dark:hover:text-orange-400 text-sm line-clamp-2 mb-4">
            {product.product_title}
          </h3>

          {/* Price and Rating */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatPrice(product.product_price || '', country)}
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
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="space-y-2 mt-auto pt-4">
          {/* Discover Suppliers Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDiscoverSuppliers();
            }}
            className="w-full bg-[#213168] text-white py-2 px-3 rounded-lg hover:bg-[#0f1a35] transition-all duration-200 text-sm flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Discover Suppliers
          </button>

          {/* View Details and Amazon Link */}
          <div className="flex gap-2">
            <button
              onClick={onViewDetails}
              className="flex-1 bg-gradient-to-r from-[#ffa41c] to-[#ff6201] dark:bg-orange-600 text-white py-2 px-3 rounded-lg hover:from-[#ffa41c] hover:to-[#ff6201] dark:hover:bg-orange-700 transition-colors text-sm flex items-center justify-center gap-1"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            <a
              href={getAmazonUrl(product, country)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductExplorer;
