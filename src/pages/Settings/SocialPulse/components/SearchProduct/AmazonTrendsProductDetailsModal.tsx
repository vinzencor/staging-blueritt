import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tantml:react-query';
import { X, ExternalLink, Star, Package, Truck, Calculator, Save } from 'lucide-react';
import { toast } from 'react-toastify';

import {
  getAmazonTrendsProductDetails,
  discoverSuppliers,
  type AmazonTrendingProduct,
  type SupplierInfo
} from '@/api/amazonTrends';

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
  const {
    data: productDetails,
    isLoading: detailsLoading,
    error: detailsError
  } = useQuery({
    queryKey: ['amazon-trends-product-details', product.asin],
    queryFn: () => getAmazonTrendsProductDetails({ asin: product.asin }),
    enabled: isOpen,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Auto-start supplier discovery if requested
  useEffect(() => {
    if (isOpen && autoStartSupplierDiscovery && suppliers.length === 0 && !isSupplierDiscoveryLoading) {
      handleDiscoverSuppliers();
    }
  }, [isOpen, autoStartSupplierDiscovery]);

  // Handle supplier discovery
  const handleDiscoverSuppliers = async () => {
    if (isSupplierDiscoveryLoading) {
      console.log('Supplier discovery already in progress, ignoring click');
      return;
    }

    setIsSupplierDiscoveryLoading(true);
    setActiveTab('suppliers');

    try {
      const response = await discoverSuppliers({
        title: product.product_title,
        asin: product.asin,
        brand: product.brand,
        price: product.product_price,
        category: product.category_path
      });

      console.log('🔍 Amazon Trends Supplier Discovery Response:', response);

      // Update quota if remaining_quota is provided in response
      if (response?.remaining_quota !== undefined) {
        console.log('🔄 Amazon Trends Supplier Discovery - Updating quota:', response.remaining_quota);
        updateSupplierQuota(response.remaining_quota);
      }

      setSuppliers(response.suppliers);
      setSupplierAnalysisTime(response.analysis_time);
    } catch (error) {
      console.error('Supplier discovery failed:', error);
      toast.error('Failed to discover suppliers');
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
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Discovering suppliers...</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">This may take a few moments</p>
      </div>
    );
  }

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No suppliers discovered yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Click "Discover Suppliers" to find potential suppliers
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Analysis Time */}
      {analysisTime > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            ✓ Found {suppliers.length} suppliers in {analysisTime.toFixed(2)}s
          </p>
        </div>
      )}

      {/* Suppliers List */}
      <div className="space-y-4">
        {suppliers.map((supplier, index) => (
          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {supplier.name || supplier.supplier_name || 'Unknown Supplier'}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {supplier.location || 'Location not specified'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {supplier.estimated_price || 'Price on request'}
                </div>
                <div className="text-xs text-gray-500">Est. Price</div>
              </div>
            </div>

            {/* Supplier Details */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">MOQ:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {supplier.moq || 'N/A'}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">Lead Time:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {supplier.lead_time || 'N/A'}
                </span>
              </div>
              {supplier.rating && (
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {supplier.rating}/5
                  </span>
                </div>
              )}
              {supplier.total_transactions && (
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Transactions:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {supplier.total_transactions}
                  </span>
                </div>
              )}
            </div>

            {/* Calculate Profit Button */}
            <button
              onClick={() => onSelectSupplier(supplier)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              Calculate Profit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmazonTrendsProductDetailsModal;

