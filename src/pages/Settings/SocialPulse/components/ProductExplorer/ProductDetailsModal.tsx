import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { X, ExternalLink, Star, Package, MessageSquare, DollarSign, Truck, Shield, Zap, Calculator, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

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
  country?: string;
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

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, isOpen, onClose, autoStartSupplierDiscovery = false, country = 'US' }) => {
  // Redux dispatch for setting profit pro source
  const dispatch = useDispatch();

  // Quota management for supplier discovery (shared with BlueRitt Explorer and TikTok Trends)
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
  // ✅ Using the same endpoint as BlueRitt Explorer with source parameter
  const {
    data: productDetails,
    isLoading: detailsLoading,
    error: detailsError
  } = useQuery({
    queryKey: ['amazon-product-details', product.asin, country],
    queryFn: () => getAmazonExplorerProductDetails({
      asin: product.asin,
      country,
      source: 'amazon_search' // ✅ Use amazon_search to match backend validation
    }),
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
      // Handle category_path - it might be an object {id, name, link} or a string
      const categoryValue = typeof product.category_path === 'object' && product.category_path !== null
        ? (product.category_path as any).name || (product.category_path as any).id || ''
        : product.category_path || '';

      const response = await discoverSuppliers({
        title: product.product_title,
        asin: product.asin,
        brand: product.brand,
        price: product.product_price,
        category: categoryValue
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

    // ✅ Set profit pro source to 'amazon_trends' for Amazon Trends products
    dispatch({
      type: 'SET_PROFIT_PRO_SOURCE',
      payload: 'amazon_trends',
    });

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
        supplier_product_image: selectedSupplier.supplier_product_image || '', // ✅ Supplier's product image from Alibaba
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
          supplier_product_image: selectedSupplier.supplier_product_image || '', // ✅ Supplier's product image from Alibaba
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col ">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeTab === 'overview' ? 'Amazon Trend Product Details' : activeTab === 'suppliers' ? 'BlueRitt SourceLink' : 'BlueRitt Product Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-900 dark:text-white" />
          </button>
        </div>

        <div className="flex justify-between border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: Package },
            // { id: 'reviews', label: 'Reviews', icon: MessageSquare },
            // { id: 'offers', label: 'Offers', icon: DollarSign },
            { id: 'suppliers', label: 'Suppliers', icon: Truck },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabType)}
              // className={`flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === id
              //   ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              //   : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              //   }`}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === id
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-white dark:bg-gray-800'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              <Icon className="w-5 h-5" />
              {label}
              {id === 'suppliers' && suppliers && suppliers.length > 0 && (
                <span className="bg-purple-100 text-purple-800 text-xs text-center px-2 py-1 rounded-full">
                  {suppliers.length}
                </span>

              )}
            </button>
          ))}
        </div>
        <div className="p-6 overflow-y-auto">

          <div className=" flex justify-between  ">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-base sm:text-sm md:text-lg lg:text-xl xl:text-2xl" >Your Selected Product</h4>
            {activeTab === 'suppliers' && suppliers && suppliers.length > 0 && (
              <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-base sm:text-sm sm:flex-wrap sm:ml-[70px] md:ml-[156px] md:text-lg lg:text-xl xl:text-2xl">
                Recommended Alibaba Suppliers for Your Product & AI Match Scores
              </h4>
            )}
          </div>
          {/* Content */}
          <div className="flex gap-6 h-[calc(90vh-300px)] ">
            {/* Left Panel - Product Info */}
            <div className="w-1/3 flex-shrink-0">
              <div className="sticky top-0 bg-white dark:bg-gray-700 rounded-xl border-2 border-orange-200 dark:border-orange-600 p-6 shadow-lg">
                {/* Product Image and Basic Info */}
                <div className="text-center">
                  <img
                    src={product.product_photo || '/api/placeholder/300/300'}
                    alt={product.product_title}
                    className="w-full max-w-xs mx-auto rounded-lg shadow-md"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      // Prevent infinite loop by checking if we've already tried the placeholder
                      if (!img.src.includes('placeholder')) {
                        img.src = '/api/placeholder/300/300';
                      }
                    }}
                  />

                  <h3 className="font-semibold hover:text-[#de7a22] text-lg mb-2 line-clamp-3 mt-4">
                    {product.product_title}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(product.product_price || '', country)}
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
                    href={getAmazonUrl(product, country)}
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
            <div className="">

              <div className="flex-1 flex flex-col ">

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto ">
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
                  country={country}
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
      {(details?.product_description || details?.product_title) && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Description</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {details?.product_description || details?.product_title || product.product_title}
            </p>
          </div>
        </div>
      )}

      {/* About This Product / Key Features */}
      {details?.about_product && details.about_product.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="space-y-2">
              {details.about_product.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* What Customers Say */}
      {(details?.customers_say || (details as any)?.customers_say) && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">What Customers Say</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">
              {details?.customers_say || (details as any)?.customers_say}
            </p>
          </div>
        </div>
      )}

      {/* Product Information / Specifications */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Information</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-600">ASIN:</span>
              <span className="ml-2 text-gray-900">{details?.asin || product.asin}</span>
            </div>
            {(details?.brand || product.brand) && (
              <div>
                <span className="font-medium text-gray-600">Brand:</span>
                <span className="ml-2 text-gray-900">{details?.brand || product.brand}</span>
              </div>
            )}
            {/* {(details?.category_path || product.category_path) && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-600">Category:</span>
                <span className="ml-2 text-gray-900">
                  {(() => {
                    const categoryPath = details?.category_path || product.category_path;
                    // Handle if category_path is an object with {id, name, link}
                    if (typeof categoryPath === 'object' && categoryPath !== null) {
                      return (categoryPath as any).name || (categoryPath as any).id || JSON.stringify(categoryPath);
                    }
                    // Handle if it's a string
                    return categoryPath;
                  })()}
                </span>
              </div>
            )} */}
            {(details?.product_num_ratings || product.product_num_ratings) && (
              <div>
                <span className="font-medium text-gray-600">Number of Ratings:</span>
                <span className="ml-2 text-gray-900">{formatReviewCount(details?.product_num_ratings || product.product_num_ratings || 0)}</span>
              </div>
            )}
            {(details?.product_num_offers || product.product_num_offers) && (
              <div>
                <span className="font-medium text-gray-600">Number of Offers:</span>
                <span className="ml-2 text-gray-900">{details?.product_num_offers || product.product_num_offers}</span>
              </div>
            )}
            {(details?.product_slug || product.product_slug) && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-600">Product Slug:</span>
                <span className="ml-2 text-gray-900">{details?.product_slug || product.product_slug}</span>
              </div>
            )}
            {details?.availability && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-600">Availability:</span>
                <span className="ml-2 text-gray-900">{details.availability}</span>
              </div>
            )}
            {details?.delivery_message && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-600">Delivery:</span>
                <span className="ml-2 text-gray-900">{details.delivery_message}</span>
              </div>
            )}
            {details?.climate_pledge_friendly && (
              <div className="md:col-span-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <Shield className="w-4 h-4" />
                  Climate Pledge Friendly
                </span>
              </div>
            )}
          </div>

          {/* Additional Product Information from product_information object */}
          {details?.product_information && typeof details.product_information === 'object' && (() => {
            const renderedFields = Object.entries(details.product_information).map(([key, value]) => {
              // Skip if value is null or undefined
              if (value === null || value === undefined) return null;

              // Handle object values (like {id, name, link})
              if (typeof value === 'object' && value !== null) {
                // If it's an array, join the elements
                if (Array.isArray(value)) {
                  // Filter out any non-primitive values from array
                  const primitiveValues = value.filter(item =>
                    typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
                  );
                  if (primitiveValues.length === 0) return null;

                  return (
                    <div key={key} className="col-span-1">
                      <span className="font-medium text-gray-600 capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="ml-2 text-gray-900">{primitiveValues.join(', ')}</span>
                    </div>
                  );
                }
                // If it's an object with 'name' property, display the name
                if ('name' in value && value.name) {
                  return (
                    <div key={key} className="col-span-1">
                      <span className="font-medium text-gray-600 capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="ml-2 text-gray-900">{String(value.name)}</span>
                    </div>
                  );
                }
                // If it's an object with other properties, try to extract meaningful text
                if ('id' in value || 'link' in value) {
                  // Skip objects that only have id/link without name
                  return null;
                }
                // Otherwise, stringify the object
                return (
                  <div key={key} className="col-span-1">
                    <span className="font-medium text-gray-600 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="ml-2 text-gray-900">{JSON.stringify(value)}</span>
                  </div>
                );
              }

              // Handle primitive values (string, number, boolean)
              return (
                <div key={key} className="col-span-1">
                  <span className="font-medium text-gray-600 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="ml-2 text-gray-900">{String(value)}</span>
                </div>
              );
            }).filter(Boolean);

            // Only render the section if there are fields to display
            if (renderedFields.length === 0) return null;

            return (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Additional Specifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderedFields}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Ingredients (if available) */}
      {details?.ingredients && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">{details.ingredients}</p>
          </div>
        </div>
      )}

      {/* Directions (if available) */}
      {details?.directions && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Directions</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">{details.directions}</p>
          </div>
        </div>
      )}

      {/* Legal Disclaimer (if available) */}
      {details?.legal_disclaimer && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Disclaimer</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm italic">{details.legal_disclaimer}</p>
          </div>
        </div>
      )}
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
  country: string;
}

const OffersTab: React.FC<OffersTabProps> = ({ offers, isLoading, error, country }) => {
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
                {formatPrice(offer.offer_price || '', country)}
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

  const [progress, setProgress] = useState(0);

  // Progress simulation effect
  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          // Slow down progress to match 30-45 seconds timeframe
          const increment = Math.random() * 3 + 1; // 1-4% per interval
          return Math.min(prev + increment, 100);
        });
      }, 800);

      return () => clearInterval(timer);
    } else {
      setProgress(100);
    }
  }, [isLoading]);

  const getStatusText = () => {
    if (progress < 30) return "Analyzing the Product";
    if (progress < 75) return "Discovering Verified Suppliers";
    return "Computing AI Match Score";
  };

  const getSubStatusText = () => {
    if (progress < 30) return "Analyzing product specifications and requirements...";
    if (progress < 75) return "Screening verified suppliers from global database...";
    return "Calculating optimal matches based on capabilities and pricing...";
  };

  console.log('🏭 BlueRitt Explorer Supplier Display:', {
    totalSuppliers: suppliers?.length || 0,
    displayingVerifiedOnly: true,
    note: 'Backend filters to show only verified suppliers with badges'
  });


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="ml-14 max-w-md mx-auto px-6 w-full">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Progress Percentage */}
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-3 text-center">
            {Math.round(progress)}%
          </div>

          {/* Dynamic Status Text */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
            {getStatusText()}
          </h3>

          {/* Constant Message */}
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-6 text-center">
            This process may take 30–45 seconds. Please wait while our AI engine generates the results
          </p>

          {/* Animated Dots */}
          <div className="flex justify-center items-center gap-1 mb-6">
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-pulse"
                style={{ animationDelay: `${dot * 0.2}s` }}
              ></div>
            ))}
          </div>

          {/* AI Powered Section */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-700">
            <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
              <Zap className="w-5 h-5 animate-pulse" />
              <span className="font-medium">AI-Powered Matching</span>
            </div>

            {/* Dynamic Sub-status */}
            <p className="text-blue-600 dark:text-blue-400 text-sm text-center">
              {getSubStatusText()}
            </p>
          </div>
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
      {/* BlueRitt SourceLink Heading */}
      {/* <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-lg p-4 shadow-md">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <Shield className="w-6 h-6" />
          BlueRitt SourceLink
        </h2>
        <p className="text-blue-100 mt-1 text-sm">
          AI-Powered Supplier Discovery & Matching
        </p>
      </div> */}

      {/* Analysis Summary */}
      {/* <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Supplier AI Matching Process Completed
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Found {displaySuppliers.length} suppliers in {analysisTime.toFixed(1)}s
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{displaySuppliers.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Suppliers</div>
          </div>
        </div>
      </div> */}

      {/* Suppliers List - EXACT COPY from BlueRitt Explorer with Colorful Badges */}
      <div className="space-y-4">

        {displaySuppliers.map((supplier, index) => (

          <div key={index} className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-2 hover:border-orange-300 dark:hover:border-orange-500 hover:shadow-lg transition-all duration-200">
            {/* ✅ Supplier Product Image */}

            {supplier.supplier_product_image && (
              <div className="mb-4">
                <img
                  src={supplier.supplier_product_image}
                  alt={supplier.name}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    // Hide image if it fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            {/* Header with Name, Verification, and AI Score */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 pr-4">
                <h5 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{supplier.name}</h5>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{supplier.location}</p>

                {/* ✅ Verification Badges - Order: Verified → Trade Assurance → Assessed → Gold → Store Age → Rating */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {/* 1. Verified Supplier Badge (First) */}
                  {(supplier.verification_badge === 'Verified Pro' ||
                    supplier.verified_pro) && (
                      <span className="bg-gradient-to-r from-orange-500 to-orange-700 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                        <Shield className="w-3 h-3 fill-current" />
                        Verified Pro
                      </span>
                    )}

                  {!supplier.verified_pro &&
                    (supplier.verification_badge === 'Verified Supplier' ||
                      supplier.verification_status === 'Verified' ||
                      supplier.verified_supplier) && (
                      <span className="bg-gradient-to-r from-red-500 to-red-700 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                        <Shield className="w-3 h-3 fill-current" />
                        Verified
                      </span>
                    )}

                  {supplier.is_assessed && (
                    <span className="bg-gradient-to-r from-green-500 to-green-700 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                      <Shield className="w-3 h-3 fill-current" />
                      Verified
                    </span>
                  )}

                  {/* 2. Trade Assurance Badge (Second) */}
                  {supplier.trade_assurance && (
                    <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                      <Shield className="w-3 h-3 fill-current" />
                      Trade Assurance
                    </span>
                  )}

                  {supplier.years_in_business && supplier.years_in_business > 0 && (
                    <span className="bg-gradient-to-r from-sky-400 to-sky-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
                      {supplier.years_in_business} {supplier.years_in_business === 1 ? 'year' : 'years'}
                    </span>
                  )}

                  {/* 3. Assessed Supplier Badge (Third) */}


                  {/* 4. Gold Supplier Badge (Fourth) */}
                  {(supplier.verification_badge === 'Gold Supplier' ||
                    supplier.verification_status === 'Gold Supplier' ||
                    supplier.verification_badge === 'Gold' ||
                    supplier.is_gold) && (
                      <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                        <Shield className="w-3 h-3 fill-current" />
                        Gold Supplier
                      </span>
                    )}

                  {/* 5. Store Age Badge (Fifth) */}


                  {/* 6. Star Rating Badge (Sixth) - Always show rating */}
                  <span className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {supplier.rating ? supplier.rating.toFixed(1) : '0'}
                  </span>
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
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Minimum Order QTY</div>
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
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Manufacturing Cost</div>
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
              <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Item id</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {supplier.id}
                </div>
              </div>

              {/* ✅ Star Rating Display */}
              <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Supplier Rating</div>
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= (supplier.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-300 text-gray-300 dark:fill-gray-500 dark:text-gray-500'
                        }`}
                    />
                  ))}
                  <span className="ml-1 text-xs font-semibold text-gray-900 dark:text-white">
                    {supplier.rating ? supplier.rating.toFixed(1) : '0.0'}
                  </span>
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

            {/* Action Buttons - Aligned to Right */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => onSelectSupplier(supplier)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-1.5 px-3 rounded-lg transition-all duration-200 font-medium text-sm flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                Calculate Profit
              </button>
              <a
                href={supplier.contact_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-1.5 px-3 rounded-lg transition-all duration-200 font-medium text-sm flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Contact Supplier
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetailsModal;
