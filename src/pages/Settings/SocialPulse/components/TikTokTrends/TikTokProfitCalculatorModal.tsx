import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X, Calculator, Save, DollarSign, Package } from 'lucide-react';
import { toast } from 'react-toastify';

import { saveProducts, getCategory, createCategory } from '@/api/savedProducts';
import { type TikTokTrendingProduct, type SupplierInfo } from '@/api/tiktokTrends';

interface TikTokProfitCalculatorModalProps {
  product: TikTokTrendingProduct;
  supplier: SupplierInfo;
  isOpen: boolean;
  onClose: () => void;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
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


const TikTokProfitCalculatorModal: React.FC<TikTokProfitCalculatorModalProps> = ({
  product,
  supplier,
  isOpen,
  onClose,
}) => {
  // Calculation state using MarginMax Basic structure
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
    fm_model: "FBA", // Using FBA as default for TikTok Shop
    fm_referrfalFees: 0,
    fm_fbaFulfillmentFees: 0,
    fm_monthlyStorageFees: 0,
    fm_longTermStorageFees: 0,
    fm_inboundShippingCost: 0,
    fm_returnsRate: 0,
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

  // Save section state
  const [showSaveSection, setShowSaveSection] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with product and supplier data
  useEffect(() => {
    if (isOpen && product && supplier) {
      // Parse supplier estimated price
      const supplierPrice = parseFloat(supplier.estimated_price.replace(/[^0-9.]/g, '') || '0');
      const suggestedPrice = supplierPrice * 2.5; // 150% markup

      // Estimate shipping cost based on MOQ
      const estimatedShipping = supplier.moq > 500 ? 2.50 : 5.00;

      // Estimate TikTok Shop fees (roughly 5-8% of selling price)
      const estimatedTikTokFees = suggestedPrice * 0.06; // 6% average

      // Estimate fulfillment fees (roughly $2-4 per unit)
      const fulfillmentFees = 3.00;

      // Estimate storage fees (roughly $0.30-0.50 per unit per month)
      const storageFees = 0.40;

      // Estimate processing fees (roughly $0.20-0.30 per unit)
      const processingFees = 0.25;

      const initialCalc: ProfitCalculation = {
        // Product Information
        pi_sellingPrice: suggestedPrice,
        pi_totalRevenue: suggestedPrice * 100,
        pi_quantity: 100,

        // Product Sourcing Cost
        psc_manufacturingCost: supplierPrice,
        psc_shippingCost: estimatedShipping,
        psc_miscCost: 0,
        psc_orderQuantity: 100,
        psc_perUnitCost: supplierPrice + estimatedShipping,
        psc_totalCost: (supplierPrice + estimatedShipping) * 100,

        // Fulfillment Model (TikTok Shop)
        fm_model: "FBA", // Using FBA model for TikTok Shop
        fm_referrfalFees: estimatedTikTokFees,
        fm_fbaFulfillmentFees: fulfillmentFees,
        fm_monthlyStorageFees: storageFees,
        fm_longTermStorageFees: processingFees,
        fm_inboundShippingCost: 0,
        fm_returnsRate: 0,
        fm_shippingFees: 0,
        fm_handlingCost: 0,
        fm_storageCost: 0,
        fm_miscCost: 0,
        fm_perUnitCost: estimatedTikTokFees + fulfillmentFees + storageFees + processingFees,
        fm_totalCost: (estimatedTikTokFees + fulfillmentFees + storageFees + processingFees) * 100,

        // Calculated Results
        grossProfit: 0,
        grossProfitMargin: 0,
        netProfit: 0,
        netProfitMargin: 0,
      };

      // Calculate profits
      const totalRevenue = initialCalc.pi_totalRevenue;
      const totalSourcingCost = initialCalc.psc_totalCost;
      const totalFulfillmentCost = initialCalc.fm_totalCost;

      initialCalc.grossProfit = totalRevenue - totalSourcingCost;
      initialCalc.grossProfitMargin = totalRevenue > 0 ? (initialCalc.grossProfit / totalRevenue) * 100 : 0;
      initialCalc.netProfit = totalRevenue - totalSourcingCost - totalFulfillmentCost;
      initialCalc.netProfitMargin = totalRevenue > 0 ? (initialCalc.netProfit / totalRevenue) * 100 : 0;

      setCalculation(initialCalc);

      // Initialize save form
      setProductName(product.title || '');
      setProductDescription(`TikTok Trends Product - ID: ${product.id} | Supplier: ${supplier.name}`);
      setSelectedCategory('');
      setShowSaveSection(false);
      setShowNewCategoryForm(false);
      setNewCategoryName('');
    }
  }, [isOpen, product, supplier]);

  // MarginMax Basic calculation functions
  // MarginMax Basic calculation functions
  const calculateFulfillmentTotals = (
    fm_model: string,
    fm_referrfalFees: number,
    fm_fbaFulfillmentFees: number,
    fm_monthlyStorageFees: number,
    fm_longTermStorageFees: number,
    fm_inboundShippingCost: number,
    fm_shippingFees: number,
    fm_handlingCost: number,
    fm_storageCost: number,
    fm_miscCost: number,
    fm_returnsRate: number,
    pi_quantity: number = 0
  ) => {
    const quantity = pi_quantity || calculation.pi_quantity || 0;

    let sum = 0;
    if (fm_model === "FBA") {
      sum = fm_referrfalFees + fm_fbaFulfillmentFees + fm_monthlyStorageFees +
            fm_longTermStorageFees + fm_inboundShippingCost;
    } else {
      sum = fm_referrfalFees + fm_shippingFees + fm_handlingCost +
            fm_storageCost + fm_miscCost;
    }

    // Calculate refund loss based on returns rate
    const refundLoss = ((quantity || 0) * (fm_returnsRate / 100) * (sum - fm_referrfalFees)) / (quantity || 1);
    const perUnitCost = sum + refundLoss;
    const totalCost = perUnitCost * quantity;

    return { perUnitCost, totalCost };
  };

  const updateCalculation = (field: keyof ProfitCalculation, value: number | string) => {
    const newCalc = { ...calculation, [field]: value };

    // Recalculate dependent values based on MarginMax Basic logic
    if (field === 'pi_sellingPrice' || field === 'pi_quantity') {
      newCalc.pi_totalRevenue = newCalc.pi_sellingPrice * newCalc.pi_quantity;
    }

    // Product Sourcing Cost calculations
    if (['psc_manufacturingCost', 'psc_shippingCost', 'psc_miscCost', 'psc_orderQuantity'].includes(field)) {
      const costPerUnit = newCalc.psc_manufacturingCost + newCalc.psc_shippingCost + newCalc.psc_miscCost;
      newCalc.psc_perUnitCost = costPerUnit;
      newCalc.psc_totalCost = costPerUnit * newCalc.psc_orderQuantity;
    }

    // Fulfillment calculations
    const fulfillmentFields = ['fm_referrfalFees', 'fm_fbaFulfillmentFees', 'fm_monthlyStorageFees',
                              'fm_longTermStorageFees', 'fm_inboundShippingCost', 'fm_shippingFees',
                              'fm_handlingCost', 'fm_storageCost', 'fm_miscCost', 'fm_returnsRate'];

    if (fulfillmentFields.includes(field) || field === 'pi_quantity' || field === 'fm_model') {
      const { perUnitCost, totalCost } = calculateFulfillmentTotals(
        newCalc.fm_model,
        newCalc.fm_referrfalFees,
        newCalc.fm_fbaFulfillmentFees,
        newCalc.fm_monthlyStorageFees,
        newCalc.fm_longTermStorageFees,
        newCalc.fm_inboundShippingCost,
        newCalc.fm_shippingFees,
        newCalc.fm_handlingCost,
        newCalc.fm_storageCost,
        newCalc.fm_miscCost,
        newCalc.fm_returnsRate,
        newCalc.pi_quantity
      );

      newCalc.fm_perUnitCost = perUnitCost;
      newCalc.fm_totalCost = totalCost;
    }

    // Calculate profits (MarginMax Basic style)
    const totalRevenue = newCalc.pi_totalRevenue;
    const totalCosts = newCalc.psc_totalCost + newCalc.fm_totalCost;

    newCalc.grossProfit = totalRevenue - newCalc.psc_totalCost - newCalc.fm_totalCost;
    newCalc.grossProfitMargin = totalRevenue > 0 ? (newCalc.grossProfit / totalRevenue) * 100 : 0;
    newCalc.netProfit = totalRevenue - totalCosts;
    newCalc.netProfitMargin = totalRevenue > 0 ? (newCalc.netProfit / totalRevenue) * 100 : 0;

    setCalculation(newCalc);
  };

  // Categories query - only fetch when save section is shown
  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategory,
    select: (response) => response.data || [],
    enabled: showSaveSection, // Only fetch when needed to reduce requests
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success('Category created successfully');
      setNewCategoryName('');
      setShowNewCategoryForm(false);
      refetchCategories();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create category');
    },
  });

  // Utility functions
  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
    return `$${numPrice.toFixed(2)}`;
  };

  const formatNumber = (num: number | undefined | null) => {
    // Handle undefined, null, or invalid numbers
    if (num === undefined || num === null || isNaN(num)) {
      return '0';
    }

    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Save product mutation
  const saveProductMutation = useMutation({
    mutationFn: saveProducts,
    onSuccess: () => {
      toast.success('Product saved to vault successfully');
      setShowSaveSection(false);
      setIsSaving(false);
      onClose();
    },
    onError: () => {
      toast.error('Failed to save product. Please try again.');
      setIsSaving(false);
    },
  });

  // Save functionality handlers

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    createCategoryMutation.mutate({
      name: newCategoryName.trim(),
      description: `Category for TikTok products`,
    });
  };

  const handleSaveProduct = () => {
    if (!productName.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select a category');
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

      // TikTok product data (using amazon_product key for compatibility)
      amazon_product: {
        data: {
          asin: product.id || 'tiktok_product',
          product_title: product.title || 'TikTok Product',
          product_price: product.price || '$0.00',
          product_photo: product.image_url || '',
          product_star_rating: product.rating || 0,
          product_num_ratings: product.review_count || 0,
          brand: 'TikTok Shop',
          category: 'TikTok Product',
          is_prime: false,
          is_amazon_choice: false,
          is_best_seller: false,
          country: product.country || 'US',
        },
        parameters: {
          searchCountry: product.country || 'US',
        },
        source: 'tiktok_trends',
        saved_at: new Date().toISOString(),
      },

      // Supplier Information
      supplier_info: {
        name: supplier.name,
        location: supplier.location,
        price_per_unit: supplier.estimated_price,
        estimated_price: supplier.estimated_price,
        minimum_order: supplier.moq,
        contact_url: supplier.contact_url,
        ai_match_score: supplier.ai_match_score,
      },
    };

    console.log('🔥 CATEGORY:', selectedCategory);
    console.log('🔥 PRODUCT DATA:', productData);
    saveProductMutation.mutate(productData);
  };

  if (!isOpen) return null;

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
              <h2 className="text-xl font-bold text-gray-900">TikTok Profit Calculator</h2>
              <p className="text-sm text-gray-600">Calculate profit margins for selected TikTok product and supplier</p>
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
              onClick={onClose}
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
                Selected TikTok Product
              </h3>
              <div className="flex gap-4">
                <img
                  src={product.image_url || '/api/placeholder/80/80'}
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/api/placeholder/80/80';
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{product.title}</h4>
                  <p className="text-lg font-bold text-pink-600 mb-2">{formatPrice(product.price)}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Views: {formatNumber(product.views_count)}</div>
                    <div>Likes: {formatNumber(product.likes_count)}</div>
                    <div>Shares: {formatNumber(product.shares_count)}</div>
                    <div>Sales: {formatNumber(product.sales_count)}</div>
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
                    <h4 className="font-medium text-gray-900">{supplier.name}</h4>
                    <p className="text-sm text-gray-600">{supplier.location}</p>
                  </div>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                    {supplier.ai_match_score || 0}% Match
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-600">MOQ:</span> <span className="font-medium">{supplier.moq || 0}</span></div>
                  <div><span className="text-gray-600">Lead Time:</span> <span className="font-medium">{supplier.lead_time}</span></div>
                  <div><span className="text-gray-600">Est. Price:</span> <span className="font-medium text-green-600">{supplier.estimated_price}</span></div>
                  <div><span className="text-gray-600">Verification:</span> <span className="font-medium text-blue-600">{supplier.verification_status}</span></div>
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

export default TikTokProfitCalculatorModal;
