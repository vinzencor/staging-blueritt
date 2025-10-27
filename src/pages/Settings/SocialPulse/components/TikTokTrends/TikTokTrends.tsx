import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Package, Filter, Search, CheckCircle, Loader2, ExternalLink, Heart, MessageCircle, Share2, Play, Zap, Truck, X, AlertCircle, ShoppingCart, Eye,
  MousePointer, Users, Hash,
  DollarSign,
  CreditCard,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useUserSubscriptionAndSearchQuota } from '../../../../../hooks/useUserDetails';
import { QuotaNames } from '../../../../../enum';
import { discoverSuppliers, type SupplierInfo, getTikTokShopAnalysis, type TikTokShopAnalysisResponse, getTikTokCreativeCenterProductDetails, type TikTokCreativeCenterResponse } from '../../../../../api/tiktokTrends';
import { checkForBlockedKeywords, getBlockedContentMessage } from '../../../../../utils/keywordFilter';
import TikTokProfitCalculatorModal from './TikTokProfitCalculatorModal';

// TikTok Categories with IDs
const TIKTOK_CATEGORIES = [
  { id: '605196', name: 'Automotive & Motorbike' },
  { id: '602284', name: 'Baby & Maternity' },
  { id: '601450', name: 'Beauty & Personal Care' },
  { id: '801928', name: 'Books, Magazines & Audio' },
  { id: '951432', name: 'Collectibles' },
  { id: '601755', name: 'Computers & Office Equipment' },
  { id: '605248', name: 'Fashion Accessories' },
  { id: '700437', name: 'Food & Beverages' },
  { id: '604453', name: 'Furniture' },
  { id: '700645', name: 'Health' },
  { id: '604968', name: 'Home Improvement' },
  { id: '600001', name: 'Home Supplies' },
  { id: '600942', name: 'Household Appliances' },
  { id: '953224', name: 'Jewellery, Accessories & Derivatives' },
  { id: '802184', name: 'Kids Fashion' },
  { id: '600024', name: 'Kitchenware' },
  { id: '824584', name: 'Luggage & Bags' },
  { id: '824328', name: 'Menswear & Men\'s Underwear' },
  { id: '601303', name: 'Muslim Fashion' },
  { id: '602118', name: 'Pet Supplies' },
  { id: '601739', name: 'Phones & Electronics' },
  { id: '601352', name: 'Shoes' },
  { id: '603014', name: 'Sports & Outdoor' },
  { id: '600154', name: 'Textiles & Soft Furnishings' },
  { id: '604579', name: 'Tools & Hardware' },
  { id: '604206', name: 'Toys & Hobbies' },
  { id: '834312', name: 'Virtual Products' },
  { id: '601152', name: 'Womenswear & Women\'s Underwear' },
];

// Time range options
const TIME_RANGES = [
  { value: '1', label: 'Last 30 Days' },
  { value: '7', label: 'Last 90 days' },
  { value: '30', label: 'Last 180 days' },
];

// Sort options
const SORT_OPTIONS = [
  { value: 'post', label: 'Popularity' },
  { value: 'post_change', label: 'Popularity change' },
  { value: 'ctr', label: 'CTR' },
  { value: 'cvr', label: 'CVR' },
  { value: 'cpa', label: 'CPA' },
  { value: 'cost', label: 'Total Ad Spend' },
  { value: 'like', label: 'Likes' },
  { value: 'share', label: 'Shares' },
  { value: 'comment', label: 'Comments' },
  { value: 'impression', label: 'Impressions' },
  { value: 'play_six_rate', label: '6s view rate' },
];

// Country options
const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'IN', label: 'India' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' },
  { value: 'SG', label: 'Singapore' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'TH', label: 'Thailand' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'PH', label: 'Philippines' },
  { value: 'ID', label: 'Indonesia' },
];

// Period options for Trending Hashtags
const HASHTAG_PERIOD_OPTIONS = [
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '120', label: 'Last 120 Days' },
];

// Industry options for Trending Hashtags
const INDUSTRY_OPTIONS = [
  { id: '22000000000', name: 'Apparel & Accessories' },
  { id: '16000000000', name: 'Appliances' },
  { id: '20000000000', name: 'Apps' },
  { id: '12000000000', name: 'Baby, Kids & Maternity' },
  { id: '14000000000', name: 'Beauty & Personal Care' },
  { id: '24000000000', name: 'Business Services' },
  { id: '30000000000', name: 'E-Commerce (Non-app)' },
  { id: '10000000000', name: 'Education' },
  { id: '13000000000', name: 'Financial Services' },
  { id: '27000000000', name: 'Food & Beverage' },
  { id: '25000000000', name: 'Games' },
  { id: '29000000000', name: 'Health' },
  { id: '21000000000', name: 'Home Improvement' },
  { id: '18000000000', name: 'Household Products' },
  { id: '26000000000', name: 'Life Services' },
  { id: '23000000000', name: 'News & Entertainment' },
  { id: '19000000000', name: 'Pets' },
  { id: '28000000000', name: 'Sports & Outdoor' },
  { id: '15000000000', name: 'Tech & Electronics' },
  { id: '17000000000', name: 'Travel' },
  { id: '11000000000', name: 'Vehicle & Transportation' },
];

// TikTok API function
const fetchTikTokTrendingProducts = async (params: {
  category_id?: string;
  last?: string;
  order_by?: string;
  order_type?: string;
  keyword?: string;
  country_code?: string;
  page?: number;
}) => {
  const queryParams = new URLSearchParams();

  if (params.category_id) queryParams.append('category_id', params.category_id);
  if (params.last) queryParams.append('last', params.last);
  if (params.order_by) queryParams.append('order_by', params.order_by);
  if (params.order_type) queryParams.append('order_type', params.order_type);
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.country_code) queryParams.append('country_code', params.country_code);
  if (params.page) queryParams.append('page', params.page.toString());

  const response = await fetch(`https://tiktok-creative-center-api.p.rapidapi.com/api/trending/top-products?${queryParams}`, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'tiktok-creative-center-api.p.rapidapi.com',
      'x-rapidapi-key': '60cb7bd196mshfa4299228d59ae3p16cdb0jsn5bf954e1e4a5'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

interface TikTokTrendsProps {
  onProductSelect?: (product: any) => void;
}

const TikTokTrends: React.FC<TikTokTrendsProps> = ({ onProductSelect }) => {
  // Backend quota management for TikTok search
  const { quotaDetails: tiktokSearchQuotaDetails, updateQuota: updateTikTokSearchQuota } = useUserSubscriptionAndSearchQuota('tiktok_searches' as any);

  // Subscription quota management
  const { quotaDetails, updateQuota } = useUserSubscriptionAndSearchQuota(QuotaNames.TikTokAnalysis);
  const { quotaDetails: supplierQuotaDetails, updateQuota: updateSupplierQuota } = useUserSubscriptionAndSearchQuota(QuotaNames.SupplierDiscovery);

  // State management
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7');
  const [selectedSortBy, setSelectedSortBy] = useState('post');
  const [selectedSortOrder, setSelectedSortOrder] = useState('desc');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [shouldFetch, setShouldFetch] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAddOnsModal, setShowAddOnsModal] = useState(false);

  // Supplier discovery state
  const [suppliers, setSuppliers] = useState<SupplierInfo[]>([]);
  const [isSupplierDiscoveryLoading, setIsSupplierDiscoveryLoading] = useState(false);
  const [supplierAnalysisTime, setSupplierAnalysisTime] = useState(0);
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'suppliers' | 'shop-analysis'>('overview');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierInfo | null>(null);
  const [showProfitCalculator, setShowProfitCalculator] = useState(false);

  // Shop analysis state
  const [shopAnalysisData, setShopAnalysisData] = useState<TikTokShopAnalysisResponse | null>(null);
  const [isShopAnalysisLoading, setIsShopAnalysisLoading] = useState(false);
  const [shopAnalysisError, setShopAnalysisError] = useState<string | null>(null);

  // Creative Center data state
  const [creativeCenterData, setCreativeCenterData] = useState<TikTokCreativeCenterResponse | null>(null);
  const [isCreativeCenterLoading, setIsCreativeCenterLoading] = useState(false);

  // Trending Hashtags state
  const [hashtagPeriod, setHashtagPeriod] = useState('120');
  const [hashtagCountry, setHashtagCountry] = useState('US');
  const [hashtagIndustry, setHashtagIndustry] = useState('');
  const [trendingHashtags, setTrendingHashtags] = useState<any[]>([]);
  const [isHashtagsLoading, setIsHashtagsLoading] = useState(false);
  const [hashtagsError, setHashtagsError] = useState<string | null>(null);

  // TikTok API Query
  const {
    data: tiktokData,
    isLoading: tiktokLoading,
    error: tiktokError,
    refetch: refetchTikTok,
  } = useQuery({
    queryKey: ['tiktok-trending', selectedCategory, selectedTimeRange, selectedSortBy, selectedSortOrder, searchKeyword, selectedCountry],
    queryFn: () => fetchTikTokTrendingProducts({
      category_id: selectedCategory || undefined,
      last: selectedTimeRange,
      order_by: selectedSortBy,
      order_type: selectedSortOrder,
      keyword: searchKeyword || undefined,
      country_code: selectedCountry,
      page: 1,
    }),
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    retryDelay: 2000,
  });

  // Update quota when API response comes back
  useEffect(() => {
    if (tiktokData?.remaining_quota !== undefined && tiktokData?.remaining_quota !== null) {
      updateTikTokSearchQuota(tiktokData.remaining_quota);
    }
  }, [tiktokData?.remaining_quota, updateTikTokSearchQuota]);

  const handleDoneClick = () => {
    // Check if quota is available from backend
    if (tiktokSearchQuotaDetails.quotaValue <= 0) {
      alert('No TikTok searches remaining. Please purchase add-ons to continue.');
      return;
    }

    // Check for blocked keywords if search keyword is provided
    if (searchKeyword.trim()) {
      const keywordCheck = checkForBlockedKeywords(searchKeyword);
      if (keywordCheck.isBlocked) {
        alert(`Keyword blocked: ${getBlockedContentMessage(keywordCheck.category)}`);
        console.warn('Blocked TikTok search attempt:', {
          query: searchKeyword,
          matchedKeywords: keywordCheck.matchedKeywords,
          category: keywordCheck.category
        });
        return;
      }
    }

    // Quota will be deducted by backend API
    setShouldFetch(true);
    refetchTikTok();
  };

  // Fetch trending hashtags
  const handleFetchTrendingHashtags = async () => {
    setIsHashtagsLoading(true);
    setHashtagsError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', '1');
      queryParams.append('limit', '20');
      queryParams.append('period', hashtagPeriod);
      queryParams.append('country', hashtagCountry);
      queryParams.append('sort_by', 'popular');

      if (hashtagIndustry) {
        queryParams.append('industry_id', hashtagIndustry);
      }

      const response = await fetch(
        `https://tiktok-creative-center-api.p.rapidapi.com/api/trending/hashtag?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'tiktok-creative-center-api.p.rapidapi.com',
            'x-rapidapi-key': '60cb7bd196mshfa4299228d59ae3p16cdb0jsn5bf954e1e4a5'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Trending Hashtags API response:', data);

      // Handle the API response structure: data.data.list
      if (data.data && data.data.list && Array.isArray(data.data.list)) {
        setTrendingHashtags(data.data.list);
      } else if (Array.isArray(data)) {
        setTrendingHashtags(data);
      } else {
        setTrendingHashtags([]);
        setHashtagsError('No hashtags found in response');
      }
    } catch (error) {
      console.error('❌ Error fetching trending hashtags:', error);
      setHashtagsError(error instanceof Error ? error.message : 'Failed to fetch trending hashtags');
      setTrendingHashtags([]);
    } finally {
      setIsHashtagsLoading(false);
    }
  };

  const handleViewDetails = async (product: any) => {
    setSelectedProduct(product);
    setShowProductModal(true);
    setActiveModalTab('overview');
    // Reset supplier state when opening new product
    setSuppliers([]);
    setSupplierAnalysisTime(0);
    // Reset shop analysis state
    setShopAnalysisData(null);
    setShopAnalysisError(null);
    // Reset creative center state
    setCreativeCenterData(null);

    // Check quota before making API call
    if (quotaDetails.quotaValue <= 0) {
      setShopAnalysisError('Search quota exceeded. Please upgrade your plan or wait for quota reset.');
      return;
    }

    // Fetch Creative Center data (age demographics and hashtags) if third_ecom_category is available
    if (product.third_ecom_category?.id) {
      console.log('🎨 Fetching Creative Center data for product ID:', product.third_ecom_category.id);
      console.log('🔍 Full product data:', product);
      console.log('📦 third_ecom_category:', product.third_ecom_category);
      setIsCreativeCenterLoading(true);

      try {
        const creativeCenterResponse = await getTikTokCreativeCenterProductDetails(product.third_ecom_category.id);
        setCreativeCenterData(creativeCenterResponse);
        console.log('✅ Creative Center data loaded:', creativeCenterResponse);
        console.log('📊 Audience ages:', creativeCenterResponse.data?.info?.audience_ages);
        console.log('🏷️ Hashtags:', creativeCenterResponse.data?.info?.hashtags);
      } catch (error) {
        console.error('❌ Error fetching Creative Center data:', error);
        // Set empty data on error
        setCreativeCenterData({
          code: 1,
          msg: 'Failed to load',
          request_id: 'error',
          data: { info: { audience_ages: [], hashtags: [] } }
        });
      } finally {
        setIsCreativeCenterLoading(false);
      }
    } else {
      console.log('⚠️ No third_ecom_category.id found for Creative Center data');
      console.log('🔍 Product structure:', product);
      // Set empty data when no category ID is available
      setCreativeCenterData({
        code: 1,
        msg: 'No category ID available',
        request_id: 'no-category',
        data: { info: { audience_ages: [], hashtags: [] } }
      });
    }

    // Fetch shop analysis data if third_ecom_category is available
    if (product.third_ecom_category?.id) {
      console.log('🛍️ Fetching shop analysis for category:', product.third_ecom_category.id);
      setIsShopAnalysisLoading(true);

      try {
        console.log('🔍 Using category ID:', product.third_ecom_category.id);
        console.log('📝 Category name:', product.third_ecom_category.value);
        console.log('📦 Product title:', product.url_title);

        // Pass product title as keyword for better filtering
        const shopData = await getTikTokShopAnalysis(
          product.third_ecom_category.id,
          product.url_title || product.title
        );

        // Update quota after successful API call
        updateQuota(quotaDetails.quotaValue - 1);

        setShopAnalysisData(shopData);
        console.log('✅ Shop analysis data loaded:', shopData);
        console.log('📊 Quota updated after TikTok Shop search');
      } catch (error) {
        console.error('❌ Error fetching shop analysis:', error);
        setShopAnalysisError(`Failed to load shop analysis data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsShopAnalysisLoading(false);
      }
    } else {
      console.log('⚠️ No third_ecom_category.id found for shop analysis');
      setShopAnalysisError('Product category not available for shop analysis');
    }
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
    setActiveModalTab('overview');
    setSuppliers([]);
    setSupplierAnalysisTime(0);
    // Reset Creative Center data
    setCreativeCenterData(null);
  };

  // Handle discover suppliers from product card - opens modal and starts discovery
  const handleDiscoverSuppliersFromCard = async (product: any) => {
    console.log('🚀 Starting discover suppliers from card for:', product.url_title);

    // First open the modal with the product
    handleViewDetails(product);

    // Longer delay to ensure modal is fully open and state is properly set
    setTimeout(async () => {
      console.log('⚡ Triggering automatic supplier discovery...');
      console.log('🔍 Selected product check:', selectedProduct?.url_title);
      console.log('📊 Supplier quota check:', supplierQuotaDetails.quotaValue);
      console.log('🔄 Loading state check:', isSupplierDiscoveryLoading);

      // Double-check that we have the product set
      if (!selectedProduct) {
        console.log('❌ No selected product, retrying in 200ms...');
        setTimeout(async () => {
          await handleDiscoverSuppliers();
        }, 200);
      } else {
        // Then trigger supplier discovery
        await handleDiscoverSuppliers();
      }
    }, 500);
  };

  const handleDiscoverSuppliers = async () => {
    if (isSupplierDiscoveryLoading) {
      console.log('Supplier discovery already in progress, ignoring click');
      return;
    }

    // Check backend quota before making API call
    if (supplierQuotaDetails.quotaValue <= 0) {
      console.log('❌ Supplier discovery quota exceeded');
      alert('No supplier discovery searches remaining. Please purchase add-ons to continue.');
      return;
    }

    console.log('🔍 Starting supplier discovery for:', selectedProduct?.url_title);
    setIsSupplierDiscoveryLoading(true);
    setActiveModalTab('suppliers');

    try {
      const response = await discoverSuppliers({
        title: selectedProduct.url_title || 'TikTok Product',
        id: selectedProduct.id || 'tiktok-product',
        price: selectedProduct.price || 'N/A',
        category: selectedProduct.first_ecom_category?.value || 'TikTok Product'
      });

      console.log('✅ Supplier discovery response:', response);
      console.log('📦 Found suppliers:', response.suppliers?.length || 0);

      // Update backend quota after successful API call
      updateSupplierQuota(supplierQuotaDetails.quotaValue - 1);
      console.log('📊 Supplier discovery quota reduced');

      setSuppliers(response.suppliers || []);
      setSupplierAnalysisTime(response.analysis_time || 0);
    } catch (error) {
      console.error('❌ Supplier discovery failed:', error);
      // Set empty suppliers array on error to show the empty state
      setSuppliers([]);
    } finally {
      setIsSupplierDiscoveryLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-[#0072D6]" />
          TikTok Trends
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover trending products from TikTok Creative Center API
        </p>

        {/* Subscription Quota Alert - Enhanced Premium Plan Section */}
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
                    {/* TikTok Trends Searches */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-blue-700">
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Product Searches</div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {tiktokSearchQuotaDetails.quotaValue === -1 ? '∞' : tiktokSearchQuotaDetails.quotaValue}
                      </div>
                    </div>

                    {/* Discover Suppliers */}
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
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm">Loading subscription details...</p>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {TIKTOK_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Country Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {COUNTRY_OPTIONS.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Range
            </label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {TIME_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={selectedSortBy}
              onChange={(e) => setSelectedSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort Order
            </label>
            <select
              value={selectedSortOrder}
              onChange={(e) => setSelectedSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Search Keyword */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Keyword (Optional)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => {
                const newValue = e.target.value;
                setSearchKeyword(newValue);

                // Real-time keyword checking for immediate feedback
                if (newValue.trim()) {
                  const keywordCheck = checkForBlockedKeywords(newValue);
                  if (keywordCheck.isBlocked) {
                    // Visual feedback for blocked content
                    e.target.style.borderColor = '#ef4444';
                    e.target.style.backgroundColor = '#fef2f2';
                  } else {
                    // Reset to normal styling
                    e.target.style.borderColor = '';
                    e.target.style.backgroundColor = '';
                  }
                } else {
                  // Reset styling when empty
                  e.target.style.borderColor = '';
                  e.target.style.backgroundColor = '';
                }
              }}
              placeholder="Enter search keyword..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Done Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleDoneClick}
            disabled={tiktokLoading}
            className="px-8 py-3 bg-gradient-to-r from-[#0072D6] to-[#111c43] text-white font-semibold rounded-lg hover:from-[#111c43]] hover:to-[#0072D6] focus:ring-2 focus:ring-[#111c43] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            {tiktokLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading Products...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Done - Get Trending Products
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Left Column - Products Section (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Trending Products
            </h2>

        {/* Loading State */}
        {tiktokLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-16 h-16 text-[#111c43] mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Loading TikTok Trending Products...
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Fetching data from TikTok Creative Center API
            </p>
          </div>
        )}

        {/* Error State */}
        {tiktokError && !tiktokLoading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
              Error Loading Products
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {tiktokError instanceof Error ? tiktokError.message : 'Failed to fetch TikTok trending products'}
            </p>
            <button
              onClick={handleDoneClick}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Products Grid */}
        {tiktokData?.data?.list && tiktokData.data.list.length > 0 && !tiktokLoading && (
          <div className="space-y-6">
            {/* Results Summary */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/30 dark:to-purple-900/30 rounded-lg p-4 border border-pink-100 dark:border-pink-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Found {tiktokData.data.list.length} trending products
              </h3>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                <p>Category: {selectedCategory ? TIKTOK_CATEGORIES.find(c => c.id === selectedCategory)?.name : 'All Categories'}</p>
                <p>Time Range: {TIME_RANGES.find(t => t.value === selectedTimeRange)?.label}</p>
                <p>Sort: {SORT_OPTIONS.find(s => s.value === selectedSortBy)?.label} ({selectedSortOrder})</p>
                {searchKeyword && <p>Keyword: {searchKeyword}</p>}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tiktokData.data.list.map((product: any, index: number) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group flex flex-col h-full"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {product.cover_url ? (
                      <img
                        src={product.cover_url}
                        alt={product.url_title || 'TikTok Product'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDOTQuNDc3MiA3MCA5MCA3NC40NzcyIDkwIDgwVjEyMEM5MCA5NC40NzcyIDk0LjQ3NzIgOTAgMTAwIDkwSDEwMEMxMDUuNTIzIDkwIDExMCA5NC40NzcyIDExMCAxMDBWMTIwQzExMCAxMjUuNTIzIDEwNS41MjMgMTMwIDEwMCAxMzBIOTBWMTQwSDEwMEMxMTEuMDQ2IDE0MCA5MCA5NC40NzcyIDkwIDgwVjEyMEM5MCA5NC40NzcyIDk0LjQ3NzIgOTAgMTAwIDkwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-400" />
                      </div>
                    )}

                    {/* Overlay with View Details Button */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => handleViewDetails(product)}
                        className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 shadow-lg"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Product Info - Flex container to push button to bottom */}
                  <div className="p-4 flex flex-col flex-grow">
                    {/* Product Title */}
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2 min-h-[2.5rem] mb-3">
                      {product.url_title || 'Trending Product'}
                    </h3>

                    {/* Category Tag */}
                    {product.first_ecom_category && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="inline-block bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-800 dark:text-pink-300 px-2 py-1 rounded-full text-xs font-medium">
                          {product.first_ecom_category.value}
                        </span>
                      </div>
                    )}

                    {/* Key Performance Metrics - CPR, CVR, CPA, Cost */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-8 flex-grow">
                      {product.ctr !== undefined && product.ctr > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center border border-blue-200 dark:border-blue-800">
                          <div className="text-blue-600 dark:text-blue-400 mb-1 font-medium">CTR</div>
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {(product.ctr * 100).toFixed(2)}%
                          </div>
                        </div>
                      )}
                      {product.cvr !== undefined && product.cvr > 0 && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center border border-purple-200 dark:border-purple-800">
                          <div className="text-purple-600 dark:text-purple-400 mb-1 font-medium">CVR</div>
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {(product.cvr * 100).toFixed(2)}%
                          </div>
                        </div>
                      )}
                      {product.cpa !== undefined && product.cpa > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center border border-green-200 dark:border-green-800">
                          <div className="text-green-600 dark:text-green-400 mb-1 font-medium">CPA</div>
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            ${product.cpa.toFixed(2)}
                          </div>
                        </div>
                      )}
                      {product.cost !== undefined && product.impression > 0 && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 text-center border border-orange-200 dark:border-orange-800">
                          <div className="text-orange-600 dark:text-orange-400 mb-1 font-medium">Impressions</div>
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            ${(product.impression).toLocaleString()}
                          </div>
                        </div>
                      )}

                    </div>

                    

                    {/* Action Buttons - Always at bottom */}
                    <div className="mt-auto space-y-2">
                      {/* Discover Suppliers Button */}
                      <button
                        onClick={() => handleDiscoverSuppliersFromCard(product)}
                        className="w-full bg-[#213168] text-white py-2 px-3 rounded-lg hover:bg-[#0f1a35] transition-all duration-200 text-sm flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Discover Suppliers
                      </button>

                      {/* View Details Button */}
                      <button
                        onClick={() => handleViewDetails(product)}
                        className="w-full bg-gradient-to-r from-[#0072D6] to-[#111c43] text-white py-2 px-4 rounded-lg hover:from-[#111c43] hover:to-[#0072D6] transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Initial State */}
        {!shouldFetch && !tiktokLoading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Ready to Fetch TikTok Trending Products
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Select your filters above and click "Done" to get trending products from TikTok Creative Center API.
            </p>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <p>Selected Category: {selectedCategory ? TIKTOK_CATEGORIES.find(c => c.id === selectedCategory)?.name : 'All Categories'}</p>
              <p>Time Range: {TIME_RANGES.find(t => t.value === selectedTimeRange)?.label}</p>
              <p>Sort: {SORT_OPTIONS.find(s => s.value === selectedSortBy)?.label} ({selectedSortOrder})</p>
              {searchKeyword && <p>Keyword: {searchKeyword}</p>}
            </div>
          </div>
        )}

        {/* No Results */}
        {shouldFetch && tiktokData && (!tiktokData.data?.list || tiktokData.data.list.length === 0) && !tiktokLoading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Trending Products Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your filters or search for different keywords.
            </p>
            <button
              onClick={handleDoneClick}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Search Again
            </button>
          </div>
        )}
          </div>
        </div>

        {/* Right Column - Trending Hashtags Section (1/3 width) */}
        {/*  */}
      </div>

      {/* Product Details Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                TikTok Product Details
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <button
                onClick={() => setActiveModalTab('overview')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeModalTab === 'overview'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-white dark:bg-gray-800'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <Package className="w-4 h-4" />
                Overview
              </button>
              <button
                onClick={() => setActiveModalTab('suppliers')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeModalTab === 'suppliers'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-white dark:bg-gray-800'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <Truck className="w-4 h-4" />
                Suppliers
                {suppliers.length > 0 && (
                  <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full text-xs font-bold">
                    {suppliers.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveModalTab('shop-analysis')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeModalTab === 'shop-analysis'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-white dark:bg-gray-800'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <TrendingUp className="w-4 h-4" />
                Shop Analysis
                {shopAnalysisData?.products && shopAnalysisData.products.length > 0 && (
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full text-xs font-bold">
                    {shopAnalysisData.products.length}
                  </span>
                )}
              </button>
            </div>

            {/* Action Buttons Bar */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedProduct.url_title || 'TikTok Product'}
              </div>

              <div className="flex items-center gap-3">
                {/* Discover Suppliers Button */}
                <button
                  onClick={handleDiscoverSuppliers}
                  disabled={isSupplierDiscoveryLoading}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {isSupplierDiscoveryLoading ? 'Analyzing...' : suppliers.length > 0 ? 'Discover More Suppliers' : 'Discover Suppliers'}
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              {activeModalTab === 'overview' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="space-y-4">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {selectedProduct.cover_url ? (
                          <img
                            src={selectedProduct.cover_url}
                            alt={selectedProduct.url_title || 'TikTok Product'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-24 h-24 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Category */}
                      {selectedProduct.first_ecom_category && (
                        <div className="text-center">
                          <span className="inline-block bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-800 dark:text-pink-300 px-4 py-2 rounded-full text-sm font-medium">
                            {selectedProduct.first_ecom_category.value}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Information */}
                    <div className="space-y-6">
                      {/* Title */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {selectedProduct.url_title || 'Trending Product'}
                        </h3>
                      </div>

                      {/* Price Information from Shop Analysis - Show only first matching product */}
                      {shopAnalysisData && shopAnalysisData.products && shopAnalysisData.products.length > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-6 border border-green-200 dark:border-green-700">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            TikTok Shop Price
                          </h4>
                          {(() => {
                            const firstProduct = shopAnalysisData.products[0];
                            return (
                              <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-green-100 dark:border-green-600">
                                {firstProduct.image_url && (
                                  <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600 h-40 flex items-center justify-center">
                                    <img
                                      src={firstProduct.image_url}
                                      alt={firstProduct.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E';
                                      }}
                                    />
                                  </div>
                                )}
                                <div className="text-center">
                                  {/* Clickable Price - Opens Calculator */}
                                  <button
                                    onClick={() => {
                                      // Create a mock supplier object from shop product data
                                      const mockSupplier: SupplierInfo & { isTikTokShopProduct?: boolean; tiktokShopPrice?: number } = {
                                        id: firstProduct.id,
                                        name: firstProduct.shop_name || 'TikTok Shop',
                                        supplier_name: firstProduct.shop_name || 'TikTok Shop',
                                        location: firstProduct.shipping_info.ship_from || 'Unknown',
                                        verification_status: 'verified',
                                        verification_badge: 'Gold',
                                        years_in_business: 5,
                                        main_products: firstProduct.title,
                                        certifications: [],
                                        contact_method: 'TikTok Shop',
                                        ai_match_score: 85,
                                        match_explanation: 'High-quality TikTok Shop product with good sales data',
                                        moq: 1,
                                        lead_time: '7-15 days',
                                        estimated_price: `$${firstProduct.price.toFixed(2)}`,
                                        contact_url: '',
                                        response_rate: '95%',
                                        trade_assurance: firstProduct.shipping_info.free_shipping,
                                        isTikTokShopProduct: true,
                                        tiktokShopPrice: firstProduct.price
                                      };

                                      // Create a mock product object with TikTok Shop data
                                      const mockProduct = {
                                        ...selectedProduct,
                                        price: firstProduct.price,
                                        title: firstProduct.title,
                                        image_url: firstProduct.image_url,
                                        sales_count: firstProduct.sales_count,
                                        isTikTokShopProduct: true
                                      };

                                      setSelectedProduct(mockProduct);
                                      setSelectedSupplier(mockSupplier);
                                      setShowProfitCalculator(true);
                                    }}
                                    className="group cursor-pointer inline-block"
                                  >
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                                      ${firstProduct.price.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                                      Click to Calculate Profit
                                    </div>
                                  </button>

                                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 mt-2">
                                    {firstProduct.currency}
                                  </div>
                                  <div className="text-sm text-gray-700 dark:text-gray-200 mb-4 line-clamp-3">
                                    {firstProduct.title}
                                  </div>

                                  {/* Product Details Grid */}
                                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                    {firstProduct.sales_count > 0 && (
                                      <div className="bg-green-50 dark:bg-green-900/30 rounded p-2">
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Sales</div>
                                        <div className="font-semibold text-green-600 dark:text-green-400">
                                          {firstProduct.sales_count.toLocaleString()}
                                        </div>
                                      </div>
                                    )}
                                    {firstProduct.product_rating > 0 && (
                                      <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded p-2">
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Rating</div>
                                        <div className="font-semibold text-yellow-600 dark:text-yellow-400">
                                          ⭐ {firstProduct.product_rating.toFixed(1)}
                                        </div>
                                      </div>
                                    )}
                                    {firstProduct.shop_name && (
                                      <div className="bg-blue-50 dark:bg-blue-900/30 rounded p-2 col-span-2">
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Shop</div>
                                        <div className="font-semibold text-blue-600 dark:text-blue-400 truncate">
                                          {firstProduct.shop_name}
                                        </div>
                                      </div>
                                    )}
                                    {firstProduct.shipping_info.free_shipping && (
                                      <div className="bg-purple-50 dark:bg-purple-900/30 rounded p-2 col-span-2">
                                        <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                                          ✓ Free Shipping
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* View All Products Link */}
                                  <button
                                    onClick={() => setActiveModalTab('shop-analysis')}
                                    className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                                  >
                                    View All {shopAnalysisData.products.length} Products
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Loading state for price information */}
                      {isShopAnalysisLoading && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            <span className="text-gray-600 dark:text-gray-300">Loading pricing data...</span>
                          </div>
                        </div>
                      )}

                      {/* Error state for price information */}
                      {shopAnalysisError && !isShopAnalysisLoading && (
                        <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-6 border border-red-200 dark:border-red-700">
                          <div className="flex items-center justify-center gap-3 text-red-600 dark:text-red-400">
                            <AlertCircle className="w-5 h-5" />
                            <span>Unable to load TikTok Shop pricing data</span>
                          </div>
                          <p className="text-sm text-red-500 dark:text-red-400 text-center mt-2">
                            Please try selecting a different product or check back later
                          </p>
                        </div>
                      )}

                      {/* No products found state */}
                      {!isShopAnalysisLoading && !shopAnalysisError && shopAnalysisData && shopAnalysisData.products.length === 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
                          <div className="flex items-center justify-center gap-3 text-yellow-600 dark:text-yellow-400">
                            <AlertCircle className="w-5 h-5" />
                            <span>No products found for this category</span>
                          </div>
                          <p className="text-sm text-yellow-500 dark:text-yellow-400 text-center mt-2">
                            Try selecting a different trending product
                          </p>
                        </div>
                      )}

                      {/* Statistics Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        {selectedProduct.post && (
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                              <Play className="w-5 h-5" />
                              <span className="font-medium">Posts</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                              {selectedProduct.post.toLocaleString()}
                            </div>
                          </div>
                        )}

                        {selectedProduct.like && (
                          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-lg p-4 text-center border border-red-200 dark:border-red-700">
                            <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 mb-2">
                              <Heart className="w-5 h-5" />
                              <span className="font-medium">Likes</span>
                            </div>
                            <div className="text-2xl font-bold text-red-800 dark:text-red-300">
                              {selectedProduct.like.toLocaleString()}
                            </div>
                          </div>
                        )}

                        {selectedProduct.share && (
                          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-4 text-center border border-green-200 dark:border-green-700">
                            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-2">
                              <Share2 className="w-5 h-5" />
                              <span className="font-medium">Shares</span>
                            </div>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                              {selectedProduct.share.toLocaleString()}
                            </div>
                          </div>
                        )}

                        {selectedProduct.comment && (
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-4 text-center border border-purple-200 dark:border-purple-700">
                            <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                              <MessageCircle className="w-5 h-5" />
                              <span className="font-medium">Comments</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                              {selectedProduct.comment.toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Additional Metrics */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Metrics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedProduct.impression && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700 text-center">
                              <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
                                <Eye className="w-5 h-5" />
                                <span className="font-medium">Impressions</span>
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {selectedProduct.impression.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {selectedProduct.ctr && (
                            <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 rounded-lg p-4 text-center border border-pink-200 dark:border-pink-700">
                              <div className="flex items-center justify-center gap-2 text-pink-600 dark:text-pink-400 mb-2">
                                <MousePointer className="w-5 h-5" />
                                <span className="font-medium">CTR</span>
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {selectedProduct.ctr}%
                              </span>
                            </div>
                          )}
                          {selectedProduct.cvr && (
                            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-4 text-center border border-green-200 dark:border-green-700">
                              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-2">
                                <TrendingUp className="w-5 h-5" />
                                <span className="font-medium">CVR</span>
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {selectedProduct.cvr}%
                              </span>
                            </div>
                          )}
                          {selectedProduct.cpa && (
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-700">
                              <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                                <DollarSign className="w-5 h-5" />
                                <span className="font-medium">CPA</span>
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                ${selectedProduct.cpa}
                              </span>
                            </div>
                          )}
                          {selectedProduct.cost && (
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg p-4 text-center border border-orange-200 dark:border-orange-700">
                              <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
                                <CreditCard className="w-5 h-5" />
                                <span className="font-medium">Total Ad Spend</span>
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                ${selectedProduct.cost}
                              </span>
                            </div>
                          )}
                          {selectedProduct.play_six_rate && (
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-4 text-center border border-purple-200 dark:border-purple-700">
                              <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                                <Play className="w-5 h-5" />
                                <span className="font-medium">6s View Rate</span>
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {selectedProduct.play_six_rate}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Creative Center Data - Age Demographics and Hashtags */}
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Audience Insights</h4>

                        {/* Debug Info */}
                        {/* <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                          Debug: creativeCenterData = {creativeCenterData ? 'EXISTS' : 'NULL'} |
                          Data: {creativeCenterData ? JSON.stringify(creativeCenterData, null, 2) : 'No data'}
                        </div> */}

                        {/* Age Demographics Chart - Real Data */}
                        {creativeCenterData?.data?.info?.audience_ages && creativeCenterData.data.info.audience_ages.length > 0 && (
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                            <h5 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <Users className="w-5 h-5 text-blue-600" />
                              Age Demographics
                            </h5>
                            <div className="space-y-3">
                              {creativeCenterData.data?.info?.audience_ages?.map((ageData, index) => (
                                <div key={index} className="flex items-center gap-3">
                                  <div className="w-12 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {ageData.age_level}+
                                  </div>
                                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                                      style={{ width: `${ageData.score}%` }}
                                    />
                                  </div>
                                  <div className="w-12 text-sm font-semibold text-blue-600 dark:text-blue-400 text-right">
                                    {ageData.score}%
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Trending Hashtags - Real Data */}
                        {creativeCenterData?.data?.info?.hashtags && creativeCenterData.data.info.hashtags.length > 0 && (
                          <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/30 rounded-xl p-6 border border-pink-200 dark:border-pink-700">
                            <h5 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <Hash className="w-5 h-5 text-pink-600" />
                              Trending Hashtags
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {creativeCenterData.data?.info?.hashtags?.slice(0, 10).map((hashtag, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/50 dark:to-rose-900/50 text-pink-800 dark:text-pink-300 px-3 py-1 rounded-full text-sm font-medium border border-pink-200 dark:border-pink-700"
                                >
                                  #{hashtag}
                                </span>
                              ))}
                            </div>
                            {(creativeCenterData.data?.info?.hashtags?.length || 0) > 10 && (
                              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                +{(creativeCenterData.data?.info?.hashtags?.length || 0) - 10} more hashtags
                              </div>
                            )}
                          </div>
                        )}

                        {/* No data message */}
                        {creativeCenterData && creativeCenterData.code !== 0 && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
                            <div className="flex items-center justify-center gap-3 text-yellow-600 dark:text-yellow-400">
                              <AlertCircle className="w-5 h-5" />
                              <span>No audience insights available for this product</span>
                            </div>
                            <p className="text-sm text-yellow-500 dark:text-yellow-400 text-center mt-2">
                              {creativeCenterData.msg}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Loading state for Creative Center data - Fixed */}
                      {isCreativeCenterLoading && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                            <span className="text-gray-600 dark:text-gray-300">Loading audience insights...</span>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        {selectedProduct.url && (
                          <a
                            href={selectedProduct.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium text-center flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="w-5 h-5" />
                            View Product
                          </a>
                        )}
                        <button
                          onClick={handleCloseModal}
                          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeModalTab === 'suppliers' && (
                <div className="p-6">
                  <SuppliersTab
                    suppliers={suppliers}
                    isLoading={isSupplierDiscoveryLoading}
                    analysisTime={supplierAnalysisTime}
                    onCalculateClick={(supplier) => {
                      setSelectedSupplier(supplier);
                      setShowProfitCalculator(true);
                    }}
                  />
                </div>
              )}

              {activeModalTab === 'shop-analysis' && (
                <div className="p-6">
                  <ShopAnalysisTab
                    shopData={shopAnalysisData}
                    isLoading={isShopAnalysisLoading}
                    error={shopAnalysisError}
                    categoryId={selectedProduct?.third_ecom_category?.id}
                    categoryName={selectedProduct?.third_ecom_category?.value}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
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

      {/* Profit Calculator Modal */}
      {showProfitCalculator && selectedProduct && selectedSupplier && (
        <TikTokProfitCalculatorModal
          product={selectedProduct}
          supplier={selectedSupplier}
          isOpen={showProfitCalculator}
          onClose={() => {
            setShowProfitCalculator(false);
            setSelectedSupplier(null);
          }}
        />
      )}
    </div>
  );
};

// Suppliers Tab Component
interface SuppliersTabProps {
  suppliers: SupplierInfo[];
  isLoading: boolean;
  analysisTime: number;
  onCalculateClick: (supplier: SupplierInfo) => void;
}

const SuppliersTab: React.FC<SuppliersTabProps> = ({ suppliers, isLoading, analysisTime, onCalculateClick }) => {
  console.log('🏭 SuppliersTab render:', {
    suppliersCount: suppliers?.length || 0,
    isLoading,
    analysisTime,
    suppliers: suppliers?.slice(0, 2) // Log first 2 suppliers for debugging
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Discovering Suppliers...
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">
          Our AI is analyzing the product and finding the best suppliers for you. This may take a few moments.
        </p>
      </div>
    );
  }

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Truck className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Suppliers Found
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">
          We couldn't find any suppliers for this product. Try clicking "Discover Suppliers" to search again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-4 border border-purple-100 dark:border-purple-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Supplier Analysis Complete
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p>Found {suppliers.length} potential suppliers in {analysisTime}s</p>
          <p>Suppliers are ranked by AI match score and verification status</p>
        </div>
      </div>

      {/* Suppliers List */}
      <div className="space-y-4">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-5 hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-lg transition-all duration-200">
            {/* Header with Name, Verification, and AI Score */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h5 className="font-bold text-gray-900 dark:text-white text-lg">{supplier.name}</h5>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${supplier.verification_status === 'Gold Verified'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    : supplier.verification_status === 'Verified'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                    }`}>
                    {supplier.verification_status}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{supplier.location}</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {supplier.match_explanation}
                </p>
              </div>

              {/* AI Match Score */}
              <div className="text-center bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {supplier.ai_match_score}%
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  AI Match
                </div>
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">MOQ</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {supplier.moq?.toLocaleString() || 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Lead Time</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {supplier.lead_time}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Est. Price</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {supplier.estimated_price}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Response Rate</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {supplier.response_rate}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-300">Years in Business:</span>
                <span className="font-medium text-gray-900 dark:text-white">{supplier.years_in_business}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-300">Main Products:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Array.isArray(supplier.main_products)
                    ? supplier.main_products.join(', ')
                    : supplier.main_products}
                </span>
              </div>
              {supplier.certifications && supplier.certifications.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Certifications:</span>
                  <div className="flex flex-wrap gap-1">
                    {supplier.certifications.map((cert, certIndex) => (
                      <span key={certIndex} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* Calculate Button */}
              <button
                onClick={() => onCalculateClick(supplier)}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 px-4 rounded-lg transition-all duration-200 font-medium text-center flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Calculate
              </button>

              {/* Contact Supplier Button */}
              {supplier.contact_url && (
                <a
                  href={supplier.contact_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2 px-4 rounded-lg transition-all duration-200 font-medium text-center flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Contact Supplier
                </a>
              )}
            </div>

            {/* Trade Assurance Badge */}
            {supplier.trade_assurance && (
              <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 mt-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Trade Assurance
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Shop Analysis Tab Component
interface ShopAnalysisTabProps {
  shopData: TikTokShopAnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
  categoryId?: string;
  categoryName?: string;
}

const ShopAnalysisTab: React.FC<ShopAnalysisTabProps> = ({
  shopData,
  isLoading,
  error,
  categoryId,
  categoryName
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Analyzing TikTok Shop Products
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Fetching products from TikTok Shop for category: {categoryName || categoryId}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
            Failed to Load Shop Analysis
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <div className="bg-white dark:bg-gray-800 rounded p-4 text-left text-sm text-gray-600 dark:text-gray-300">
            <p className="font-mono text-xs">
              Category ID: {categoryId}<br />
              Category Name: {categoryName}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!shopData || !shopData.products || shopData.products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Shop Products Found
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          No products found in TikTok Shop for category: {categoryName || categoryId}
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-left text-sm text-gray-600 dark:text-gray-300 inline-block">
          <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Debug Information:</p>
          <p className="font-mono text-xs">
            Category ID: {categoryId}<br />
            Category Name: {categoryName}<br />
            Shop Data: {shopData ? 'Loaded' : 'Not loaded'}<br />
            Products: {shopData?.products?.length || 0}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg p-4 border border-green-100 dark:border-green-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          TikTok Shop Analysis - {categoryName || 'Category ' + categoryId}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Found {shopData.products.length} products with pricing and sales data
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shopData.products.map((product) => (
          <div key={product.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
            {/* Product Header */}
            <div className="flex items-start gap-4 mb-4">
              {/* Product Image */}
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600 flex-shrink-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
                  {product.title}
                </h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {product.currency}
                  </span>
                </div>
                {product.shop_name && (
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    by {product.shop_name}
                  </p>
                )}
              </div>
            </div>

            {/* Product Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {product.sales_count.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Sales</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {product.product_rating.toFixed(1)}★
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Rating</div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300 mb-4">
              {product.review_count > 0 && (
                <div className="flex justify-between">
                  <span>Reviews:</span>
                  <span>{product.review_count.toLocaleString()}</span>
                </div>
              )}
              {product.shipping_info.free_shipping && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>Free Shipping</span>
                </div>
              )}
              {product.shipping_info.ship_from && (
                <div className="flex justify-between">
                  <span>Ships from:</span>
                  <span>{product.shipping_info.ship_from}</span>
                </div>
              )}
            </div>


          </div>
        ))}
      </div>
    </div>
  );
};

export default TikTokTrends;
