import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { Search, TrendingUp, Star, ShoppingCart, Award, Crown, Zap, Play, Heart, MessageCircle, Share, Eye, Package, Users, Hash } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'trending' | 'search' | 'creators' | 'hashtags'>('trending');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchCategory, setSearchCategory] = useState('');
  const [bestSellersCategory, setBestSellersCategory] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Product Details Modal State
  const [selectedProduct, setSelectedProduct] = useState<TikTokTrendingProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Real API queries - exactly like MarginMax flow
  const { data: trendingData, isLoading: trendingLoading, error: trendingError } = useQuery({
    queryKey: ['tiktok-trending', selectedCountry],
    queryFn: async () => {
      try {
        const response = await getTikTokTrendingProducts({
          country: selectedCountry,
          limit: 20,
          page: 1
        });

        console.log('🔄 TikTok Trending Response:', response);

        // Update quota if remaining_quota is provided in response
        if (response?.remaining_quota !== undefined) {
          console.log('🔄 TikTok Trending - Updating quota:', response.remaining_quota);
          updateQuota(response.remaining_quota);
        }

        // Ensure we always return valid data structure
        return {
          data: {
            products: response?.data?.products || [],
            total: response?.data?.total || 0,
            trending_count: response?.data?.trending_count || 0,
            api_count: response?.data?.api_count || 0,
            page: response?.data?.page || 1,
            limit: response?.data?.limit || 20,
            message: response?.data?.message || ''
          },
          country: response?.country || selectedCountry,
          remaining_quota: response?.remaining_quota || 0
        };
      } catch (error: any) {
        console.error('TikTok Trending API Error:', error);
        // Return empty data instead of throwing to prevent logout
        return {
          data: {
            products: [],
            total: 0,
            trending_count: 0,
            api_count: 0,
            page: 1,
            limit: 20,
            message: 'Unable to load trending products. Please try again later.'
          },
          country: selectedCountry,
          remaining_quota: 0
        };
      }
    },
    enabled: activeTab === 'trending',
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Disable retries to prevent multiple API calls
  });

  const { data: searchData, isLoading: searchLoading, refetch: refetchSearch, error: searchError } = useQuery({
    queryKey: ['tiktok-search', searchQuery, selectedCountry],
    queryFn: async () => {
      try {
        const response = await searchTikTokProducts({
          keyword: searchQuery,
          country_code: selectedCountry,
          limit: 20,
          page: 1,
          start_product_rating: 0,
          end_product_rating: 5
        });

        console.log('🔄 TikTok Search Response:', response);

        // Update quota if remaining_quota is provided in response
        if (response?.remaining_quota !== undefined) {
          console.log('🔄 TikTok Search - Updating quota:', response.remaining_quota);
          updateQuota(response.remaining_quota);
        }

        // Ensure we always return valid data structure
        return {
          data: {
            products: response?.data?.products || [],
            total: response?.data?.total || 0,
            trending_count: response?.data?.trending_count || 0,
            api_count: response?.data?.api_count || 0,
            page: response?.data?.page || 1,
            limit: response?.data?.limit || 20,
            message: response?.data?.message || ''
          },
          query: response?.query || searchQuery,
          country: response?.country || selectedCountry,
          remaining_quota: response?.remaining_quota || 0
        };
      } catch (error: any) {
        console.error('TikTok Search API Error:', error);
        // Return empty data instead of throwing to prevent logout
        return {
          data: {
            products: [],
            total: 0,
            trending_count: 0,
            api_count: 0,
            page: 1,
            limit: 20,
            message: 'Unable to search products. Please try again later.'
          },
          query: searchQuery,
          country: selectedCountry,
          remaining_quota: 0
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
      if (product.image_url && product.image_url.trim() !== '') {
        setImageState('loading');
        let processedUrl = product.image_url.trim();

        // Handle protocol-relative URLs
        if (processedUrl.startsWith('//')) {
          processedUrl = `https:${processedUrl}`;
        }

        // Handle TikTok CDN URLs that might need processing
        if (processedUrl.includes('tiktokcdn') && !processedUrl.startsWith('http')) {
          processedUrl = `https://${processedUrl}`;
        }

        setImageSrc(processedUrl);

        // Debug logging
        console.log('🖼️ TikTok Image Debug:', {
          productId: product.id,
          originalUrl: product.image_url,
          processedUrl: processedUrl,
          title: product.title
        });
      } else {
        setImageState('error');
        console.log('❌ No image URL for product:', product.id, product.title);
      }
    }, [product.image_url, product.id, product.title]);

    const handleImageLoad = () => {
      setImageState('loaded');
    };

    const handleImageError = () => {
      console.log('❌ Image failed to load:', imageSrc);
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
          {/* Product Info */}
          {/* <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center shadow-md">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">TikTok Shop</span>
          </div> */}

          {/* Title */}
          <h3 className="font-semibold text-gray-900 hover:text-[#de7a22] text-sm line-clamp-2 mb-2">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>

          {/* Engagement Stats */}
          {/* <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {formatNumber(product.likes_count)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {formatNumber(product.review_count || 0)}
              </span>
              <span className="flex items-center gap-1">
                <Share className="w-3 h-3" />
                {formatNumber(product.shares_count)}
              </span>
            </div>
            <span>{formatNumber(product.views_count)} views</span>
          </div> */}

          {/* Price */}
          {product.price && (
            <div className="flex items-center justify-between">
              <span className="font-bold text-green-600 text-lg">{product.price}</span>
            </div>
          )}

          {/* Product Description */}
          {product.description && (
            <div className="text-xs text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </div>
          )}

          {/* Trending Stats */}
          {product.source === 'trending' && (
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t mb-3">
              {/* <span>Views: {formatNumber(product.views_count)}</span> */}
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent font-medium">
                Trending #{index + 1}
              </span>
            </div>
          )}

          {/* View Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick(product);
            }}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
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
        const searchProducts = searchData?.data?.products || [];
        console.log('🔍 TikTok Search Products:', searchProducts.length, searchProducts);
        return searchProducts;
      case 'trending':
        const trendingProducts = trendingData?.data?.products || [];
        console.log('📈 TikTok Trending Products:', trendingProducts.length, trendingProducts);
        return trendingProducts;
      case 'creators':
        return []; // To be implemented
      case 'hashtags':
        return []; // To be implemented
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
      case 'creators':
        return false;
      case 'hashtags':
        return false;
      default:
        return false;
    }
  };

  const products = getCurrentData();
  const isLoading = getCurrentLoading();

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
            <option value="UK">United Kingdom</option>
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

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'trending', label: 'Trending', icon: TrendingUp },
              { key: 'search', label: 'Search Results', icon: Search },
              { key: 'creators', label: 'Top Creators', icon: Award },
              { key: 'hashtags', label: 'Trending Hashtags', icon: Crown },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as 'trending' | 'search' | 'creators' | 'hashtags')}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => renderProductCard(product, index))}
              </div>
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
                {/* Debug info */}
                <div className="text-xs text-gray-400 mt-4">
                  <p>Debug: {activeTab === 'search' ? 'Search' : 'Trending'} data loaded: {activeTab === 'search' ? !!searchData : !!trendingData ? 'Yes' : 'No'}</p>
                  <p>Products count: {products.length}</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Top Creators Content */}
        {activeTab === 'creators' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-pink-500" />
                Top TikTok Creators
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: '@fashionista_maya', followers: '2.3M', engagement: '8.5%', niche: 'Fashion & Style', avatar: '/api/placeholder/80/80' },
                  { name: '@techreview_pro', followers: '1.8M', engagement: '12.3%', niche: 'Tech Reviews', avatar: '/api/placeholder/80/80' },
                  { name: '@homedesign_guru', followers: '3.1M', engagement: '6.7%', niche: 'Home Decor', avatar: '/api/placeholder/80/80' },
                  { name: '@fitness_journey', followers: '1.5M', engagement: '15.2%', niche: 'Fitness & Health', avatar: '/api/placeholder/80/80' },
                  { name: '@foodie_adventures', followers: '2.7M', engagement: '9.8%', niche: 'Food & Cooking', avatar: '/api/placeholder/80/80' },
                  { name: '@beauty_secrets', followers: '4.2M', engagement: '7.1%', niche: 'Beauty & Skincare', avatar: '/api/placeholder/80/80' },
                ].map((creator, index) => (
                  <div key={index} className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{creator.name}</h4>
                        <p className="text-sm text-gray-600">{creator.niche}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Followers:</span>
                        <div className="font-semibold text-pink-600">{creator.followers}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Engagement:</span>
                        <div className="font-semibold text-purple-600">{creator.engagement}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trending Hashtags Content */}
        {activeTab === 'hashtags' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Hash className="w-6 h-6 text-pink-500" />
                Trending Hashtags
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { tag: '#viral', posts: '12.5M', growth: '+25%', category: 'General' },
                  { tag: '#tiktokmademebuyit', posts: '8.3M', growth: '+18%', category: 'Shopping' },
                  { tag: '#amazonfinds', posts: '6.7M', growth: '+32%', category: 'Shopping' },
                  { tag: '#aesthetic', posts: '15.2M', growth: '+12%', category: 'Lifestyle' },
                  { tag: '#smallbusiness', posts: '4.1M', growth: '+45%', category: 'Business' },
                  { tag: '#diy', posts: '9.8M', growth: '+22%', category: 'DIY' },
                  { tag: '#skincare', posts: '11.3M', growth: '+28%', category: 'Beauty' },
                  { tag: '#homedesign', posts: '5.9M', growth: '+35%', category: 'Home' },
                  { tag: '#fashion', posts: '18.7M', growth: '+15%', category: 'Fashion' },
                ].map((hashtag, index) => (
                  <div key={index} className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-lg text-pink-600">{hashtag.tag}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        hashtag.growth.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {hashtag.growth}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Posts:</span>
                        <span className="font-semibold">{hashtag.posts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium text-purple-600">{hashtag.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
