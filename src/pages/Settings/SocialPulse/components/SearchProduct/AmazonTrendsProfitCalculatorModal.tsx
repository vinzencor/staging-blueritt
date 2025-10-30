import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X, Calculator, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { saveProducts, getCategory, createCategory } from '@/api/savedProducts';
import { type AmazonTrendingProduct, type SupplierInfo } from '@/api/amazonTrends';

interface AmazonTrendsProfitCalculatorModalProps {
  product: AmazonTrendingProduct;
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
  { country: "United States", code: "US", vat: 0, gst: 10, salesTax: 0 },
  { country: "Canada", code: "CA", vat: 0, gst: 5, salesTax: 13 },
  { country: "Mexico", code: "MX", vat: 16, gst: 0, salesTax: 0 },
  { country: "Brazil", code: "BR", vat: 5, gst: 5, salesTax: 0 },
  { country: "United Kingdom", code: "GB", vat: 20, gst: 0, salesTax: 0 },
  { country: "Germany", code: "DE", vat: 19, gst: 0, salesTax: 0 },
  { country: "Sweden", code: "SE", vat: 25, gst: 0, salesTax: 0 },
  { country: "Poland", code: "PL", vat: 23, gst: 0, salesTax: 0 },
  { country: "Turkey", code: "TR", vat: 18, gst: 0, salesTax: 0 },
  { country: "UAE", code: "AE", vat: 5, gst: 0, salesTax: 0 },
  { country: "India", code: "IN", vat: 0, gst: 18, salesTax: 0 },
  { country: "France", code: "FR", vat: 20, gst: 0, salesTax: 0 },
  { country: "Italy", code: "IT", vat: 22, gst: 0, salesTax: 0 },
  { country: "Spain", code: "ES", vat: 21, gst: 0, salesTax: 0 },
  { country: "Netherlands", code: "NL", vat: 21, gst: 0, salesTax: 0 },
  { country: "Saudi Arabia", code: "SA", vat: 15, gst: 0, salesTax: 0 },
  { country: "Japan", code: "JP", vat: 0, gst: 0, salesTax: 10 },
  { country: "Singapore", code: "SG", vat: 0, gst: 8, salesTax: 0 },
  { country: "Australia", code: "AU", vat: 0, gst: 10, salesTax: 0 },
];

const AmazonTrendsProfitCalculatorModal: React.FC<AmazonTrendsProfitCalculatorModalProps> = ({
  product,
  supplier,
  isOpen,
  onClose,
}) => {
  const [calculation, setCalculation] = useState<EnhancedProfitCalculation>({
    pi_sellingPrice: 0, pi_totalRevenue: 0, pi_quantity: 100,
    psc_manufacturingCost: 0, psc_shippingCost: 0, psc_productLogoCost: 0, psc_miscCost: 0,
    psc_orderQuantity: 100, psc_perUnitCost: 0, psc_totalCost: 0,
    fm_model: "FBA", fm_referrfalFees: 0, fm_fbaFulfillmentFees: 0, fm_monthlyStorageFees: 0,
    fm_longTermStorageFees: 0, fm_inboundShippingCost: 0, fm_returnsRate: 0, fm_shippingFees: 0,
    fm_handlingCost: 0, fm_storageCost: 0, fm_miscCost: 0, fm_perUnitCost: 0, fm_totalCost: 0,
    marc_marketingCost: 0, marc_attributionCost: 0, marc_influencerCost: 0, marc_miscCost: 0,
    marc_marketingVATCost: 0, marc_totalCost: 0, marc_perUnitCost: 0,
    tax_region: "US", tax_VAT: 0, tax_GST: 10, tax_salesTax: 0, tax_miscCost: 0,
    tax_perUnitCost: 0, tax_totalCost: 0,
    gc_imagingAndPhotographyCost: 0, gc_videographyCost: 0, gc_productPackingCost: 0,
    gc_3dAnimationCost: 0, gc_miscCost: 0, gc_totalCost: 0, gc_perUnitCost: 0,
    pfc_vineProgramCost: 0, pfc_miscCost: 0, pfc_totalCost: 0, pfc_perUnitCost: 0,
    oc_competitorProductSamples: 0, oc_preLaunchSamples: 0, oc_employeesCost: 0,
    oc_anyOtherCost: 0, oc_totalCost: 0, oc_perUnitCost: 0,
    grossProfit: 0, grossProfitMargin: 0, netProfitBeforeTaxes: 0, netProfitBeforeTaxesMargin: 0,
    netProfitAfterTaxes: 0, netProfitAfterTaxesMargin: 0,
  });

  const [expandedSections, setExpandedSections] = useState({
    productInfo: true, sourcing: true, fulfillment: true, marketing: false,
    taxes: false, graphics: false, feedback: false, other: false,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [saveTitle, setSaveTitle] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [showSaveSection, setShowSaveSection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const { data: categoriesData } = useQuery({
    queryKey: ["getCategories"],
    queryFn: getCategory,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (categoriesData) setCategories(categoriesData.data);
  }, [categoriesData]);

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
    // Prevent multiple saves
    if (isSaving || saveProductMutation.isPending) {
      console.log('🔥 Save already in progress, ignoring duplicate request');
      return;
    }

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

    // Helper function to extract numeric price from string and format with currency
    const extractPrice = (priceValue: any): string => {
      if (!priceValue && priceValue !== 0) return '$0';

      if (typeof priceValue === 'number') {
        // If it's already a number, format it with currency
        return `$${priceValue.toFixed(2)}`;
      }

      if (typeof priceValue === 'string') {
        // Extract numeric value from string
        const numericPrice = priceValue.replace(/[^0-9.]/g, '');
        if (numericPrice) {
          const parsedValue = parseFloat(numericPrice);
          return isNaN(parsedValue) ? '$0' : `$${parsedValue.toFixed(2)}`;
        }
      }

      return '$0';
    };

    // Debug logging
    console.log('🔍 Amazon Trends Product Save Debug:', {
      productAsin: product.asin,
      productTitle: product.product_title,
      productPrice: product.product_price,
      productPriceType: typeof product.product_price,
      extractedPrice: extractPrice(product.product_price),
      saveTitle: saveTitle.trim(),
      supplierName: supplier.name,
      imageUrl: product.product_photo,
      rating: product.product_star_rating,
      reviewCount: product.product_num_ratings,
      brand: product.brand,
    });

    // Prepare product data with MarginMax Basic field structure
    const productData = {
      name: saveTitle.trim(),
      description: saveDescription.trim(),
      category: selectedCategory,

      // IMPORTANT: Set simple_profit_pro to true so backend stores all calculation fields
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

      // Amazon product field (database schema requires this field name)
      amazon_product: {
        data: {
          asin: product.asin,
          product_title: product.product_title,
          product_price: extractPrice(product.product_price),
          product_original_price: extractPrice(product.product_price),
          currency: 'USD',
          country: 'US',
          product_byline: supplier.name || 'Unknown Supplier',
          product_byline_link: supplier.contact_url || '',
          product_star_rating: product.product_star_rating || '0',
          product_num_ratings: product.product_num_ratings || 0,
          product_url: product.product_url || '',
          product_photo: product.product_photo || '',
          product_num_offers: 1,
          product_availability: 'In Stock',
          is_best_seller: product.is_best_seller || false,
          is_amazon_choice: product.is_amazon_choice || false,
          is_prime: product.is_prime || false,
          climate_pledge_friendly: product.climate_pledge_friendly || false,
          sales_volume: '0',
          about_product: [],
          product_description: '',
          product_information: {},
          product_videos: [],
          product_photos: product.product_photo ? [product.product_photo] : [],
          has_video: false,
          product_details: {},
          brand: product.brand || '',
          category: product.category || '',
          primary_delivery_time: supplier.lead_time || '7-14 days',
          seller_country: supplier.location || 'China',
        },
        parameters: {
          searchCountry: 'US',
          country: 'US',
        },
        source: 'amazon_trends',
        saved_at: new Date().toISOString(),
        // IMPORTANT: offer object must be at same level as data, not inside data
        offer: {
          product_price: extractPrice(product.product_price),
          product_original_price: extractPrice(product.product_price),
          product_condition: 'New',
          seller: supplier.name || 'Unknown Supplier',
          seller_id: supplier.id || '',
          seller_link: supplier.contact_url || '',
          seller_star_rating: (supplier.rating || 0).toString(),
          seller_star_rating_info: (supplier.total_transactions || 0).toString(),
          currency: 'USD',
          delivery_price: 'Free Shipping',
          ships_from: supplier.location || 'China',
        },
      },

      // Supplier Information (must match ProductList.tsx expectations)
      supplier_info: {
        name: supplier.name,
        location: supplier.location,
        minimum_order: supplier.moq, // ProductList expects minimum_order, not moq
        moq: supplier.moq,
        lead_time: supplier.lead_time,
        estimated_price: supplier.estimated_price,
        verification_status: supplier.verification_status,
        ai_match_score: supplier.ai_match_score,
        rating: supplier.rating || 0,
        total_transactions: supplier.total_transactions || 0,
        response_rate: supplier.response_rate || '95%',
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
    console.log('🔥 CALCULATION FIELDS:', {
      simple_profit_pro: productData.simple_profit_pro,
      pi_totalRevenue: productData.pi_totalRevenue,
      psc_totalCost: productData.psc_totalCost,
      fm_totalCost: productData.fm_totalCost,
      grossProfit: productData.grossProfit,
      netProfitAfterTaxes: productData.netProfitAfterTaxes,
      selling_price: productData.selling_price,
      total_revenue: productData.total_revenue,
      gross_profit: productData.gross_profit,
      net_profit: productData.net_profit,
    });
    console.log('🔥 SUPPLIER INFO:', productData.supplier_info);
    saveProductMutation.mutate(productData);
  };

  useEffect(() => {
    if (isOpen && product && supplier) {
      // Extract Amazon product price
      const amazonPrice = parseFloat(product.product_price?.replace(/[^0-9.]/g, '') || '0');
      const supplierPrice = parseFloat(supplier.estimated_price?.replace(/[^0-9.]/g, '') || '0');
      const suggestedPrice = amazonPrice > 0 ? amazonPrice : supplierPrice * 2.5;
      const costPrice = supplierPrice;
      const estimatedShipping = supplier.moq > 500 ? 2.50 : 5.00;

      // Amazon FBA fees (estimated)
      const estimatedReferralFees = suggestedPrice * 0.15; // 15% referral fee
      const fulfillmentFees = 3.50; // Estimated FBA fulfillment fee
      const storageFees = 0.75; // Monthly storage fee
      const processingFees = 0.15;

      const initialCalc: EnhancedProfitCalculation = {
        pi_sellingPrice: suggestedPrice, pi_totalRevenue: suggestedPrice * 100, pi_quantity: 100,
        psc_manufacturingCost: costPrice, psc_shippingCost: estimatedShipping, psc_productLogoCost: 0,
        psc_miscCost: 0, psc_orderQuantity: 100, psc_perUnitCost: costPrice + estimatedShipping,
        psc_totalCost: (costPrice + estimatedShipping) * 100,
        fm_model: "FBA", fm_referrfalFees: estimatedReferralFees, fm_fbaFulfillmentFees: fulfillmentFees,
        fm_monthlyStorageFees: storageFees, fm_longTermStorageFees: 0, fm_inboundShippingCost: 0,
        fm_returnsRate: 0, fm_shippingFees: 0, fm_handlingCost: 0, fm_storageCost: 0, fm_miscCost: processingFees,
        fm_perUnitCost: estimatedReferralFees + fulfillmentFees + storageFees + processingFees,
        fm_totalCost: (estimatedReferralFees + fulfillmentFees + storageFees + processingFees) * 100,
        marc_marketingCost: 0, marc_attributionCost: 0, marc_influencerCost: 0, marc_miscCost: 0,
        marc_marketingVATCost: 0, marc_totalCost: 0, marc_perUnitCost: 0,
        tax_region: "US", tax_VAT: 0, tax_GST: 10, tax_salesTax: 0, tax_miscCost: 0, tax_perUnitCost: 0, tax_totalCost: 0,
        gc_imagingAndPhotographyCost: 0, gc_videographyCost: 0, gc_productPackingCost: 0, gc_3dAnimationCost: 0,
        gc_miscCost: 0, gc_totalCost: 0, gc_perUnitCost: 0,
        pfc_vineProgramCost: 0, pfc_miscCost: 0, pfc_totalCost: 0, pfc_perUnitCost: 0,
        oc_competitorProductSamples: 0, oc_preLaunchSamples: 0, oc_employeesCost: 0, oc_anyOtherCost: 0,
        oc_totalCost: 0, oc_perUnitCost: 0,
        grossProfit: 0, grossProfitMargin: 0, netProfitBeforeTaxes: 0, netProfitBeforeTaxesMargin: 0,
        netProfitAfterTaxes: 0, netProfitAfterTaxesMargin: 0,
      };

      // Calculate all profit metrics
      const totalRevenue = initialCalc.pi_totalRevenue;
      const totalCostsBeforeTax = initialCalc.psc_totalCost + initialCalc.fm_totalCost +
        initialCalc.marc_totalCost + initialCalc.gc_totalCost +
        initialCalc.pfc_totalCost + initialCalc.oc_totalCost;

      initialCalc.grossProfit = totalRevenue - initialCalc.psc_totalCost;
      initialCalc.grossProfitMargin = totalRevenue > 0 ? (initialCalc.grossProfit / totalRevenue) * 100 : 0;
      initialCalc.netProfitBeforeTaxes = totalRevenue - totalCostsBeforeTax;
      initialCalc.netProfitBeforeTaxesMargin = totalRevenue > 0 ? (initialCalc.netProfitBeforeTaxes / totalRevenue) * 100 : 0;
      initialCalc.netProfitAfterTaxes = initialCalc.netProfitBeforeTaxes - initialCalc.tax_totalCost;
      initialCalc.netProfitAfterTaxesMargin = totalRevenue > 0 ? (initialCalc.netProfitAfterTaxes / totalRevenue) * 100 : 0;

      setCalculation(initialCalc);
      setSaveTitle(product.product_title || 'Amazon Product');
      setSaveDescription(`Amazon Trends Product - ASIN: ${product.asin} | Supplier: ${supplier.name} | Price: ${product.product_price}`);
    }
  }, [isOpen, product, supplier]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateCalculation = (field: keyof EnhancedProfitCalculation, value: number | string) => {
    const newCalc = { ...calculation, [field]: typeof value === 'string' ? parseFloat(value) || 0 : value };

    if (field === 'pi_sellingPrice' || field === 'pi_quantity') {
      newCalc.pi_totalRevenue = newCalc.pi_sellingPrice * newCalc.pi_quantity;
    }

    if (['psc_manufacturingCost', 'psc_shippingCost', 'psc_productLogoCost', 'psc_miscCost'].includes(field as string)) {
      const costPerUnit = newCalc.psc_manufacturingCost + newCalc.psc_shippingCost + newCalc.psc_productLogoCost + newCalc.psc_miscCost;
      newCalc.psc_perUnitCost = costPerUnit;
      newCalc.psc_totalCost = costPerUnit * newCalc.psc_orderQuantity;
    }

    if (field === 'psc_orderQuantity') {
      newCalc.psc_totalCost = newCalc.psc_perUnitCost * newCalc.psc_orderQuantity;
    }

    if (['fm_referrfalFees', 'fm_fbaFulfillmentFees', 'fm_monthlyStorageFees', 'fm_longTermStorageFees', 'fm_inboundShippingCost', 'fm_shippingFees', 'fm_handlingCost', 'fm_storageCost', 'fm_miscCost'].includes(field as string)) {
      let sum = 0;
      if (newCalc.fm_model === "FBA") {
        sum = newCalc.fm_referrfalFees + newCalc.fm_fbaFulfillmentFees + newCalc.fm_monthlyStorageFees + newCalc.fm_longTermStorageFees + newCalc.fm_inboundShippingCost;
      } else {
        sum = newCalc.fm_referrfalFees + newCalc.fm_shippingFees + newCalc.fm_handlingCost + newCalc.fm_storageCost + newCalc.fm_miscCost;
      }
      newCalc.fm_perUnitCost = sum;
      newCalc.fm_totalCost = sum * newCalc.pi_quantity;
    }

    if (['marc_marketingCost', 'marc_attributionCost', 'marc_influencerCost', 'marc_miscCost', 'marc_marketingVATCost'].includes(field as string)) {
      const sum = newCalc.marc_marketingCost + newCalc.marc_attributionCost + newCalc.marc_influencerCost + newCalc.marc_miscCost + newCalc.marc_marketingVATCost;
      newCalc.marc_totalCost = sum;
      newCalc.marc_perUnitCost = newCalc.pi_quantity > 0 ? sum / newCalc.pi_quantity : 0;
    }

    if (['tax_VAT', 'tax_GST', 'tax_salesTax', 'tax_miscCost'].includes(field as string)) {
      const sum = newCalc.tax_VAT + newCalc.tax_GST + newCalc.tax_salesTax + newCalc.tax_miscCost;
      newCalc.tax_totalCost = sum;
      newCalc.tax_perUnitCost = newCalc.pi_quantity > 0 ? sum / newCalc.pi_quantity : 0;
    }

    if (['gc_imagingAndPhotographyCost', 'gc_videographyCost', 'gc_productPackingCost', 'gc_3dAnimationCost', 'gc_miscCost'].includes(field as string)) {
      const sum = newCalc.gc_imagingAndPhotographyCost + newCalc.gc_videographyCost + newCalc.gc_productPackingCost + newCalc.gc_3dAnimationCost + newCalc.gc_miscCost;
      newCalc.gc_totalCost = sum;
      newCalc.gc_perUnitCost = newCalc.pi_quantity > 0 ? sum / newCalc.pi_quantity : 0;
    }

    if (['pfc_vineProgramCost', 'pfc_miscCost'].includes(field as string)) {
      const sum = newCalc.pfc_vineProgramCost + newCalc.pfc_miscCost;
      newCalc.pfc_totalCost = sum;
      newCalc.pfc_perUnitCost = newCalc.pi_quantity > 0 ? sum / newCalc.pi_quantity : 0;
    }

    if (['oc_competitorProductSamples', 'oc_preLaunchSamples', 'oc_employeesCost', 'oc_anyOtherCost'].includes(field as string)) {
      const sum = newCalc.oc_competitorProductSamples + newCalc.oc_preLaunchSamples + newCalc.oc_employeesCost + newCalc.oc_anyOtherCost;
      newCalc.oc_totalCost = sum;
      newCalc.oc_perUnitCost = newCalc.pi_quantity > 0 ? sum / newCalc.pi_quantity : 0;
    }

    const totalRevenue = newCalc.pi_totalRevenue;
    const totalCostsBeforeTax = newCalc.psc_totalCost + newCalc.fm_totalCost + newCalc.marc_totalCost + newCalc.gc_totalCost + newCalc.pfc_totalCost + newCalc.oc_totalCost;

    newCalc.grossProfit = totalRevenue - newCalc.psc_totalCost;
    newCalc.grossProfitMargin = totalRevenue > 0 ? (newCalc.grossProfit / totalRevenue) * 100 : 0;
    newCalc.netProfitBeforeTaxes = totalRevenue - totalCostsBeforeTax;
    newCalc.netProfitBeforeTaxesMargin = totalRevenue > 0 ? (newCalc.netProfitBeforeTaxes / totalRevenue) * 100 : 0;
    newCalc.netProfitAfterTaxes = newCalc.netProfitBeforeTaxes - newCalc.tax_totalCost;
    newCalc.netProfitAfterTaxesMargin = totalRevenue > 0 ? (newCalc.netProfitAfterTaxes / totalRevenue) * 100 : 0;

    setCalculation(newCalc);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">TikTok Profit Calculator</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Complete profit analysis with all cost categories</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-6 h-6 dark:text-white" />
          </button>
        </div>

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
              <p className="text-xs text-green-700 dark:text-green-300">{calculation.grossProfitMargin.toFixed(1)}%</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Net Profit (Before Tax)</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">${calculation.netProfitBeforeTaxes.toFixed(2)}</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">{calculation.netProfitBeforeTaxesMargin.toFixed(1)}%</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Net Profit (After Tax)</p>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">${calculation.netProfitAfterTaxes.toFixed(2)}</p>
              <p className="text-xs text-purple-700 dark:text-purple-300">{calculation.netProfitAfterTaxesMargin.toFixed(1)}%</p>
            </div>
          </div>

          {/* Product Information Section */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('productInfo')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Product Information</h3>
              {expandedSections.productInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.productInfo && (
              <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selling Price ($)</label>
                    <input
                      type="number"
                      value={calculation.pi_sellingPrice}
                      onChange={(e) => updateCalculation('pi_sellingPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={calculation.pi_quantity}
                      onChange={(e) => updateCalculation('pi_quantity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Revenue ($)</label>
                    <input
                      type="number"
                      value={calculation.pi_totalRevenue}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Sourcing Cost Section */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('sourcing')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Product Sourcing Cost</h3>
              {expandedSections.sourcing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.sourcing && (
              <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manufacturing Cost ($)</label>
                    <input
                      type="number"
                      value={calculation.psc_manufacturingCost}
                      onChange={(e) => updateCalculation('psc_manufacturingCost', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shipping Cost ($)</label>
                    <input
                      type="number"
                      value={calculation.psc_shippingCost}
                      onChange={(e) => updateCalculation('psc_shippingCost', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Logo Cost ($)</label>
                    <input
                      type="number"
                      value={calculation.psc_productLogoCost}
                      onChange={(e) => updateCalculation('psc_productLogoCost', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Misc Cost ($)</label>
                    <input
                      type="number"
                      value={calculation.psc_miscCost}
                      onChange={(e) => updateCalculation('psc_miscCost', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Quantity</label>
                    <input
                      type="number"
                      value={calculation.psc_orderQuantity}
                      onChange={(e) => updateCalculation('psc_orderQuantity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Per Unit Cost ($)</label>
                    <input
                      type="number"
                      value={calculation.psc_perUnitCost}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Cost ($)</label>
                    <input
                      type="number"
                      value={calculation.psc_totalCost}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fulfillment Model Section */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('fulfillment')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Fulfillment Model</h3>
              {expandedSections.fulfillment ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.fulfillment && (
              <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Referral Fees ($)</label>
                    <input
                      type="number"
                      value={calculation.fm_referrfalFees}
                      onChange={(e) => updateCalculation('fm_referrfalFees', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">FBA Fulfillment Fees ($)</label>
                    <input
                      type="number"
                      value={calculation.fm_fbaFulfillmentFees}
                      onChange={(e) => updateCalculation('fm_fbaFulfillmentFees', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Storage Fees ($)</label>
                    <input
                      type="number"
                      value={calculation.fm_monthlyStorageFees}
                      onChange={(e) => updateCalculation('fm_monthlyStorageFees', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Long Term Storage Fees ($)</label>
                    <input
                      type="number"
                      value={calculation.fm_longTermStorageFees}
                      onChange={(e) => updateCalculation('fm_longTermStorageFees', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Per Unit Cost ($)</label>
                    <input
                      type="number"
                      value={calculation.fm_perUnitCost}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Cost ($)</label>
                    <input
                      type="number"
                      value={calculation.fm_totalCost}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Marketing Section */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
            <button
              onClick={() => toggleSection('marketing')}
              className="w-full flex items-center justify-between font-semibold text-yellow-900 hover:text-yellow-700"
            >
              <span className="flex items-center gap-2">
                {expandedSections.marketing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                Marketing & Advertising
              </span>
            </button>
            {expandedSections.marketing && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marketing Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.marc_marketingCost}
                    onChange={(e) => updateCalculation('marc_marketingCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attribution Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.marc_attributionCost}
                    onChange={(e) => updateCalculation('marc_attributionCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Influencer Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.marc_influencerCost}
                    onChange={(e) => updateCalculation('marc_influencerCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Other Marketing Costs</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.marc_miscCost}
                    onChange={(e) => updateCalculation('marc_miscCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Taxes Section */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4">
            <button
              onClick={() => toggleSection('taxes')}
              className="w-full flex items-center justify-between font-semibold text-red-900 hover:text-red-700"
            >
              <span className="flex items-center gap-2">
                {expandedSections.taxes ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                Taxes
              </span>
            </button>
            {expandedSections.taxes && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Region</label>
                  <select
                    value={calculation.tax_region}
                    onChange={(e) => updateCalculation('tax_region', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {TAX_OPTIONS.map(tax => (
                      <option key={tax.code} value={tax.code}>{tax.country}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">VAT (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.tax_VAT}
                      onChange={(e) => updateCalculation('tax_VAT', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GST (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.tax_GST}
                      onChange={(e) => updateCalculation('tax_GST', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sales Tax (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculation.tax_salesTax}
                      onChange={(e) => updateCalculation('tax_salesTax', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* Graphics Section */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4">
            <button
              onClick={() => toggleSection('graphics')}
              className="w-full flex items-center justify-between font-semibold text-cyan-900 hover:text-cyan-700"
            >
              <span className="flex items-center gap-2">
                {expandedSections.graphics ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                Graphics & Content
              </span>
            </button>
            {expandedSections.graphics && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photography Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.gc_imagingAndPhotographyCost}
                    onChange={(e) => updateCalculation('gc_imagingAndPhotographyCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Videography Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.gc_videographyCost}
                    onChange={(e) => updateCalculation('gc_videographyCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Packing Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.gc_productPackingCost}
                    onChange={(e) => updateCalculation('gc_productPackingCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">3D Animation Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.gc_3dAnimationCost}
                    onChange={(e) => updateCalculation('gc_3dAnimationCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Product Feedback Section */}
          <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-lg p-4">
            <button
              onClick={() => toggleSection('feedback')}
              className="w-full flex items-center justify-between font-semibold text-teal-900 hover:text-teal-700"
            >
              <span className="flex items-center gap-2">
                {expandedSections.feedback ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                Product Feedback
              </span>
            </button>
            {expandedSections.feedback && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vine Program Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.pfc_vineProgramCost}
                    onChange={(e) => updateCalculation('pfc_vineProgramCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Other Feedback Costs</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.pfc_miscCost}
                    onChange={(e) => updateCalculation('pfc_miscCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Other Costs Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
            <button
              onClick={() => toggleSection('other')}
              className="w-full flex items-center justify-between font-semibold text-indigo-900 hover:text-indigo-700"
            >
              <span className="flex items-center gap-2">
                {expandedSections.other ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                Other Costs
              </span>
            </button>
            {expandedSections.other && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Competitor Samples</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.oc_competitorProductSamples}
                    onChange={(e) => updateCalculation('oc_competitorProductSamples', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pre-Launch Samples</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.oc_preLaunchSamples}
                    onChange={(e) => updateCalculation('oc_preLaunchSamples', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employees Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.oc_employeesCost}
                    onChange={(e) => updateCalculation('oc_employeesCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Other Costs</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculation.oc_anyOtherCost}
                    onChange={(e) => updateCalculation('oc_anyOtherCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                  />
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

        {/* Save Button */}
        {/* <div className="flex gap-3 pt-4">
          <button
            onClick={() => setShowSaveSection(!showSaveSection)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition"
          >
            <Save className="w-5 h-5" />
            Save to Vault
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default AmazonTrendsProfitCalculatorModal;
