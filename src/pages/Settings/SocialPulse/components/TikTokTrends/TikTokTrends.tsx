import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, Package, Filter, Search, CheckCircle, Loader2, ExternalLink, Heart, MessageCircle, Share2, Play, Zap, Truck, X, AlertCircle, ShoppingCart, Eye,
  MousePointer, Users, Hash,
  DollarSign,
  CreditCard,
  Star,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useUserSubscriptionAndSearchQuota } from '../../../../../hooks/useUserDetails';
import { QuotaNames } from '../../../../../enum';
import { getTikTokTrendingProducts, discoverSuppliers, type SupplierInfo, getTikTokShopAnalysis, type TikTokShopAnalysisResponse, getTikTokCreativeCenterProductDetails, type TikTokCreativeCenterResponse } from '../../../../../api/tiktokTrends';
import { checkForBlockedKeywords, getBlockedContentMessage } from '../../../../../utils/keywordFilter';
import { fetchPexelsFallbackImage, extractCategoryName } from '../../../../../utils/pexelsImageFallback'; // Now uses Freepik API
import TikTokProfitCalculatorModal from './TikTokProfitCalculatorModal';
import AddOnsChoiceModal from '../AddOnsChoiceModal';
import api from '../../../../../api';

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

// Country options - 60 TikTok supported countries
const COUNTRY_OPTIONS = [
  // Americas
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CL', label: 'Chile' },
  { value: 'CO', label: 'Colombia' },
  { value: 'PE', label: 'Peru' },

  // Europe
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'PL', label: 'Poland' },
  { value: 'SE', label: 'Sweden' },
  { value: 'NO', label: 'Norway' },
  { value: 'DK', label: 'Denmark' },
  { value: 'FI', label: 'Finland' },
  { value: 'BE', label: 'Belgium' },
  { value: 'AT', label: 'Austria' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'IE', label: 'Ireland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'GR', label: 'Greece' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'RO', label: 'Romania' },
  { value: 'HU', label: 'Hungary' },

  // Asia Pacific
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'SG', label: 'Singapore' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'TH', label: 'Thailand' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'PH', label: 'Philippines' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'BD', label: 'Bangladesh' },

  // Middle East & Africa
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'EG', label: 'Egypt' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'IL', label: 'Israel' },
  { value: 'TR', label: 'Turkey' },
  { value: 'QA', label: 'Qatar' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'OM', label: 'Oman' },
  { value: 'BH', label: 'Bahrain' },
  { value: 'JO', label: 'Jordan' },
  { value: 'LB', label: 'Lebanon' },
  { value: 'MA', label: 'Morocco' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'KE', label: 'Kenya' },
  { value: 'GH', label: 'Ghana' },
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

// TikTok API function - Fetch 3 pages in parallel from Direct API (~60 products)
const fetchTikTokTrendingProducts = async (params: {
  category_id?: string;
  last?: string;
  order_by?: string;
  order_type?: string;
  keyword?: string;
  country_code?: string;
  page?: number;
}) => {
  console.log('🔍 Fetching TikTok trending products with params:', params);
  console.log('🚀 FETCHING 3 PAGES SEQUENTIALLY FROM TIKTOK API (~60 products)');

  try {
    // 1. FIRST: Fetch from database (fast response) with quota reduction
    console.log('📊 Step 1: Fetching from database with quota reduction...');
    const databaseResponse = await getTikTokTrendingProducts({
      country: params.country_code || 'US',
      limit: 200, // Fetch more products from database
      page: params.page || 1,
      category: params.category_id || '',
      last: params.last || '7',
      order_by: params.order_by || 'post',
      order_type: params.order_type || 'desc',
      keyword: params.keyword || '',
    });

    console.log('✅ Database Response:', databaseResponse);
    console.log('📊 Database Products:', databaseResponse.data?.products?.length || 0);
    console.log('📊 Remaining Quota:', databaseResponse.remaining_quota);

    // 2. SEQUENTIAL: Fetch 3 pages from Direct TikTok API one by one (fresh data) - NO quota reduction
    console.log('📊 Step 2: Fetching 3 pages sequentially from Direct TikTok API (with 1s delay between requests)...');

    const fetchPage = async (pageNum: number) => {
      const apiParams = {
        page: pageNum.toString(),
        ...(params.category_id && { category_id: params.category_id }),
        ...(params.last && { last: params.last }),
        ...(params.order_by && { order_by: params.order_by }),
        ...(params.order_type && { order_type: params.order_type }),
        ...(params.keyword && { keyword: params.keyword }),
        ...(params.country_code && { country: params.country_code })
      };

      try {
        // ✅ Call backend endpoint instead of RapidAPI directly
        const response = await api.get('/products/tiktok-trends/creative-center/', { params: apiParams });
        const products = response.data?.data?.list || [];
        console.log(`✅ Backend API Page ${pageNum}:`, products.length, 'products');
        console.log(`📦 Page ${pageNum} products:`, products);
        return products;
      } catch (error) {
        console.warn(`⚠️ Backend API Page ${pageNum} failed:`, error);
        return [];
      }
    };

    // Fetch pages 1, 2, 3 SEQUENTIALLY (not parallel) to avoid rate limiting
    console.log('⏳ Fetching Page 1...');
    const page1Products = await fetchPage(1);
    console.log('📊 Page 1 products count:', page1Products.length);

    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

    console.log('⏳ Fetching Page 2...');
    const page2Products = await fetchPage(2);
    console.log('📊 Page 2 products count:', page2Products.length);

    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

    console.log('⏳ Fetching Page 3...');
    const page3Products = await fetchPage(3);
    console.log('📊 Page 3 products count:', page3Products.length);

    // Combine all products from 3 pages
    const allDirectApiProducts = [...page1Products, ...page2Products, ...page3Products];
    console.log('✅ Total Direct API Products from 3 pages:', allDirectApiProducts.length);
    console.log('📦 All Direct API Products:', allDirectApiProducts);

    // 3. MERGE: Combine database and direct API data
    const mergedData = {
      ...databaseResponse,
      data: {
        products: databaseResponse.data?.products || [],
        list: allDirectApiProducts, // All products from 3 pages
        total: Math.max(
          databaseResponse.data?.products?.length || 0,
          allDirectApiProducts.length
        ),
        message: `Database: ${databaseResponse.data?.products?.length || 0} products, Direct API (3 pages): ${allDirectApiProducts.length} products`
      }
    };

    console.log('🔄 MERGED DATA:', mergedData);
    console.log('📊 Total products in list:', mergedData.data.list.length);
    console.log('📦 Products to render:', mergedData.data.list);
    return mergedData;

  } catch (error) {
    console.error('❌ Fetch error:', error);
    throw error;
  }
};

interface TikTokTrendsProps {
  onProductSelect?: (product: any) => void;
}

const TikTokTrends: React.FC<TikTokTrendsProps> = ({ onProductSelect }) => {
  // Backend quota management for TikTok search
  const { quotaDetails: tiktokSearchQuotaDetails, updateQuota: updateTikTokSearchQuota } = useUserSubscriptionAndSearchQuota(QuotaNames.TikTokSearches);

  // Subscription quota management for supplier discovery
  const { quotaDetails: supplierQuotaDetails, updateQuota: updateSupplierQuota } = useUserSubscriptionAndSearchQuota(QuotaNames.SupplierDiscovery);

  // For displaying plan name (use tiktokSearchQuotaDetails as the main quota details)
  const quotaDetails = tiktokSearchQuotaDetails;

  // State management
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7');
  const [selectedSortBy, setSelectedSortBy] = useState('post');
  const [selectedSortOrder, setSelectedSortOrder] = useState('desc');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('GB'); // ✅ Default to UK
  const [shouldFetch, setShouldFetch] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAddOnsModal, setShowAddOnsModal] = useState(false);
  const [showAddOnsChoiceModal, setShowAddOnsChoiceModal] = useState(false);

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
  const [hashtagCountry, setHashtagCountry] = useState('GB'); // ✅ Default to UK
  const [hashtagIndustry, setHashtagIndustry] = useState('');
  const [trendingHashtags, setTrendingHashtags] = useState<any[]>([]);
  const [isHashtagsLoading, setIsHashtagsLoading] = useState(false);
  const [hashtagsError, setHashtagsError] = useState<string | null>(null);

  // Add a fetch counter to create unique query keys only when button is clicked
  const [fetchCounter, setFetchCounter] = useState(0);

  // Track last quota update to prevent duplicate updates
  const lastQuotaUpdateRef = useRef<number | null>(null);

  // TikTok API Query - Only fetch when shouldFetch is true
  const {
    data: tiktokData,
    isLoading: tiktokLoading,
    error: tiktokError,
  } = useQuery({
    queryKey: ['tiktok-trending', fetchCounter], // Only change when button is clicked
    queryFn: () => {
      console.log('🔥 QUERY FUNCTION EXECUTING - fetchCounter:', fetchCounter);
      return fetchTikTokTrendingProducts({
        category_id: selectedCategory || undefined,
        last: selectedTimeRange,
        order_by: selectedSortBy,
        order_type: selectedSortOrder,
        keyword: searchKeyword || undefined,
        country_code: selectedCountry,
        page: 1,
      });
    },
    enabled: shouldFetch, // Only fetch when button is clicked
    staleTime: 0, // Don't cache - always fetch fresh data
    gcTime: 0, // Don't keep in cache
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on component mount
    refetchOnReconnect: false, // Prevent refetch on reconnect
    retry: 1,
    retryDelay: 2000,
  });

  // Update quota when API response comes back and reset shouldFetch
  useEffect(() => {
    if (tiktokData?.remaining_quota !== undefined && tiktokData?.remaining_quota !== null) {
      console.log('📊 Quota update check:', {
        current: lastQuotaUpdateRef.current,
        new: tiktokData.remaining_quota,
        shouldFetch: shouldFetch,
        tiktokLoading: tiktokLoading
      });

      // Update quota if it has changed
      if (lastQuotaUpdateRef.current !== tiktokData.remaining_quota) {
        console.log('📊 Updating quota:', lastQuotaUpdateRef.current, '→', tiktokData.remaining_quota);
        lastQuotaUpdateRef.current = tiktokData.remaining_quota;
        updateTikTokSearchQuota(tiktokData.remaining_quota);
      }
    }

    // Always reset shouldFetch after data is received (whether quota changed or not)
    if (tiktokData && !tiktokLoading && shouldFetch) {
      console.log('✅ Data received, resetting shouldFetch to false');
      setShouldFetch(false);
    }
  }, [tiktokData, tiktokLoading, shouldFetch, updateTikTokSearchQuota]);

  // Debug logging for data structure
  useEffect(() => {
    if (tiktokData) {
      console.log('🔍 TIKTOK DATA RECEIVED:', tiktokData);
      console.log('📊 Data structure check:');
      console.log('  - tiktokData.data?.list:', tiktokData.data?.list?.length || 0);
      console.log('  - tiktokData.data?.products:', tiktokData.data?.products?.length || 0);
      console.log('  - shouldFetch:', shouldFetch);
      console.log('  - tiktokLoading:', tiktokLoading);
    }
  }, [tiktokData, shouldFetch, tiktokLoading]);

  const handleDoneClick = () => {
    console.log('🔘 BUTTON CLICKED - Discover Trending Products');
    console.log('🔘 Current state:', {
      tiktokLoading,
      shouldFetch,
      fetchCounter,
      quotaValue: tiktokSearchQuotaDetails.quotaValue
    });

    // Prevent multiple clicks while loading
    if (tiktokLoading || shouldFetch) {
      console.log('🔥 Discovery already in progress, ignoring duplicate click', {
        tiktokLoading,
        shouldFetch
      });
      return;
    }

    console.log('🔘 Current filters:', {
      category: selectedCategory,
      timeRange: selectedTimeRange,
      sortBy: selectedSortBy,
      sortOrder: selectedSortOrder,
      keyword: searchKeyword,
      country: selectedCountry
    });

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

    // Set shouldFetch to true and increment counter to trigger new query
    console.log('🚀 Triggering API call with button click');
    console.log('🚀 Setting shouldFetch to TRUE');
    setShouldFetch(true);
    setFetchCounter(prev => {
      const newCounter = prev + 1;
      console.log('🔢 Fetch counter incremented:', prev, '→', newCounter);
      return newCounter;
    });
  };

  // Fetch trending hashtags with quota deduction and 7-day caching
  const handleFetchTrendingHashtags = async () => {
    // Check backend quota before making API call
    if (tiktokSearchQuotaDetails.quotaValue <= 0) {
      setHashtagsError('No TikTok searches remaining. Please purchase add-ons to continue.');
      return;
    }

    setIsHashtagsLoading(true);
    setHashtagsError(null);
    try {
      const params = {
        page: '1',
        limit: '20',
        period: hashtagPeriod,
        country: hashtagCountry,
        sort_by: 'popular',
        ...(hashtagIndustry && { industry_id: hashtagIndustry })
      };

      // ✅ Call backend endpoint with 7-day caching and quota deduction
      const response = await api.get('/products/tiktok-trends/hashtags/', { params });
      const data = response.data;
      console.log('✅ Trending Hashtags API response:', data);

      // ✅ Update quota from backend response (handles cache hit/miss automatically)
      if (data.remaining_quota !== undefined) {
        console.log('🔄 Hashtag Discovery - Updating quota from backend:', data.remaining_quota);
        console.log('📊 Cache hit:', data.cache_hit ? 'YES (no quota deducted)' : 'NO (quota deducted)');
        updateTikTokSearchQuota(data.remaining_quota);
      }

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

        // Update quota after successful API call (shop analysis uses TikTok search quota)
        updateTikTokSearchQuota(tiktokSearchQuotaDetails.quotaValue - 1);

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
    console.log('🚀 Starting discover suppliers from card for:', product.url_title || product.title);

    // First open the modal with the product
    handleViewDetails(product);

    // Wait for modal to open and then trigger supplier discovery with the product
    setTimeout(async () => {
      console.log('⚡ Triggering automatic supplier discovery...');
      await handleDiscoverSuppliersWithProduct(product);
    }, 500);
  };

  // Helper function to discover suppliers with a specific product
  const handleDiscoverSuppliersWithProduct = async (product: any) => {
    if (isSupplierDiscoveryLoading) {
      console.log('Supplier discovery already in progress, ignoring click');
      return;
    }

    // Check if product is provided
    if (!product) {
      console.error('❌ No product provided for supplier discovery');
      alert('Please select a product first');
      return;
    }

    // Check backend quota before making API call
    if (supplierQuotaDetails.quotaValue <= 0) {
      console.log('❌ Supplier discovery quota exceeded');
      alert('No supplier discovery searches remaining. Please purchase add-ons to continue.');
      return;
    }

    console.log('🔍 Starting supplier discovery for:', product.url_title || product.title);
    setIsSupplierDiscoveryLoading(true);
    setActiveModalTab('suppliers');

    try {
      const response = await discoverSuppliers({
        title: product.url_title || product.title || 'TikTok Product',
        id: product.id || 'tiktok-product',
        price: product.price || 'N/A',
        category: product.first_ecom_category?.value || product.third_ecom_category?.value || 'TikTok Product'
      });

      console.log('✅ Supplier discovery response:', response);
      console.log('📦 Found suppliers:', response.suppliers?.length || 0);

      // Update quota if remaining_quota is provided in response
      if (response?.remaining_quota !== undefined) {
        console.log('🔄 TikTok Trends Supplier Discovery - Updating quota:', response.remaining_quota);
        updateSupplierQuota(response.remaining_quota);
      }

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

  const handleDiscoverSuppliers = async () => {
    // Use selectedProduct state for manual discovery from modal
    await handleDiscoverSuppliersWithProduct(selectedProduct);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
          <h2 className="text-3xl font-bold text-blue-900 dark:text-white mb-2">BlueRitt SocialPulse</h2>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-[#0072D6]" />
          TikTok Trends
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover trending products and hashtags on TikTok with BlueRitt SocialPulse
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
                      onClick={() => setShowAddOnsChoiceModal(true)}>
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
                Discover Trending Products
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
              Top Tiktok Trending Products
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
            {tiktokData && ((tiktokData.data?.list && tiktokData.data.list.length > 0) || (tiktokData.data?.products && tiktokData.data.products.length > 0)) && !tiktokLoading && (
              <div className="space-y-6">
                {/* ✅ Cache Hit Indicator - Shows when data is from 7-day cache */}
                {tiktokData.cache_hit && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Loaded from Cache - No Quota Deducted
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          These results were cached from your previous search. Your quota was not deducted. Cache expires in 7 days from first search.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ Fresh Data Indicator - Shows when data is from API (quota deducted) */}
                {!tiktokData.cache_hit && tiktokData.remaining_quota !== undefined && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Fresh Data from TikTok API - Quota Deducted
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          New data fetched from TikTok Creative Center. Results cached for 7 days. Remaining searches: {tiktokData.remaining_quota}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Display Direct API products first (fresh data), then database products */}
                  {(() => {
                    const productsToRender = tiktokData.data?.list || tiktokData.data?.products || [];
                    console.log('🎨 RENDERING PRODUCTS:', productsToRender.length, 'products');
                    console.log('🎨 Products array:', productsToRender);
                    return productsToRender;
                  })().map((product: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group flex flex-col h-full"
                    >
                      {/* Product Image with Pexels Fallback */}
                      <div className="relative">
                        <ProductImageWithFallback product={product} />

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
                                {product.ctr.toFixed(2)}
                              </div>
                            </div>
                          )}
                          {product.cvr !== undefined && product.cvr > 0 && (
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center border border-purple-200 dark:border-purple-800">
                              <div className="text-purple-600 dark:text-purple-400 mb-1 font-medium">CVR</div>
                              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                {product.cvr.toFixed(2)}
                              </div>
                            </div>
                          )}
                          {product.cpa !== undefined && product.cpa > 0 && (
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center border border-green-200 dark:border-green-800">
                              <div className="text-green-600 dark:text-green-400 mb-1 font-medium">CPA</div>
                              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                {product.cpa.toFixed(2)}
                              </div>
                            </div>
                          )}
                          {product.cost !== undefined && product.impression > 0 && (
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 text-center border border-orange-200 dark:border-orange-800">
                              <div className="text-orange-600 dark:text-orange-400 mb-1 font-medium">Impressions</div>
                              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                {(product.impression).toLocaleString()}
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
            {!shouldFetch && !tiktokLoading && !tiktokData && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Top TikTok Trending Products
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Select your filters above and click "Done" to get trending products from TikTok.
                </p>
                {/* <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <p>Selected Category: {selectedCategory ? TIKTOK_CATEGORIES.find(c => c.id === selectedCategory)?.name : 'All Categories'}</p>
                  <p>Time Range: {TIME_RANGES.find(t => t.value === selectedTimeRange)?.label}</p>
                  <p>Sort: {SORT_OPTIONS.find(s => s.value === selectedSortBy)?.label} ({selectedSortOrder})</p>
                  {searchKeyword && <p>Keyword: {searchKeyword}</p>}
                </div> */}
              </div>
            )}

            {/* No Results */}
            {tiktokData && (!tiktokData.data?.list || tiktokData.data.list.length === 0) && (!tiktokData.data?.products || tiktokData.data.products.length === 0) && !tiktokLoading && (
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
                    {/* Product Image with Pexels Fallback */}
                    <div className="space-y-4">
                      <ProductImageWithFallback product={selectedProduct} className="rounded-xl" />

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
                                <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600 h-40 flex items-center justify-center">
                                  <img
                                    src={firstProduct.image_url || `https://picsum.photos/400/400?random=${Date.now()}`}
                                    alt={firstProduct.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      if (!target.src.includes('picsum')) {
                                        target.src = `https://picsum.photos/400/400?random=${Date.now()}`;
                                      }
                                    }}
                                  />
                                </div>
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
                                {selectedProduct.ctr}
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
                                {selectedProduct.cvr}
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
                                {selectedProduct.cpa}
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
                                {selectedProduct.cost}
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
                                {selectedProduct.play_six_rate}
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

      {/* Add-ons Choice Modal */}
      <AddOnsChoiceModal
        isOpen={showAddOnsChoiceModal}
        onClose={() => setShowAddOnsChoiceModal(false)}
      />
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
  // ✅ Show ALL suppliers (both verified and unverified)
  const displaySuppliers = suppliers || [];

  console.log('🏭 TikTok Trends SuppliersTab render:', {
    totalSuppliersCount: suppliers?.length || 0,
    displayingAll: true,
    verifiedCount: displaySuppliers.filter(s => s.verification_status?.toLowerCase() !== 'unverified').length,
    unverifiedCount: displaySuppliers.filter(s => s.verification_status?.toLowerCase() === 'unverified').length,
    isLoading,
    analysisTime
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

  if (!displaySuppliers || displaySuppliers.length === 0) {
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
      <div className="bg-gradient-to-r from-orange-50 to-orange-50 dark:from-orange-900/30 dark:to-orange-900/30 rounded-lg p-4 border border-orange-100 dark:border-purple-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Supplier Analysis Complete
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p>Found {displaySuppliers.length} suppliers in {analysisTime}s</p>
          <p>Suppliers are ranked by AI match score and verification status</p>
        </div>
      </div>

      {/* Suppliers List */}
      <div className="space-y-4">
        {displaySuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-5 hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-lg transition-all duration-200">
            {/* Header with Name, Verification, and AI Score */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 pr-4">
                <h5 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{supplier.name}</h5>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{supplier.location}</p>

                {/* ✅ Verification Badges - Same design as Amazon Trends */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {/* Gold Supplier Badge */}
                  {(supplier.verification_badge === 'Gold Supplier' ||
                    supplier.verification_status === 'Gold Supplier' ||
                    supplier.verification_badge === 'Gold' ||
                    supplier.is_gold) && (
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
                      Gold Supplier
                    </span>
                  )}

                  {/* Verified Pro Badge */}
                  {(supplier.verification_badge === 'Verified Pro' ||
                    supplier.verified_pro) && (
                    <span className="bg-gradient-to-r from-orange-500 to-orange-700 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
                      Verified Pro
                    </span>
                  )}

                  {/* Verified Supplier Badge */}
                  {!supplier.verified_pro &&
                   (supplier.verification_badge === 'Verified Supplier' ||
                    supplier.verification_status === 'Verified' ||
                    supplier.verified_supplier) && (
                    <span className="bg-gradient-to-r from-red-500 to-red-700 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
                      Verified
                    </span>
                  )}

                  {/* Trade Assurance Badge */}
                  {supplier.trade_assurance && (
                    <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
                      Trade Assurance
                    </span>
                  )}

                  {/* Store Age Badge */}
                  {supplier.years_in_business && supplier.years_in_business > 0 && (
                    <span className="bg-gradient-to-r from-sky-400 to-sky-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
                      {supplier.years_in_business} {supplier.years_in_business === 1 ? 'year' : 'years'}
                    </span>
                  )}

                  {/* Rating Badge */}
                  {supplier.rating && supplier.rating > 0 && (
                    <span className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {supplier.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* AI Match Score - Circular Progress (Same as Amazon Trends) */}
              <div className="flex items-center justify-end">
                <div className="relative h-[90px] w-[90px]">
                  {/* Circular Progress Bar */}
                  <svg className="transform -rotate-90" width="90" height="90">
                    <circle
                      cx="45"
                      cy="45"
                      r="40"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="45"
                      cy="45"
                      r="40"
                      stroke={
                        (supplier.ai_match_score || 0) >= 80
                          ? '#22c55e'
                          : (supplier.ai_match_score || 0) >= 60
                          ? '#eab308'
                          : '#ef4444'
                      }
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={
                        2 * Math.PI * 40 * (1 - (supplier.ai_match_score || 0) / 100)
                      }
                    />
                  </svg>

                  {/* Content in center */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">AI Match</div>
                    <div className="font-bold text-purple-600 dark:text-purple-400">
                      {(supplier.ai_match_score || 0).toFixed(2)}%
                    </div>
                  </div>
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
            <div className="flex justify-end gap-2">
              {/* Calculate Button */}
              <button
                onClick={() => onCalculateClick(supplier)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-1.5 px-3 rounded-lg transition-all duration-200 font-medium text-sm flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                Calculate
              </button>

              {/* Contact Supplier Button */}
              {supplier.contact_url && (
                <a
                  href={supplier.contact_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-1.5 px-3 rounded-lg transition-all duration-200 font-medium text-sm flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
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
                <img
                  src={product.image_url || `https://picsum.photos/400/400?random=${Date.now()}`}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('picsum')) {
                      target.src = `https://picsum.photos/400/400?random=${Date.now()}`;
                    }
                  }}
                />
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

// Product Image Component with Freepik Fallback
interface ProductImageWithFallbackProps {
  product: any;
  className?: string;
}

const ProductImageWithFallback: React.FC<ProductImageWithFallbackProps> = ({ product, className = '' }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoadingFallback, setIsLoadingFallback] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  const handleImageError = async () => {
    // Only attempt fallback once
    if (fallbackAttempted) return;

    setFallbackAttempted(true);
    setIsLoadingFallback(true);

    try {
      // Use url_title for more relevant images, fallback to title or category
      const searchQuery = product.url_title || product.title || extractCategoryName(product);
      const cacheKey = `${product.id || ''}_${searchQuery}`;

      console.log('🖼️ Fetching Freepik fallback for product:', {
        id: product.id,
        url_title: product.url_title,
        title: product.title,
        searchQuery
      });

      const fallbackImage = await fetchPexelsFallbackImage(searchQuery, cacheKey);

      if (fallbackImage) {
        console.log('✅ Freepik fallback loaded:', fallbackImage);
        setImageSrc(fallbackImage);
      }
    } catch (error) {
      console.error('❌ Error fetching Freepik fallback:', error);
    } finally {
      setIsLoadingFallback(false);
    }
  };

  useEffect(() => {
    // Reset state when product changes
    setFallbackAttempted(false);
    setIsLoadingFallback(false);

    // Check if product has cover_url
    if (product.cover_url) {
      console.log('✅ Product has cover_url:', product.cover_url);
      setImageSrc(product.cover_url);
    } else {
      // No image from the start, fetch fallback immediately
      console.log('⚠️ Product missing cover_url, fetching fallback...');
      handleImageError();
    }
  }, [product.cover_url, product.id]);

  return (
    <div className={`relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700 ${className}`}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={product.url_title || 'TikTok Product'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />
      ) : isLoadingFallback ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="w-16 h-16 text-gray-400" />
        </div>
      )}
    </div>
  );
};

export default TikTokTrends;
