import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { Search, TrendingUp, Star, ShoppingCart, Award, Crown, Zap, Filter, X, ChevronLeft, ChevronRight, Eye, FolderTree, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { Drawer } from '@mui/material';
import LoadingSpinner from '../../../../../components/LoadingSpinner';
import ProductLoadingSkeleton from '../../../../../components/ProductLoadingSkeleton';
import AmazonLoader from '../../../../../components/AmazonLoader';

import {
  amazonTrendsSearch,
  getTrendingProducts,
  getAmazonBestSellers,
  getAmazonDeals,
  getAmazonTrendsProductsByCategory,
  getAmazonCategoryList,
  getAmazonCategoryListDirect,
  getAmazonProductsByCategoryDirect,
  AmazonTrendingProduct,
  AmazonCategory,
  parseAmazonPrice,
  formatTrendingScore,
  getTrendingBadge,
  sortProductsByTrending,
  getTopInfluencers,
  InfluencerProfile,
} from '@/api/amazonTrends';

import {
  loadAmazonCategories,
  getRootCategories,
  getSubcategories,
  getCategoryById,
  searchCategories,
  extractCategoryId,
  formatCategoryDisplay,
  AmazonCategoryItem,
} from '@/utils/amazonCategories';

import AmazonTrendsProductDetailsModal from './AmazonTrendsProductDetailsModal';
import CategorySelector from './CategorySelector';
import { useUserSubscriptionAndSearchQuota } from '../../../../../hooks/useUserDetails';
import { QuotaNames } from '../../../../../enum';


interface AmazonTrendsProps {
  onProductSelect?: (product: AmazonTrendingProduct) => void;
}

interface FilterState {
  category_id: string;
  sort_by: string;
  product_condition: string;
  is_prime: boolean;
  deals_and_discounts: string;
  min_price: number;
  max_price: number;
  four_stars_and_up: boolean;
  brand: string;
}

const AmazonTrends: React.FC<AmazonTrendsProps> = ({ onProductSelect }) => {
  const dispatch = useDispatch();
  const selectedAsinProducts = useSelector((state: any) => state.selectedAsinProducts);

  // Subscription quota management
  const { quotaDetails, updateQuota } = useUserSubscriptionAndSearchQuota(QuotaNames.AmazonSearch);
  const { quotaDetails: supplierQuotaDetails } = useUserSubscriptionAndSearchQuota(QuotaNames.SupplierDiscovery);

  // Debug quota details
  console.log('Amazon Trends - Quota Details:', quotaDetails);
  console.log('Amazon Trends - Supplier Discovery Quota:', supplierQuotaDetails);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US'); // Default to UK as requested
  const [activeTab, setActiveTab] = useState<'search' | 'trending' | 'bestsellers' | 'deals' | 'category'>('trending');
  const [isSearching, setIsSearching] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [bestSellersCategory, setBestSellersCategory] = useState('');
  const [bestSellersType, setBestSellersType] = useState('BEST_SELLERS');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [selectedRootCategory, setSelectedRootCategory] = useState<string | null>(null);
  const [influencers, setInfluencers] = useState<InfluencerProfile[]>([]);
  const [influencersLoading, setInfluencersLoading] = useState(false);
  const [showAddOnsModal, setShowAddOnsModal] = useState(false);

  // Country list with all supported countries
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

  // Product Details Modal State
  const [selectedProduct, setSelectedProduct] = useState<AmazonTrendingProduct | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    category_id: '281407', // Default software category
    sort_by: 'RELEVANCE',
    product_condition: 'ALL',
    is_prime: false,
    deals_and_discounts: 'NONE',
    min_price: 0,
    max_price: 0,
    four_stars_and_up: false,
    brand: '',
  });

  // Load Amazon categories from local JSON file
  const { rootCategories, allCategories } = useMemo(() => loadAmazonCategories(), []);

  // Load influencers on component mount
  React.useEffect(() => {
    const loadInfluencers = async () => {
      setInfluencersLoading(true);
      try {
        const data = await getTopInfluencers(selectedCountry);
        setInfluencers(data);
      } catch (error) {
        console.error('Error loading influencers:', error);
        setInfluencers([]);
      } finally {
        setInfluencersLoading(false);
      }
    };

    loadInfluencers();
  }, [selectedCountry]);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!categorySearchTerm.trim()) {
      return rootCategories;
    }
    const searchResults = searchCategories(categorySearchTerm);
    // Group search results by root category
    const grouped = new Map<string, AmazonCategoryItem[]>();
    searchResults.forEach(cat => {
      if (cat.is_root) {
        grouped.set(cat.id, [cat]);
      } else if (cat.parent_id) {
        const existing = grouped.get(cat.parent_id) || [];
        existing.push(cat);
        grouped.set(cat.parent_id, existing);
      }
    });

    // Convert to root categories with filtered subcategories
    return Array.from(grouped.entries()).map(([rootId, cats]) => {
      const rootCat = cats.find(c => c.is_root) || getCategoryById(rootId);
      const subcats = cats.filter(c => !c.is_root);
      return {
        ...rootCat!,
        subcategories: subcats.length > 0 ? subcats : undefined
      };
    }).filter(Boolean);
  }, [categorySearchTerm, rootCategories]);

  // Get subcategories for selected root category
  const displayedSubcategories = useMemo(() => {
    if (!selectedRootCategory) return [];
    return getSubcategories(selectedRootCategory);
  }, [selectedRootCategory]);

  // Trending Products Query
  const {
    data: trendingData,
    isLoading: trendingLoading,
    refetch: refetchTrending,
  } = useQuery({
    queryKey: ['trending-products', selectedCountry],
    queryFn: async () => {
      const response = await getTrendingProducts({ country: selectedCountry, limit: 20 });

      // Update quota if remaining_quota is provided in response
      if (response?.remaining_quota !== undefined) {
        console.log('🔄 Amazon Trending Products - Updating quota:', response.remaining_quota);
        updateQuota(response.remaining_quota);
      }

      return response;
    },
    enabled: activeTab === 'trending',
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    retryDelay: 2000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Search Results Query
  const {
    data: searchData,
    isLoading: searchLoading,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ['amazon-trends-search', searchQuery, selectedCountry, filters, currentPage, bestSellersCategory],
    queryFn: async () => {
      const response = await amazonTrendsSearch({
        query: searchQuery,
        country: selectedCountry,
        page: currentPage,
        sort_by: filters.sort_by,
        product_condition: filters.product_condition,
        is_prime: filters.is_prime,
        deals_and_discounts: filters.deals_and_discounts,
        min_price: filters.min_price > 0 ? filters.min_price : undefined,
        max_price: filters.max_price > 0 ? filters.max_price : undefined,
        brand: filters.brand || undefined,
        four_stars_and_up: filters.four_stars_and_up,
        category: bestSellersCategory || undefined,
      });

      // Update quota if remaining_quota is provided in response
      if (response?.remaining_quota !== undefined) {
        console.log('🔄 Amazon Search - Updating quota:', response.remaining_quota);
        updateQuota(response.remaining_quota);
      }

      return response;
    },
    enabled: false, // Manual trigger only
    staleTime: 1000 * 60 * 2, // 2 minutes - faster refresh for search results
    retry: 1,
    retryDelay: 2000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Best Sellers Query
  const {
    data: bestSellersData,
    isLoading: bestSellersLoading,
    refetch: refetchBestSellers,
  } = useQuery({
    queryKey: ['amazon-best-sellers', selectedCountry, bestSellersCategory, bestSellersType, currentPage],
    queryFn: async () => {
      const response = await getAmazonBestSellers({
        category: bestSellersCategory,
        type: bestSellersType,
        country: selectedCountry,
        page: currentPage
      });

      // Update quota if remaining_quota is provided in response
      if (response?.remaining_quota !== undefined) {
        console.log('🔄 Amazon Best Sellers - Updating quota:', response.remaining_quota);
        updateQuota(response.remaining_quota);
      }

      return response;
    },
    enabled: activeTab === 'bestsellers',
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    retryDelay: 2000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Deals Query
  const {
    data: dealsData,
    isLoading: dealsLoading,
    refetch: refetchDeals,
  } = useQuery({
    queryKey: ['amazon-deals', selectedCountry],
    queryFn: async () => {
      const response = await getAmazonDeals({ country: selectedCountry });

      // Update quota if remaining_quota is provided in response
      if (response?.remaining_quota !== undefined) {
        console.log('🔄 Amazon Deals - Updating quota:', response.remaining_quota);
        updateQuota(response.remaining_quota);
      }

      return response;
    },
    enabled: activeTab === 'deals',
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 1,
    retryDelay: 2000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Products by Category Query - Using direct Amazon API with extracted category ID
  const {
    data: categoryProductsData,
    isLoading: categoryProductsLoading,
    error: categoryProductsError,
  } = useQuery({
    queryKey: ['amazon-products-by-category-direct', selectedCategoryId, selectedCountry, currentPage],
    queryFn: async () => {
      // Extract the actual category ID (e.g., "appliances/3741261" -> "3741261")
      const actualCategoryId = extractCategoryId(selectedCategoryId);

      console.log('🔍 Fetching products for category:', {
        selectedCategoryId,
        actualCategoryId,
        country: selectedCountry,
        page: currentPage
      });

      const response = await getAmazonProductsByCategoryDirect({
        categoryId: actualCategoryId,
        country: selectedCountry,
        page: currentPage,
        sortBy: filters.sort_by as any,
        productCondition: filters.product_condition as any,
        isPrime: filters.is_prime,
        dealsAndDiscounts: filters.deals_and_discounts as any,
      });

      // Update quota if remaining_quota is provided in response
      if (response?.remaining_quota !== undefined) {
        console.log('🔄 Amazon Category Products - Updating quota:', response.remaining_quota);
        updateQuota(response.remaining_quota);
      }

      return response;
    },
    enabled: activeTab === 'category' && !!selectedCategoryId, // Only run when in category tab and a category is selected
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    retryDelay: 2000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Category Products Query
  const {
    data: categoryData,
    isLoading: categoryLoading,
    refetch: refetchCategory,
  } = useQuery({
    queryKey: ['amazon-category', selectedCountry, selectedCategoryId, filters],
    queryFn: async () => {
      const response = await getAmazonTrendsProductsByCategory({
        category_id: selectedCategoryId || filters.category_id,
        country: selectedCountry,
        page: 1,
        sort_by: filters.sort_by,
        product_condition: filters.product_condition,
        is_prime: filters.is_prime,
        deals_and_discounts: filters.deals_and_discounts,
        min_price: filters.min_price > 0 ? filters.min_price : undefined,
        max_price: filters.max_price > 0 ? filters.max_price : undefined,
        brand: filters.brand || undefined,
        four_stars_and_up: filters.four_stars_and_up,
      });

      // Update quota if remaining_quota is provided in response
      if (response?.remaining_quota !== undefined) {
        console.log('🔄 Amazon Category - Updating quota:', response.remaining_quota);
        updateQuota(response.remaining_quota);
      }

      return response;
    },
    enabled: activeTab === 'category' && !!(selectedCategoryId || filters.category_id),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    retryDelay: 2000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsSearching(true);
    setActiveTab('search');
    setCurrentPage(1); // Reset to first page

    try {
      await refetchSearch();
      toast.success('Search completed!');
    } catch (error) {
      toast.error('Search failed. Please try again.');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refetch data based on active tab
    if (activeTab === 'search') {
      refetchSearch();
    } else if (activeTab === 'bestsellers') {
      refetchBestSellers();
    } else if (activeTab === 'category') {
      refetchCategory();
    }
  };

  const handleCategoryChange = (category: string) => {
    setBestSellersCategory(category);
    setCurrentPage(1); // Reset to first page
    if (activeTab === 'bestsellers') {
      refetchBestSellers();
    } else if (activeTab === 'search' && searchQuery.trim()) {
      refetchSearch();
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    console.log('🏷️ Category selected:', categoryId);
    setSelectedCategoryId(categoryId);
    setCurrentPage(1); // Reset to first page

    // Update filters to include the selected category
    setFilters(prev => ({ ...prev, category_id: categoryId }));

    // The categoryProductsData query will automatically refetch due to the dependency changes
    console.log('✅ Category selected, query should refetch');
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleRootCategoryClick = (categoryId: string) => {
    // If clicking the same root category, collapse it
    if (selectedRootCategory === categoryId) {
      setSelectedRootCategory(null);
      toggleCategoryExpansion(categoryId);
    } else {
      // Expand the new root category
      setSelectedRootCategory(categoryId);
      if (!expandedCategories.has(categoryId)) {
        toggleCategoryExpansion(categoryId);
      }
    }
  };

  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setActiveTab('category');
    setIsFilterOpen(false);
    updateActiveFilterCount();
    refetchCategory();
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      category_id: '281407',
      sort_by: 'RELEVANCE',
      product_condition: 'ALL',
      is_prime: false,
      deals_and_discounts: 'NONE',
      min_price: 0,
      max_price: 0,
      four_stars_and_up: false,
      brand: '',
    };
    setFilters(clearedFilters);
    setActiveFilterCount(0);
  };

  const updateActiveFilterCount = () => {
    const count = Object.entries(filters).filter(([key, value]) => {
      if (key === 'category_id' && value === '281407') return false;
      if (key === 'sort_by' && value === 'RELEVANCE') return false;
      if (key === 'product_condition' && value === 'ALL') return false;
      if (key === 'deals_and_discounts' && value === 'NONE') return false;
      if (key === 'min_price' && value === 0) return false;
      if (key === 'max_price' && value === 0) return false;
      if (key === 'is_prime' && value === false) return false;
      if (key === 'four_stars_and_up' && value === false) return false;
      if (key === 'brand' && value === '') return false;
      return true;
    }).length;
    setActiveFilterCount(count);
  };

  const handleProductClick = (product: AmazonTrendingProduct) => {
    // Open product details modal instead of redirecting to MarginMax
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  // Handle product details view
  const handleViewDetails = (product: AmazonTrendingProduct) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const renderProductCard = (product: AmazonTrendingProduct, index: number) => {
    const badge = getTrendingBadge(product);
    const price = parseAmazonPrice(product.product_price || '0');
    const rating = parseFloat(product.product_star_rating || '0');

    return (
      <div
        key={`${product.asin}-${index}`}
        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
        onClick={() => handleProductClick(product)}
      >
        {/* Product Image */}
        <div className="relative h-48 bg-gray-100">
          {product.product_photo ? (
            <img
              src={product.product_photo}
              alt={product.product_title}
              className="w-full h-full object-contain p-4"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-product.png';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.source === 'trending' && (
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Trending
              </span>
            )}
            {badge && (
              <span className={`text-white text-xs px-2 py-1 rounded-full ${
                badge === 'Best Seller' ? 'bg-orange-500' :
                badge === "Amazon's Choice" ? 'bg-blue-500' :
                badge === 'Prime' ? 'bg-blue-600' :
                'bg-green-500'
              }`}>
                {badge === 'Best Seller' && <Award className="w-3 h-3 inline mr-1" />}
                {badge === "Amazon's Choice" && <Crown className="w-3 h-3 inline mr-1" />}
                {badge === 'Prime' && <Zap className="w-3 h-3 inline mr-1" />}
                {badge}
              </span>
            )}
          </div>

          {/* Trending Score */}
          {product.source === 'trending' && product.trending_score > 0 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
              Score: {formatTrendingScore(product.trending_score)}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
            {product.product_title}
          </h3>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">
                {rating > 0 ? rating.toFixed(1) : 'N/A'}
              </span>
              {product.product_num_ratings && (
                <span className="text-xs text-gray-500">
                  ({product.product_num_ratings.toLocaleString()})
                </span>
              )}
            </div>
            
            {price > 0 && (
              <span className="font-bold text-green-600">
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Trending Stats */}
          {product.source === 'trending' && (
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t">
              <span>Searches: {product.search_count}</span>
              <span className="text-purple-600 font-medium">
                Trending #{index + 1}
              </span>
            </div>
          )}

          {/* Brand */}
          {product.brand && (
            <div className="text-xs text-gray-500 mt-1">
              by {product.brand}
            </div>
          )}

          {/* View Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(product);
            }}
            className="w-full mt-3 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
        </div>
      </div>
    );
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'search':
        return searchData?.data?.products || [];
      case 'trending':
        return trendingData?.data?.products || [];
      case 'bestsellers':
        return bestSellersData?.data?.best_sellers || [];
      case 'deals':
        return dealsData?.data?.deals || [];
      case 'category':
        // Prioritize direct API data when available, fallback to trends API data
        const directProducts = categoryProductsData?.data?.products || [];
        const trendsProducts = categoryData?.data?.products || [];

        console.log('🔍 Category data debug:', {
          selectedCategoryId,
          hasDirectProducts: directProducts.length > 0,
          hasTrendsProducts: trendsProducts.length > 0,
          directProductsCount: directProducts.length,
          trendsProductsCount: trendsProducts.length,
          categoryProductsLoading,
          categoryLoading
        });

        // Use direct API data if available, otherwise use trends API data
        return directProducts.length > 0 ? directProducts : trendsProducts;
      default:
        return [];
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'search':
        return searchLoading || isSearching;
      case 'trending':
        return trendingLoading;
      case 'bestsellers':
        return bestSellersLoading;
      case 'deals':
        return dealsLoading;
      case 'category':
        // Show loading if either query is loading
        return categoryProductsLoading || categoryLoading;
      default:
        return false;
    }
  };

  const products = sortProductsByTrending(getCurrentData());
  const isLoading = getCurrentLoading();

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-purple-600" />
          Amazon Trends
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover trending products, search by keywords, or browse by category
        </p>

        {/* Subscription Quota Alert */}
        <div className="mt-4">
          {quotaDetails ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-blue-900 dark:text-blue-200 text-sm font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    {quotaDetails.packageName} Plan Features
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Amazon Trends Searches */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-blue-700">
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Product Searches</div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {quotaDetails.quotaValue === -1 ? '∞' : quotaDetails.quotaValue}
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
                      onClick={() => window.location.href = '/settings/subscription'}>
                      <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400 mb-1" />
                      <div className="text-xs text-green-700 dark:text-green-300 font-semibold text-center">Add-ons</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-center">
                <LoadingSpinner
                  size="sm"
                  color="gray"
                  text="Loading subscription details..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Products
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for products, brands, or keywords..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isSearching ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Search
            </>
          )}
        </button>

        <button
          onClick={() => setIsFilterOpen(true)}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 relative"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'trending', label: 'Trending', icon: TrendingUp },
              { key: 'search', label: 'Search Results', icon: Search },
              { key: 'bestsellers', label: 'Best Sellers', icon: Award },
              { key: 'deals', label: 'Deals', icon: ShoppingCart },
              { key: 'category', label: 'Category', icon: Filter },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {key === 'search' && searchData?.data?.total && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {searchData.data.total}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* NEW: Category Dropdown Section - Always Visible */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          📂 Browse by Category
        </label>
        <select
          value={bestSellersCategory}
          onChange={(e) => setBestSellersCategory(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
        >
          <option value="">-- Select a Category --</option>
          {rootCategories.map((category) => (
            <optgroup key={category.id} label={category.name}>
              <option value={category.id}>
                {category.name}
              </option>
              {getSubcategories(category.id).map((subCategory) => (
                <option
                  key={subCategory.id}
                  value={subCategory.id}
                >
                  └─ {subCategory.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {bestSellersCategory && (
          <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Selected Category:</span> {bestSellersCategory}
            </p>
          </div>
        )}
      </div>

      {/* Category Selection Section - Integrated into By Category tab */}
      {activeTab === 'category' && (
        <div className="mb-6">
          {/* Country Selector for Categories */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-purple-600" />
                Browse by Category
              </h3>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedCategoryId(''); // Reset selected category when country changes
                }}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selection with Hover Subcategories */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                📂 Browse Categories - Hover to see subcategories
              </label>
              <CategorySelector
                selectedCategory={selectedCategoryId}
                onCategorySelect={handleCategorySelect}
              />
            </div>

            {selectedCategoryId && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Selected Category:</span>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {(() => {
                      const category = getCategoryById(selectedCategoryId);
                      if (!category) return null;

                      return (
                        <>
                          {category.parent_name && (
                            <>
                              <span className="text-gray-500">{category.parent_name}</span>
                              <ChevronRight className="w-3 h-3 text-gray-400" />
                            </>
                          )}
                          <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                            {category.name}
                          </span>
                          <button
                            onClick={() => setSelectedCategoryId('')}
                            className="ml-2 text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Clear
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Products by Category Results */}
            {selectedCategoryId && (
              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                  Products in Category
                </h4>

                {categoryProductsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner
                      size="md"
                      color="primary"
                      text="Loading products..."
                    />
                  </div>
                ) : categoryProductsError ? (
                  <div className="text-center py-8">
                    <div className="text-sm text-red-500">
                      Error loading products for this category
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Please try selecting a different category or refresh the page
                    </div>
                  </div>
                ) : categoryProductsData?.data?.products && Array.isArray(categoryProductsData.data.products) ? (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Found {categoryProductsData.data.products.length} products
                      </div>
                      <div className="text-xs text-gray-500">
                        Page {currentPage}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {categoryProductsData.data.products.map((product: any, index: number) => (
                        <div
                          key={product.asin || product.product_id || index}
                          className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          {product.product_photo && (
                            <img
                              src={product.product_photo}
                              alt={product.product_title || 'Product'}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <h5 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
                            {product.product_title || 'Product Title'}
                          </h5>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-purple-600">
                              {product.product_price || 'N/A'}
                            </span>
                            {product.product_star_rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600">
                                  {product.product_star_rating}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="mt-6 flex items-center justify-center gap-4">
                      <button
                        onClick={() => {
                          if (currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                          }
                        }}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>

                      <span className="text-sm text-gray-600">
                        Page {currentPage}
                      </span>

                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-sm text-gray-500">
                      No products found for this category
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="min-h-96">
        {isLoading ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center py-8">
              <AmazonLoader
                size="lg"
                text={`Loading ${activeTab === 'search' ? 'Amazon search results' :
                      activeTab === 'bestsellers' ? 'Amazon best sellers' :
                      activeTab === 'trending' ? 'trending Amazon products' :
                      activeTab === 'deals' ? 'Amazon deals' : 'Amazon products'}...`}
              />
            </div>
            <ProductLoadingSkeleton count={activeTab === 'search' ? 4 : 8} />
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Results Summary */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {activeTab === 'search' && searchData?.data ? (
                      <>Found {searchData.data.total} products for "{searchData.data.query}"</>
                    ) : activeTab === 'trending' ? (
                      <>Top {products.length} Trending Products</>
                    ) : activeTab === 'bestsellers' ? (
                      <>All Trending Products in {selectedCountry}{bestSellersCategory && ` - ${bestSellersCategory}`}</>
                    ) : activeTab === 'category' ? (
                      <>Category Products: {products.length} found{selectedCategoryId && ` in ${selectedCategoryId}`}</>
                    ) : (
                      <>Latest Deals in {selectedCountry}</>
                    )}
                  </h3>
                  {activeTab === 'search' && searchData?.data && (
                    <p className="text-sm text-gray-600 mt-1">
                      {searchData.data.trending_count} trending • {searchData.data.api_count} from API
                    </p>
                  )}
                  {activeTab === 'category' && (categoryData?.data || categoryProductsData?.data) && (
                    <p className="text-sm text-gray-600 mt-1">
                      {categoryData?.data ? (
                        `${categoryData.data.trending_count} trending • ${categoryData.data.api_count} from API • Category: ${selectedCategoryId || filters.category_id}`
                      ) : (
                        `Direct API results • Category: ${selectedCategoryId}`
                      )}
                    </p>
                  )}
                </div>
                {searchData?.remaining_quota !== undefined && (
                  <div className="text-sm text-gray-600">
                    Searches remaining: <span className="font-semibold">{searchData.remaining_quota}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Best Sellers Controls - Three Column Layout */}
            {activeTab === 'bestsellers' && (
              <div className="mb-6 space-y-4">
                {/* Three Column Grid: Country, Type, Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Select Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Country
                    </label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amazon Trends Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amazon Trends Type
                    </label>
                    <select
                      value={bestSellersType}
                      onChange={(e) => setBestSellersType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="BEST_SELLERS">🏆 Best Sellers</option>
                      <option value="GIFT_IDEAS">🎁 Gift Ideas</option>
                      <option value="MOST_WISHED_FOR">💝 Most Wished For</option>
                      <option value="MOVERS_AND_SHAKERS">📈 Movers and Shakers</option>
                      <option value="NEW_RELEASES">🆕 New Releases</option>
                    </select>
                  </div>

                  {/* Select Category (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Category (Optional)
                    </label>
                    <select
                      value={bestSellersCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">All Categories</option>
                      {rootCategories.map((category) => (
                        <optgroup key={category.id} label={category.name}>
                          <option value={category.id}>
                            {category.name}
                          </option>
                          {getSubcategories(category.id).map((subCategory) => (
                            <option
                              key={subCategory.id}
                              value={subCategory.id}
                            >
                              └─ {subCategory.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Search Tab Category Selection */}
            {activeTab === 'search' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Category (Optional)
                </label>
                <select
                  value={bestSellersCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {rootCategories.map((category) => (
                    <optgroup key={category.id} label={category.name}>
                      <option value={category.id}>
                        {category.name}
                      </option>
                      {getSubcategories(category.id).map((subCategory) => (
                        <option
                          key={subCategory.id}
                          value={subCategory.id}
                        >
                          └─ {subCategory.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => renderProductCard(product, index))}
            </div>

            {/* Pagination Controls */}
            {products.length > 0 && (activeTab === 'search' || activeTab === 'bestsellers' || activeTab === 'category') && (
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, Math.max(1, Math.ceil(products.length / 20))))].map((_, i) => {
                      const pageNum = Math.max(1, currentPage - 2) + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={products.length < 20} // Assume 20 products per page
                    className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-sm text-gray-600">
                  Page {currentPage} • {products.length} products
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'search' ? 'No search results' : `No ${activeTab} found`}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'search' 
                ? 'Try searching for different keywords or check your spelling'
                : `Try changing the country or check back later for new ${activeTab}`
              }
            </p>
          </div>
        )}
      </div>

      {/* Top Influencers Section - Auto Scrolling */}
      <div className="mt-12 mb-8">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Crown className="w-6 h-6 text-purple-600" />
            Top Influencers
          </h2>

          {influencersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <span className="ml-3 text-gray-600">Loading influencers...</span>
            </div>
          ) : influencers.length > 0 ? (
            <div className="relative overflow-hidden">
              {/* Auto-scrolling container */}
              <div className="overflow-x-auto scrollbar-hide">
                <style>{`
                  @keyframes scroll {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-100%); }
                  }
                  .auto-scroll {
                    animation: scroll 30s linear infinite;
                  }
                  .auto-scroll:hover {
                    animation-play-state: paused;
                  }
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}</style>

                <div className="h-96 overflow-y-auto scrollbar-hide">
                  <div className="space-y-3">
                    {/* Display influencers twice for seamless loop */}
                    {[...influencers, ...influencers].map((influencer, index) => (
                      <div
                        key={`${influencer.influencer_name}-${index}`}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          {/* Influencer Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {influencer.influencer_name?.charAt(0).toUpperCase() || 'I'}
                            </div>
                          </div>

                          {/* Influencer Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {influencer.influencer_name || 'Unknown'}
                            </h3>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                              {influencer.follower_count && (
                                <div className="bg-blue-50 rounded px-2 py-1">
                                  <span className="text-gray-600">Followers:</span>
                                  <span className="font-semibold text-blue-600 ml-1">
                                    {influencer.follower_count}
                                  </span>
                                </div>
                              )}
                              {influencer.following_count && (
                                <div className="bg-green-50 rounded px-2 py-1">
                                  <span className="text-gray-600">Following:</span>
                                  <span className="font-semibold text-green-600 ml-1">
                                    {influencer.following_count}
                                  </span>
                                </div>
                              )}
                              {influencer.post_count && (
                                <div className="bg-purple-50 rounded px-2 py-1">
                                  <span className="text-gray-600">Posts:</span>
                                  <span className="font-semibold text-purple-600 ml-1">
                                    {influencer.post_count}
                                  </span>
                                </div>
                              )}
                              {influencer.engagement_rate && (
                                <div className="bg-orange-50 rounded px-2 py-1">
                                  <span className="text-gray-600">Engagement:</span>
                                  <span className="font-semibold text-orange-600 ml-1">
                                    {influencer.engagement_rate}%
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Bio */}
                            {influencer.bio && (
                              <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                {influencer.bio}
                              </p>
                            )}
                          </div>

                          {/* Verified Badge */}
                          {influencer.verified && (
                            <div className="flex-shrink-0">
                              <div className="bg-blue-100 text-blue-600 rounded-full p-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No influencers found for {selectedCountry}</p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      >
        <div className="p-6 w-80 bg-white h-full overflow-y-auto">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h3>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category ID
            </label>
            <input
              type="text"
              value={filters.category_id}
              onChange={(e) => handleFilterChange('category_id', e.target.value)}
              placeholder="e.g., 281407 for Software"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Find category IDs from Amazon URLs (e.g., amazon.com/s?node=281407)
            </p>
          </div>

          {/* Sort By */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sort_by}
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="RELEVANCE">Relevance</option>
              <option value="LOWEST_PRICE">Lowest Price</option>
              <option value="HIGHEST_PRICE">Highest Price</option>
              <option value="REVIEWS">Most Reviews</option>
              <option value="NEWEST">Newest</option>
              <option value="BEST_SELLERS">Best Sellers</option>
            </select>
          </div>

          {/* Product Condition */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Condition
            </label>
            <select
              value={filters.product_condition}
              onChange={(e) => handleFilterChange('product_condition', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="ALL">All Conditions</option>
              <option value="NEW">New</option>
              <option value="USED">Used</option>
              <option value="RENEWED">Renewed</option>
              <option value="COLLECTIBLE">Collectible</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.min_price || ''}
                onChange={(e) => handleFilterChange('min_price', Number(e.target.value) || 0)}
                placeholder="Min"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="number"
                value={filters.max_price || ''}
                onChange={(e) => handleFilterChange('max_price', Number(e.target.value) || 0)}
                placeholder="Max"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Brand */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <input
              type="text"
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              placeholder="e.g., Apple, Samsung"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Multiple brands can be separated by commas
            </p>
          </div>

          {/* Prime Only */}
          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.is_prime}
                onChange={(e) => handleFilterChange('is_prime', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Prime Only</span>
            </label>
          </div>

          {/* 4 Stars and Up */}
          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.four_stars_and_up}
                onChange={(e) => handleFilterChange('four_stars_and_up', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">4 Stars & Up</span>
            </label>
          </div>

          {/* Deals and Discounts */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deals & Discounts
            </label>
            <select
              value={filters.deals_and_discounts}
              onChange={(e) => handleFilterChange('deals_and_discounts', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="NONE">No Filter</option>
              <option value="ALL_DISCOUNTS">All Discounts</option>
              <option value="TODAYS_DEALS">Today's Deals</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={applyFilters}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </Drawer>

      {/* Product Details Modal */}
      {selectedProduct && (
        <AmazonTrendsProductDetailsModal
          product={selectedProduct}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Add-ons Modal */}
      {showAddOnsModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Purchase Tokens</h2>
              <button
                onClick={() => setShowAddOnsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Purchase additional tokens to increase your quota limits.
              </p>

              {/* Purchase Tokens Button */}
              <button
                onClick={() => window.location.href = '/settings/subscription'}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Go to Subscription Page
              </button>
            </div>

            <button
              onClick={() => setShowAddOnsModal(false)}
              className="w-full m-4 mt-0 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AmazonTrends;
