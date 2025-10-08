import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X, Calculator, DollarSign, Package, Truck, TrendingUp, TrendingDown, Save, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { AmazonTrendingProduct } from '@/api/amazonTrends';
import { SupplierInfo } from '@/api/amazonExplorer';
import { saveProducts, getCategory, createCategory } from '@/api/savedProducts';

interface ProfitCalculatorModalProps {
  product: AmazonTrendingProduct;
  supplier: SupplierInfo;
  isOpen: boolean;
  onClose: () => void;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

interface ProfitCalculation {
  // Product Information (Product Revenue)
  pi_sellingPrice: number;           // Selling Price*
  pi_quantity: number;               // Product Quantity*
  pi_totalRevenue: number;           // Total Product Revenue*

  // Product Sourcing Cost
  psc_manufacturingCost: number;     // Product Manufacturing*
  psc_shippingCost: number;          // Shipping Cost*
  psc_miscCost: number;              // Other Sourcing Costs
  psc_orderQuantity: number;         // Order Quantity*
  psc_perUnitCost: number;           // Sourcing Cost/Unit
  psc_totalCost: number;             // Total Sourcing Cost

  // Fulfillment Cost
  fm_model: string;                  // Fulfillment Model* (FBA/FBM)
  fm_referrfalFees: number;          // Amazon Fees*
  fm_fbaFulfillmentFees: number;     // Fulfillment Cost*
  fm_monthlyStorageFees: number;     // Storage Cost*
  fm_longTermStorageFees: number;    // Inbounding Cost
  fm_inboundShippingCost: number;    // Other FBA Costs
  fm_returnsRate: number;            // Returns/Refund Rate (Sellable)%
  fm_shippingFees: number;           // FBM Shipping Fees
  fm_handlingCost: number;           // FBM Fulfillment Cost
  fm_storageCost: number;            // FBM Storage Cost
  fm_miscCost: number;               // FBM Other Costs
  fm_perUnitCost: number;            // Cost/Unit*
  fm_totalCost: number;              // Total Cost*

  // Calculated Results
  grossProfit: number;               // Gross Profit/Unit
  grossProfitMargin: number;         // Total Gross Profit
  netProfit: number;
  netProfitMargin: number;
}

const ProfitCalculatorModal: React.FC<ProfitCalculatorModalProps> = ({
  product,
  supplier,
  isOpen,
  onClose
}) => {
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
    fm_model: "FBA",
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

  // Save functionality state
  const [showSaveSection, setShowSaveSection] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategory,
    enabled: isOpen,
  });

  const categories: Category[] = categoriesData?.data || [];

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success('Category created successfully');
      setShowNewCategoryForm(false);
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
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save product');
      setIsSaving(false);
    },
  });

  // Initialize with product and supplier data
  useEffect(() => {
    if (isOpen && product && supplier) {
      const productPrice = parseFloat(product.product_price?.replace(/[^0-9.]/g, '') || '0');
      const supplierPrice = parseFloat(supplier.estimated_price?.replace(/[^0-9.]/g, '') || '0');

      // Estimate Amazon fees (referral fees - roughly 8-15% of selling price)
      const estimatedReferralRate = 0.10; // 10% average
      const referralFees = productPrice * estimatedReferralRate;

      // Estimate FBA fulfillment fees (roughly $3-5 per unit)
      const fulfillmentFees = 3.50;

      // Estimate storage fees (roughly $0.50-1.00 per unit per month)
      const storageFees = 0.75;

      // Estimate inbounding fees (roughly $0.30-0.50 per unit)
      const inboundingFees = 0.40;

      const initialCalc: ProfitCalculation = {
        // Product Information
        pi_sellingPrice: productPrice,
        pi_totalRevenue: productPrice * 100,
        pi_quantity: 100,

        // Product Sourcing Cost
        psc_manufacturingCost: supplierPrice,
        psc_shippingCost: 0,
        psc_miscCost: 0,
        psc_orderQuantity: 100,
        psc_perUnitCost: supplierPrice,
        psc_totalCost: supplierPrice * 100,

        // Fulfillment Model
        fm_model: "FBA",
        fm_referrfalFees: referralFees,
        fm_fbaFulfillmentFees: fulfillmentFees,
        fm_monthlyStorageFees: storageFees,
        fm_longTermStorageFees: inboundingFees,
        fm_inboundShippingCost: 0,
        fm_returnsRate: 0,
        fm_shippingFees: 0,
        fm_handlingCost: 0,
        fm_storageCost: 0,
        fm_miscCost: 0,
        fm_perUnitCost: referralFees + fulfillmentFees + storageFees + inboundingFees,
        fm_totalCost: (referralFees + fulfillmentFees + storageFees + inboundingFees) * 100,

        // Calculated Results
        grossProfit: 0,
        grossProfitMargin: 0,
        netProfit: 0,
        netProfitMargin: 0,
      };

      // Calculate profits (MarginMax Basic style)
      // Gross Profit/Unit = Selling Price - Sourcing Cost/Unit - Fulfillment Cost/Unit
      initialCalc.grossProfit = initialCalc.pi_sellingPrice - initialCalc.psc_perUnitCost - initialCalc.fm_perUnitCost;

      // Total Gross Profit = Gross Profit/Unit × Quantity
      initialCalc.grossProfitMargin = initialCalc.grossProfit * initialCalc.pi_quantity;

      // Net calculations (same as gross for this implementation)
      initialCalc.netProfit = initialCalc.grossProfit;
      initialCalc.netProfitMargin = initialCalc.grossProfitMargin;

      setCalculation(initialCalc);

      // Initialize save form
      setProductName(product.product_title || '');
      setProductDescription(`Amazon Trends Product - ASIN: ${product.asin} | Supplier: ${supplier.name}`);
      setSelectedCategory('');
      setShowSaveSection(false);
      setShowNewCategoryForm(false);
      setNewCategoryName('');
    }
  }, [isOpen, product, supplier]);

  // MarginMax Basic calculation functions
  const calculateTotalRevenue = (sellingPrice: number, quantity: number) => {
    const totalRevenue = sellingPrice * quantity;
    setCalculation(prev => ({ ...prev, pi_totalRevenue: totalRevenue }));
    return totalRevenue;
  };

  const calculateProductSourcingTotals = (
    manufacturingCost: number,
    shippingCost: number,
    miscCost: number,
    orderQuantity: number
  ) => {
    const costPerUnit = manufacturingCost + shippingCost + miscCost;
    const totalCost = costPerUnit * orderQuantity;

    setCalculation(prev => ({
      ...prev,
      psc_perUnitCost: costPerUnit,
      psc_totalCost: totalCost
    }));

    return { costPerUnit, totalCost };
  };

  // MarginMax Basic fulfillment calculation function
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
    // Gross Profit/Unit = Selling Price - Sourcing Cost/Unit - Fulfillment Cost/Unit
    newCalc.grossProfit = newCalc.pi_sellingPrice - newCalc.psc_perUnitCost - newCalc.fm_perUnitCost;

    // Total Gross Profit = Gross Profit/Unit × Quantity
    newCalc.grossProfitMargin = newCalc.grossProfit * newCalc.pi_quantity;

    // Net calculations (same as gross for this implementation)
    newCalc.netProfit = newCalc.grossProfit;
    newCalc.netProfitMargin = newCalc.grossProfitMargin;

    setCalculation(newCalc);
  };

  // Save functionality handlers
  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    createCategoryMutation.mutate({
      name: newCategoryName.trim(),
      description: `Category for Amazon Trends products`,
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

    // Prepare product data similar to Blueritt Explorer format
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

      // Amazon Trends specific data
      amazon_product: {
        asin: product.asin,
        title: product.product_title,
        price: product.product_price,
        image: product.product_photo,
        rating: product.product_star_rating,
        reviews: product.product_num_ratings,
        source: 'amazon_trends',
        saved_at: new Date().toISOString(),
      },

      // Supplier Information
      supplier_info: {
        name: supplier.name,
        location: supplier.location,
        price_per_unit: supplier.price_per_unit,
        estimated_price: supplier.estimated_price,
        minimum_order: supplier.minimum_order,
        contact_url: supplier.contact_url,
        ai_match_score: supplier.ai_match_score,
      },

      // Default values for required fields
      simple_profit_pro: false,
    };

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
                  <p className="text-lg font-bold text-pink-600 mb-2">{product.product_price}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>ASIN: {product.asin}</div>
                    <div>Rating: {product.product_star_rating}★</div>
                    <div>Reviews: {product.product_num_ratings}</div>
                    <div>Brand: {product.brand || 'N/A'}</div>
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
                  <div><span className="text-gray-600">MOQ:</span> <span className="font-medium">{(supplier.moq || 0).toLocaleString()}</span></div>
                  <div><span className="text-gray-600">Lead Time:</span> <span className="font-medium">{supplier.lead_time || 'N/A'}</span></div>
                  <div><span className="text-gray-600">Est. Price:</span> <span className="font-medium text-green-600">{supplier.estimated_price}</span></div>
                  <div><span className="text-gray-600">Verification:</span> <span className="font-medium text-blue-600">{supplier.verification_status}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Calculator Section - MarginMax Basic Style */}
          <div className="space-y-6">
            {/* Product Revenue Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Product Revenue
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.pi_sellingPrice}
                      onChange={(e) => updateCalculation('pi_sellingPrice', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Quantity*
                  </label>
                  <input
                    type="number"
                    value={calculation.pi_quantity}
                    onChange={(e) => updateCalculation('pi_quantity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Revenue/Unit*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.pi_sellingPrice}
                      disabled
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Product Revenue*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.pi_totalRevenue}
                      disabled
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Sourcing Cost Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Sourcing Cost
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Manufacturing*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.psc_manufacturingCost}
                      onChange={(e) => updateCalculation('psc_manufacturingCost', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Cost*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.psc_shippingCost}
                      onChange={(e) => updateCalculation('psc_shippingCost', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Sourcing Costs
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.psc_miscCost}
                      onChange={(e) => updateCalculation('psc_miscCost', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Quantity*
                  </label>
                  <input
                    type="number"
                    value={calculation.psc_orderQuantity}
                    onChange={(e) => updateCalculation('psc_orderQuantity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sourcing Cost/Unit
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.psc_perUnitCost}
                      disabled
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Sourcing Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.psc_totalCost}
                      disabled
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fulfillment Cost Section */}
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
                    <input
                      type="radio"
                      name="fm_model"
                      value="FBA"
                      checked={calculation.fm_model === "FBA"}
                      onChange={(e) => updateCalculation('fm_model', e.target.value)}
                      className="text-purple-600"
                    />
                    <label>FBA</label>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <input
                      type="radio"
                      name="fm_model"
                      value="FBM"
                      checked={calculation.fm_model === "FBM"}
                      onChange={(e) => updateCalculation('fm_model', e.target.value)}
                      className="text-purple-600"
                    />
                    <label>FBM</label>
                  </div>
                </div>
              </div>

              {/* Fulfillment Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amazon Fees*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.fm_referrfalFees}
                      onChange={(e) => updateCalculation('fm_referrfalFees', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* FBA and FBM dependent fields */}
                {calculation.fm_model === "FBA" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fulfillment Cost*
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={calculation.fm_fbaFulfillmentFees}
                          onChange={(e) => updateCalculation('fm_fbaFulfillmentFees', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Storage Cost*
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={calculation.fm_monthlyStorageFees}
                          onChange={(e) => updateCalculation('fm_monthlyStorageFees', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inbounding Cost
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={calculation.fm_longTermStorageFees}
                          onChange={(e) => updateCalculation('fm_longTermStorageFees', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other FBA Costs
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={calculation.fm_inboundShippingCost}
                          onChange={(e) => updateCalculation('fm_inboundShippingCost', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fulfillment Cost*
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={calculation.fm_handlingCost}
                          onChange={(e) => updateCalculation('fm_handlingCost', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Storage Cost*
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={calculation.fm_storageCost}
                          onChange={(e) => updateCalculation('fm_storageCost', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inbounding Cost
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={calculation.fm_shippingFees}
                          onChange={(e) => updateCalculation('fm_shippingFees', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other FBA Costs
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={calculation.fm_miscCost}
                          onChange={(e) => updateCalculation('fm_miscCost', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Returns/Refund Rate Slider */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Returns/Refund Rate (Sellable)%
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

              {/* Cost Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost/Unit*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.fm_perUnitCost}
                      disabled
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Cost*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.fm_totalCost}
                      disabled
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="0"
                    />
                  </div>
                </div>
            </div>
          </div>

            {/* Profit Analysis Results */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-green-600" />
                Profit Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600 mb-2">Gross Profit/Unit</div>
                  <div className={`text-2xl font-bold ${calculation.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${calculation.grossProfit.toFixed(2)}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600 mb-2">Total Gross Profit</div>
                  <div className={`text-2xl font-bold ${calculation.grossProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${calculation.grossProfitMargin.toFixed(2)}
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
  );
};

export default ProfitCalculatorModal;
