import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X, Calculator, Save, DollarSign, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { saveProducts, getCategory, createCategory } from '@/api/savedProducts';

interface EnhancedProfitCalculatorModalProps {
  product: any;
  supplier: any;
  isOpen: boolean;
  onClose: () => void;
  calculatorType?: 'tiktok' | 'topchoice' | 'amazon';
}

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

interface EnhancedCalculation {
  // Product Information
  pi_sellingPrice: number;
  pi_totalRevenue: number;
  pi_quantity: number;

  // Product Sourcing Cost
  psc_manufacturingCost: number;
  psc_shippingCost: number;
  psc_productLogoCost: number;
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

  // Marketing, Advertisement and Ranking Cost
  marc_marketingCost: number;
  marc_attributionCost: number;
  marc_influencerCost: number;
  marc_miscCost: number;
  marc_marketingVATCost: number;
  marc_totalCost: number;
  marc_perUnitCost: number;

  // Taxes
  tax_region: string;
  tax_VAT: number;
  tax_GST: number;
  tax_salesTax: number;
  tax_miscCost: number;
  tax_perUnitCost: number;
  tax_totalCost: number;

  // Graphics Cost
  gc_imagingAndPhotographyCost: number;
  gc_videographyCost: number;
  gc_productPackingCost: number;
  gc_3dAnimationCost: number;
  gc_miscCost: number;
  gc_totalCost: number;
  gc_perUnitCost: number;

  // Product Feedback Cost
  pfc_vineProgramCost: number;
  pfc_miscCost: number;
  pfc_totalCost: number;
  pfc_perUnitCost: number;

  // Other Costs
  oc_competitorProductSamples: number;
  oc_preLaunchSamples: number;
  oc_employeesCost: number;
  oc_anyOtherCost: number;
  oc_totalCost: number;
  oc_perUnitCost: number;

  // Calculated Results
  grossProfit: number;
  grossProfitMargin: number;
  netProfitBeforeTaxes: number;
  netProfitBeforeTaxesMargin: number;
  netProfitAfterTaxes: number;
  netProfitAfterTaxesMargin: number;
}

const TAX_OPTIONS = [
  { country: "United States", code: "US", vat: 0, gst: 10, salesTax: 0, misc: 0 },
  { country: "Canada", code: "CA", vat: 0, gst: 5, salesTax: 13, misc: 0 },
  { country: "Mexico", code: "MX", vat: 16, gst: 0, salesTax: 0, misc: 0 },
  { country: "Brazil", code: "BR", vat: 5, gst: 5, salesTax: 0, misc: 3 },
  { country: "United Kingdom", code: "GB", vat: 20, gst: 0, salesTax: 0, misc: 0 },
  { country: "Germany", code: "DE", vat: 19, gst: 0, salesTax: 0, misc: 0 },
  { country: "Sweden", code: "SE", vat: 25, gst: 0, salesTax: 0, misc: 0 },
  { country: "Poland", code: "PL", vat: 23, gst: 0, salesTax: 0, misc: 0 },
  { country: "Turkey", code: "TR", vat: 18, gst: 0, salesTax: 0, misc: 0 },
  { country: "UAE", code: "AE", vat: 5, gst: 0, salesTax: 0, misc: 0 },
  { country: "India", code: "IN", vat: 0, gst: 18, salesTax: 0, misc: 0 },
  { country: "France", code: "FR", vat: 20, gst: 0, salesTax: 0, misc: 0 },
  { country: "Italy", code: "IT", vat: 22, gst: 0, salesTax: 0, misc: 0 },
  { country: "Spain", code: "ES", vat: 21, gst: 0, salesTax: 0, misc: 0 },
  { country: "Netherlands", code: "NL", vat: 21, gst: 0, salesTax: 0, misc: 0 },
  { country: "Saudi Arabia", code: "SA", vat: 15, gst: 0, salesTax: 0, misc: 0 },
  { country: "Japan", code: "JP", vat: 0, gst: 0, salesTax: 10, misc: 0 },
  { country: "Singapore", code: "SG", vat: 0, gst: 8, salesTax: 0, misc: 0 },
  { country: "Australia", code: "AU", vat: 0, gst: 10, salesTax: 0, misc: 0 },
];

const EnhancedProfitCalculatorModal: React.FC<EnhancedProfitCalculatorModalProps> = ({
  product,
  supplier,
  isOpen,
  onClose,
  calculatorType = 'tiktok',
}) => {
  const [calculation, setCalculation] = useState<EnhancedCalculation>({
    // Product Information
    pi_sellingPrice: 0,
    pi_totalRevenue: 0,
    pi_quantity: 100,

    // Product Sourcing Cost
    psc_manufacturingCost: 0,
    psc_shippingCost: 0,
    psc_productLogoCost: 0,
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

    // Marketing
    marc_marketingCost: 0,
    marc_attributionCost: 0,
    marc_influencerCost: 0,
    marc_miscCost: 0,
    marc_marketingVATCost: 0,
    marc_totalCost: 0,
    marc_perUnitCost: 0,

    // Taxes
    tax_region: "US",
    tax_VAT: 0,
    tax_GST: 10,
    tax_salesTax: 0,
    tax_miscCost: 0,
    tax_perUnitCost: 0,
    tax_totalCost: 0,

    // Graphics
    gc_imagingAndPhotographyCost: 0,
    gc_videographyCost: 0,
    gc_productPackingCost: 0,
    gc_3dAnimationCost: 0,
    gc_miscCost: 0,
    gc_totalCost: 0,
    gc_perUnitCost: 0,

    // Product Feedback
    pfc_vineProgramCost: 0,
    pfc_miscCost: 0,
    pfc_totalCost: 0,
    pfc_perUnitCost: 0,

    // Other Costs
    oc_competitorProductSamples: 0,
    oc_preLaunchSamples: 0,
    oc_employeesCost: 0,
    oc_anyOtherCost: 0,
    oc_totalCost: 0,
    oc_perUnitCost: 0,

    // Results
    grossProfit: 0,
    grossProfitMargin: 0,
    netProfitBeforeTaxes: 0,
    netProfitBeforeTaxesMargin: 0,
    netProfitAfterTaxes: 0,
    netProfitAfterTaxesMargin: 0,
  });

  const [expandedSections, setExpandedSections] = useState({
    productInfo: true,
    sourcing: true,
    fulfillment: true,
    marketing: false,
    taxes: false,
    graphics: false,
    feedback: false,
    other: false,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [saveTitle, setSaveTitle] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [showSaveSection, setShowSaveSection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get categories
  const { data: categoriesData } = useQuery({
    queryKey: ["getCategories"],
    queryFn: getCategory,
  });

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData.data);
    }
  }, [categoriesData]);

  // Initialize calculator with product and supplier data
  useEffect(() => {
    if (isOpen && product && supplier) {
      const isTikTokShop = (supplier as any)?.isTikTokShopProduct === true;
      const shopPrice = (supplier as any)?.tiktokShopPrice || product.price || 0;
      let supplierPrice = 0;

      if (isTikTokShop) {
        supplierPrice = shopPrice;
      } else {
        supplierPrice = parseFloat(supplier.estimated_price?.replace(/[^0-9.]/g, '') || '0');
      }

      const suggestedPrice = isTikTokShop ? shopPrice : supplierPrice * 2.5;
      let costPrice = supplierPrice;
      let estimatedShipping = supplier.moq > 500 ? 2.50 : 5.00;

      if (isTikTokShop) {
        costPrice = suggestedPrice * 0.45;
        estimatedShipping = 0;
      }

      const initialCalc: EnhancedCalculation = {
        ...calculation,
        pi_sellingPrice: suggestedPrice,
        pi_totalRevenue: suggestedPrice * 100,
        pi_quantity: 100,
        psc_manufacturingCost: costPrice,
        psc_shippingCost: estimatedShipping,
        psc_orderQuantity: 100,
        psc_perUnitCost: costPrice + estimatedShipping,
        psc_totalCost: (costPrice + estimatedShipping) * 100,
      };

      setCalculation(initialCalc);
    }
  }, [isOpen, product, supplier]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateCalculation = (field: keyof EnhancedCalculation, value: number | string) => {
    const newCalc = { ...calculation, [field]: typeof value === 'string' ? parseFloat(value) || 0 : value };

    // Recalculate dependent values
    if (field === 'pi_sellingPrice' || field === 'pi_quantity') {
      newCalc.pi_totalRevenue = newCalc.pi_sellingPrice * newCalc.pi_quantity;
    }

    if (['psc_manufacturingCost', 'psc_shippingCost', 'psc_productLogoCost', 'psc_miscCost'].includes(field)) {
      const costPerUnit = newCalc.psc_manufacturingCost + newCalc.psc_shippingCost + newCalc.psc_productLogoCost + newCalc.psc_miscCost;
      newCalc.psc_perUnitCost = costPerUnit;
      newCalc.psc_totalCost = costPerUnit * newCalc.psc_orderQuantity;
    }

    if (field === 'psc_orderQuantity') {
      newCalc.psc_totalCost = newCalc.psc_perUnitCost * newCalc.psc_orderQuantity;
    }

    // Fulfillment calculations
    if (['fm_referrfalFees', 'fm_fbaFulfillmentFees', 'fm_monthlyStorageFees', 'fm_longTermStorageFees', 'fm_inboundShippingCost', 'fm_shippingFees', 'fm_handlingCost', 'fm_storageCost', 'fm_miscCost'].includes(field)) {
      let sum = 0;
      if (newCalc.fm_model === "FBA") {
        sum = newCalc.fm_referrfalFees + newCalc.fm_fbaFulfillmentFees + newCalc.fm_monthlyStorageFees + newCalc.fm_longTermStorageFees + newCalc.fm_inboundShippingCost;
      } else {
        sum = newCalc.fm_referrfalFees + newCalc.fm_shippingFees + newCalc.fm_handlingCost + newCalc.fm_storageCost + newCalc.fm_miscCost;
      }
      newCalc.fm_perUnitCost = sum;
      newCalc.fm_totalCost = sum * newCalc.pi_quantity;
    }

    // Marketing calculations
    if (['marc_marketingCost', 'marc_attributionCost', 'marc_influencerCost', 'marc_miscCost', 'marc_marketingVATCost'].includes(field)) {
      const sum = newCalc.marc_marketingCost + newCalc.marc_attributionCost + newCalc.marc_influencerCost + newCalc.marc_miscCost + newCalc.marc_marketingVATCost;
      newCalc.marc_totalCost = sum;
      newCalc.marc_perUnitCost = newCalc.pi_quantity > 0 ? sum / newCalc.pi_quantity : 0;
    }

    // Tax calculations
    if (['tax_VAT', 'tax_GST', 'tax_salesTax', 'tax_miscCost'].includes(field)) {
      const sum = newCalc.tax_VAT + newCalc.tax_GST + newCalc.tax_salesTax + newCalc.tax_miscCost;
      newCalc.tax_totalCost = sum;
      newCalc.tax_perUnitCost = newCalc.pi_quantity > 0 ? sum / newCalc.pi_quantity : 0;
    }

    // Graphics calculations
    if (['gc_imagingAndPhotographyCost', 'gc_videographyCost', 'gc_productPackingCost', 'gc_3dAnimationCost', 'gc_miscCost'].includes(field)) {
      const sum = newCalc.gc_imagingAndPhotographyCost + newCalc.gc_videographyCost + newCalc.gc_productPackingCost + newCalc.gc_3dAnimationCost + newCalc.gc_miscCost;
      newCalc.gc_totalCost = sum;
      newCalc.gc_perUnitCost = newCalc.pi_quantity > 0 ? sum / newCalc.pi_quantity : 0;
    }

    // Product Feedback calculations
    if (['pfc_vineProgramCost', 'pfc_miscCost'].includes(field)) {
      const sum = newCalc.pfc_vineProgramCost + newCalc.pfc_miscCost;
      newCalc.pfc_totalCost = sum;
      newCalc.pfc_perUnitCost = newCalc.pi_quantity > 0 ? sum / newCalc.pi_quantity : 0;
    }

    // Other costs calculations
    if (['oc_competitorProductSamples', 'oc_preLaunchSamples', 'oc_employeesCost', 'oc_anyOtherCost'].includes(field)) {
      const sum = newCalc.oc_competitorProductSamples + newCalc.oc_preLaunchSamples + newCalc.oc_employeesCost + newCalc.oc_anyOtherCost;
      newCalc.oc_totalCost = sum;
      newCalc.oc_perUnitCost = newCalc.pi_quantity > 0 ? sum / newCalc.pi_quantity : 0;
    }

    // Calculate final profits
    const totalRevenue = newCalc.pi_totalRevenue;
    const totalSourcingCost = newCalc.psc_totalCost;
    const totalFulfillmentCost = newCalc.fm_totalCost;
    const totalMarketingCost = newCalc.marc_totalCost;
    const totalGraphicsCost = newCalc.gc_totalCost;
    const totalFeedbackCost = newCalc.pfc_totalCost;
    const totalOtherCost = newCalc.oc_totalCost;

    newCalc.grossProfit = totalRevenue - totalSourcingCost;
    newCalc.grossProfitMargin = totalRevenue > 0 ? (newCalc.grossProfit / totalRevenue) * 100 : 0;

    const totalCostsBeforeTax = totalSourcingCost + totalFulfillmentCost + totalMarketingCost + totalGraphicsCost + totalFeedbackCost + totalOtherCost;
    newCalc.netProfitBeforeTaxes = totalRevenue - totalCostsBeforeTax;
    newCalc.netProfitBeforeTaxesMargin = totalRevenue > 0 ? (newCalc.netProfitBeforeTaxes / totalRevenue) * 100 : 0;

    newCalc.netProfitAfterTaxes = newCalc.netProfitBeforeTaxes - newCalc.tax_totalCost;
    newCalc.netProfitAfterTaxesMargin = totalRevenue > 0 ? (newCalc.netProfitAfterTaxes / totalRevenue) * 100 : 0;

    setCalculation(newCalc);
  };

  const saveProductMutation = useMutation({
    mutationFn: saveProducts,
    onSuccess: () => {
      toast.success("Product Saved Successfully!");
      setIsSaving(false);
      setSaveTitle("");
      setSaveDescription("");
      setShowSaveSection(false);
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save product");
      setIsSaving(false);
    },
  });

  const handleSaveProduct = () => {
    if (!saveTitle.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    setIsSaving(true);
    const saveData = {
      name: saveTitle,
      description: saveDescription,
      category: selectedCategory,
      calculations: calculation,
      product: product,
      supplier: supplier,
      calculatorType: calculatorType,
    };

    saveProductMutation.mutate(saveData as any);
  };

  if (!isOpen) return null;

  const title = calculatorType === 'tiktok' ? 'TikTok Profit Calculator' : calculatorType === 'topchoice' ? 'TopChoice Plus Profit Calculator' : 'Amazon Profit Calculator';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600">Complete profit analysis with all cost categories</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Product Information Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('productInfo')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900">Product Information</h3>
              {expandedSections.productInfo ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.productInfo && (
              <div className="p-4 border-t border-gray-200 grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    value={calculation.pi_sellingPrice}
                    onChange={(e) => updateCalculation('pi_sellingPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={calculation.pi_quantity}
                    onChange={(e) => updateCalculation('pi_quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Revenue ($)</label>
                  <input
                    type="number"
                    value={calculation.pi_totalRevenue.toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sourcing Cost Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('sourcing')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900">Product Sourcing Cost</h3>
              {expandedSections.sourcing ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.sourcing && (
              <div className="p-4 border-t border-gray-200 grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.psc_manufacturingCost}
                    onChange={(e) => updateCalculation('psc_manufacturingCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.psc_shippingCost}
                    onChange={(e) => updateCalculation('psc_shippingCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo/Box Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.psc_productLogoCost}
                    onChange={(e) => updateCalculation('psc_productLogoCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Misc Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.psc_miscCost}
                    onChange={(e) => updateCalculation('psc_miscCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Quantity</label>
                  <input
                    type="number"
                    value={calculation.psc_orderQuantity}
                    onChange={(e) => updateCalculation('psc_orderQuantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Per Unit ($)</label>
                  <input
                    type="number"
                    value={calculation.psc_perUnitCost.toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.psc_totalCost.toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Fulfillment Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('fulfillment')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900">Fulfillment Model</h3>
              {expandedSections.fulfillment ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.fulfillment && (
              <div className="p-4 border-t border-gray-200 grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <select
                    value={calculation.fm_model}
                    onChange={(e) => updateCalculation('fm_model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="FBA">FBA</option>
                    <option value="FBM">FBM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referral Fees ($)</label>
                  <input
                    type="number"
                    value={calculation.fm_referrfalFees}
                    onChange={(e) => updateCalculation('fm_referrfalFees', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">FBA Fulfillment ($)</label>
                  <input
                    type="number"
                    value={calculation.fm_fbaFulfillmentFees}
                    onChange={(e) => updateCalculation('fm_fbaFulfillmentFees', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Storage ($)</label>
                  <input
                    type="number"
                    value={calculation.fm_monthlyStorageFees}
                    onChange={(e) => updateCalculation('fm_monthlyStorageFees', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Long Term Storage ($)</label>
                  <input
                    type="number"
                    value={calculation.fm_longTermStorageFees}
                    onChange={(e) => updateCalculation('fm_longTermStorageFees', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inbound Shipping ($)</label>
                  <input
                    type="number"
                    value={calculation.fm_inboundShippingCost}
                    onChange={(e) => updateCalculation('fm_inboundShippingCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Returns Rate (%)</label>
                  <input
                    type="number"
                    value={calculation.fm_returnsRate}
                    onChange={(e) => updateCalculation('fm_returnsRate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Per Unit ($)</label>
                  <input
                    type="number"
                    value={calculation.fm_perUnitCost.toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.fm_totalCost.toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Marketing Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('marketing')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900">Marketing & Advertising</h3>
              {expandedSections.marketing ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.marketing && (
              <div className="p-4 border-t border-gray-200 grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marketing Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.marc_marketingCost}
                    onChange={(e) => updateCalculation('marc_marketingCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attribution Links ($)</label>
                  <input
                    type="number"
                    value={calculation.marc_attributionCost}
                    onChange={(e) => updateCalculation('marc_attributionCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Influencer Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.marc_influencerCost}
                    onChange={(e) => updateCalculation('marc_influencerCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Misc Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.marc_miscCost}
                    onChange={(e) => updateCalculation('marc_miscCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marketing VAT ($)</label>
                  <input
                    type="number"
                    value={calculation.marc_marketingVATCost}
                    onChange={(e) => updateCalculation('marc_marketingVATCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Per Unit ($)</label>
                  <input
                    type="number"
                    value={calculation.marc_perUnitCost.toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.marc_totalCost.toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Taxes Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('taxes')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900">Taxes</h3>
              {expandedSections.taxes ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.taxes && (
              <div className="p-4 border-t border-gray-200 grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <select
                    value={calculation.tax_region}
                    onChange={(e) => updateCalculation('tax_region', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {TAX_OPTIONS.map(opt => (
                      <option key={opt.code} value={opt.code}>{opt.country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VAT (%)</label>
                  <input
                    type="number"
                    value={calculation.tax_VAT}
                    onChange={(e) => updateCalculation('tax_VAT', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST (%)</label>
                  <input
                    type="number"
                    value={calculation.tax_GST}
                    onChange={(e) => updateCalculation('tax_GST', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Tax (%)</label>
                  <input
                    type="number"
                    value={calculation.tax_salesTax}
                    onChange={(e) => updateCalculation('tax_salesTax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Misc Tax ($)</label>
                  <input
                    type="number"
                    value={calculation.tax_miscCost}
                    onChange={(e) => updateCalculation('tax_miscCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Per Unit ($)</label>
                  <input
                    type="number"
                    value={calculation.tax_perUnitCost.toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Tax ($)</label>
                  <input
                    type="number"
                    value={calculation.tax_totalCost.toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Graphics Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('graphics')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900">Graphics & Content</h3>
              {expandedSections.graphics ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.graphics && (
              <div className="p-4 border-t border-gray-200 grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photography ($)</label>
                  <input
                    type="number"
                    value={calculation.gc_imagingAndPhotographyCost}
                    onChange={(e) => updateCalculation('gc_imagingAndPhotographyCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Videography ($)</label>
                  <input
                    type="number"
                    value={calculation.gc_videographyCost}
                    onChange={(e) => updateCalculation('gc_videographyCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Packing ($)</label>
                  <input
                    type="number"
                    value={calculation.gc_productPackingCost}
                    onChange={(e) => updateCalculation('gc_productPackingCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">3D Animation ($)</label>
                  <input
                    type="number"
                    value={calculation.gc_3dAnimationCost}
                    onChange={(e) => updateCalculation('gc_3dAnimationCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Misc Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.gc_miscCost}
                    onChange={(e) => updateCalculation('gc_miscCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Per Unit ($)</label>
                  <input
                    type="number"
                    value={calculation.gc_perUnitCost.toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.gc_totalCost.toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Product Feedback Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('feedback')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900">Product Feedback & Reviews</h3>
              {expandedSections.feedback ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.feedback && (
              <div className="p-4 border-t border-gray-200 grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vine Program ($)</label>
                  <input
                    type="number"
                    value={calculation.pfc_vineProgramCost}
                    onChange={(e) => updateCalculation('pfc_vineProgramCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Misc Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.pfc_miscCost}
                    onChange={(e) => updateCalculation('pfc_miscCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Per Unit ($)</label>
                  <input
                    type="number"
                    value={calculation.pfc_perUnitCost.toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.pfc_totalCost.toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Other Costs Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('other')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900">Other Costs</h3>
              {expandedSections.other ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.other && (
              <div className="p-4 border-t border-gray-200 grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Competitor Samples ($)</label>
                  <input
                    type="number"
                    value={calculation.oc_competitorProductSamples}
                    onChange={(e) => updateCalculation('oc_competitorProductSamples', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pre-Launch Samples ($)</label>
                  <input
                    type="number"
                    value={calculation.oc_preLaunchSamples}
                    onChange={(e) => updateCalculation('oc_preLaunchSamples', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.oc_employeesCost}
                    onChange={(e) => updateCalculation('oc_employeesCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.oc_anyOtherCost}
                    onChange={(e) => updateCalculation('oc_anyOtherCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Per Unit ($)</label>
                  <input
                    type="number"
                    value={calculation.oc_perUnitCost.toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost ($)</label>
                  <input
                    type="number"
                    value={calculation.oc_totalCost.toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Profit Summary */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Gross Profit</p>
              <p className="text-2xl font-bold text-green-600">${calculation.grossProfit.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{calculation.grossProfitMargin.toFixed(2)}% margin</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Net Profit (Before Tax)</p>
              <p className="text-2xl font-bold text-blue-600">${calculation.netProfitBeforeTaxes.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{calculation.netProfitBeforeTaxesMargin.toFixed(2)}% margin</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Net Profit (After Tax)</p>
              <p className="text-2xl font-bold text-purple-600">${calculation.netProfitAfterTaxes.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{calculation.netProfitAfterTaxesMargin.toFixed(2)}% margin</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-orange-600">${calculation.pi_totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">From {calculation.pi_quantity} units</p>
            </div>
          </div>

          {/* Save Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            {!showSaveSection ? (
              <button
                onClick={() => setShowSaveSection(true)}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <Save className="w-5 h-5" />
                Save Calculation to Vault
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                    placeholder="Enter product name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSaveSection(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProduct}
                    disabled={isSaving || saveProductMutation.isPending}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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

export default EnhancedProfitCalculatorModal;

