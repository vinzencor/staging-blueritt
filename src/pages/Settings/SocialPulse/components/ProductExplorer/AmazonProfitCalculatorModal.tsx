import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X, Calculator, Save, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import { saveProducts, getCategory, createCategory } from '@/api/savedProducts';
import { type AmazonProduct, type SupplierInfo } from '@/api/amazonExplorer';
import { useUserSubscriptionAndSearchQuota } from '@/hooks/useUserDetails';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
}

interface AmazonProfitCalculatorModalProps {
  product: AmazonProduct;
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

interface EnhancedProfitCalculation {
  pi_sellingPrice: number;
  pi_totalRevenue: number;
  pi_quantity: number;
  psc_manufacturingCost: number;
  psc_shippingCost: number;
  psc_productLogoCost: number;
  psc_miscCost: number;
  psc_orderQuantity: number;
  psc_perUnitCost: number;
  psc_totalCost: number;
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
  marc_marketingCost: number;
  marc_attributionCost: number;
  marc_influencerCost: number;
  marc_miscCost: number;
  marc_marketingVATCost: number;
  marc_totalCost: number;
  marc_perUnitCost: number;
  tax_region: string;
  tax_VAT: number;
  tax_GST: number;
  tax_salesTax: number;
  tax_miscCost: number;
  tax_perUnitCost: number;
  tax_totalCost: number;
  gc_imagingAndPhotographyCost: number;
  gc_videographyCost: number;
  gc_productPackingCost: number;
  gc_3dAnimationCost: number;
  gc_miscCost: number;
  gc_totalCost: number;
  gc_perUnitCost: number;
  pfc_vineProgramCost: number;
  pfc_miscCost: number;
  pfc_totalCost: number;
  pfc_perUnitCost: number;
  oc_competitorProductSamples: number;
  oc_preLaunchSamples: number;
  oc_employeesCost: number;
  oc_anyOtherCost: number;
  oc_totalCost: number;
  oc_perUnitCost: number;
  grossProfit: number;
  grossProfitMargin: number;
  netProfitBeforeTaxes: number;
  netProfitBeforeTaxesMargin: number;
  netProfitAfterTaxes: number;
  netProfitAfterTaxesMargin: number;
}

const TAX_OPTIONS = [
  {
    country: "United States",
    code: "US",
    vat: 0,
    gst: 10,
    salesTax: 0,
    misc: 0,
    salesTaxNote: "Sales Tax is variable by state (e.g., California, New York).",
  },
  {
    country: "Canada",
    code: "CA",
    vat: 0,
    gst: 5,
    salesTax: 13,
    misc: 0,
    gstNote: "GST is variable by province (e.g., GST 5% or HST in certain regions like Ontario: 13%).",
  },
  {
    country: "Mexico",
    code: "MX",
    vat: 16,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 16%.",
  },
  {
    country: "Brazil",
    code: "BR",
    vat: 5,
    gst: 5,
    salesTax: 0,
    misc: 3,
    vatNote: "Brazil has complex tax structures including ICMS, IPI, PIS, and COFINS depending on the state.",
  },
  {
    country: "United Kingdom",
    code: "GB",
    vat: 20,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 20%.",
  },
  {
    country: "Germany",
    code: "DE",
    vat: 19,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 19%.",
  },
  {
    country: "Sweden",
    code: "SE",
    vat: 25,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 25%.",
  },
  {
    country: "Poland",
    code: "PL",
    vat: 23,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 23%.",
  },
  {
    country: "Turkey",
    code: "TR",
    vat: 18,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 18%.",
  },
  {
    country: "UAE",
    code: "AE",
    vat: 5,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 5%.",
  },
  {
    country: "India",
    code: "IN",
    vat: 0,
    gst: 18,
    salesTax: 0,
    misc: 0,
    gstNote: "GST rates vary from 5% to 28%, depending on the product category.",
  },
  {
    country: "France",
    code: "FR",
    vat: 20,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 20%.",
  },
  {
    country: "Italy",
    code: "IT",
    vat: 22,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 22%.",
  },
  {
    country: "Spain",
    code: "ES",
    vat: 21,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 21%.",
  },
  {
    country: "Netherlands",
    code: "NL",
    vat: 21,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 21%.",
  },
  {
    country: "Saudi Arabia",
    code: "SA",
    vat: 15,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 15%.",
  },
  {
    country: "Japan",
    code: "JP",
    vat: 0,
    gst: 0,
    salesTax: 10,
    misc: 0,
    salesTaxNote: "Standard Consumption Tax of 10%.",
  },
  {
    country: "Singapore",
    code: "SG",
    vat: 0,
    gst: 8,
    salesTax: 0,
    misc: 0,
    gstNote: "Standard GST of 8%.",
  },
  {
    country: "Australia",
    code: "AU",
    vat: 0,
    gst: 10,
    salesTax: 0,
    misc: 0,
    gstNote: "Standard GST of 10%.",
  },
];

const AmazonProfitCalculatorModal: React.FC<AmazonProfitCalculatorModalProps> = ({
  product,
  supplier,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { quotaDetails } = useUserSubscriptionAndSearchQuota();

  // ✅ Check if user has access to Net Profit features (Advance & Premium only)
  const userPlan = quotaDetails?.packageName?.toLowerCase() || 'trial';
  const hasNetProfitAccess = userPlan === 'advance' || userPlan === 'premium';
  const isBasicOrTrial = userPlan === 'basic' || userPlan === 'trial';

  const [calculation, setCalculation] = useState<EnhancedProfitCalculation>({
    pi_sellingPrice: 0,
    pi_totalRevenue: 0,
    pi_quantity: 100,
    psc_manufacturingCost: 0,
    psc_shippingCost: 0,
    psc_productLogoCost: 0,
    psc_miscCost: 0,
    psc_orderQuantity: 100,
    psc_perUnitCost: 0,
    psc_totalCost: 0,
    fm_model: 'FBA',
    fm_referrfalFees: 0,
    fm_fbaFulfillmentFees: 0,
    fm_monthlyStorageFees: 0,
    fm_longTermStorageFees: 0,
    fm_inboundShippingCost: 0,
    fm_returnsRate: 5,
    fm_shippingFees: 0,
    fm_handlingCost: 0,
    fm_storageCost: 0,
    fm_miscCost: 0,
    fm_perUnitCost: 0,
    fm_totalCost: 0,
    marc_marketingCost: 0,
    marc_attributionCost: 0,
    marc_influencerCost: 0,
    marc_miscCost: 0,
    marc_marketingVATCost: 0,
    marc_totalCost: 0,
    marc_perUnitCost: 0,
    tax_region: 'US',
    tax_VAT: 0,
    tax_GST: 10,
    tax_salesTax: 0,
    tax_miscCost: 0,
    tax_perUnitCost: 0,
    tax_totalCost: 0,
    gc_imagingAndPhotographyCost: 0,
    gc_videographyCost: 0,
    gc_productPackingCost: 0,
    gc_3dAnimationCost: 0,
    gc_miscCost: 0,
    gc_totalCost: 0,
    gc_perUnitCost: 0,
    pfc_vineProgramCost: 0,
    pfc_miscCost: 0,
    pfc_totalCost: 0,
    pfc_perUnitCost: 0,
    oc_competitorProductSamples: 0,
    oc_preLaunchSamples: 0,
    oc_employeesCost: 0,
    oc_anyOtherCost: 0,
    oc_totalCost: 0,
    oc_perUnitCost: 0,
    grossProfit: 0,
    grossProfitMargin: 0,
    netProfitBeforeTaxes: 0,
    netProfitBeforeTaxesMargin: 0,
    netProfitAfterTaxes: 0,
    netProfitAfterTaxesMargin: 0,
  });

  const [expandedSections, setExpandedSections] = useState({
    product: true,
    sourcing: true,
    fulfillment: true,
    marketing: false,
    taxes: false,
    graphics: false,
    feedback: false,
    other: false,
  });

  const [quantityError, setQuantityError] = useState<string>('');

  const [saveDescription, setSaveDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveSection, setShowSaveSection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Initialize calculation with product data
  useEffect(() => {
    if (isOpen && product && supplier) {
      const productPrice = parseFloat(product.product_price?.replace(/[^0-9.]/g, '') || '0');
      const supplierPrice = parseFloat(supplier.estimated_price?.replace(/[^0-9.]/g, '') || '0');
      const quantity = 100;
      const shippingCost = 2.5;

      // Calculate initial values
      const totalRevenue = productPrice * quantity;
      const perUnitCost = supplierPrice + shippingCost;
      const totalSourcingCost = perUnitCost * quantity;

      // Estimate Amazon fees (15% referral fee + $3 FBA fee)
      const referralFee = productPrice * 0.15;
      const fbaFee = 3.0;
      const storageFee = 0.75;
      const totalFulfillmentPerUnit = referralFee + fbaFee + storageFee;
      const totalFulfillmentCost = totalFulfillmentPerUnit * quantity;

      // Calculate profits
      const grossProfit = totalRevenue - totalSourcingCost;
      const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
      const netProfitBeforeTaxes = totalRevenue - totalSourcingCost - totalFulfillmentCost;
      const netProfitBeforeTaxesMargin = totalRevenue > 0 ? (netProfitBeforeTaxes / totalRevenue) * 100 : 0;
      const netProfitAfterTaxes = netProfitBeforeTaxes; // No tax costs initially
      const netProfitAfterTaxesMargin = totalRevenue > 0 ? (netProfitAfterTaxes / totalRevenue) * 100 : 0;

      setCalculation({
        pi_sellingPrice: productPrice,
        pi_totalRevenue: totalRevenue,
        pi_quantity: quantity,
        psc_manufacturingCost: supplierPrice,
        psc_shippingCost: shippingCost,
        psc_productLogoCost: 0,
        psc_miscCost: 0,
        psc_orderQuantity: quantity,
        psc_perUnitCost: perUnitCost,
        psc_totalCost: totalSourcingCost,
        fm_model: 'FBA',
        fm_referrfalFees: referralFee,
        fm_fbaFulfillmentFees: fbaFee,
        fm_monthlyStorageFees: storageFee,
        fm_longTermStorageFees: 0,
        fm_inboundShippingCost: 0,
        fm_returnsRate: 5,
        fm_shippingFees: 0,
        fm_handlingCost: 0,
        fm_storageCost: 0,
        fm_miscCost: 0,
        fm_perUnitCost: totalFulfillmentPerUnit,
        fm_totalCost: totalFulfillmentCost,
        marc_marketingCost: 0,
        marc_attributionCost: 0,
        marc_influencerCost: 0,
        marc_miscCost: 0,
        marc_marketingVATCost: 0,
        marc_totalCost: 0,
        marc_perUnitCost: 0,
        tax_region: 'US',
        tax_VAT: 0,
        tax_GST: 10,
        tax_salesTax: 0,
        tax_miscCost: 0,
        tax_perUnitCost: 0,
        tax_totalCost: 0,
        gc_imagingAndPhotographyCost: 0,
        gc_videographyCost: 0,
        gc_productPackingCost: 0,
        gc_3dAnimationCost: 0,
        gc_miscCost: 0,
        gc_totalCost: 0,
        gc_perUnitCost: 0,
        pfc_vineProgramCost: 0,
        pfc_miscCost: 0,
        pfc_totalCost: 0,
        pfc_perUnitCost: 0,
        oc_competitorProductSamples: 0,
        oc_preLaunchSamples: 0,
        oc_employeesCost: 0,
        oc_anyOtherCost: 0,
        oc_totalCost: 0,
        oc_perUnitCost: 0,
        grossProfit,
        grossProfitMargin,
        netProfitBeforeTaxes,
        netProfitBeforeTaxesMargin,
        netProfitAfterTaxes,
        netProfitAfterTaxesMargin,
      });

      setSaveTitle(product.product_title || '');
      setSaveDescription(`Amazon Product - ASIN: ${product.asin} | Supplier: ${supplier.name}`);
    }
  }, [isOpen, product, supplier]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategory();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (data) => {
      toast.success('Category created successfully');
      setCategories(prev => [...prev, data.data]);
      setSelectedCategory(data.data.id);
      setNewCategoryName('');
      setShowNewCategoryForm(false);
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

  // Handle create category
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
    if (!saveTitle.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    if (!supplier) {
      toast.error('No supplier selected');
      return;
    }

    setIsSaving(true);

    // Prepare product data with MarginMax Basic field structure
    const productData = {
      name: saveTitle.trim(),
      description: saveDescription.trim(),
      category: selectedCategory,
      simple_profit_pro: true,

      // Add profit summary fields for Product Vault display
      // Note: ListingDetail expects gross_profit/net_profit to be percentages, not dollar amounts
      selling_price: parseFloat(calculation.pi_sellingPrice.toFixed(2)),
      quantity: parseInt(calculation.pi_quantity.toString(), 10),
      total_revenue: parseFloat(calculation.pi_totalRevenue.toFixed(2)),
      gross_profit: parseFloat(calculation.grossProfitMargin.toFixed(2)), // Percentage
      net_profit: parseFloat(calculation.netProfitAfterTaxesMargin.toFixed(2)), // Percentage
      product_gross_profit: parseFloat(calculation.grossProfit.toFixed(2)), // Dollar amount
      product_net_profit: parseFloat(calculation.netProfitAfterTaxes.toFixed(2)), // Dollar amount

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
          seller: (product as any).seller || 'Amazon',
          seller_id: product.asin || '',
          seller_link: '',
          seller_star_rating: product.product_star_rating || '0',
          seller_star_rating_info: product.product_num_ratings?.toString() || '0',
          currency: product.currency || 'USD',
          delivery_price: product.delivery || 'Standard Shipping',
          delivery_time: '2-3 days',
          ships_from: 'USA',
        },
      },

      // Supplier Information
      supplier_info: {
        name: supplier.name,
        location: supplier.location,
        moq: supplier.moq,
        lead_time: supplier.lead_time,
        estimated_price: supplier.estimated_price,
        verification_status: supplier.verification_status,
        ai_match_score: supplier.ai_match_score,
      },

      // Product Information (MarginMax Basic format)
      pi_sellingPrice: parseFloat(calculation.pi_sellingPrice.toFixed(2)),
      pi_totalRevenue: parseFloat(calculation.pi_totalRevenue.toFixed(2)),
      pi_quantity: parseInt(calculation.pi_quantity.toString(), 10),

      // Product Sourcing Cost (MarginMax Basic format)
      psc_manufacturingCost: parseFloat(calculation.psc_manufacturingCost.toFixed(2)),
      psc_shippingCost: parseFloat(calculation.psc_shippingCost.toFixed(2)),
      psc_miscCost: parseFloat(calculation.psc_miscCost.toFixed(2)),
      psc_orderQuantity: parseInt(calculation.psc_orderQuantity.toString(), 10),
      psc_perUnitCost: parseFloat(calculation.psc_perUnitCost.toFixed(2)),
      psc_totalCost: parseFloat(calculation.psc_totalCost.toFixed(2)),

      // Fulfillment Model (MarginMax Basic format)
      fm_model: calculation.fm_model,
      fm_referrfalFees: parseFloat(calculation.fm_referrfalFees.toFixed(2)),
      fm_fbaFulfillmentFees: parseFloat(calculation.fm_fbaFulfillmentFees.toFixed(2)),
      fm_monthlyStorageFees: parseFloat(calculation.fm_monthlyStorageFees.toFixed(2)),
      fm_longTermStorageFees: parseFloat(calculation.fm_longTermStorageFees.toFixed(2)),
      fm_inboundShippingCost: parseFloat(calculation.fm_inboundShippingCost.toFixed(2)),
      fm_returnsRate: parseFloat(calculation.fm_returnsRate.toFixed(2)),
      fm_shippingFees: parseFloat(calculation.fm_shippingFees.toFixed(2)),
      fm_handlingCost: parseFloat(calculation.fm_handlingCost.toFixed(2)),
      fm_storageCost: parseFloat(calculation.fm_storageCost.toFixed(2)),
      fm_miscCost: parseFloat(calculation.fm_miscCost.toFixed(2)),
      fm_perUnitCost: parseFloat(calculation.fm_perUnitCost.toFixed(2)),
      fm_totalCost: parseFloat(calculation.fm_totalCost.toFixed(2)),

      // Marketing, Advertisement and Ranking Cost
      marc_marketingCost: parseFloat(calculation.marc_marketingCost.toFixed(2)),
      marc_attributionCost: parseFloat(calculation.marc_attributionCost.toFixed(2)),
      marc_influencerCost: parseFloat(calculation.marc_influencerCost.toFixed(2)),
      marc_miscCost: parseFloat(calculation.marc_miscCost.toFixed(2)),
      marc_marketingVATCost: parseFloat(calculation.marc_marketingVATCost.toFixed(2)),
      marc_totalCost: parseFloat(calculation.marc_totalCost.toFixed(2)),
      marc_perUnitCost: parseFloat(calculation.marc_perUnitCost.toFixed(2)),

      // Taxes
      tax_region: calculation.tax_region,
      tax_VAT: parseFloat(calculation.tax_VAT.toFixed(2)),
      tax_GST: parseFloat(calculation.tax_GST.toFixed(2)),
      tax_salesTax: parseFloat(calculation.tax_salesTax.toFixed(2)),
      tax_miscCost: parseFloat(calculation.tax_miscCost.toFixed(2)),
      tax_perUnitCost: parseFloat(calculation.tax_perUnitCost.toFixed(2)),
      tax_totalCost: parseFloat(calculation.tax_totalCost.toFixed(2)),

      // Graphics Cost
      gc_imagingAndPhotographyCost: parseFloat(calculation.gc_imagingAndPhotographyCost.toFixed(2)),
      gc_videographyCost: parseFloat(calculation.gc_videographyCost.toFixed(2)),
      gc_productPackingCost: parseFloat(calculation.gc_productPackingCost.toFixed(2)),
      gc_3dAnimationCost: parseFloat(calculation.gc_3dAnimationCost.toFixed(2)),
      gc_miscCost: parseFloat(calculation.gc_miscCost.toFixed(2)),
      gc_totalCost: parseFloat(calculation.gc_totalCost.toFixed(2)),
      gc_perUnitCost: parseFloat(calculation.gc_perUnitCost.toFixed(2)),

      // Product Feedback Cost
      pfc_vineProgramCost: parseFloat(calculation.pfc_vineProgramCost.toFixed(2)),
      pfc_miscCost: parseFloat(calculation.pfc_miscCost.toFixed(2)),
      pfc_totalCost: parseFloat(calculation.pfc_totalCost.toFixed(2)),
      pfc_perUnitCost: parseFloat(calculation.pfc_perUnitCost.toFixed(2)),

      // Other Costs
      oc_competitorProductSamples: parseFloat(calculation.oc_competitorProductSamples.toFixed(2)),
      oc_preLaunchSamples: parseFloat(calculation.oc_preLaunchSamples.toFixed(2)),
      oc_employeesCost: parseFloat(calculation.oc_employeesCost.toFixed(2)),
      oc_anyOtherCost: parseFloat(calculation.oc_anyOtherCost.toFixed(2)),
      oc_totalCost: parseFloat(calculation.oc_totalCost.toFixed(2)),
      oc_perUnitCost: parseFloat(calculation.oc_perUnitCost.toFixed(2)),

      // Profit Results
      grossProfit: parseFloat(calculation.grossProfit.toFixed(2)),
      grossProfitMargin: parseFloat(calculation.grossProfitMargin.toFixed(2)),
      netProfitBeforeTaxes: parseFloat(calculation.netProfitBeforeTaxes.toFixed(2)),
      netProfitBeforeTaxesMargin: parseFloat(calculation.netProfitBeforeTaxesMargin.toFixed(2)),
      netProfitAfterTaxes: parseFloat(calculation.netProfitAfterTaxes.toFixed(2)),
      netProfitAfterTaxesMargin: parseFloat(calculation.netProfitAfterTaxesMargin.toFixed(2)),
    };

    console.log('🔥 CATEGORY:', selectedCategory);
    console.log('🔥 PRODUCT DATA:', productData);
    saveProductMutation.mutate(productData);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    // ✅ Check if section is locked for Basic/Trial users
    const netProfitSections = ['marketing', 'taxes', 'graphics', 'feedback', 'other'];
    const isLockedSection = netProfitSections.includes(section) && isBasicOrTrial;

    if (isLockedSection) {
      // Show upgrade message
      toast.info(
        <div>
          <p className="font-semibold">🔒 Net Profit Features Locked</p>
          <p className="text-sm mt-1">Upgrade to Advance or Premium plan to access Net Profit calculations including Marketing, Taxes, Graphics, Feedback, and Other Costs.</p>
          <button
            onClick={() => navigate('/settings/subscription-plans')}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Upgrade Plan
          </button>
        </div>,
        {
          autoClose: 5000,
          closeButton: true,
        }
      );
      return;
    }

    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const roundOffToTwoDecimals = (num: number) => {
    return Math.round(num * 100) / 100;
  };

  const getTaxNotes = () => {
    const taxRegion = TAX_OPTIONS.find(
      (opt) => opt.code === calculation.tax_region
    );

    if (!taxRegion) return null;

    return (
      <div className="mt-2 space-y-1">
        {taxRegion?.vatNote && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{taxRegion?.vatNote}</p>
        )}
        {taxRegion?.gstNote && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{taxRegion?.gstNote}</p>
        )}
        {taxRegion?.salesTaxNote && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{taxRegion?.salesTaxNote}</p>
        )}
      </div>
    );
  };

  const updateCalculation = (field: keyof EnhancedProfitCalculation, value: number | string) => {
    const newCalc = { ...calculation, [field]: typeof value === 'string' ? parseFloat(value) || 0 : value };

    // Validate quantity vs order quantity
    if (field === 'pi_quantity' || field === 'psc_orderQuantity') {
      const quantity = parseFloat(String(newCalc.pi_quantity)) || 0;
      const orderQuantity = parseFloat(String(newCalc.psc_orderQuantity)) || 0;

      if (quantity > 0 && orderQuantity > 0 && quantity > orderQuantity) {
        setQuantityError('Quantity cannot be greater than Order Quantity');
      } else {
        setQuantityError('');
      }
    }

    // Product Information calculations - EXACT MATCH TO MARGINMAX
    if (field === 'pi_sellingPrice' || field === 'pi_quantity') {
      const ans = Number(newCalc.pi_sellingPrice) * (newCalc.pi_quantity ? Number(newCalc.pi_quantity) : 0);
      newCalc.pi_totalRevenue = ans ? roundOffToTwoDecimals(ans) : 0;
    }

    // Product Sourcing Cost calculations - EXACT MATCH TO MARGINMAX
    if (['psc_manufacturingCost', 'psc_shippingCost', 'psc_productLogoCost', 'psc_miscCost', 'psc_orderQuantity'].includes(field as string)) {
      const manufacturingCost = parseFloat(String(newCalc.psc_manufacturingCost)) || 0;
      const shippingCost = parseFloat(String(newCalc.psc_shippingCost)) || 0;
      const productLogoCost = parseFloat(String(newCalc.psc_productLogoCost)) || 0;
      const miscCost = parseFloat(String(newCalc.psc_miscCost)) || 0;
      const orderQuantity = parseFloat(String(newCalc.psc_orderQuantity)) || 0;

      const costPerUnit = manufacturingCost + shippingCost + productLogoCost + miscCost;
      const totalCost = costPerUnit * orderQuantity;

      newCalc.psc_perUnitCost = roundOffToTwoDecimals(costPerUnit);
      newCalc.psc_totalCost = roundOffToTwoDecimals(totalCost);
    }

    // Fulfillment Model calculations - EXACT MATCH TO MARGINMAX
    if (['fm_model', 'fm_referrfalFees', 'fm_fbaFulfillmentFees', 'fm_monthlyStorageFees', 'fm_longTermStorageFees', 'fm_inboundShippingCost', 'fm_shippingFees', 'fm_handlingCost', 'fm_storageCost', 'fm_miscCost', 'fm_returnsRate', 'pi_quantity'].includes(field as string)) {
      const referrfalFees = parseFloat(String(newCalc.fm_referrfalFees)) || 0;
      const fbaFulfillmentFees = parseFloat(String(newCalc.fm_fbaFulfillmentFees)) || 0;
      const monthlyStorageFees = parseFloat(String(newCalc.fm_monthlyStorageFees)) || 0;
      const longTermStorageFees = parseFloat(String(newCalc.fm_longTermStorageFees)) || 0;
      const inboundShippingCost = parseFloat(String(newCalc.fm_inboundShippingCost)) || 0;
      const shippingFees = parseFloat(String(newCalc.fm_shippingFees)) || 0;
      const handlingCost = parseFloat(String(newCalc.fm_handlingCost)) || 0;
      const storageCost = parseFloat(String(newCalc.fm_storageCost)) || 0;
      const miscCost = parseFloat(String(newCalc.fm_miscCost)) || 0;
      const returnsRate = parseFloat(String(newCalc.fm_returnsRate)) || 0;
      const quantity = parseFloat(String(newCalc.pi_quantity)) || 0;

      let sum = 0;
      if (newCalc.fm_model === "FBA") {
        sum = referrfalFees + fbaFulfillmentFees + monthlyStorageFees + longTermStorageFees + inboundShippingCost + miscCost;
      } else {
        sum = referrfalFees + shippingFees + handlingCost + storageCost + miscCost;
      }

      const refundLoss = ((quantity || 0) * (returnsRate / 100) * (sum - referrfalFees)) / (quantity || 1);
      const perUnitCost = sum + refundLoss;
      const totalCost = perUnitCost * quantity;

      newCalc.fm_perUnitCost = roundOffToTwoDecimals(perUnitCost);
      newCalc.fm_totalCost = roundOffToTwoDecimals(totalCost);
    }

    // Marketing calculations - EXACT MATCH TO MARGINMAX
    if (['marc_marketingCost', 'marc_attributionCost', 'marc_influencerCost', 'marc_miscCost', 'marc_marketingVATCost', 'pi_quantity'].includes(field as string)) {
      const marketingCost = parseFloat(String(newCalc.marc_marketingCost)) || 0;
      const attributionCost = parseFloat(String(newCalc.marc_attributionCost)) || 0;
      const influencerCost = parseFloat(String(newCalc.marc_influencerCost)) || 0;
      const miscCost = parseFloat(String(newCalc.marc_miscCost)) || 0;
      const marketingVATCost = parseFloat(String(newCalc.marc_marketingVATCost)) || 0;
      const quantity = parseFloat(String(newCalc.pi_quantity)) || 0;

      const totalCost = marketingCost + attributionCost + influencerCost + miscCost + marketingVATCost;
      const perUnitCost = totalCost / (quantity || 1);

      newCalc.marc_totalCost = roundOffToTwoDecimals(totalCost);
      newCalc.marc_perUnitCost = roundOffToTwoDecimals(perUnitCost);
    }

    // Tax calculations - EXACT MATCH TO MARGINMAX
    if (['tax_region', 'tax_VAT', 'tax_GST', 'tax_salesTax', 'tax_miscCost', 'pi_sellingPrice', 'pi_quantity'].includes(field as string)) {
      if (field === 'tax_region') {
        const selectedTax = TAX_OPTIONS.find(t => t.code === value);
        if (selectedTax) {
          newCalc.tax_VAT = selectedTax.vat;
          newCalc.tax_GST = selectedTax.gst;
          newCalc.tax_salesTax = selectedTax.salesTax;
          newCalc.tax_miscCost = selectedTax.misc || 0;
        }
      }

      const vat = parseFloat(String(newCalc.tax_VAT)) || 0;
      const gst = parseFloat(String(newCalc.tax_GST)) || 0;
      const salesTax = parseFloat(String(newCalc.tax_salesTax)) || 0;
      const miscCost = parseFloat(String(newCalc.tax_miscCost)) || 0;
      const sellingPrice = parseFloat(String(newCalc.pi_sellingPrice)) || 0;
      const quantity = parseFloat(String(newCalc.pi_quantity)) || 0;

      const perUnitTotal = (vat / 100) * sellingPrice + (gst / 100) * sellingPrice + (salesTax / 100) * sellingPrice;
      const taxForQty = perUnitTotal * quantity + miscCost;

      newCalc.tax_perUnitCost = roundOffToTwoDecimals(perUnitTotal);
      newCalc.tax_totalCost = roundOffToTwoDecimals(taxForQty);
    }

    // Graphics calculations - EXACT MATCH TO MARGINMAX
    if (['gc_imagingAndPhotographyCost', 'gc_videographyCost', 'gc_productPackingCost', 'gc_3dAnimationCost', 'gc_miscCost', 'pi_quantity'].includes(field as string)) {
      const imagingAndPhotographyCost = parseFloat(String(newCalc.gc_imagingAndPhotographyCost)) || 0;
      const videographyCost = parseFloat(String(newCalc.gc_videographyCost)) || 0;
      const productPackingCost = parseFloat(String(newCalc.gc_productPackingCost)) || 0;
      const animationCost = parseFloat(String(newCalc.gc_3dAnimationCost)) || 0;
      const miscCost = parseFloat(String(newCalc.gc_miscCost)) || 0;
      const quantity = parseFloat(String(newCalc.pi_quantity)) || 0;

      const totalGraphicsCost = imagingAndPhotographyCost + videographyCost + productPackingCost + animationCost + miscCost;
      const gc_perUnitCost = totalGraphicsCost / (quantity || 1);

      newCalc.gc_totalCost = roundOffToTwoDecimals(totalGraphicsCost);
      newCalc.gc_perUnitCost = roundOffToTwoDecimals(gc_perUnitCost);
    }

    // Feedback calculations - EXACT MATCH TO MARGINMAX
    if (['pfc_vineProgramCost', 'pfc_miscCost', 'pi_quantity'].includes(field as string)) {
      const vineProgramCost = parseFloat(String(newCalc.pfc_vineProgramCost)) || 0;
      const miscCost = parseFloat(String(newCalc.pfc_miscCost)) || 0;
      const quantity = parseFloat(String(newCalc.pi_quantity)) || 0;

      const totalCost = vineProgramCost + miscCost;
      const perUnitCost = totalCost / (quantity || 1);

      newCalc.pfc_totalCost = roundOffToTwoDecimals(totalCost);
      newCalc.pfc_perUnitCost = roundOffToTwoDecimals(perUnitCost);
    }

    // Other costs calculations - EXACT MATCH TO MARGINMAX
    if (['oc_competitorProductSamples', 'oc_preLaunchSamples', 'oc_employeesCost', 'oc_anyOtherCost', 'pi_quantity'].includes(field as string)) {
      const preLaunchSamples = parseFloat(String(newCalc.oc_preLaunchSamples)) || 0;
      const competitorProductSamples = parseFloat(String(newCalc.oc_competitorProductSamples)) || 0;
      const employeesCost = parseFloat(String(newCalc.oc_employeesCost)) || 0;
      const anyOtherCost = parseFloat(String(newCalc.oc_anyOtherCost)) || 0;
      const quantity = parseFloat(String(newCalc.pi_quantity)) || 0;

      const totalCost = competitorProductSamples + employeesCost + anyOtherCost + preLaunchSamples;
      const perUnitCost = totalCost / (quantity || 1);

      newCalc.oc_totalCost = roundOffToTwoDecimals(totalCost);
      newCalc.oc_perUnitCost = roundOffToTwoDecimals(perUnitCost);
    }

    // Final profit calculations - EXACT MATCH TO MARGINMAX
    const totalRev = newCalc.pi_totalRevenue;
    let grossProfitForQty = 0;
    let grossProfitPerUnit = 0;
    let netProfitBeforeTaxesPerUnit = 0;
    let netProfitBeforeTaxesForQty = 0;
    let netProfitAfterTaxesPerUnit = 0;
    let netProfitAfterTaxesForQty = 0;

    if (newCalc.psc_totalCost && newCalc.psc_orderQuantity && newCalc.pi_quantity) {
      grossProfitForQty = totalRev - newCalc.psc_totalCost - newCalc.fm_totalCost;
      grossProfitPerUnit = grossProfitForQty / newCalc.pi_quantity;

      netProfitBeforeTaxesPerUnit =
        grossProfitPerUnit -
        newCalc.marc_totalCost / newCalc.psc_orderQuantity -
        newCalc.gc_totalCost / newCalc.psc_orderQuantity -
        newCalc.pfc_totalCost / newCalc.psc_orderQuantity -
        newCalc.oc_totalCost / newCalc.psc_orderQuantity;

      netProfitBeforeTaxesForQty =
        grossProfitForQty -
        newCalc.marc_totalCost -
        newCalc.gc_totalCost -
        newCalc.pfc_totalCost -
        newCalc.oc_totalCost;
    } else if (newCalc.psc_totalCost === 0 && newCalc.psc_orderQuantity === 0 && newCalc.pi_quantity === 0) {
      grossProfitForQty = 0;
    } else {
      grossProfitForQty = totalRev - newCalc.psc_totalCost - newCalc.fm_totalCost;
    }

    if (newCalc.tax_totalCost >= 0) {
      netProfitAfterTaxesForQty = netProfitBeforeTaxesForQty - newCalc.tax_totalCost;
      if (newCalc.psc_orderQuantity > 0) {
        netProfitAfterTaxesPerUnit = netProfitAfterTaxesForQty / newCalc.psc_orderQuantity;
      } else {
        netProfitAfterTaxesPerUnit = 0;
        netProfitAfterTaxesForQty = 0;
      }
    } else {
      netProfitAfterTaxesForQty = 0;
      netProfitAfterTaxesPerUnit = 0;
    }

    newCalc.grossProfit = roundOffToTwoDecimals(grossProfitForQty);
    newCalc.grossProfitMargin = totalRev > 0 ? roundOffToTwoDecimals((grossProfitForQty / totalRev) * 100) : 0;
    newCalc.netProfitBeforeTaxes = roundOffToTwoDecimals(netProfitBeforeTaxesForQty);
    newCalc.netProfitBeforeTaxesMargin = totalRev > 0 ? roundOffToTwoDecimals((netProfitBeforeTaxesForQty / totalRev) * 100) : 0;
    newCalc.netProfitAfterTaxes = roundOffToTwoDecimals(netProfitAfterTaxesForQty);
    newCalc.netProfitAfterTaxesMargin = totalRev > 0 ? roundOffToTwoDecimals((netProfitAfterTaxesForQty / totalRev) * 100) : 0;

    setCalculation(newCalc);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">BlueRitt MarginMax</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enhanced calculator with 8 cost categories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profit Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
              <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">Total Revenue</p>
              <p className="text-lg font-bold text-orange-900 dark:text-orange-100">${calculation.pi_totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Gross Profit</p>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">${calculation.grossProfit.toFixed(2)}</p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">{calculation.grossProfitMargin.toFixed(1)}%</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Net Profit (Before Tax)</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">${calculation.netProfitBeforeTaxes.toFixed(2)}</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{calculation.netProfitBeforeTaxesMargin.toFixed(1)}%</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Net Profit (After Tax)</p>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">${calculation.netProfitAfterTaxes.toFixed(2)}</p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">{calculation.netProfitAfterTaxesMargin.toFixed(1)}%</p>
            </div>
          </div>

          {/* ✅ GROSS PROFIT SECTION HEADING */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 rounded-lg p-4 shadow-md">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Calculator className="w-6 h-6" />
              Gross Profit Section
            </h2>
            <p className="text-green-100 mt-1 text-sm">
              Available in all subscriptions • Includes: Product Revenue + Product Sourcing Cost + Fulfillment Cost
            </p>
          </div>

          {/* Product Revenue Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
            <button
              onClick={() => toggleSection('product')}
              className="w-full flex items-center justify-between font-semibold text-green-900 dark:text-green-100 hover:text-green-700 dark:hover:text-green-300"
            >
              <span className="flex items-center gap-2">
                {expandedSections.product ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                Product Revenue
              </span>
            </button>
            {expandedSections.product && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selling Price*</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.pi_sellingPrice.toFixed(2)}
                      onChange={(e) => updateCalculation('pi_sellingPrice', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Quantity*</label>
                    <input
                      type="number"
                      value={calculation.pi_quantity}
                      onChange={(e) => updateCalculation('pi_quantity', parseInt(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${quantityError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      placeholder="0"
                    />
                    {quantityError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{quantityError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Revenue/Unit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.pi_sellingPrice.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Product Revenue</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.pi_totalRevenue.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Sourcing Cost Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
            <button
              onClick={() => toggleSection('sourcing')}
              className="w-full flex items-center justify-between font-semibold text-blue-900 dark:text-blue-100 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <span className="flex items-center gap-2">
                {expandedSections.sourcing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                Product Sourcing Cost
              </span>
            </button>
            {expandedSections.sourcing && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Manufacturing*</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.psc_manufacturingCost.toFixed(2)}
                      onChange={(e) => updateCalculation('psc_manufacturingCost', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shipping Cost*</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.psc_shippingCost.toFixed(2)}
                      onChange={(e) => updateCalculation('psc_shippingCost', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Other Sourcing Costs</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.psc_miscCost.toFixed(2)}
                      onChange={(e) => updateCalculation('psc_miscCost', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Quantity*</label>
                    <input
                      type="number"
                      value={calculation.psc_orderQuantity}
                      onChange={(e) => updateCalculation('psc_orderQuantity', parseInt(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sourcing Cost/Unit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.psc_perUnitCost.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Sourcing Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.psc_totalCost.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fulfillment Cost Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
            <button
              onClick={() => toggleSection('fulfillment')}
              className="w-full flex items-center justify-between font-semibold text-purple-900 dark:text-purple-100 hover:text-purple-700 dark:hover:text-purple-300"
            >
              <span className="flex items-center gap-2">
                {expandedSections.fulfillment ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                Fulfillment Cost
              </span>
            </button>
            {expandedSections.fulfillment && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fulfillment Model*</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="fm_model"
                        value="FBA"
                        checked={calculation.fm_model === "FBA"}
                        onChange={(e) => updateCalculation('fm_model', e.target.value)}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-gray-900 dark:text-white font-medium">FBA</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="fm_model"
                        value="FBM"
                        checked={calculation.fm_model === "FBM"}
                        onChange={(e) => updateCalculation('fm_model', e.target.value)}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-gray-900 dark:text-white font-medium">FBM</span>
                    </label>
                  </div>
                </div>

                {calculation.fm_model === "FBA" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amazon Fees*</label>
                      <input
                        type="number"
                        step="0.01"
                        value={calculation.fm_referrfalFees.toFixed(2)}
                        onChange={(e) => updateCalculation('fm_referrfalFees', parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="$ 0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fulfillment Cost*</label>
                      <input
                        type="number"
                        step="0.01"
                        value={calculation.fm_fbaFulfillmentFees.toFixed(2)}
                        onChange={(e) => updateCalculation('fm_fbaFulfillmentFees', parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="$ 0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Storage Cost*</label>
                      <input
                        type="number"
                        step="0.01"
                        value={calculation.fm_monthlyStorageFees.toFixed(2)}
                        onChange={(e) => updateCalculation('fm_monthlyStorageFees', parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="$ 0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Inbounding Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        value={calculation.fm_inboundShippingCost.toFixed(2)}
                        onChange={(e) => updateCalculation('fm_inboundShippingCost', parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="$ 0"
                      />
                    </div>
                  </div>
                )}

                {calculation.fm_model === "FBM" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amazon Fees*</label>
                      <input
                        type="number"
                        step="0.01"
                        value={calculation.fm_referrfalFees.toFixed(2)}
                        onChange={(e) => updateCalculation('fm_referrfalFees', parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="$ 0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shipping Fees*</label>
                      <input
                        type="number"
                        step="0.01"
                        value={calculation.fm_shippingFees.toFixed(2)}
                        onChange={(e) => updateCalculation('fm_shippingFees', parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="$ 0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Handling Cost*</label>
                      <input
                        type="number"
                        step="0.01"
                        value={calculation.fm_handlingCost.toFixed(2)}
                        onChange={(e) => updateCalculation('fm_handlingCost', parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="$ 0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Storage Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        value={calculation.fm_storageCost.toFixed(2)}
                        onChange={(e) => updateCalculation('fm_storageCost', parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="$ 0"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Other FBA Costs</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.fm_miscCost.toFixed(2)}
                      onChange={(e) => updateCalculation('fm_miscCost', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Returns/Refund fee (Refillable)%</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.fm_returnsRate.toFixed(2)}
                      onChange={(e) => updateCalculation('fm_returnsRate', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cost/Unit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.fm_perUnitCost.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Cost*</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.fm_totalCost.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ NET PROFIT SECTION HEADING */}
          <div className={`rounded-lg p-4 shadow-md ${isBasicOrTrial ? 'bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700' : 'bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700'}`}>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              {isBasicOrTrial ? <Lock className="w-6 h-6" /> : <Calculator className="w-6 h-6" />}
              Net Profit Section
              {isBasicOrTrial && <span className="ml-auto text-sm bg-white/20 px-3 py-1 rounded-full">🔒 Locked</span>}
            </h2>
            <p className="text-white/90 mt-1 text-sm">
              {isBasicOrTrial
                ? 'Available in Advance & Premium only • Upgrade to access Marketing & Ads, Graphics Design, Reviewer Program, Additional Costs, and Taxes'
                : 'Available in Advance & Premium • Includes: All Gross Profit + Marketing & Ads + Graphics Design + Reviewer Program + Additional Costs + Taxes'}
            </p>
            {isBasicOrTrial && (
              <button
                onClick={() => navigate('/settings/subscription-plans')}
                className="mt-3 px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Upgrade to Advance or Premium
              </button>
            )}
          </div>

          {/* Marketing Cost Section */}
          <div className={`rounded-lg p-4 ${isBasicOrTrial ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 opacity-60' : 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'}`}>
            <button
              onClick={() => toggleSection('marketing')}
              className={`w-full flex items-center justify-between font-semibold ${isBasicOrTrial ? 'text-gray-500 cursor-not-allowed' : 'text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300'}`}
              disabled={isBasicOrTrial}
            >
              <span className="flex items-center gap-2">
                {isBasicOrTrial && <Lock className="w-4 h-4" />}
                {expandedSections.marketing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                Marketing Cost
                {isBasicOrTrial && <span className="ml-2 text-xs bg-gray-300 dark:bg-gray-600 px-2 py-0.5 rounded-full">Locked</span>}
              </span>
            </button>
            {expandedSections.marketing && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pay-per-Click(PPC)*</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.marc_marketingCost.toFixed(2)}
                      onChange={(e) => updateCalculation('marc_marketingCost', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attribution Links</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.marc_attributionCost.toFixed(2)}
                      onChange={(e) => updateCalculation('marc_attributionCost', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Promotion/Other Costs</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.marc_influencerCost.toFixed(2)}
                      onChange={(e) => updateCalculation('marc_influencerCost', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PPC VAT(if Applicable)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.marc_marketingVATCost.toFixed(2)}
                      onChange={(e) => updateCalculation('marc_marketingVATCost', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Marketing Cost/Unit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.marc_perUnitCost.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Marketing Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.marc_totalCost.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Graphics Design Cost Section */}
          <div className={`rounded-lg p-4 ${isBasicOrTrial ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 opacity-60' : 'bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20'}`}>
            <button
              onClick={() => toggleSection('graphics')}
              className={`w-full flex items-center justify-between font-semibold ${isBasicOrTrial ? 'text-gray-500 cursor-not-allowed' : 'text-cyan-900 dark:text-cyan-100 hover:text-cyan-700 dark:hover:text-cyan-300'}`}
              disabled={isBasicOrTrial}
            >
              <span className="flex items-center gap-2">
                {isBasicOrTrial && <Lock className="w-4 h-4" />}
                {expandedSections.graphics ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                Graphics Design Cost
                {isBasicOrTrial && <span className="ml-2 text-xs bg-gray-300 dark:bg-gray-600 px-2 py-0.5 rounded-full">Locked</span>}
              </span>
            </button>
            {expandedSections.graphics && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">A+ Content*</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.gc_imagingAndPhotographyCost.toFixed(2)}
                      onChange={(e) => updateCalculation('gc_imagingAndPhotographyCost', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Videography</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.gc_videographyCost.toFixed(2)}
                      onChange={(e) => updateCalculation('gc_videographyCost', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Packaging</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.gc_productPackingCost.toFixed(2)}
                      onChange={(e) => updateCalculation('gc_productPackingCost', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Other Content Costs</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.gc_miscCost.toFixed(2)}
                      onChange={(e) => updateCalculation('gc_miscCost', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Graphics Cost/Unit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.gc_perUnitCost.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Graphics Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.gc_totalCost.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reviewer Program Cost Section */}
          <div className={`rounded-lg p-4 ${isBasicOrTrial ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 opacity-60' : 'bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20'}`}>
            <button
              onClick={() => toggleSection('feedback')}
              className={`w-full flex items-center justify-between font-semibold ${isBasicOrTrial ? 'text-gray-500 cursor-not-allowed' : 'text-teal-900 dark:text-teal-100 hover:text-teal-700 dark:hover:text-teal-300'}`}
              disabled={isBasicOrTrial}
            >
              <span className="flex items-center gap-2">
                {isBasicOrTrial && <Lock className="w-4 h-4" />}
                {expandedSections.feedback ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                Reviewer Program Cost
                {isBasicOrTrial && <span className="ml-2 text-xs bg-gray-300 dark:bg-gray-600 px-2 py-0.5 rounded-full">Locked</span>}
              </span>
            </button>
            {expandedSections.feedback && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review Related Expenses</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.pfc_vineProgramCost.toFixed(2)}
                      onChange={(e) => updateCalculation('pfc_vineProgramCost', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Other Associated Costs</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.pfc_miscCost.toFixed(2)}
                      onChange={(e) => updateCalculation('pfc_miscCost', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review Cost/Unit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.pfc_perUnitCost.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Review Prog. Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.pfc_totalCost.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Costs Section */}
          <div className={`rounded-lg p-4 ${isBasicOrTrial ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 opacity-60' : 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'}`}>
            <button
              onClick={() => toggleSection('other')}
              className={`w-full flex items-center justify-between font-semibold ${isBasicOrTrial ? 'text-gray-500 cursor-not-allowed' : 'text-indigo-900 dark:text-indigo-100 hover:text-indigo-700 dark:hover:text-indigo-300'}`}
              disabled={isBasicOrTrial}
            >
              <span className="flex items-center gap-2">
                {isBasicOrTrial && <Lock className="w-4 h-4" />}
                {expandedSections.other ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                Additional Costs
                {isBasicOrTrial && <span className="ml-2 text-xs bg-gray-300 dark:bg-gray-600 px-2 py-0.5 rounded-full">Locked</span>}
              </span>
            </button>
            {expandedSections.other && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pre-launch Samples</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.oc_preLaunchSamples.toFixed(2)}
                      onChange={(e) => updateCalculation('oc_preLaunchSamples', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Competitor Samples</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.oc_competitorProductSamples.toFixed(2)}
                      onChange={(e) => updateCalculation('oc_competitorProductSamples', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employees Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.oc_employeesCost.toFixed(2)}
                      onChange={(e) => updateCalculation('oc_employeesCost', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Miscellaneous Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.oc_anyOtherCost.toFixed(2)}
                      onChange={(e) => updateCalculation('oc_anyOtherCost', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Cost/Unit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.oc_perUnitCost.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Additional Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.oc_totalCost.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Taxes (if applicable) Section */}
          <div className={`rounded-lg p-4 ${isBasicOrTrial ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 opacity-60' : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'}`}>
            <button
              onClick={() => toggleSection('taxes')}
              className={`w-full flex items-center justify-between font-semibold ${isBasicOrTrial ? 'text-gray-500 cursor-not-allowed' : 'text-red-900 dark:text-red-100 hover:text-red-700 dark:hover:text-red-300'}`}
              disabled={isBasicOrTrial}
            >
              <span className="flex items-center gap-2">
                {isBasicOrTrial && <Lock className="w-4 h-4" />}
                {expandedSections.taxes ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                Taxes (if applicable)
                {isBasicOrTrial && <span className="ml-2 text-xs bg-gray-300 dark:bg-gray-600 px-2 py-0.5 rounded-full">Locked</span>}
              </span>
            </button>
            {expandedSections.taxes && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Region</label>
                  <select
                    value={calculation.tax_region}
                    onChange={(e) => updateCalculation('tax_region', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Tax Region</option>
                    {TAX_OPTIONS.map(tax => (
                      <option key={tax.code} value={tax.code}>{tax.country}</option>
                    ))}
                  </select>
                  {calculation.tax_region && getTaxNotes()}
                </div>

                {/* VAT, GST, Sales Tax Sliders and Miscellaneous Cost */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* VAT Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">VAT</label>
                      <input
                        type="number"
                        value={calculation.tax_VAT}
                        min={0}
                        max={100}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                          updateCalculation('tax_VAT', val);
                        }}
                        className="w-12 h-6 text-xs rounded-md border border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={calculation.tax_VAT}
                      onChange={(e) => updateCalculation('tax_VAT', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                  </div>

                  {/* GST Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GST</label>
                      <input
                        type="number"
                        value={calculation.tax_GST}
                        min={0}
                        max={100}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                          updateCalculation('tax_GST', val);
                        }}
                        className="w-12 h-6 text-xs rounded-md border border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={calculation.tax_GST}
                      onChange={(e) => updateCalculation('tax_GST', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                  </div>

                  {/* Sales Tax Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sales Tax</label>
                      <input
                        type="number"
                        value={calculation.tax_salesTax}
                        min={0}
                        max={100}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                          updateCalculation('tax_salesTax', val);
                        }}
                        className="w-12 h-6 text-xs rounded-md border border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={calculation.tax_salesTax}
                      onChange={(e) => updateCalculation('tax_salesTax', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                  </div>

                  {/* Miscellaneous Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Miscellaneous Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.tax_miscCost.toFixed(2)}
                      onChange={(e) => updateCalculation('tax_miscCost', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$ 0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Taxes/Unit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.tax_perUnitCost.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Taxes</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.tax_totalCost.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => setShowSaveSection(!showSaveSection)}
            className="px-4 py-2 text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save to Vault
          </button>
        </div>

        {/* Save Section */}
        {showSaveSection && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Save className="w-5 h-5 text-blue-600" />
              Save to Product Vault
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-300 dark:border-gray-600">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="New category name"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={isSaving || saveProductMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving || saveProductMutation.isPending ? 'Saving...' : 'Save to Vault'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmazonProfitCalculatorModal;

