import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { X, ExternalLink, Star, Package, Truck, Calculator, Save, Shield, Zap } from 'lucide-react';
import { toast } from 'react-toastify';

import {
  getAmazonTrendsProductDetails,
  type AmazonTrendingProduct,
} from '@/api/amazonTrends';

// Import from tiktokTrends since discoverSuppliers is shared
import { discoverSuppliers, type SupplierInfo } from '@/api/tiktokTrends';

import { saveProducts, getCategory, createCategory } from '@/api/savedProducts';
import AmazonTrendsProfitCalculatorModal from './AmazonTrendsProfitCalculatorModal';
import { useUserSubscriptionAndSearchQuota } from '../../../../../hooks/useUserDetails';
import { QuotaNames } from '../../../../../enum';

// Category type definition
interface Category {
  id: string;
  name: string;
}

interface AmazonTrendsProductDetailsModalProps {
  product: AmazonTrendingProduct;
  isOpen: boolean;
  onClose: () => void;
  autoStartSupplierDiscovery?: boolean;
}

type TabType = 'overview' | 'suppliers';

const AmazonTrendsProductDetailsModal: React.FC<AmazonTrendsProductDetailsModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  autoStartSupplierDiscovery = false 
}) => {
  // Quota management for supplier discovery
  const { quotaDetails: supplierQuotaDetails, updateQuota: updateSupplierQuota } = useUserSubscriptionAndSearchQuota(QuotaNames.SupplierDiscovery);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSupplierDiscoveryLoading, setIsSupplierDiscoveryLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierInfo[]>([]);
  const [supplierAnalysisTime, setSupplierAnalysisTime] = useState<number>(0);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierInfo | null>(null);
  const [showProfitCalculator, setShowProfitCalculator] = useState(false);

  // Product Details Query
  // ✅ Using the same endpoint as BlueRitt Explorer with source parameter
  const {
    data: productDetails,
    isLoading: detailsLoading,
    error: detailsError
  } = useQuery({
    queryKey: ['amazon-trends-product-details', product.asin],
    queryFn: () => getAmazonTrendsProductDetails({
      asin: product.asin,
      country: 'US',
      source: 'amazon_trends' // ✅ Specify source as amazon_trends
    }),
    enabled: isOpen,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Auto-start supplier discovery if requested
  useEffect(() => {
    if (isOpen && autoStartSupplierDiscovery && suppliers.length === 0 && !isSupplierDiscoveryLoading) {
      handleDiscoverSuppliers();
    }
  }, [isOpen, autoStartSupplierDiscovery]);

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
        title: product.product_title,
        id: product.asin || '',
        price: product.product_price || '',
        category: product.category_path || product.category || 'General'
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
    setSelectedSupplier(supplier);
    setShowProfitCalculator(true);
  };

  if (!isOpen) return null;

  const details = productDetails?.data;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Amazon Product Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Product Info Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            {product.product_photo && (
              <img
                src={product.product_photo}
                alt={product.product_title}
                className="w-24 h-24 object-contain rounded-lg border border-gray-200"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {product.product_title}
              </h3>
              <div className="flex items-center gap-4 text-sm">
                {product.product_price && (
                  <span className="text-green-600 font-bold text-lg">
                    {product.product_price}
                  </span>
                )}
                {product.product_star_rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{product.product_star_rating}</span>
                    {product.product_num_ratings && (
                      <span className="text-gray-500">({product.product_num_ratings})</span>
                    )}
                  </div>
                )}
              </div>
              {product.brand && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Brand: {product.brand}
                </p>
              )}
            </div>
            <a
              href={product.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#ffa41c] text-white rounded-lg hover:bg-[#ff6201] transition-colors h-fit"
            >
              <ExternalLink className="w-4 h-4" />
              View on Amazon
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: Package },
              { key: 'suppliers', label: 'Suppliers', icon: Truck, badge: suppliers.length > 0 ? suppliers.length : undefined },
            ].map(({ key, label, icon: Icon, badge }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === key
                    ? 'border-[#ffa41c] text-[#ffa41c]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {badge && (
                  <span className="ml-2 bg-[#ffa41c] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <OverviewTab
              product={product}
              details={details}
              isLoading={detailsLoading}
              error={detailsError}
              onDiscoverSuppliers={handleDiscoverSuppliers}
              supplierQuotaValue={supplierQuotaDetails.quotaValue}
            />
          )}
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

      {/* Profit Calculator Modal */}
      {showProfitCalculator && selectedSupplier && (
        <AmazonTrendsProfitCalculatorModal
          product={product}
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

// Overview Tab Component
interface OverviewTabProps {
  product: AmazonTrendingProduct;
  details?: any;
  isLoading: boolean;
  error: any;
  onDiscoverSuppliers: () => void;
  supplierQuotaValue: number;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ 
  product, 
  details, 
  isLoading, 
  error,
  onDiscoverSuppliers,
  supplierQuotaValue
}) => {
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

  return (
    <div className="space-y-6">
      {/* Product Information */}
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Product Information</h4>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">ASIN:</span>
            <span className="font-medium text-gray-900 dark:text-white">{product.asin}</span>
          </div>
          {product.category && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Category:</span>
              <span className="font-medium text-gray-900 dark:text-white">{product.category}</span>
            </div>
          )}
          {product.is_prime && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Prime:</span>
              <span className="font-medium text-blue-600">✓ Prime Eligible</span>
            </div>
          )}
          {product.is_best_seller && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Badge:</span>
              <span className="font-medium text-orange-600">Best Seller</span>
            </div>
          )}
        </div>
      </div>

      {/* Discover Suppliers Button */}
      <div>
        <button
          onClick={onDiscoverSuppliers}
          disabled={supplierQuotaValue <= 0}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Truck className="w-5 h-5" />
          Discover Suppliers
          {supplierQuotaValue <= 0 && <span className="text-xs">(No quota remaining)</span>}
        </button>
      </div>
    </div>
  );
};

// Suppliers Tab Component
interface SuppliersTabProps {
  suppliers: SupplierInfo[];
  isLoading: boolean;
  analysisTime: number;
  onSelectSupplier: (supplier: SupplierInfo) => void;
}

const SuppliersTab: React.FC<SuppliersTabProps> = ({ suppliers, isLoading, analysisTime, onSelectSupplier }) => {
  // ✅ EXACT COPY from BlueRitt Explorer - Show ONLY VERIFIED suppliers (backend filtered)
  const displaySuppliers = suppliers || [];

  console.log('🏭 Amazon Trends Supplier Display:', {
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
        {displaySuppliers.map((supplier, index) => (
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

            {/* Additional supplier details */}
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Response Rate:</span>
                  <span className="font-medium ml-2">{supplier.response_rate || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-medium ml-2">{supplier.rating || 'N/A'}/5.0</span>
                </div>
                <div>
                  <span className="text-gray-600">Transactions:</span>
                  <span className="font-medium ml-2">{supplier.total_transactions || 'N/A'}</span>
                </div>
              </div>

              {supplier.main_products && (
                <div className="mt-3">
                  <span className="text-gray-600 text-sm">Main Products:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Array.isArray(supplier.main_products)
                      ? supplier.main_products.map((product: string, idx: number) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {product}
                          </span>
                        ))
                      : (
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {supplier.main_products}
                          </span>
                        )
                    }
                  </div>
                </div>
              )}

              {supplier.certifications && supplier.certifications.length > 0 && (
                <div className="mt-3">
                  <span className="text-gray-600 text-sm">Certifications:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {supplier.certifications.map((cert, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ✅ Verification Badges Section - Same as spkbgcards.tsx */}
            <div className="flex flex-wrap gap-3 mt-2">
              {/* Gold Supplier Badge */}
              {(supplier.verification_badge === 'Gold Supplier' || supplier.verification_status === 'Gold Supplier') && (
                <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-medium">
                  Gold Supplier
                </span>
              )}

              {/* Verified Pro Badge */}
              {(supplier.verification_badge === 'Verified Pro' || supplier.verified_supplier) && (
                <span className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-3 py-1 rounded-full text-xs font-medium">
                  Verified Pro
                </span>
              )}

              {/* Verified Supplier Badge */}
              {(supplier.verification_badge === 'Verified Supplier' || supplier.verification_status === 'Verified') && (
                <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 rounded-full text-xs font-medium">
                  Verified
                </span>
              )}

              {/* Trade Assurance Badge */}
              {supplier.trade_assurance && (
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                  Trade Assurance
                </span>
              )}

              {/* Store Age Badge */}
              {supplier.years_in_business && supplier.years_in_business > 0 && (
                <span className="bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 px-3 py-1 rounded-full text-xs font-medium">
                  Store Age: {supplier.years_in_business} {supplier.years_in_business === 1 ? 'year' : 'years'}
                </span>
              )}

              {/* Rating Badge */}
              {supplier.rating && supplier.rating > 0 && (
                <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {supplier.rating.toFixed(1)}
                </span>
              )}

              {/* AI Match Level Badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                (supplier.ai_match_score || 0) >= 80
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : (supplier.ai_match_score || 0) >= 60
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                AI Match: {(supplier.ai_match_score || 0).toFixed(2)}%
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

            <div className="flex justify-between items-center">
              <button
                onClick={() => onSelectSupplier(supplier)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Select Supplier
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmazonTrendsProductDetailsModal;

