import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { X, ExternalLink, Star, Package, MessageSquare, DollarSign, Truck, Shield, Zap, Calculator, Save } from 'lucide-react';
import { toast } from 'react-toastify';

import {
  getAmazonExplorerProductDetails,
  getAmazonExplorerProductReviews,
  getAmazonExplorerProductOffers,
  discoverSuppliers,
  formatPrice,
  formatRating,
  formatReviewCount,
  getAmazonUrl,
  type AmazonProduct,
  type ProductDetails,
  type ProductReview,
  type ProductOffer,
  type SupplierInfo
} from '@/api/amazonExplorer';

import { saveProducts, getCategory, createCategory } from '@/api/savedProducts';
import AmazonProfitCalculatorModal from './AmazonProfitCalculatorModal';
import { useUserSubscriptionAndSearchQuota } from '../../../../../hooks/useUserDetails';
import { QuotaNames } from '../../../../../enum';



// Category type definition
interface Category {
  id: string;
  name: string;
}

interface ProductDetailsModalProps {
  product: AmazonProduct;
  isOpen: boolean;
  onClose: () => void;
  autoStartSupplierDiscovery?: boolean;
}

interface ProfitCalculation {
  // Product Information
  pi_sellingPrice: number;
  pi_totalRevenue: number;
  pi_quantity: number;

  // Product Sourcing Cost
  psc_manufacturingCost: number;
  psc_shippingCost: number;
  psc_miscCost: number;
  psc_orderQuantity: number;
  psc_perUnitCost: number;
  psc_totalCost: number;

  // Fulfillment Model
  fm_model: string;
  fm_referrfalFees: number;
  fm_fbaFulfillmentFees: number;
  fm_monthlyStorageFees: number;
  fm_longTermStorageFees: number;
  fm_inboundShippingCost: number;
  fm_returnsRate: number;
  fm_shippingFees: number;
  fm_handlingCost: number;
  fm_storageCost: number;
  fm_miscCost: number;
  fm_perUnitCost: number;
  fm_totalCost: number;

  // Calculated Results
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;
}

type TabType = 'overview' | 'reviews' | 'offers' | 'suppliers';

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, isOpen, onClose, autoStartSupplierDiscovery = false }) => {
  // Quota management for supplier discovery
  const { quotaDetails: supplierQuotaDetails, updateQuota: updateSupplierQuota } = useUserSubscriptionAndSearchQuota(QuotaNames.SupplierDiscovery);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSupplierDiscoveryLoading, setIsSupplierDiscoveryLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierInfo[]>([]);
  const [supplierAnalysisTime, setSupplierAnalysisTime] = useState<number>(0);

  // Profit Calculator and Save functionality state
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierInfo | null>(null);
  const [showProfitCalculator, setShowProfitCalculator] = useState(false);
  const [showSaveSection, setShowSaveSection] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);

  // MarginMax Basic profit calculation state
  const [calculation, setCalculation] = useState<ProfitCalculation>({
    // Product Information
    pi_sellingPrice: 0,
    pi_totalRevenue: 0,
    pi_quantity: 100,

    // Product Sourcing Cost
    psc_manufacturingCost: 0,
    psc_shippingCost: 0,
    psc_miscCost: 0,
    psc_orderQuantity: 100,
    psc_perUnitCost: 0,
    psc_totalCost: 0,

    // Fulfillment Model
    fm_model: 'FBA',
    fm_referrfalFees: 0,
    fm_fbaFulfillmentFees: 0,
    fm_monthlyStorageFees: 0,
    fm_longTermStorageFees: 0,
    fm_inboundShippingCost: 0,
    fm_returnsRate: 5.0,
    fm_shippingFees: 0,
    fm_handlingCost: 0,
    fm_storageCost: 0,
    fm_miscCost: 0,
    fm_perUnitCost: 0,
    fm_totalCost: 0,

    // Calculated Results
    grossProfit: 0,
    grossProfitMargin: 0,
    netProfit: 0,
    netProfitMargin: 0,
  });

  // Reset supplier data when modal is closed/opened with different product
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('overview');
      setIsSupplierDiscoveryLoading(false);
      setSuppliers([]);
      setSupplierAnalysisTime(0);
    }
  }, [isOpen, product.asin]);

  // Auto-start supplier discovery when modal opens with autoStartSupplierDiscovery flag
  useEffect(() => {
    if (isOpen && autoStartSupplierDiscovery && !isSupplierDiscoveryLoading && suppliers.length === 0) {
      console.log('🚀 Auto-starting supplier discovery for Amazon Explorer product:', product.product_title);
      setTimeout(() => {
        handleDiscoverSuppliers();
      }, 500);
    }
  }, [isOpen, autoStartSupplierDiscovery, product.asin]);

  // Product Details Query
  const {
    data: productDetails,
    isLoading: detailsLoading,
    error: detailsError
  } = useQuery({
    queryKey: ['amazon-product-details', product.asin],
    queryFn: () => getAmazonExplorerProductDetails({ asin: product.asin }),
    enabled: isOpen,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Product Reviews Query
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError
  } = useQuery({
    queryKey: ['amazon-product-reviews', product.asin],
    queryFn: () => getAmazonExplorerProductReviews({ asin: product.asin }),
    enabled: isOpen && activeTab === 'reviews',
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Product Offers Query
  const {
    data: offersData,
    isLoading: offersLoading,
    error: offersError
  } = useQuery({
    queryKey: ['amazon-product-offers', product.asin],
    queryFn: () => getAmazonExplorerProductOffers({ asin: product.asin }),
    enabled: isOpen && activeTab === 'offers',
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Fetch categories for save functionality
  const {
    data: categoriesData,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategory,
    enabled: isOpen,
  });

  const categories = categoriesData?.data || [];

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success('Category created successfully');
      setShowAddCategory(false);
      setNewCategoryName('');
      refetchCategories();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create category');
    },
  });

  // Save product mutation
  const saveProductMutation = useMutation({
    mutationFn: saveProducts,
    onSuccess: () => {
      toast.success('Product saved to vault successfully');
      setShowSaveSection(false);
      setIsSaving(false);
      setShowProfitCalculator(false);
      setSelectedSupplier(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save product');
      setIsSaving(false);
    },
  });

  // Handle supplier discovery
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
        asin: product.asin,
        brand: product.brand,
        price: product.product_price,
        category: product.category_path
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

  // Handle supplier selection for profit calculator
  const handleSelectSupplier = (supplier: SupplierInfo) => {
    console.log('🎯 Supplier selected:', supplier.name, supplier);
    setSelectedSupplier(supplier);

    // Initialize profit calculation with MarginMax Basic structure
    const productPrice = parseFloat(product.product_price?.replace(/[^0-9.]/g, '') || '0');
    const supplierPrice = parseFloat(supplier.estimated_price?.replace(/[^0-9.]/g, '') || '0');
    const quantity = 100;

    const initialCalc: ProfitCalculation = {
      // Product Information
      pi_sellingPrice: productPrice,
      pi_totalRevenue: productPrice * quantity,
      pi_quantity: quantity,

      // Product Sourcing Cost
      psc_manufacturingCost: supplierPrice,
      psc_shippingCost: 0,
      psc_miscCost: 0,
      psc_orderQuantity: quantity,
      psc_perUnitCost: supplierPrice,
      psc_totalCost: supplierPrice * quantity,

      // Fulfillment Model (FBA defaults)
      fm_model: 'FBA',
      fm_referrfalFees: productPrice * 0.15, // 15% referral fee estimate
      fm_fbaFulfillmentFees: 3.5, // Estimated FBA fulfillment fee
      fm_monthlyStorageFees: 0.75, // Monthly storage fee estimate
      fm_longTermStorageFees: 0,
      fm_inboundShippingCost: 0.5,
      fm_returnsRate: 5.0,
      fm_shippingFees: 0,
      fm_handlingCost: 0,
      fm_storageCost: 0,
      fm_miscCost: 0,
      fm_perUnitCost: 0,
      fm_totalCost: 0,

      // Calculated Results (will be calculated below)
      grossProfit: 0,
      grossProfitMargin: 0,
      netProfit: 0,
      netProfitMargin: 0,
    };

    // Calculate fulfillment costs
    const fulfillmentPerUnit = initialCalc.fm_referrfalFees + initialCalc.fm_fbaFulfillmentFees +
      initialCalc.fm_monthlyStorageFees + initialCalc.fm_inboundShippingCost;
    initialCalc.fm_perUnitCost = fulfillmentPerUnit;
    initialCalc.fm_totalCost = fulfillmentPerUnit * quantity;

    // Calculate profits (MarginMax Basic style)
    initialCalc.grossProfit = initialCalc.pi_sellingPrice - initialCalc.psc_perUnitCost - initialCalc.fm_perUnitCost;
    initialCalc.grossProfitMargin = initialCalc.grossProfit * initialCalc.pi_quantity;
    initialCalc.netProfit = initialCalc.grossProfit;
    initialCalc.netProfitMargin = initialCalc.grossProfitMargin;

    setCalculation(initialCalc);

    // Initialize save form
    setProductName(product.product_title || '');
    setProductDescription(`Amazon Explorer Product - ASIN: ${product.asin} | Supplier: ${supplier.name}`);
    setSelectedCategory('');
    setShowSaveSection(false);
    setShowAddCategory(false);
    setNewCategoryName('');

    setShowProfitCalculator(true);
  };

  // MarginMax Basic calculation functions
  const calculateFulfillmentTotals = () => {
    const {
      fm_referrfalFees,
      fm_fbaFulfillmentFees,
      fm_monthlyStorageFees,
      fm_longTermStorageFees,
      fm_inboundShippingCost,
      fm_shippingFees,
      fm_handlingCost,
      fm_storageCost,
      fm_miscCost,
      pi_quantity,
      fm_returnsRate
    } = calculation;

    // Calculate per-unit fulfillment cost
    let perUnitCost = 0;

    if (calculation.fm_model === 'FBA') {
      perUnitCost = fm_referrfalFees + fm_fbaFulfillmentFees + fm_monthlyStorageFees +
        fm_longTermStorageFees + fm_inboundShippingCost;
    } else {
      perUnitCost = fm_referrfalFees + fm_shippingFees + fm_handlingCost +
        fm_storageCost + fm_miscCost;
    }

    const totalCost = perUnitCost * pi_quantity;

    // Calculate refund loss based on returns rate
    const sum = calculation.psc_perUnitCost + perUnitCost;
    const refundLoss = ((pi_quantity * (fm_returnsRate / 100) * (sum - fm_referrfalFees)) / (pi_quantity || 1));

    return {
      perUnitCost: perUnitCost + refundLoss,
      totalCost: totalCost + (refundLoss * pi_quantity)
    };
  };

  const updateCalculation = (field: keyof ProfitCalculation, value: number | string) => {
    setCalculation(prev => {
      const updated = { ...prev, [field]: value };

      // Recalculate dependent fields
      // Product Information calculations
      updated.pi_totalRevenue = updated.pi_sellingPrice * updated.pi_quantity;

      // Product Sourcing Cost calculations
      const sourcingTotal = updated.psc_manufacturingCost + updated.psc_shippingCost + updated.psc_miscCost;
      updated.psc_perUnitCost = sourcingTotal / (updated.psc_orderQuantity || 1);
      updated.psc_totalCost = updated.psc_perUnitCost * updated.pi_quantity;

      // Fulfillment Model calculations
      const fulfillmentTotals = calculateFulfillmentTotals();
      updated.fm_perUnitCost = fulfillmentTotals.perUnitCost;
      updated.fm_totalCost = fulfillmentTotals.totalCost;

      // Profit calculations (MarginMax Basic style)
      updated.grossProfit = updated.pi_sellingPrice - updated.psc_perUnitCost - updated.fm_perUnitCost;
      updated.grossProfitMargin = updated.grossProfit * updated.pi_quantity;
      updated.netProfit = updated.grossProfit;
      updated.netProfitMargin = updated.grossProfitMargin;

      return updated;
    });
  };

  // Handle category creation
  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    createCategoryMutation.mutate({
      name: newCategoryName.trim(),
      description: `Category for ${newCategoryName.trim()} products`
    });
  };

  // Handle product save
  const handleSaveProduct = () => {
    if (!productName.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    if (!selectedSupplier) {
      toast.error('No supplier selected');
      return;
    }

    setIsSaving(true);

    // Prepare product data with MarginMax Basic field structure
    const productData = {
      name: productName.trim(),
      description: productDescription.trim(),
      category: selectedCategory,

      // Product Information (MarginMax Basic format)
      pi_sellingPrice: calculation.pi_sellingPrice.toFixed(2),
      pi_totalRevenue: calculation.pi_totalRevenue.toFixed(2),
      pi_quantity: calculation.pi_quantity,

      // Product Sourcing Cost (MarginMax Basic format)
      psc_manufacturingCost: calculation.psc_manufacturingCost.toFixed(2),
      psc_shippingCost: calculation.psc_shippingCost.toFixed(2),
      psc_miscCost: calculation.psc_miscCost.toFixed(2),
      psc_orderQuantity: calculation.psc_orderQuantity,
      psc_perUnitCost: calculation.psc_perUnitCost.toFixed(2),
      psc_totalCost: calculation.psc_totalCost.toFixed(2),

      // Fulfillment Model (MarginMax Basic format)
      fm_model: calculation.fm_model,
      fm_referrfalFees: calculation.fm_referrfalFees.toFixed(2),
      fm_fbaFulfillmentFees: calculation.fm_fbaFulfillmentFees.toFixed(2),
      fm_monthlyStorageFees: calculation.fm_monthlyStorageFees.toFixed(2),
      fm_longTermStorageFees: calculation.fm_longTermStorageFees.toFixed(2),
      fm_inboundShippingCost: calculation.fm_inboundShippingCost.toFixed(2),
      fm_returnsRate: calculation.fm_returnsRate,
      fm_shippingFees: calculation.fm_shippingFees.toFixed(2),
      fm_handlingCost: calculation.fm_handlingCost.toFixed(2),
      fm_storageCost: calculation.fm_storageCost.toFixed(2),
      fm_miscCost: calculation.fm_miscCost.toFixed(2),
      fm_perUnitCost: calculation.fm_perUnitCost.toFixed(2),
      fm_totalCost: calculation.fm_totalCost.toFixed(2),

      // Profit Information
      gross_profit: calculation.grossProfit.toFixed(2),
      gross_profit_margin: calculation.grossProfitMargin.toFixed(2),
      net_profit: calculation.netProfit.toFixed(2),
      net_profit_margin: calculation.netProfitMargin.toFixed(2),
      simple_profit_pro: false,

      // Amazon product data
      amazon_product: {
        data: product,
        parameters: {
          searchCountry: 'US',
        },
        source: 'amazon_explorer',
        saved_at: new Date().toISOString(),
        // Add offer object with seller information for Product Vault display
        offer: {
          product_price: product.product_price || '0',
          product_original_price: product.product_original_price || '',
          product_condition: 'New',
          // If supplier is selected, use supplier name; otherwise use product seller name
          seller: selectedSupplier?.name || (product as any).seller_name || 'Amazon Seller',
          seller_id: product.asin || '',
          seller_link: selectedSupplier?.contact_url || product.product_url || '',
          seller_star_rating: selectedSupplier?.rating?.toString() || product.product_star_rating || '0',
          seller_star_rating_info: selectedSupplier?.total_transactions?.toString() || product.product_num_ratings?.toString() || '0',
          currency: product.currency || 'USD',
          delivery_price: product.delivery || ((product as any).free_shipping ? 'Free Shipping' : 'Standard Shipping'),
          delivery_time: selectedSupplier?.lead_time || (product as any).primary_delivery_time || '7-14 days',
          // If supplier is selected, use supplier location; otherwise use product country
          ships_from: selectedSupplier?.location || (product as any).seller_country || (product as any).country || 'US',
        },
      },

      // Supplier Information (saved in both fields for compatibility)
      // supplier_info: Simple format for display in Product Vault
      supplier_info: {
        name: selectedSupplier.name,
        location: selectedSupplier.location,
        price_per_unit: selectedSupplier.estimated_price,
        estimated_price: selectedSupplier.estimated_price,
        minimum_order: selectedSupplier.moq,
        contact_url: selectedSupplier.contact_url,
        ai_match_score: selectedSupplier.ai_match_score,
        rating: selectedSupplier.rating || 0,
        total_transactions: selectedSupplier.total_transactions || 0,
        lead_time: selectedSupplier.lead_time || '7-14 days',
        response_rate: selectedSupplier.response_rate || '95%',
        verification_status: selectedSupplier.verification_status || 'Verified',
      },

      // alibaba_product: Backend expects this field (JSONField in Product model)
      alibaba_product: {
        supplier: {
          name: selectedSupplier.name,
          location: selectedSupplier.location,
          price_per_unit: selectedSupplier.estimated_price,
          estimated_price: selectedSupplier.estimated_price,
          minimum_order: selectedSupplier.moq,
          moq: selectedSupplier.moq,
          contact_url: selectedSupplier.contact_url,
          ai_match_score: selectedSupplier.ai_match_score,
          rating: selectedSupplier.rating || 0,
          total_transactions: selectedSupplier.total_transactions || 0,
          lead_time: selectedSupplier.lead_time || '7-14 days',
          response_rate: selectedSupplier.response_rate || '95%',
          verification_status: selectedSupplier.verification_status || 'Verified',
        },
        source: 'amazon_explorer',
        saved_at: new Date().toISOString(),
      },
    };

    console.log('🔥 CATEGORY:', selectedCategory);
    console.log('🔥 PRODUCT DATA:', productData);
    saveProductMutation.mutate(productData);
  };

  const details = productDetails?.data;
  const reviews = reviewsData?.data?.reviews || [];


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 line-clamp-1">
            Product Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-80px)]">
          {/* Left Panel - Product Info */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Product Image and Basic Info */}
              <div className="text-center">
                <img
                  src={product.product_photo || '/api/placeholder/300/300'}
                  alt={product.product_title}
                  className="w-full max-w-xs mx-auto rounded-lg shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/api/placeholder/300/300';
                  }}
                />

                <h3 className="font-semibold hover:text-[#de7a22] text-lg mb-2 line-clamp-3 mt-4">
                  {product.product_title}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(product.product_price || '')}
                    </span>
                    {product.product_star_rating && (
                      <div className="flex items-center text-[#2262a1]">
                        <Star className="w-5 h-5 text-[#de7a22] fill-current mr-1" />
                        <span className="font-medium">{formatRating(product.product_star_rating)}</span>
                        <span className=" ml-1">
                          ({formatReviewCount(product.product_num_ratings || 0)})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {product.is_best_seller && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                        Best Seller
                      </span>
                    )}
                    {product.is_amazon_choice && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        Amazon's Choice
                      </span>
                    )}
                    {product.is_prime && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                        Prime
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={getAmazonUrl(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#ffa41c] text-white py-3 px-4 rounded-lg hover:bg-[#ff6201] transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  View on Amazon
                </a>

                <button
                  onClick={handleDiscoverSuppliers}
                  disabled={isSupplierDiscoveryLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSupplierDiscoveryLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Discovering...
                    </>
                  ) : (
                    <>
                      <Truck className="w-5 h-5" />
                      Discover Suppliers
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Tabs */}
          <div className="flex-1 flex flex-col">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              {[
                { id: 'overview', label: 'Overview', icon: Package },
                // { id: 'reviews', label: 'Reviews', icon: MessageSquare },
                // { id: 'offers', label: 'Offers', icon: DollarSign },
                { id: 'suppliers', label: 'Suppliers', icon: Truck },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                  {id === 'suppliers' && suppliers && suppliers.length > 0 && (
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      {suppliers.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <OverviewTab
                  product={product}
                  details={details}
                  isLoading={detailsLoading}
                  error={detailsError}
                />
              )}
              {/* {activeTab === 'reviews' && (
                <ReviewsTab
                  reviews={reviews}
                  isLoading={reviewsLoading}
                  error={reviewsError}
                />
              )}
              {activeTab === 'offers' && (
                <OffersTab
                  offers={offers}
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
      </div>

      {/* Profit Calculator Modal */}
      {showProfitCalculator && selectedSupplier && (
        <AmazonProfitCalculatorModal
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

// Tab Components
interface OverviewTabProps {
  product: AmazonProduct;
  details: ProductDetails | undefined;
  isLoading: boolean;
  error: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ product, details, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load product details</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Product Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Description</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed">
            {details?.product_description || product.product_title || 'No description available'}
          </p>
        </div>
      </div>

      {/* Product Features */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700">
            Product features will be displayed here when available from the API.
          </p>
        </div>
      </div>

      {/* Product Specifications */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Information</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-600">ASIN:</span>
              <span className="ml-2 text-gray-900">{product.asin}</span>
            </div>
            {product.brand && (
              <div>
                <span className="font-medium text-gray-600">Brand:</span>
                <span className="ml-2 text-gray-900">{product.brand}</span>
              </div>
            )}
            {product.category_path && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-600">Category:</span>
                <span className="ml-2 text-gray-900">{product.category_path}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ReviewsTabProps {
  reviews: ProductReview[];
  isLoading: boolean;
  error: any;
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({ reviews, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load reviews</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No reviews available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.slice(0, 10).map((review, index) => (
        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < review.review_star_rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {review.review_date}
            </span>
          </div>

          {review.review_title && (
            <h4 className="font-medium text-gray-900 mb-2">
              {review.review_title}
            </h4>
          )}

          <p className="text-gray-700 text-sm leading-relaxed">
            {review.review_comment}
          </p>

          {review.review_author && (
            <p className="text-xs text-gray-500 mt-2">
              By {review.review_author}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

interface OffersTabProps {
  offers: ProductOffer[];
  isLoading: boolean;
  error: any;
}

const OffersTab: React.FC<OffersTabProps> = ({ offers, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load offers</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-8">
        <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No offers available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.slice(0, 10).map((offer, index) => (
        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium text-gray-900">
                Seller Information
              </h4>
              {offer.offer_condition && (
                <p className="text-sm text-gray-600">
                  Condition: {offer.offer_condition}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                {formatPrice(offer.offer_price || '')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface SuppliersTabProps {
  suppliers: SupplierInfo[];
  isLoading: boolean;
  analysisTime: number;
  onSelectSupplier: (supplier: SupplierInfo) => void;
}

const SuppliersTab: React.FC<SuppliersTabProps> = ({ suppliers, isLoading, analysisTime, onSelectSupplier }) => {
  // ✅ Show ONLY VERIFIED suppliers (backend filtered)
  const displaySuppliers = suppliers || [];

  console.log('🏭 BlueRitt Explorer Supplier Display:', {
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
      {/* Analysis Summary */}
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

      {/* Suppliers List */}
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500">MOQ</div>
                <div className="font-medium">{supplier.moq || supplier.min_order_quantity || 'Contact supplier'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Lead Time</div>
                <div className="font-medium">{supplier.lead_time || 'Contact supplier'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Verification</div>
                <div className="font-medium text-blue-600">{supplier.verification_status || (supplier.verified_supplier ? 'Verified' : 'Unverified')}</div>
              </div>



              <div className="flex items-center justify-end gap-[8px]">
                <div className="relative h-[90px] w-[90px]">
                  {/* Circular Progress Bar */}
                  <svg className="transform -rotate-90" width="90" height="90">
                    <circle
                      cx="45"
                      cy="45"
                      r="40"
                      stroke="#e5e7eb"  // Tailwind's gray-200
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="45"
                      cy="45"
                      r="40"
                      stroke={
                        (supplier.ai_match_score || 0) >= 80
                          ? '#22c55e' // green-500
                          : (supplier.ai_match_score || 0) >= 60
                            ? '#eab308' // yellow-500
                            : '#ef4444' // red-500
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
                    <div className="text-xs text-gray-500">AI Match</div>
                    <div className="font-medium text-purple-600">
                      {supplier?.ai_match_score !== undefined
                        ? Number(supplier.ai_match_score).toFixed(2)
                        : 0
                      }%
                    </div>
                  </div>

                </div>

                {/* price */}
                {/* <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {supplier.estimated_price}
                    </div>
                    <div className="text-xs text-gray-500">Est. Price</div>
                  </div> */}
              </div>

            </div>

            {/* Additional supplier details */}
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Years in Business:</span>
                  <span className="font-medium ml-2">{supplier.years_in_business || 'N/A'} years</span>
                </div>
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

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${(supplier.ai_match_score || 0) >= 80
                    ? 'bg-green-100 text-green-800'
                    : (supplier.ai_match_score || 0) >= 60
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                  {(supplier.ai_match_score || 0) >= 80 ? 'Excellent Match' :
                    (supplier.ai_match_score || 0) >= 60 ? 'Good Match' : 'Fair Match'}
                </span>
                {supplier.trade_assurance && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Trade Assurance
                  </span>
                )}
              </div>

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

export default ProductDetailsModal;
