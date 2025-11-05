
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { X, ExternalLink, Star, Package, MessageSquare, DollarSign, Truck, Shield, Zap, Heart, Eye, Share, Save, Calculator } from 'lucide-react';
import { toast } from 'react-toastify';

import {
  getTikTokProductDetails,
  getTikTokProductTrends,
  getTikTokCreativeCenterProductDetails,
  discoverSuppliers,
  formatNumber,
  formatPrice,
  type TikTokTrendingProduct,
  type TikTokProductTrends,
  type TikTokCreativeCenterProductDetails,
  type SupplierInfo,
  type AudienceAge
} from '@/api/tiktokTrends';

import { saveProducts, getCategory, createCategory } from '@/api/savedProducts';
import { useUserSubscriptionAndSearchQuota } from '../../../../../hooks/useUserDetails';
import { QuotaNames } from '../../../../../enum';
import TikTokProfitCalculatorModal from './TikTokProfitCalculatorModal';
import TikTokSaveSearchModal from './TikTokSaveSearchModal';

interface TikTokProductDetailsModalProps {
  product: TikTokTrendingProduct;
  isOpen: boolean;
  onClose: () => void;
  autoStartSupplierDiscovery?: boolean; // ✅ EXACT COPY from Amazon ProductExplorer
}

type TabType = 'overview' | 'engagement' | 'suppliers';

// Trending Hashtags Auto-scrolling Carousel Component
const TrendingHashtagsCarousel: React.FC<{ hashtags: string[] }> = ({ hashtags }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Auto-scroll logic with 50ms interval
    // Pauses on hover, resumes on leave
    // Resets to start when reaching end
  }, [isHovering, hashtags.length]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth">
      {/* Duplicate hashtags for infinite scroll */}
      {[...hashtags, ...hashtags].map((hashtag, index) => (
        <span className="...">#{hashtag}</span>
      ))}
    </div>
  );
};

const TikTokProductDetailsModal: React.FC<TikTokProductDetailsModalProps> = ({ product, isOpen, onClose, autoStartSupplierDiscovery }) => {
  // Quota management for supplier discovery
  const { quotaDetails: supplierQuotaDetails, updateQuota: updateSupplierQuota } = useUserSubscriptionAndSearchQuota(QuotaNames.AlibabaMatchPerProduct);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSupplierDiscoveryLoading, setIsSupplierDiscoveryLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierInfo[]>([]);
  const [supplierAnalysisTime, setSupplierAnalysisTime] = useState<number>(0);

  // New state for save and calculator functionality
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierInfo | null>(null);
  const [showProfitCalculator, setShowProfitCalculator] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Reset supplier data when modal is closed/opened with different product
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('overview');
      setIsSupplierDiscoveryLoading(false);
      setSuppliers([]);
      setSupplierAnalysisTime(0);
      setSelectedSupplier(null);
      setShowProfitCalculator(false);
      setShowSaveModal(false);
    }
  }, [isOpen, product.id]);

  // ✅ Auto-start supplier discovery when modal opens with autoStartSupplierDiscovery flag - EXACT COPY from Amazon ProductExplorer
  useEffect(() => {
    if (isOpen && autoStartSupplierDiscovery && !isSupplierDiscoveryLoading && suppliers.length === 0) {
      console.log('🚀 Auto-starting supplier discovery for TikTok product:', product.title);
      setTimeout(() => {
        handleDiscoverSuppliers();
      }, 500);
    }
  }, [isOpen, autoStartSupplierDiscovery, product.id]);

  // Product Details Query - Fetch detailed product info including audience data
  const {
    data: details,
    isLoading: detailsLoading,
    error: detailsError,
  } = useQuery({
    queryKey: ['tiktok-product-details', product.id],
    queryFn: () => getTikTokProductDetails(product.id),
    enabled: isOpen, // Enabled - fetch when modal opens
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Product Trends Query - DISABLED (endpoint doesn't exist, would return dummy data)
  const {
    data: trendsData,
    isLoading: trendsLoading,
    error: trendsError,
  } = useQuery({
    queryKey: ['tiktok-product-trends', product.id],
    queryFn: () => {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return getTikTokProductTrends(product.id, startDate, endDate);
    },
    enabled: false, // Disabled - endpoint doesn't exist in backend
    staleTime: 1000 * 60 * 30, // 30 minutes (trends data changes more frequently)
  });

  // TikTok Creative Center Details Query - Fetch age levels and hashtags
  const {
    data: creativeCenterData,
    isLoading: creativeCenterLoading,
    error: creativeCenterError,
  } = useQuery({
    queryKey: ['tiktok-creative-center-details', product.id],
    queryFn: () => getTikTokCreativeCenterProductDetails(product.id),
    enabled: isOpen && activeTab === 'overview', // Only fetch when modal opens and overview tab is active
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // ✅ Handle supplier discovery - EXACT COPY from BlueRitt Explorer
  const handleDiscoverSuppliers = async () => {
    // Prevent multiple simultaneous calls
    if (isSupplierDiscoveryLoading) {
      console.log('Supplier discovery already in progress, ignoring click');
      return;
    }

    setIsSupplierDiscoveryLoading(true);
    setActiveTab('suppliers');

    try {
      const response = await discoverSuppliers({
        title: product.title,
        asin: product.id || '',
        brand: product.brand || '',
        price: product.price || '',
        category: 'TikTok Product'
      });

      console.log('🔍 Supplier Discovery Response:', response);

      // Update quota if remaining_quota is provided in response
      if (response?.remaining_quota !== undefined) {
        console.log('🔄 Product Explorer Supplier Discovery - Updating quota:', response.remaining_quota);
        updateSupplierQuota(response.remaining_quota);
      }

      // Handle both response formats: response.suppliers or response.data.suppliers
      const suppliersData = response.suppliers || response.data?.suppliers || [];
      const analysisTime = response.analysis_time || response.data?.analysis_time || 0;

      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
      setSupplierAnalysisTime(analysisTime);
    } catch (error) {
      console.error('Supplier discovery failed:', error);
      // Reset suppliers to empty array on error
      setSuppliers([]);
      setSupplierAnalysisTime(0);
    } finally {
      setIsSupplierDiscoveryLoading(false);
    }
  };

  // Handle supplier selection
  const handleSelectSupplier = (supplier: SupplierInfo) => {
    console.log('🎯 TikTok Supplier selected:', supplier.name, supplier);
    setSelectedSupplier(supplier);
    setShowProfitCalculator(true);
  };

  // Handle save search
  const handleSaveSearch = () => {
    setShowSaveModal(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-7xl w-full max-h-[98vh] sm:max-h-[95vh] overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full min-h-[500px] sm:min-h-[600px]">
          {/* Left Panel - Product Image and Basic Info */}
          <div className="w-full lg:w-1/3 lg:min-w-[300px] bg-gradient-to-br from-pink-50 to-purple-50 p-4 sm:p-6 flex flex-col overflow-y-auto lg:max-h-full max-h-[40vh] lg:max-h-none">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900 text-sm sm:text-base">TikTok Shop</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>

            {/* Product Image */}
            <div className="relative mb-4 sm:mb-6 bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg">
              {(() => {
                // Get image URL - prioritize cover_url from TikTok Creative Center API
                const imageUrl = (product as any).cover_url || product.image_url || '';
                const hasImage = imageUrl && imageUrl.trim() !== '';

                let processedUrl = '';
                if (hasImage) {
                  processedUrl = imageUrl.trim();
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
                }

                console.log('🖼️ TikTok Modal Image:', {
                  cover_url: (product as any).cover_url,
                  image_url: product.image_url,
                  processed: processedUrl,
                  productId: product.id
                });

                return (
                  <>
                    {hasImage && (
                      <img
                        src={processedUrl}
                        alt={product.title}
                        className="w-full h-32 sm:h-48 object-cover"
                        onLoad={() => {
                          console.log('✅ TikTok modal image loaded successfully:', processedUrl);
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.log('❌ TikTok modal image failed to load:', target.src);
                          target.style.display = 'none';
                          const placeholder = target.parentElement?.querySelector('.fallback-placeholder') as HTMLElement;
                          if (placeholder) {
                            placeholder.classList.remove('hidden');
                          }
                        }}
                      />
                    )}
                    {!hasImage && (
                      <div className="fallback-placeholder w-full h-32 sm:h-48 bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              {product.video_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[12px] sm:border-l-[16px] border-l-pink-500 border-t-[8px] sm:border-t-[10px] border-t-transparent border-b-[8px] sm:border-b-[10px] border-b-transparent ml-1"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Basic Product Info */}
            <div className="flex-1">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3">
                {product.title}
              </h3>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  {/* <span className="text-xl sm:text-2xl font-bold text-pink-600">
                    {formatPrice(product.price)}
                  </span> */}
                  {product.trending_score > 0 && (
                    <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full">
                      Score: {product.trending_score.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Engagement Stats */}
                {/* <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm mb-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    <span>{formatNumber(product.likes_count)} likes</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                    <Share className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span>{formatNumber(product.shares_count)} shares</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span>{formatNumber(product.views_count)} views</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                    <Package className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                    <span>{formatNumber(product.sales_count)} sales</span>
                  </div>
                </div> */}

                {/* Discover Suppliers Button */}
                <button
                  onClick={handleDiscoverSuppliers}
                  disabled={isSupplierDiscoveryLoading || suppliers.length > 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {isSupplierDiscoveryLoading ? 'Analyzing...' : suppliers.length > 0 ? 'Suppliers Found' : 'Discover Suppliers'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Detailed Information */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Header with Action Buttons */}
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2">
                  {product.title}
                </h2>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {/* Save Search Button */}
                  <button
                    onClick={handleSaveSearch}
                    className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Save Search</span>
                    <span className="sm:hidden">Save</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 px-4 sm:px-6 pt-4 flex-shrink-0">
              <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
                {[
                  { key: 'overview', label: 'Overview', icon: Package },
                  // { key: 'engagement', label: 'Engagement', icon: Heart },
                  { key: 'suppliers', label: 'Suppliers', icon: Truck, badge: suppliers.length > 0 ? suppliers.length : undefined },
                ].map(({ key, label, icon: Icon, badge }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as TabType)}
                    className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                      activeTab === key
                        ? 'border-[#fc8804] text-[#fc8804]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{key === 'overview' ? 'Info' : key === 'suppliers' ? 'Suppliers' : label}</span>
                    {badge && (
                      <span className="bg-[#fc8804] text-white text-xs px-2 py-1 rounded-full">
                        {badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden min-h-0">
              <div className="h-full overflow-y-auto p-4 sm:p-6">
                {activeTab === 'overview' && (
                  <OverviewTab
                    product={product}
                    details={details?.data}
                    trendsData={trendsData?.data}
                    creativeCenterData={creativeCenterData?.data}
                    isLoading={detailsLoading || trendsLoading || creativeCenterLoading}
                    error={detailsError || trendsError || creativeCenterError}
                  />
                )}

                {/* {activeTab === 'engagement' && (
                  <EngagementTab product={product} />
                )} */}

                {activeTab === 'suppliers' && (
                  <SuppliersTab
                    suppliers={suppliers}
                    isLoading={isSupplierDiscoveryLoading}
                    analysisTime={supplierAnalysisTime}
                    onSelectSupplier={handleSelectSupplier}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showProfitCalculator && selectedSupplier && (
        <TikTokProfitCalculatorModal
          product={product}
          supplier={selectedSupplier}
          isOpen={showProfitCalculator}
          onClose={() => {
            setShowProfitCalculator(false);
            setSelectedSupplier(null);
          }}
        />
      )}

      {showSaveModal && (
        <TikTokSaveSearchModal
          product={product}
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
};

// Overview Tab Component
interface OverviewTabProps {
  product: TikTokTrendingProduct;
  details?: any;
  trendsData?: TikTokProductTrends;
  creativeCenterData?: {
    info?: {
      audience_ages?: AudienceAge[];
      hashtags?: string[];
      [key: string]: any;
    };
  };
  isLoading: boolean;
  error: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ product, details, trendsData, creativeCenterData, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // Show basic product info even if detailed API calls fail (e.g., quota exceeded)
  const showQuotaWarning = error && !details && !trendsData;

  return (
    <div className="space-y-6">
      {/* Show quota warning if API calls failed */}
      {showQuotaWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">Limited Product Details</h4>
              <p className="text-sm text-yellow-700">
                Detailed product information requires additional API quota. Showing basic information from search results.
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Product Information</h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Product ID:</span>
            <span className="font-medium">{product.id}</span>
          </div>
          {/* <div className="flex justify-between">
            <span className="text-gray-600">Price:</span>
            <span className="font-medium text-pink-600">{formatPrice(product.price)}</span>
          </div> */}
          <div className="flex justify-between">
            <span className="text-gray-600">Country:</span>
            <span className="font-medium">{product.country}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Source:</span>
            <span className="font-medium capitalize">{product.source}</span>
          </div>
          {(product as any).ctr !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-600">CTR (Click-Through Rate):</span>
              <span className="font-medium text-green-600">{(product as any).ctr}%</span>
            </div>
          )}
          {(product as any).cvr !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-600">CVR (Conversion Rate):</span>
              <span className="font-medium text-blue-600">{(product as any).cvr}%</span>
            </div>
          )}
          {(product as any).cpa !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-600">CPA (Cost Per Action):</span>
              <span className="font-medium text-purple-600">${(product as any).cpa}</span>
            </div>
          )}
          {product.sales_count && (
            <div className="flex justify-between">
              <span className="text-gray-600">Sales Count:</span>
              <span className="font-medium text-green-600">{formatNumber(product.sales_count)}</span>
            </div>
          )}
          {product.commission_rate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Commission Rate:</span>
              <span className="font-medium text-blue-600">{product.commission_rate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Audience Age Distribution */}
      {details?.data?.audience_ages && details.data.audience_ages.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Audience Age Distribution</h4>
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
            <div className="space-y-3">
              {details.data.audience_ages.map((age: any, index: number) => {
                const ageLabel = age.age_level === 18 ? '18-24' :
                                age.age_level === 25 ? '25-34' :
                                age.age_level === 35 ? '35-44' :
                                age.age_level === 45 ? '45-54' :
                                age.age_level === 55 ? '55+' : `${age.age_level}+`;
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{ageLabel}</span>
                      <span className="text-sm font-semibold text-pink-600">{age.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${age.score}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hashtags - Auto-scrolling Carousel */}
      {details?.data?.hashtags && details.data.hashtags.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Trending Hashtags</h4>
          <TrendingHashtagsCarousel hashtags={details.data.hashtags} />
        </div>
      )}

      {/* Product Trends Section */}
      {trendsData && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Product Trends ({trendsData.trends_period})</h4>
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Sales Count:</span>
                <span className="font-medium text-green-600">{trendsData.sold_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Earnings (USD):</span>
                <span className="font-medium text-green-600">{trendsData.earn_amount_usd}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commission Rate:</span>
                <span className="font-medium text-blue-600">{(trendsData.commission_rate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Free Shipping:</span>
                <span className={`font-medium ${trendsData.free_shipping ? 'text-green-600' : 'text-gray-500'}`}>
                  {trendsData.free_shipping ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            {trendsData.seller_name && (
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Seller:</span>
                  <span className="font-medium">{trendsData.seller_name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Product Overview */}
      {trendsData?.overview && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Product Overview</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{trendsData.overview}</p>
          </div>
        </div>
      )}

      {/* Description removed - API doesn't provide product descriptions */}

      {/* TikTok Creative Center - Age Levels and Hashtags */}
      {creativeCenterData && (
        <>
          {/* Age Levels from Creative Center */}
          {creativeCenterData?.info?.audience_ages && creativeCenterData.info.audience_ages.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-lg">👥</span> Target Age Groups
              </h4>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <div className="space-y-3">
                  {creativeCenterData.info.audience_ages.map((ageData: AudienceAge, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{ageData.age_level}+</span>
                        <span className="text-sm font-semibold text-blue-600">{ageData.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(ageData.score, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hashtags from Creative Center */}
          {creativeCenterData?.info?.hashtags && creativeCenterData.info.hashtags.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-lg">#️⃣</span> Trending Hashtags
              </h4>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                  {creativeCenterData.info.hashtags.map((hashtag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-block bg-white border border-purple-200 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      #{hashtag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Performance Metrics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{formatNumber(product.likes_count)}</div>
            <div className="text-sm text-gray-600">Likes</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Share className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{formatNumber(product.shares_count)}</div>
            <div className="text-sm text-gray-600">Shares</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Eye className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{formatNumber(product.views_count)}</div>
            <div className="text-sm text-gray-600">Views</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <Package className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{formatNumber(product.sales_count)}</div>
            <div className="text-sm text-gray-600">Sales</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Engagement Tab Component
interface EngagementTabProps {
  product: TikTokTrendingProduct;
}

const EngagementTab: React.FC<EngagementTabProps> = ({ product }) => {
  const totalEngagement = product.likes_count + product.shares_count + product.views_count;
  const engagementRate = product.views_count > 0 ? ((product.likes_count + product.shares_count) / product.views_count * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Engagement Overview</h4>
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">{formatNumber(totalEngagement)}</div>
              <div className="text-sm text-gray-600">Total Engagement</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{engagementRate.toFixed(2)}%</div>
              <div className="text-sm text-gray-600">Engagement Rate</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Engagement Breakdown</h4>
        <div className="space-y-4">
          {[
            { label: 'Views', count: product.views_count, color: 'green', icon: Eye },
            { label: 'Likes', count: product.likes_count, color: 'red', icon: Heart },
            { label: 'Shares', count: product.shares_count, color: 'blue', icon: Share },
            { label: 'Sales', count: product.sales_count, color: 'purple', icon: Package },
          ].map(({ label, count, color, icon: Icon }) => {
            const percentage = totalEngagement > 0 ? (count / totalEngagement * 100) : 0;
            return (
              <div key={label} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full bg-${color}-100 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${color}-500`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900">{label}</span>
                    <span className="text-sm text-gray-600">{formatNumber(count)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">{percentage.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Suppliers Tab Component (reuse from Amazon)
interface SuppliersTabProps {
  suppliers: SupplierInfo[];
  isLoading: boolean;
  analysisTime: number;
  onSelectSupplier?: (supplier: SupplierInfo) => void;
}

const SuppliersTab: React.FC<SuppliersTabProps> = ({ suppliers, isLoading, analysisTime, onSelectSupplier }) => {
  // ✅ EXACT COPY from BlueRitt Explorer - Show ONLY VERIFIED suppliers (backend filtered)
  const displaySuppliers = suppliers || [];

  console.log('🏭 TikTok Trends Supplier Display:', {
    totalSuppliers: suppliers?.length || 0,
    displayingVerifiedOnly: true,
    note: 'Backend filters to show only verified suppliers with badges'
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Discovering Suppliers...
        </h3>
        <p className="text-gray-600 mb-4">
          Our AI is analyzing global suppliers to find the best matches for this product.
        </p>
        <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center gap-2 text-blue-700">
            <Zap className="w-5 h-5" />
            <span className="font-medium">AI-Powered Matching</span>
          </div>
          <p className="text-blue-600 text-sm mt-1">
            Analyzing product specifications, pricing, and supplier capabilities...
          </p>
        </div>
      </div>
    );
  }

  if (!displaySuppliers || displaySuppliers.length === 0) {
    return (
      <div className="text-center py-8">
        <Truck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">
          No suppliers found. Click "Discover Suppliers" to start analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ Analysis Summary - EXACT COPY from BlueRitt Explorer */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Supplier Analysis Complete
            </h3>
            <p className="text-gray-600 text-sm">
              Found {displaySuppliers.length} suppliers in {analysisTime.toFixed(1)}s
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{displaySuppliers.length}</div>
            <div className="text-xs text-gray-500">Total Suppliers</div>
          </div>
        </div>
      </div>

      {/* ✅ Suppliers List - EXACT COPY from BlueRitt Explorer */}
      <div className="space-y-4">
        {displaySuppliers.map((supplier, index) => {
          // Debug log to check supplier badge data with scoring bonuses
          console.log(`🏷️ TikTok Supplier ${index + 1} Badge Data:`, {
            name: supplier.name,
            verification_badge: supplier.verification_badge,
            verification_status: supplier.verification_status,
            // Verification bonuses (score points)
            is_gold: supplier.is_gold, // +15 points
            verified_pro: supplier.verified_pro, // +12 points
            verified_supplier: supplier.verified_supplier, // +10 points
            alibaba_guaranteed: supplier.alibaba_guaranteed, // +8 points
            trade_assurance: supplier.trade_assurance, // +8 points
            is_assessed: supplier.is_assessed, // +5 points
            // Other data
            years_in_business: supplier.years_in_business,
            rating: supplier.rating,
            ai_match_score: supplier.ai_match_score
          });

          return (
          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{supplier.name || supplier.supplier_name || 'Unknown Supplier'}</h4>
                <p className="text-gray-600 text-sm">{supplier.location || 'Location not specified'}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {supplier.estimated_price || 'Price on request'}
                </div>
                <div className="text-xs text-gray-500">Est. Price</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">MOQ</div>
                <div className="font-medium text-gray-900 dark:text-white">{supplier.moq || supplier.min_order_quantity || 'Contact supplier'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Lead Time</div>
                <div className="font-medium text-gray-900 dark:text-white">{supplier.lead_time || 'Contact supplier'}</div>
              </div>

              <div className="flex items-center justify-end gap-[8px]">
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-[10px] rounded-full">
                    <div className="text-xs text-gray-500 dark:text-gray-400">AI Match</div>
                    <div className="font-medium text-purple-600 dark:text-purple-400">
                      {(supplier.ai_match_score || 0).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Verification Badges Section - All 6 verification types with scoring bonuses */}
            <div className="flex flex-wrap gap-2 mt-3">
              {/* 1. Gold Supplier Badge - Score +15 (Highest bonus) */}
              {(supplier.verification_badge === 'Gold Supplier' ||
                supplier.verification_status === 'Gold Supplier' ||
                supplier.is_gold) && (
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                  <Shield className="w-3 h-3 fill-current" />
                  Gold
                </span>
              )}

              {/* 2. Verified Pro Badge - Score +12 */}
              {(supplier.verification_badge === 'Verified Pro' ||
                supplier.verified_pro) && (
                <span className="bg-gradient-to-r from-orange-500 to-orange-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                  <Shield className="w-3 h-3 fill-current" />
                  Verified Pro
                </span>
              )}

              {/* 3. Verified Supplier Badge - Score +10 */}
              {!supplier.verified_pro &&
               (supplier.verification_badge === 'Verified Supplier' ||
                supplier.verification_status === 'Verified' ||
                supplier.verified_supplier) && (
                <span className="bg-gradient-to-r from-red-500 to-red-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                  <Shield className="w-3 h-3 fill-current" />
                  Verified
                </span>
              )}

              {/* 4. Alibaba Guaranteed Badge - Score +8 */}
              {supplier.alibaba_guaranteed && (
                <span className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                  <Shield className="w-3 h-3 fill-current" />
                  Alibaba Guaranteed
                </span>
              )}

              {/* 5. Trade Assurance Badge - Score +8 */}
              {supplier.trade_assurance && (
                <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                  <Shield className="w-3 h-3 fill-current" />
                  Trade Assurance
                </span>
              )}

              {/* 6. Assessed Supplier Badge - Score +5 */}
              {!supplier.verified_pro &&
               !supplier.verified_supplier &&
               supplier.is_assessed && (
                <span className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                  <Shield className="w-3 h-3 fill-current" />
                  Assessed
                </span>
              )}

              {/* Store Age Badge */}
              {supplier.years_in_business && supplier.years_in_business > 0 && (
                <span className="bg-gradient-to-r from-sky-400 to-sky-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                  Store Age: {supplier.years_in_business} {supplier.years_in_business === 1 ? 'year' : 'years'}
                </span>
              )}

              {/* Rating Badge */}
              {supplier.rating && supplier.rating > 0 && (
                <span className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {supplier.rating.toFixed(1)} Rating
                </span>
              )}

              {/* AI Match Level Badge */}
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm text-white ${
                (supplier.ai_match_score || 0) >= 80
                  ? 'bg-gradient-to-r from-green-500 to-green-700'
                  : (supplier.ai_match_score || 0) >= 60
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-700'
                  : 'bg-gradient-to-r from-red-500 to-red-700'
              }`}>
                AI Match: {(supplier.ai_match_score || 0).toFixed(0)}%
              </span>
            </div>

            {/* Additional Info Section */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Response Rate:</span>
                <span className="font-medium ml-2 text-gray-900 dark:text-white">{supplier.response_rate || 'N/A'}</span>
              </div>
              {supplier.total_transactions && supplier.total_transactions > 0 && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Transactions:</span>
                  <span className="font-medium ml-2 text-gray-900 dark:text-white">{supplier.total_transactions.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Main Products Section */}
            {supplier.main_products && (
              <div className="mt-3">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Main Products:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Array.isArray(supplier.main_products)
                    ? supplier.main_products.map((product: string, idx: number) => (
                        <span key={idx} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                          {product}
                        </span>
                      ))
                    : (
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                          {supplier.main_products}
                        </span>
                      )
                  }
                </div>
              </div>
            )}

            {/* Certifications Section */}
            {supplier.certifications && supplier.certifications.length > 0 && (
              <div className="mt-3">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Certifications:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {supplier.certifications.map((cert, idx) => (
                    <span key={idx} className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Button */}
            <div className="mt-4">
              <a
                href={supplier.contact_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full text-center px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium transition-colors"
              >
                Contact Supplier →
              </a>
            </div>

            {/* Select Supplier Button */}
            <div className="mt-4">
              <button
                onClick={() => onSelectSupplier && onSelectSupplier(supplier)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Select Supplier
              </button>
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
};

export default TikTokProductDetailsModal;
