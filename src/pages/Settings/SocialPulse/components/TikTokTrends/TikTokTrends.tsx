import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { Search, TrendingUp, Star, ShoppingCart, Zap, Play, Heart, MessageCircle, Share, Eye, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import TikTokProductDetailsModal from './TikTokProductDetailsModal';
import SearchesAlert from '../../../../../@spk/uielements/SearchesAlert';
import { useUserSubscriptionAndSearchQuota } from '../../../../../hooks/useUserDetails';
import { QuotaNames } from '../../../../../enum';
import LoadingSpinner from '../../../../../components/LoadingSpinner';
import ProductLoadingSkeleton from '../../../../../components/ProductLoadingSkeleton';
import TikTokLoader from '../../../../../components/TikTokLoader';

// Import TikTok API functions
import {
  searchTikTokProducts,
  getTikTokTrendingProducts,
  formatNumber,
  formatPrice,
  formatTrendingScore,
  type TikTokTrendingProduct,
  type TikTokSearchParams
} from '@/api/tiktokTrends';

interface TikTokTrendsProps {
  onProductSelect?: (product: TikTokTrendingProduct) => void;
}

const TikTokTrends: React.FC<TikTokTrendsProps> = ({ onProductSelect }) => {
  const dispatch = useDispatch();
  const selectedAsinProducts = useSelector((state: any) => state.selectedAsinProducts);

  // Subscription quota management - Using AmazonSearch quota type for TikTok (valid search type)
  const { quotaDetails, updateQuota } = useUserSubscriptionAndSearchQuota(QuotaNames.AmazonSearch);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [activeTab, setActiveTab] = useState<'trending' | 'search'>('trending');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchCategory, setSearchCategory] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLast, setSelectedLast] = useState('7'); // 1, 7, or 30 days
  const [searchCurrentPage, setSearchCurrentPage] = useState(1); // Separate pagination for search results

  // New filter states for trending
  const [orderBy, setOrderBy] = useState('post'); // post, ctr, cvr, cpa, cost, like, share, comment, impression, play_six_rate
  const [orderType, setOrderType] = useState('desc'); // asc or desc

  // Product Details Modal State
  const [selectedProduct, setSelectedProduct] = useState<TikTokTrendingProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Real API queries - Backend now fetches 5 pages and returns ALL products (~100 products)
  // Frontend handles client-side pagination (12 per page)
  const { data: trendingData, isLoading: trendingLoading, error: trendingError } = useQuery({
    queryKey: ['tiktok-trending', selectedCountry, searchCategory, selectedLast, orderBy, orderType],  // Added orderBy and orderType
    queryFn: async () => {
      try {
        const response = await getTikTokTrendingProducts({
          country: selectedCountry,
          limit: 12,  // Not used by backend, but kept for compatibility
          page: 1,  // Always page 1 - backend fetches 3 pages internally
          category: searchCategory,
          last: selectedLast,
          keyword: 'bestseller',  // Use "bestseller" keyword to fetch bestselling products
          order_by: orderBy,  // Sort field: post, ctr, cvr, cpa, cost, like, share, comment, impression, play_six_rate
          order_type: orderType  // Sort order: asc or desc
        });

        console.log('🔄 TikTok Trending Response (ALL products from 3 API pages):', response);
        console.log(`📊 Total products received: ${response?.data?.products?.length || 0}`);

        // Update quota if remaining_quota is provided in response
        if (response?.remaining_quota !== undefined) {
          console.log('🔄 TikTok Trending - Updating quota:', response.remaining_quota);
          updateQuota(response.remaining_quota);
        }

        // Ensure we always return valid data structure
        return {
          data: {
            products: response?.data?.products || [],  // ALL products from 3 API pages (~60 products)
            total: response?.data?.total || 0,
            trending_count: response?.data?.trending_count || 0,
            api_count: response?.data?.api_count || 0,
            page: 1,  // Always page 1 since we get all products
            limit: response?.data?.products?.length || 0,  // Total products
            total_pages: (response?.data && 'total_pages' in response.data) ? (response.data as any).total_pages : 1,
            has_more: false,  // All products returned at once
            message: response?.data?.message || ''
          },
          country: response?.country || selectedCountry,
          remaining_quota: response?.remaining_quota || 0
        };
      } catch (error: any) {
        console.error('TikTok Trending API Error:', error);

        // Handle insufficient credits error (402)
        if (error?.response?.status === 402) {
          const errorData = error.response?.data;
          toast.error(errorData?.message || 'You have run out of TikTok Trends Searches. Please purchase more credits or upgrade your plan.');
        }

        // Return empty data instead of throwing to prevent logout
        return {
          data: {
            products: [],
            total: 0,
            trending_count: 0,
            api_count: 0,
            page: 1,
            limit: 0,
            total_pages: 0,
            message: error?.response?.status === 402
              ? 'Insufficient TikTok Trends Searches'
              : 'Unable to load trending products. Please try again later.'
          },
          country: selectedCountry,
          remaining_quota: error?.response?.data?.remaining_searches || 0
        };
      }
    },
    enabled: activeTab === 'trending',
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Disable retries to prevent multiple API calls
  });

  // Backend now fetches 3 pages and returns ALL products (~60 products)
  // Frontend handles client-side pagination (12 per page)
  const { data: searchData, isLoading: searchLoading, refetch: refetchSearch } = useQuery({
    queryKey: ['tiktok-search', searchQuery, selectedCountry],
    queryFn: async () => {
      try {
        // Backend fetches 3 pages internally and returns all products
        const response = await searchTikTokProducts({
          keyword: searchQuery,
          country_code: selectedCountry,
          limit: 12,  // Not used by backend, but kept for compatibility
          page: 1,  // Always page 1 - backend fetches 3 pages internally
          start_product_rating: 0,
          end_product_rating: 5
        });

        console.log('🔄 TikTok Search Response (ALL products from 3 API pages):', response);
        console.log(`📊 Total products received: ${response?.data?.products?.length || 0}`);

        // Update quota if remaining_quota is provided in response
        if (response?.remaining_quota !== undefined) {
          console.log('🔄 TikTok Search - Updating quota:', response.remaining_quota);
          updateQuota(response.remaining_quota);
        }

        // Return all products
        return {
          data: {
            products: response?.data?.products || [],  // ALL products from 3 API pages (~60 products)
            total: response?.data?.total || 0,
            trending_count: 0,
            api_count: response?.data?.api_count || 0,
            page: 1,  // Always page 1 since we get all products
            limit: response?.data?.products?.length || 0,  // Total products
            total_pages: (response?.data && 'total_pages' in response.data) ? (response.data as any).total_pages : 1,
            message: response?.data?.message || ''
          },
          query: searchQuery,
          country: selectedCountry,
          remaining_quota: response?.remaining_quota || 0
        };
      } catch (error: any) {
        console.error('TikTok Search API Error:', error);

        // Handle insufficient credits error (402)
        if (error?.response?.status === 402) {
          const errorData = error.response?.data;
          toast.error(errorData?.message || 'You have run out of TikTok Trends Searches. Please purchase more credits or upgrade your plan.');
        }

        // Return empty data instead of throwing to prevent logout
        return {
          data: {
            products: [],
            total: 0,
            trending_count: 0,
            api_count: 0,
            page: 1,
            limit: 0,
            total_pages: 0,
            message: error?.response?.status === 402
              ? 'Insufficient TikTok Trends Searches'
              : 'Unable to search products. Please try again later.'
          },
          query: searchQuery,
          country: selectedCountry,
          remaining_quota: error?.response?.data?.remaining_searches || 0
        };
      }
    },
    enabled: false, // Only run when manually triggered
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false, // Disable retries to prevent multiple API calls
  });

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsSearching(true);
    setActiveTab('search');
    setSearchCurrentPage(1); // Reset to first page when searching

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

  const handleProductClick = (product: TikTokTrendingProduct) => {
    // Open product details modal
    setSelectedProduct(product);
    setIsModalOpen(true);

    // Also handle Redux state for compatibility
    const productId = product.id;
    const title = product.title;

    if (!selectedAsinProducts?.includes(productId)) {
      dispatch({
        type: "SET_SELECTED_ASIN_PRODUCTS",
        payload: [...(selectedAsinProducts || []), productId],
      });
    }

    dispatch({
      type: "SET_SCANNER_PRODUCT_DETAILS",
      payload: {
        data: {
          asin: productId, // Using product ID as ASIN equivalent
          product_title: title,
        },
        parameters: {
          searchCountry: selectedCountry,
        },
      },
    });
    
    dispatch({
      type: "SET_SCANNER_ACTIVE_COMPONENT",
      payload: "Connect",
    });
  };



  // Enhanced image component with loading states
  const TikTokProductImage: React.FC<{ product: TikTokTrendingProduct }> = ({ product }) => {
    const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
    const [imageSrc, setImageSrc] = useState<string>('');

    useEffect(() => {
      // Prioritize cover_url from TikTok Creative Center API
      const imageUrl = (product as any).cover_url || product.image_url || '';

      if (imageUrl && imageUrl.trim() !== '') {
        setImageState('loading');
        let processedUrl = imageUrl.trim();

        // Handle protocol-relative URLs
        if (processedUrl.startsWith('//')) {
          processedUrl = `https:${processedUrl}`;
        }
        // Handle TikTok CDN URLs that might need processing
        else if (processedUrl.includes('tiktokcdn') && !processedUrl.startsWith('http')) {
          processedUrl = `https://${processedUrl}`;
        }
        // Ensure URL starts with http/https
        else if (!processedUrl.startsWith('http')) {
          processedUrl = `https://${processedUrl}`;
        }

        // Use image proxy to bypass CORS restrictions
        const API_URL = import.meta.env.VITE_API_URL || 'https://staging-api.blueritt.com';
        const proxyUrl = `${API_URL}/products/tiktok-trends/image-proxy/?url=${encodeURIComponent(processedUrl)}`;

        setImageSrc(proxyUrl);

        // Debug logging
        console.log('🖼️ TikTok Image Debug:', {
          productId: product.id,
          cover_url: (product as any).cover_url,
          image_url: product.image_url,
          originalUrl: processedUrl,
          proxyUrl: proxyUrl,
          title: product.title
        });
      } else {
        setImageState('error');
      }
    }, [(product as any).cover_url, product.image_url, product.id, product.title]);

    const handleImageLoad = () => {
      setImageState('loaded');
    };

    const handleImageError = () => {
      setImageState('error');
    };

    return (
      <div className="relative h-48 bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Loading State */}
        {imageState === 'loading' && imageSrc && (
          <>
            <img
              src={imageSrc}
              alt={product.title}
              className="w-full h-full object-contain p-4"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
              <LoadingSpinner size="sm" color="primary" />
            </div>
          </>
        )}

        {/* Loaded State */}
        {imageState === 'loaded' && (
          <img
            src={imageSrc}
            alt={product.title}
            className="w-full h-full object-contain p-4"
          />
        )}

        {/* Error/Fallback State */}
        {imageState === 'error' && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Image not available</p>
            </div>
          </div>
        )}

        {/* Video indicator if video_url exists */}
        {product.video_url && (
          <div className="absolute top-2 left-2">
            <div className="bg-black bg-opacity-70 rounded-full p-2">
              <Play className="w-4 h-4 text-white fill-current" />
            </div>
          </div>
        )}

        {/* Trending Badge */}
        {product.source === 'trending' && (
          <div className="absolute top-2 left-2">
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <TrendingUp className="w-3 h-3" />
              Trending
            </span>
          </div>
        )}

        {/* Trending Score */}
        {product.trending_score && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
            Score: {product.trending_score.toFixed(1)}
          </div>
        )}
      </div>
    );
  };

  const renderProductCard = (product: TikTokTrendingProduct, index: number) => {
    const productData = product as any;

    return (
      <div
        key={`${product.id}-${index}`}
        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
        onClick={() => handleProductClick(product)}
      >
        {/* Product Image with Enhanced Loading */}
        <TikTokProductImage product={product} />

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 hover:text-[#de7a22] text-base line-clamp-2 mb-2">
            {product.title}
          </h3>

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* CTR */}
            {productData.ctr !== undefined && (
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-xs text-gray-600">CTR</div>
                <div className="text-sm font-bold text-green-600">{productData.ctr}%</div>
              </div>
            )}

            {/* CVR */}
            {productData.cvr !== undefined && (
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-xs text-gray-600">CVR</div>
                <div className="text-sm font-bold text-blue-600">{productData.cvr}%</div>
              </div>
            )}

            {/* CPA */}
            {productData.cpa !== undefined && (
              <div className="bg-purple-50 rounded-lg p-2">
                <div className="text-xs text-gray-600">CPA</div>
                <div className="text-sm font-bold text-purple-600">${productData.cpa}</div>
              </div>
            )}

            {/* Posts */}
            {productData.post_count !== undefined && (
              <div className="bg-pink-50 rounded-lg p-2">
                <div className="text-xs text-gray-600">Posts</div>
                <div className="text-sm font-bold text-pink-600">{formatNumber(productData.post_count)}</div>
              </div>
            )}
          </div>

          {/* Engagement Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            {/* Likes */}
            {product.likes_count > 0 && (
              <div className="flex items-center gap-1 text-gray-600">
                <Heart className="w-3 h-3 text-red-500" />
                <span>{formatNumber(product.likes_count)}</span>
              </div>
            )}

            {/* Comments */}
            {productData.comments_count > 0 && (
              <div className="flex items-center gap-1 text-gray-600">
                <MessageCircle className="w-3 h-3 text-blue-500" />
                <span>{formatNumber(productData.comments_count)}</span>
              </div>
            )}

            {/* Shares */}
            {product.shares_count > 0 && (
              <div className="flex items-center gap-1 text-gray-600">
                <Share className="w-3 h-3 text-green-500" />
                <span>{formatNumber(product.shares_count)}</span>
              </div>
            )}

            {/* Views */}
            {product.views_count > 0 && (
              <div className="flex items-center gap-1 text-gray-600">
                <Eye className="w-3 h-3 text-purple-500" />
                <span>{formatNumber(product.views_count)}</span>
              </div>
            )}
          </div>

          {/* Trending Badge */}
          {product.source === 'trending' && (
            <div className="mb-3">
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                🔥 Trending #{index + 1}
              </span>
            </div>
          )}

          {/* View Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick(product);
            }}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
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
        const allSearchProducts = searchData?.data?.products || [];
        console.log('🔍 TikTok Search - Total Products:', allSearchProducts.length);
        console.log('🔍 TikTok Search - All Products:', allSearchProducts);

        // Client-side pagination: Show 12 products per page
        const startIndex = (searchCurrentPage - 1) * 12;
        const endIndex = startIndex + 12;
        const paginatedSearchProducts = allSearchProducts.slice(startIndex, endIndex);

        console.log(`📄 Search Page ${searchCurrentPage}: Showing ${paginatedSearchProducts.length} products (${startIndex + 1}-${Math.min(endIndex, allSearchProducts.length)} of ${allSearchProducts.length})`);
        console.log('📄 Paginated Products:', paginatedSearchProducts);
        return paginatedSearchProducts;
      case 'trending':
        // Client-side pagination for trending products
        // Backend returns ALL products from 5 API pages (~100 products)
        // Frontend displays 12 per page
        const allTrendingProducts = trendingData?.data?.products || [];
        console.log('📊 TikTok Trending - Total Products:', allTrendingProducts.length);
        console.log('📊 TikTok Trending - All Products:', allTrendingProducts);

        const trendingStartIndex = (currentPage - 1) * 12;
        const trendingEndIndex = trendingStartIndex + 12;
        const paginatedTrendingProducts = allTrendingProducts.slice(trendingStartIndex, trendingEndIndex);


        console.log(`📄 Trending Page ${currentPage}: Showing ${paginatedTrendingProducts.length} products (${trendingStartIndex + 1}-${Math.min(trendingEndIndex, allTrendingProducts.length)} of ${allTrendingProducts.length})`);
        console.log('📄 Paginated Products:', paginatedTrendingProducts);
        return paginatedTrendingProducts;
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
      default:
        return false;
    }
  };

  const products = getCurrentData();
  const isLoading = getCurrentLoading();

  // Debug: Log products before rendering
  console.log('🎨 RENDERING - Products to display:', products.length, products);

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-white fill-current" />
          </div>
          TikTok Trends
        </h1>
        <p className="text-gray-600">
          Discover viral products and trending items from TikTok creators
        </p>
      </div>

      {/* Subscription Quota Alert */}
      <div className="mb-6">
        <SearchesAlert
          quotaDetails={quotaDetails}
          searchType="TikTok Trends Searches"
          addOnName="TikTok Trends Search"
        />
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Products or Hashtags
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g., phone case, room decor, #viral"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Region
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="IT">Italy</option>
            <option value="ES">Spain</option>
            <option value="JP">Japan</option>
          </select>
        </div>
        
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 flex items-center gap-2"
        >
          {isSearching ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Search
            </>
          )}
        </button>
      </div>

      {/* Filters for Trending Tab */}
      {activeTab === 'trending' && (
        <div className="mb-6 space-y-4">
          {/* First Row: Category, Time Range, Sort By */}
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={searchCategory}
                onChange={(e) => {
                  setSearchCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="605196">Automotive & Motorbike</option>
                <option value="602284">Baby & Maternity</option>
                <option value="601450">Beauty & Personal Care</option>
                <option value="801928">Books, Magazines & Audio</option>
                <option value="951432">Collectibles</option>
                <option value="601755">Computers & Office Equipment</option>
                <option value="605248">Fashion Accessories</option>
                <option value="700437">Food & Beverages</option>
                <option value="604453">Furniture</option>
                <option value="700645">Health</option>
                <option value="604968">Home Improvement</option>
                <option value="600001">Home Supplies</option>
                <option value="600942">Household Appliances</option>
                <option value="953224">Jewellery, Accessories & Derivatives</option>
                <option value="802184">Kids Fashion</option>
                <option value="600024">Kitchenware</option>
                <option value="824584">Luggage & Bags</option>
                <option value="824328">Menswear & Men's Underwear</option>
                <option value="601303">Muslim Fashion</option>
                <option value="602118">Pet Supplies</option>
                <option value="601739">Phones & Electronics</option>
                <option value="601352">Shoes</option>
                <option value="603014">Sports & Outdoor</option>
                <option value="600154">Textiles & Soft Furnishings</option>
                <option value="604579">Tools & Hardware</option>
                <option value="604206">Toys & Hobbies</option>
                <option value="834312">Virtual Products</option>
                <option value="601152">Womenswear & Women's Underwear</option>
              </select>
            </div>

            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                value={selectedLast}
                onChange={(e) => {
                  setSelectedLast(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="1">Yesterday (1 day)</option>
  <option value="7">Last 7 days</option>
  <option value="30">Last 30 days</option>
              </select>
            </div>

            <div className="min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={orderBy}
                onChange={(e) => {
                  setOrderBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="post">Popularity (Posts)</option>
                <option value="post_change">Popularity Change</option>
                <option value="ctr">CTR (Click-Through Rate)</option>
                <option value="cvr">CVR (Conversion Rate)</option>
                <option value="cpa">CPA (Cost Per Action)</option>
                <option value="cost">Total Cost</option>
                <option value="like">Likes</option>
                <option value="share">Shares</option>
                <option value="comment">Comments</option>
                <option value="impression">Views (Impressions)</option>
                <option value="play_six_rate">6s View Rate</option>
              </select>
            </div>

            <div className="min-w-[120px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={orderType}
                onChange={(e) => {
                  setOrderType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="desc">Highest First</option>
                <option value="asc">Lowest First</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'trending', label: 'Trending', icon: TrendingUp },
              { key: 'search', label: 'Search Results', icon: Search },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key as 'trending' | 'search');
                  setCurrentPage(1); // Reset to page 1 when switching tabs
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                  activeTab === key
                    ? 'border-pink-500 text-pink-600 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {key === 'search' && searchData?.data?.products?.length && (
                  <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                    {searchData.data.products.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Products Content (Trending & Search) */}
        {(activeTab === 'trending' || activeTab === 'search') && (
          <>
            {isLoading ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center py-8">
                  <TikTokLoader
                    size="lg"
                    text={`Loading ${activeTab === 'search' ? 'TikTok search results' : 'trending TikTok products'}...`}
                  />
                </div>
                <ProductLoadingSkeleton count={8} />
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => renderProductCard(product, index))}
                </div>

                {/* Trending Pagination with Page Numbers */}
                {activeTab === 'trending' && trendingData?.data?.products && trendingData.data.products.length > 0 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const totalProducts = trendingData.data.products.length;
                        const totalPages = Math.ceil(totalProducts / 12);
                        const pages = [];

                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all ${
                                currentPage === i
                                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        return pages;
                      })()}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage >= Math.ceil((trendingData?.data?.products?.length || 0) / 12)}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>

                    {/* Total count */}
                    <span className="ml-2 text-sm text-gray-600">
                      ({trendingData.data.products.length} total products)
                    </span>
                  </div>
                )}

                {/* Search Pagination with Page Numbers */}
                {activeTab === 'search' && searchData?.data?.products && searchData.data.products.length > 0 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setSearchCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={searchCurrentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const totalProducts = searchData.data.products.length;
                        const totalPages = Math.ceil(totalProducts / 12);
                        const pages = [];

                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => setSearchCurrentPage(i)}
                              className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all ${
                                searchCurrentPage === i
                                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        return pages;
                      })()}
                    </div>

                    <button
                      onClick={() => setSearchCurrentPage(prev => prev + 1)}
                      disabled={searchCurrentPage >= Math.ceil((searchData?.data?.products?.length || 0) / 12)}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>

                    {/* Total count */}
                    <span className="ml-2 text-sm text-gray-600">
                      ({searchData.data.products.length} total products)
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-[#eb5929c7] to-[#0037a2] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-white fill-current" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'search' ? 'No search results found' : 'No trending products available'}
                </h3>
                <p className="text-gray-500 mb-2">
                  {activeTab === 'search'
                    ? searchData?.data?.message || 'Try searching for different keywords or hashtags'
                    : trendingData?.data?.message || 'Check back later for the latest trending products'
                  }
                </p>
           
              </div>
            )}
          </>
        )}


      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <TikTokProductDetailsModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default TikTokTrends;
