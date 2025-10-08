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



// Category type definition
interface Category {
  id: string;
  name: string;
}

interface ProductDetailsModalProps {
  product: AmazonProduct;
  isOpen: boolean;
  onClose: () => void;
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

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, isOpen, onClose }) => {
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
      },

      // Supplier Information
      supplier_info: {
        name: selectedSupplier.name,
        location: selectedSupplier.location,
        price_per_unit: selectedSupplier.estimated_price,
        estimated_price: selectedSupplier.estimated_price,
        minimum_order: selectedSupplier.moq,
        contact_url: selectedSupplier.contact_url,
        ai_match_score: selectedSupplier.ai_match_score,
      },
    };

    console.log('🔥 CATEGORY:', selectedCategory);
    console.log('🔥 PRODUCT DATA:', productData);
    saveProductMutation.mutate(productData);
  };

  const details = productDetails?.data;
  const reviews = reviewsData?.data?.reviews || [];
  const offers = offersData?.data?.offers || [];

  // Profit Calculator Modal Component
  const ProfitCalculatorModal = () => {
    if (!showProfitCalculator || !selectedSupplier) return null;

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Amazon Profit Calculator</h2>
              <p className="text-sm text-gray-600">Calculate profit margins for selected Amazon product and supplier</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Save to Vault Button */}
            <button
              onClick={() => setShowSaveSection(!showSaveSection)}
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-colors flex items-center gap-2 font-medium shadow-md"
            >
              <Save className="w-4 h-4" />
              Save to Vault
            </button>

            <button
              onClick={() => setShowProfitCalculator(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Product and Supplier Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Product Info */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-pink-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Selected Amazon Product
              </h3>
              <div className="flex gap-4">
                <img
                  src={product.product_photo || '/api/placeholder/80/80'}
                  alt={product.product_title}
                  className="w-20 h-20 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/api/placeholder/80/80';
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{product.product_title}</h4>
                  <p className="text-lg font-bold text-pink-600 mb-2">{formatPrice(product.product_price || '')}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>ASIN: {product.asin}</div>
                    <div>Brand: {product.brand || 'N/A'}</div>
                    <div>Rating: {formatRating(product.product_star_rating || 0)}</div>
                    <div>Reviews: {formatReviewCount(product.product_num_ratings || 0)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Supplier Info */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Selected Supplier
              </h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedSupplier.name}</h4>
                    <p className="text-sm text-gray-600">{selectedSupplier.location}</p>
                  </div>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                    {selectedSupplier.ai_match_score}% Match
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-600">MOQ:</span> <span className="font-medium">{selectedSupplier.moq}</span></div>
                  <div><span className="text-gray-600">Lead Time:</span> <span className="font-medium">{selectedSupplier.lead_time}</span></div>
                  <div><span className="text-gray-600">Est. Price:</span> <span className="font-medium text-green-600">{selectedSupplier.estimated_price}</span></div>
                  <div><span className="text-gray-600">Verification:</span> <span className="font-medium text-blue-600">{selectedSupplier.verification_status}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Calculator Section */}
          <div className="space-y-6">
            {/* Product Information Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Product Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Revenue/Unit
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.pi_sellingPrice}
                    onChange={(e) => updateCalculation('pi_sellingPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Product Revenue
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.pi_totalRevenue}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={calculation.pi_quantity}
                    onChange={(e) => updateCalculation('pi_quantity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            {/* Product Sourcing Cost Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Sourcing Cost
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Manufacturing
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.psc_manufacturingCost}
                    onChange={(e) => updateCalculation('psc_manufacturingCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.psc_shippingCost}
                    onChange={(e) => updateCalculation('psc_shippingCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Sourcing Costs
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.psc_miscCost}
                    onChange={(e) => updateCalculation('psc_miscCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Quantity
                  </label>
                  <input
                    type="number"
                    value={calculation.psc_orderQuantity}
                    onChange={(e) => updateCalculation('psc_orderQuantity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            {/* Fulfillment Model Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Fulfillment Cost
              </h3>

              {/* Fulfillment Model Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fulfillment Model*
                </label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-x-2">
                    <label>FBA</label>
                    <input
                      type="radio"
                      name="fm_model"
                      value="FBA"
                      checked={calculation.fm_model === "FBA"}
                      onChange={(e) => updateCalculation('fm_model', e.target.value)}
                      className="text-purple-600"
                    />
                  </div>
                  <div className="flex items-center gap-x-2">
                    <label>FBM</label>
                    <input
                      type="radio"
                      name="fm_model"
                      value="FBM"
                      checked={calculation.fm_model === "FBM"}
                      onChange={(e) => updateCalculation('fm_model', e.target.value)}
                      className="text-purple-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TikTok Shop Fees*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.fm_referrfalFees}
                    onChange={(e) => updateCalculation('fm_referrfalFees', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {/* FBA and FBM dependent fields */}
                {calculation.fm_model === "FBA" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fulfillment Cost*
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={calculation.fm_fbaFulfillmentFees}
                        onChange={(e) => updateCalculation('fm_fbaFulfillmentFees', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Storage Cost*
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={calculation.fm_monthlyStorageFees}
                        onChange={(e) => updateCalculation('fm_monthlyStorageFees', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inbounding Cost
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={calculation.fm_longTermStorageFees}
                        onChange={(e) => updateCalculation('fm_longTermStorageFees', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other FBA Costs
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={calculation.fm_inboundShippingCost}
                        onChange={(e) => updateCalculation('fm_inboundShippingCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shipping Delivery Charges
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={calculation.fm_shippingFees}
                        onChange={(e) => updateCalculation('fm_shippingFees', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fulfillment Cost
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={calculation.fm_handlingCost}
                        onChange={(e) => updateCalculation('fm_handlingCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Storage Cost
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={calculation.fm_storageCost}
                        onChange={(e) => updateCalculation('fm_storageCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other FBM Costs
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={calculation.fm_miscCost}
                        onChange={(e) => updateCalculation('fm_miscCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Returns Rate Slider */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Returns/Refund Rate (Sellable)%*
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={calculation.fm_returnsRate}
                  onChange={(e) => updateCalculation('fm_returnsRate', parseFloat(e.target.value) || 0)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="font-medium">{calculation.fm_returnsRate.toFixed(1)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Profit Analysis Results */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-green-600" />
                Profit Analysis
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-sm text-gray-600">Profit per Unit</div>
                  <div className={`text-lg font-bold ${(calculation.pi_sellingPrice - calculation.psc_perUnitCost - calculation.fm_perUnitCost) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(calculation.pi_sellingPrice - calculation.psc_perUnitCost - calculation.fm_perUnitCost).toFixed(2)}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <div className="text-lg font-bold text-blue-600">
                    ${calculation.pi_totalRevenue.toFixed(2)}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-sm text-gray-600">Net Profit</div>
                  <div className={`text-lg font-bold ${calculation.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${calculation.netProfit.toFixed(2)}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-sm text-gray-600">Profit Margin</div>
                  <div className={`text-lg font-bold ${calculation.netProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculation.netProfitMargin.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Cost Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Sourcing Cost/Unit:</span>
                    <span className="font-medium">${calculation.psc_perUnitCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fulfillment Cost/Unit:</span>
                    <span className="font-medium">${calculation.fm_perUnitCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600 font-medium">Total Cost per Unit:</span>
                    <span className="font-bold">${(calculation.psc_perUnitCost + calculation.fm_perUnitCost).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Total Sourcing Costs:</span>
                    <span className="font-bold text-blue-600">${calculation.psc_totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Total Fulfillment Costs:</span>
                    <span className="font-bold text-purple-600">${calculation.fm_totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600 font-medium">Total Costs (All Units):</span>
                    <span className="font-bold text-red-600">${(calculation.psc_totalCost + calculation.fm_totalCost).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Section */}
            {showSaveSection && (
              <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Save className="w-5 h-5 text-green-600" />
                      Save to Product Vault
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Name
                        </label>
                        <input
                          type="text"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter product name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">Select a category</option>
                            {categories.map((category: Category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            New
                          </button>
                        </div>
                      </div>
                      
                      {showNewCategoryForm && (
                        <div className="bg-white rounded-lg p-3 border">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="New category name"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={handleCreateCategory}
                              disabled={createCategoryMutation.isPending}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {createCategoryMutation.isPending ? 'Creating...' : 'Create'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Save Actions */}
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => setShowSaveSection(false)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProduct}
                        disabled={isSaving || saveProductMutation.isPending}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving || saveProductMutation.isPending ? 'Saving...' : 'Save to Vault'}
                      </button>
                    </div>
                  </div>
                )}
          </div>
        </div>
      </div>
    </div>
    );
  };

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
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === id
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
      <ProfitCalculatorModal />
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
                  className={`w-4 h-4 ${
                    i < review.review_star_rating
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

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="text-center py-8">
        <Truck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No suppliers found. Click "Discover Suppliers" to start analysis.</p>
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
              Found {suppliers?.length || 0} verified suppliers in {analysisTime.toFixed(1)}s
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{suppliers?.length || 0}</div>
            <div className="text-xs text-gray-500">Suppliers</div>
          </div>
        </div>
      </div>

      {/* Suppliers List */}
      <div className="space-y-4">
        {suppliers && suppliers.map((supplier, index) => (
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
                      {supplier.ai_match_score || 0}%
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  (supplier.ai_match_score || 0) >= 80
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
