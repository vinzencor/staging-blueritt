import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, ExternalLink, Star, Package, MessageSquare, DollarSign, Truck, Shield, Zap, Save, Calculator } from 'lucide-react';

import {
  getAmazonTrendsProductDetails,
  // getAmazonTrendsProductReviews,
  // getAmazonTrendsProductOffers,
  AmazonTrendingProduct,
  parseAmazonPrice,
} from '@/api/amazonTrends';

import {
  discoverSuppliers,
  // formatPrice,
  // formatRating,
  // formatReviewCount,
  getAmazonUrl,
  type ProductDetails,
  // type ProductReview,
  // type ProductOffer,
  type SupplierInfo
} from '@/api/amazonExplorer';

import ProfitCalculatorModal from './ProfitCalculatorModal';
import SaveSearchModal from './SaveSearchModal';

interface AmazonTrendsProductDetailsModalProps {
  product: AmazonTrendingProduct;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'suppliers';

const AmazonTrendsProductDetailsModal: React.FC<AmazonTrendsProductDetailsModalProps> = ({ product, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSupplierDiscoveryLoading, setIsSupplierDiscoveryLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierInfo[]>([]);
  const [supplierAnalysisTime, setSupplierAnalysisTime] = useState<number>(0);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierInfo | null>(null);
  const [showProfitCalculator, setShowProfitCalculator] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Reset state when modal is closed/opened with different product
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
  }, [isOpen, product.asin]);

  // Product Details Query
  const {
    data: details,
    isLoading: detailsLoading,
    error: detailsError
  } = useQuery({
    queryKey: ['amazon-trends-product-details', product.asin],
    queryFn: () => getAmazonTrendsProductDetails({ asin: product.asin }),
    enabled: isOpen && !!product.asin,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Product Reviews Query
  // const {
  //   data: reviews,
  //   isLoading: reviewsLoading,
  //   error: reviewsError
  // } = useQuery({
  //   queryKey: ['amazon-trends-product-reviews', product.asin],
  //   queryFn: () => getAmazonTrendsProductReviews({ asin: product.asin }),
  //   enabled: isOpen && activeTab === 'reviews' && !!product.asin,
  //   staleTime: 1000 * 60 * 10, // 10 minutes
  // });

  // Product Offers Query
  // const {
  //   data: offers,
  //   isLoading: offersLoading,
  //   error: offersError
  // } = useQuery({
  //   queryKey: ['amazon-trends-product-offers', product.asin],
  //   queryFn: () => getAmazonTrendsProductOffers({ asin: product.asin }),
  //   enabled: isOpen && activeTab === 'offers' && !!product.asin,
  //   staleTime: 1000 * 60 * 10, // 10 minutes
  // });

  // Handle supplier discovery
  const handleDiscoverSuppliers = async () => {
    if (isSupplierDiscoveryLoading) {
      console.log('Supplier discovery already in progress, ignoring click');
      return;
    }

    console.log('🔍 Starting supplier discovery for:', product.product_title);
    setIsSupplierDiscoveryLoading(true);
    setActiveTab('suppliers');

    try {
      const response = await discoverSuppliers({
        title: product.product_title,
        asin: product.asin,
        brand: product.brand,
        price: product.product_price,
        category: product.category_path || 'Amazon Product'
      });

      console.log('✅ Supplier discovery response:', response);
      console.log('📦 Found suppliers:', response.suppliers?.length || 0);

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

  // Handle supplier selection
  const handleSelectSupplier = (supplier: SupplierInfo) => {
    console.log('🎯 Supplier selected:', supplier.name, supplier);
    setSelectedSupplier(supplier);
    setShowProfitCalculator(true);
  };

  // Handle save search
  const handleSaveSearch = () => {
    setShowSaveModal(true);
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, badge: suppliers.length > 0 ? suppliers.length : undefined },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {product.product_photo ? (
                <img
                  src={product.product_photo}
                  alt={product.product_title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Package className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 line-clamp-2">
                {product.product_title}
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">
                    {product.product_star_rating || 'N/A'}
                  </span>
                  {product.product_num_ratings && (
                    <span className="text-xs text-gray-500">
                      ({product.product_num_ratings.toLocaleString()})
                    </span>
                  )}
                </div>
                {product.product_price && (
                  <span className="font-bold text-green-600">
                    {product.product_price}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Save Search Button */}
            <button
              onClick={handleSaveSearch}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Search
            </button>
            
            {/* Discover Suppliers Button */}
            <button
              onClick={handleDiscoverSuppliers}
              disabled={isSupplierDiscoveryLoading || suppliers.length > 0}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {isSupplierDiscoveryLoading ? 'Analyzing...' : suppliers.length > 0 ? 'Suppliers Found' : 'Discover Suppliers'}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <div className="p-4">
              <nav className="space-y-2">
                {tabs.map(({ id, label, icon: Icon, badge }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as TabType)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      {label}
                    </div>
                    {badge && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <OverviewTab 
                product={product} 
                details={details?.data} 
                isLoading={detailsLoading} 
                error={detailsError} 
              />
            )}
            
            {/* {activeTab === 'reviews' && (
              <ReviewsTab 
                reviews={reviews?.data?.reviews || []} 
                isLoading={reviewsLoading} 
                error={reviewsError} 
              />
            )}
            
            {activeTab === 'offers' && (
              <OffersTab 
                offers={offers?.data?.offers || []} 
                isLoading={offersLoading} 
                error={offersError} 
              />
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

      {/* Profit Calculator Modal */}
      {selectedSupplier && showProfitCalculator && (
        <ProfitCalculatorModal
          product={product}
          supplier={selectedSupplier}
          isOpen={showProfitCalculator}
          onClose={() => {
            setShowProfitCalculator(false);
            setSelectedSupplier(null);
          }}
        />
      )}

      {/* Save Search Modal */}
      <SaveSearchModal
        product={product}
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
      />
    </div>
  );
};

// Overview Tab Component
interface OverviewTabProps {
  product: AmazonTrendingProduct;
  details?: ProductDetails;
  isLoading: boolean;
  error: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ product, details, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Failed to load product details</p>
      </div>
    );
  }

  const price = parseAmazonPrice(product.product_price || '0');

  return (
    <div className="space-y-6">
      {/* Product Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">ASIN:</span>
            <span className="ml-2 font-medium">{product.asin}</span>
          </div>
          {product.brand && (
            <div>
              <span className="text-gray-600">Brand:</span>
              <span className="ml-2 font-medium">{product.brand}</span>
            </div>
          )}
          <div>
            <span className="text-gray-600">Price:</span>
            <span className="ml-2 font-medium text-green-600">{product.product_price || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Rating:</span>
            <span className="ml-2 font-medium">{product.product_star_rating || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Product Features */}
      <div className="flex flex-wrap gap-2">
        {product.is_best_seller && (
          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
            Best Seller
          </span>
        )}
        {product.is_amazon_choice && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            Amazon's Choice
          </span>
        )}
        {product.is_prime && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            Prime
          </span>
        )}
        {product.climate_pledge_friendly && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            Climate Pledge Friendly
          </span>
        )}
      </div>

      {/* Product Description */}
      {details?.product_description && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
          <p className="text-gray-700 leading-relaxed">{details.product_description}</p>
        </div>
      )}

      {/* Amazon Link */}
      <div className="pt-4 border-t border-gray-200">
        <a
          href={product.product_url || `https://amazon.com/dp/${product.asin}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View on Amazon
        </a>
      </div>
    </div>
  );
};



// Offers Tab Component
// interface OffersTabProps {
//   offers: ProductOffer[];
//   isLoading: boolean;
//   error: any;
// }

// const OffersTab: React.FC<OffersTabProps> = ({ offers, isLoading, error }) => {
//   if (isLoading) {
//     return (
//       <div className="space-y-4">
//         {[...Array(3)].map((_, i) => (
//           <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
//             <div className="flex justify-between items-start mb-2">
//               <div className="h-4 bg-gray-200 rounded w-32"></div>
//               <div className="h-6 bg-gray-200 rounded w-20"></div>
//             </div>
//             <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
//             <div className="h-4 bg-gray-200 rounded w-40"></div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center py-8">
//         <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
//         <p className="text-gray-600">Failed to load offers</p>
//       </div>
//     );
//   }

//   if (offers.length === 0) {
//     return (
//       <div className="text-center py-8">
//         <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
//         <p className="text-gray-600">No offers available</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {offers.map((offer, index) => (
//         <div key={index} className="border border-gray-200 rounded-lg p-4">
//           <div className="flex justify-between items-start mb-2">
//             <div>
//               <h4 className="font-medium text-gray-900">{offer.offer_seller_name}</h4>
//               {offer.offer_condition && (
//                 <p className="text-sm text-gray-600">Condition: {offer.offer_condition}</p>
//               )}
//             </div>
//             <div className="text-right">
//               <div className="font-bold text-lg text-green-600">
//                 {formatPrice(offer.offer_price)}
//               </div>
//               {offer.offer_shipping_price && (
//                 <div className="text-sm text-gray-600">
//                   Shipping: {formatPrice(offer.offer_shipping_price)}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="flex gap-2 mt-2">
//             {offer.is_prime && (
//               <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                 Prime
//               </span>
//             )}
//             {offer.is_amazon_fulfilled && (
//               <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
//                 Fulfilled by Amazon
//               </span>
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// Suppliers Tab Component
interface SuppliersTabProps {
  suppliers: SupplierInfo[];
  isLoading: boolean;
  analysisTime: number;
  onSelectSupplier: (supplier: SupplierInfo) => void;
}

const SuppliersTab: React.FC<SuppliersTabProps> = ({ suppliers, isLoading, analysisTime, onSelectSupplier }) => {
  console.log('🏭 SuppliersTab render:', {
    suppliersCount: suppliers?.length || 0,
    isLoading,
    analysisTime,
    suppliers: suppliers?.slice(0, 2) // Log first 2 suppliers for debugging
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Analyzing Product, Discovering Verified Suppliers and Computing AI Match Score...
        </h3>
        <p className="text-gray-600 mb-4">
          The process may take up to 30-45 seconds. Please wait while we generate the results.
        </p>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-purple-800">
            Our AI is analyzing product specifications, supplier capabilities,
            certifications, and market data to find the best matches for you.
          </p>
        </div>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-8">
        <Truck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Click "Discover Suppliers" to find verified suppliers for this Amazon product</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Summary */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-2">Analysis Complete</h4>
        <p className="text-sm text-purple-800">
          Found {suppliers.length} verified suppliers in {analysisTime.toFixed(1)} seconds using AI matching
        </p>
        <div className="mt-2 text-xs text-purple-600 bg-purple-100 p-2 rounded">
          🔍 Debug: Suppliers loaded successfully. Look for green "Select Seller" buttons below each supplier.
        </div>
      </div>

      {/* Suppliers List - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2" style={{ maxHeight: 'calc(100vh - 400px)' }}>
        {suppliers.map((supplier, index) => (
          <div key={supplier.id} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-lg transition-all duration-200">
            {/* Header with Name, Verification, and AI Score */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h5 className="font-bold text-gray-900 text-lg">{supplier.name}</h5>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                    supplier.verification_status === 'Gold Verified'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      : supplier.verification_status === 'Premium Verified'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-green-100 text-green-800 border border-green-300'
                  }`}>
                    {supplier.verification_status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 font-medium">{supplier.location}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{supplier.main_products}</p>
              </div>

              <div className="text-right flex-shrink-0 bg-purple-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600">
                  {supplier.ai_match_score}%
                </div>
                <div className="text-xs text-purple-500 font-medium">AI Match</div>
              </div>
            </div>

            {/* Supplier Details Grid - Improved Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <span className="text-blue-600 block text-xs font-semibold mb-1">MOQ:</span>
                <span className="font-bold text-gray-900">{supplier.moq.toLocaleString()} pcs</span>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                <span className="text-orange-600 block text-xs font-semibold mb-1">Lead Time:</span>
                <span className="font-bold text-gray-900">{supplier.lead_time}</span>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                <span className="text-green-600 block text-xs font-semibold mb-1">Est. Price:</span>
                <span className="font-bold text-green-700">{supplier.estimated_price}</span>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                <span className="text-purple-600 block text-xs font-semibold mb-1">Response Rate:</span>
                <span className="font-bold text-gray-900">{supplier.response_rate}</span>
              </div>
            </div>

            {/* Match Explanation - Improved Design */}
            <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <p className="text-sm text-purple-800 font-medium italic">"{supplier.match_explanation}"</p>
              </div>
            </div>

            {/* Certifications and Actions */}
            <div className="space-y-4">
              {/* Certifications */}
              <div className="flex flex-wrap gap-2">
                {supplier.certifications.slice(0, 3).map((cert, certIndex) => (
                  <span key={certIndex} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200 font-medium">
                    {cert}
                  </span>
                ))}
                {supplier.trade_assurance && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full border border-blue-200 font-medium">
                    ✓ Trade Assurance
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 justify-end pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    console.log('🎯 Select Seller clicked for:', supplier.name);
                    onSelectSupplier(supplier);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <Calculator className="w-4 h-4" />
                  Select & Calculate
                </button>

                <a
                  href={supplier.contact_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4" />
                  Contact Supplier
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmazonTrendsProductDetailsModal;
