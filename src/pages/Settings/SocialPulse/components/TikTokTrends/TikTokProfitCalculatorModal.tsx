import * as Yup from "yup";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import Pageheader from "@/components/common/page-header/pageheader";
import SearchesAlert from "@/@spk/uielements/SearchesAlert";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Icon from "@/assets/images/brand-logos/icon.png";
import Stepper from "@/components/common/Stepper";
import { getAmazonProductDetail } from "@/api/product";
import {
  getProfitProCalculations,
  saveProducts,
  updateProducts,
  getCategory,
  createCategory,
} from "@/api/savedProducts";
import Input from "@/components/common/input/Input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select/Select";
import Button from "@/components/common/button/Button";
import { Package, Truck, Star, Shield } from "lucide-react";
import { COUNTRY_OPTIONS } from "@/utils/constants";
import type { TAlibabaProduct, TAmazonProduct } from "@/types/product";
import type { TikTokTrendingProduct, SupplierInfo } from "@/api/tiktokTrends";
import { useUserSubscriptionAndSearchQuota } from "@/hooks/useUserDetails";
import { EAccessTypes, QuotaNames } from "@/enum";
import FormInput from "@/pages/ProfitPro/components/FormInput";
import SliderInput from "@/pages/ProfitPro/components/SliderInput";
import AlibabaCard from "@/pages/ProfitPro/components/AlibabaCard";
import AmazonCard from "@/pages/ProfitPro/components/AmazonCard";
import RevenueCalculationCard from "@/pages/ProfitPro/components/RevenueCalculationCard";

import "reactjs-popup/dist/index.css";

import { useSelector } from "react-redux";
import { AxiosError } from "axios";


const TAX_OPTIONS = [
  {
    country: "United States",
    code: "US",
    vat: 0,
    gst: 10,
    salesTax: 0,
    misc: 0,

    salesTaxNote:
      "Sales Tax is variable by state (e.g., California, New York).",
  },
  {
    country: "Canada",
    code: "CA",
    vat: 0,
    gst: 5,
    salesTax: 13,
    misc: 0,
    gstNote:
      "GST is variable by province (e.g., GST 5% or HST in certain regions like Ontario: 13%).",
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
    vatNote:
      "Brazil has complex tax structures including ICMS, IPI, PIS, and COFINS depending on the state.",
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
    gstNote:
      "GST rates vary from 5% to 28%, depending on the product category.",
  },
  {
    country: "France",
    code: "",
    vat: 20,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 20%.",
  },
  {
    country: "Italy",
    code: "",
    vat: 22,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 22%.",
  },
  {
    country: "Spain",
    code: "",
    vat: 21,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 21%.",
  },
  {
    country: "Netherlands",
    code: "",
    vat: 21,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 21%.",
  },
  {
    country: "Saudi Arabia",
    code: "",
    vat: 15,
    gst: 0,
    salesTax: 0,
    misc: 0,
    vatNote: "Standard VAT of 15%.",
  },
  {
    country: "Japan",
    code: "",
    vat: 0,
    gst: 0,
    salesTax: 10,
    misc: 0,
    salesTaxNote: "Standard Consumption Tax of 10%.",
  },
  {
    country: "Singapore",
    code: "",
    vat: 0,
    gst: 8,
    salesTax: 0,
    misc: 0,
    gstNote: "Standard GST of 8%.",
  },
  {
    country: "Australia",
    code: "",
    vat: 0,
    gst: 10,
    salesTax: 0,
    misc: 0,
    gstNote: "Standard GST of 10%.",
  },
  { country: "", code: "", vat: 0, gst: 0, salesTax: 0, misc: 0 },
];

const validationSchema = Yup.object({
  pi_sellingPrice: Yup.number()
    .label("Selling Price")
    .required("Selling Price  is required.")
    .typeError(
      "Selling Price must be a valid number. Please enter a numeric value."
    ),
  pi_quantity: Yup.number()
    .required("Units Sold (Product Revenue) is required.")
    .typeError(
      "Units Sold must be a valid number. Please enter a numeric value."
    ),
  pi_totalRevenue: Yup.number()
    .label("Total Revenue")
    .required("Total Revenue (Product Revenue) field is required.")
    .typeError(
      "Total Revenue must be a valid number. Please enter a numeric value."
    ),

  psc_manufacturingCost: Yup.number()
    .label("Product Manufacturing")
    .required("Product Manufacturing is required.")
    .typeError(
      "Product Manufacturing must be a valid number. Please enter a numeric value."
    ),
  psc_shippingCost: Yup.number()
    .label("Shipping Cost")
    .required("Shipping Cost is required.")
    .typeError(
      "Shipping Cost must be a valid number. Please enter a numeric value."
    ),
  psc_productLogoCost: Yup.number()
    .label("Product Logo Cost")
    .optional()
    .typeError(
      "Product Logo Cost must be a valid number. Please enter a numeric value."
    ),
  psc_orderQuantity: Yup.number()
    .label("Order Quantity")
    .required("Order Quantity is required.")
    .typeError(
      "Order Quantity must be a valid number. Please enter a numeric value."
    ),
  psc_miscCost: Yup.number()
    .label("Other Sourcing Costs")
    .optional()
    .typeError(
      "Other Sourcing Costs must be a valid number. Please enter a numeric value."
    ),
  psc_perUnitCost: Yup.number()
    .label("Cost Per Unit")
    .required("Cost Per Unit (Product Sourcing Cost) is required.")
    .typeError(
      "Cost Per Unit must be a valid number. Please enter a numeric value."
    ),
  psc_totalCost: Yup.number()
    .label("Total Cost")
    .required("Total Cost (Product Sourcing Cost) is required.")
    .typeError(
      "Total Cost must be a valid number. Please enter a numeric value."
    ),

  fm_model: Yup.string()
    .required("Fulfillment Model is required.")
    .default("FBA"),
  fm_referrfalFees: Yup.number()
    .label("Amazon Fees")
    .required("Amazon Fees (Fulfillment Model) is required.")
    .typeError(
      "Amazon Fees must be a valid number. Please enter a numeric value."
    ),
  fm_fbaFulfillmentFees: Yup.number()
    .label("Fulfillment Cost")
    .required("Fulfillment Cost is required.")
    .typeError(
      "Fulfillment Cost must be a valid number. Please enter a numeric value."
    ),
  fm_monthlyStorageFees: Yup.number()
    .label("Storage Cost")
    .required("Storage Cost is required.")
    .typeError("Storage Cost is required."),
  fm_longTermStorageFees: Yup.number()
    .label("Inbounding Cost")
    .optional()
    .typeError(
      "Inbounding Cost must be a valid number. Please enter a numeric value."
    ),
  fm_inboundShippingCost: Yup.number()
    .label("Other FBA Costs")
    .optional()
    .typeError(
      "Other FBA Costs must be a valid number. Please enter a numeric value."
    ),
  fm_returnsRate: Yup.number()
    .label("Returns Rate")
    .required("Returns Rate is required.")
    .typeError(
      "Returns Rate must be a valid number. Please enter a numeric value."
    ),
  fm_shippingFees: Yup.number()
    .label("Shipping Delivery Charges")
    .optional()
    .typeError(
      "Shipping Delivery Charges must be a valid number. Please enter a numeric value."
    ),
  fm_handlingCost: Yup.number()
    .label("Fulfillment Cost")
    .optional()
    .typeError(
      "Fulfillment Cost must be a valid number. Please enter a numeric value."
    ),
  fm_storageCost: Yup.number()
    .label("Storage Cost")
    .optional()
    .typeError(
      "Storage Cost must be a valid number. Please enter a numeric value."
    ),
  fm_miscCost: Yup.number()
    .label("Other FBM Cost")
    .optional()
    .typeError(
      "Other FBM Cost must be a valid number. Please enter a numeric value."
    ),
  fm_totalCost: Yup.number()
    .label("Total Cost")
    .required("Total Cost (Fulfillment Model) is required.")
    .typeError(
      "Total Cost must be a valid number. Please enter a numeric value."
    ),
  fm_perUnitCost: Yup.number()
    .label("Cost Per Unit")
    .required("Cost Per Unit (Fulfillment Model) is required.")
    .typeError(
      "Total Cost must be a valid number. Please enter a numeric value."
    ),

  marc_marketingCost: Yup.string().required("Marketing Cost is required."),
  marc_attributionCost: Yup.number()
    .label("Attribution Links")
    .optional()
    .typeError(
      "Attribution Links must be a valid number. Please enter a numeric value."
    ),
  marc_influencerCost: Yup.number()
    .label("Prmotion/Other Costs")
    .optional()
    .typeError(
      "Prmotion/Other Costs must be a valid number. Please enter a numeric value."
    ),
  marc_miscCost: Yup.number()
    .label("PPC VAT(if Applicable)")
    .optional()
    .typeError(
      "PPC VAT(if Applicable) must be a valid number. Please enter a numeric value."
    ),
  marc_marketingVATCost: Yup.number()
    .label("Marketing VAT Cost")
    .optional()
    .typeError(
      "Marketing VAT Cost must be a valid number. Please enter a numeric value."
    ),
  marc_totalCost: Yup.number()
    .label("Total Cost")
    .optional()
    .typeError(
      "Total Cost must be a valid number. Please enter a numeric value."
    ),
  marc_perUnitCost: Yup.number()
    .label("Per Unit Cost")
    .optional()
    .typeError(
      "Per Unit Cost must be a valid number. Please enter a numeric value."
    ),

  tax_region: Yup.string().optional(),
  tax_VAT: Yup.number()
    .label("VAT")
    .optional()
    .typeError("VAT must be a valid number. Please enter a numeric value."),
  tax_GST: Yup.number()
    .label("GST")
    .optional()
    .typeError("GST must be a valid number. Please enter a numeric value."),
  tax_salesTax: Yup.number()
    .label("Sales Tax")
    .optional()
    .typeError(
      "Sales Tax must be a valid number. Please enter a numeric value."
    ),
  tax_miscCost: Yup.number()
    .label("Miscellaneous Cost")
    .optional()
    .typeError(
      "Miscellaneous Cost must be a valid number. Please enter a numeric value."
    ),
  tax_perUnitCost: Yup.number().optional(),
  tax_totalCost: Yup.number().optional(),

  gc_imagingAndPhotographyCost: Yup.number().required(
    "Imaging and Photography Cost is required."
  ),
  gc_videographyCost: Yup.number().optional(),
  gc_productPackingCost: Yup.number().optional(),
  gc_3dAnimationCost: Yup.number().optional(),
  gc_miscCost: Yup.number().optional(),
  gc_totalCost: Yup.number().optional(),
  gc_perUnitCost: Yup.number().optional(),

  pfc_vineProgramCost: Yup.number().optional(),
  pfc_miscCost: Yup.number().optional(),
  pfc_totalCost: Yup.number().optional(),
  pfc_perUnitCost: Yup.number().optional(),

  oc_competitorProductSamples: Yup.number().optional(),
  oc_preLaunchSamples: Yup.number()
    .label("Pre-Launch Samples")
    .optional()
    .typeError(
      "Pre-Launch Samples must be a valid number. Please enter a numeric value."
    ),
  oc_employeesCost: Yup.number().optional(),
  oc_anyOtherCost: Yup.number().optional(),
  oc_totalCost: Yup.number().optional(),
  oc_perUnitCost: Yup.number().optional(),
});



type TikTokProfitCalculatorModalProps = {
  product?: TAmazonProduct | TikTokTrendingProduct | any;
  supplier?: TAlibabaProduct | SupplierInfo | any;
  shopAnalysisData?: any;
  isOpen: boolean;
  onClose: () => void;
};

const TikTokProfitCalculatorModal: React.FC<TikTokProfitCalculatorModalProps> = ({
  product,
  supplier,
  shopAnalysisData,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const scannerSelectedSupplier = useSelector(
    (state: any) => state.scannerSelectedSupplier
  );
  const scannerActiveComponent = useSelector(
    (state: any) => state.scannerActiveComponent
  );
  const profitProSource = useSelector((state: any) => state.profitProSource);
  const dispatch = useDispatch();
  const [alibabaProductFromState, setAlibabaProductFromState] =
    useState<TAlibabaProduct | null>(null);
  const [amazonProductFromState, setAmazonProductFromState] =
    useState<TAmazonProduct | null>(null);
  const [visualSearchImageURL, setVisualSearchImageURL] = useState<
    string | null
  >(null);
  // Popup state
  const [showAIScore, setShowAIScore] = useState(false);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSecondPopupOpen, setIsSecondPopupOpen] = useState(false);
  const [isPopupLoading, setIsPopupLoading] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const [saveDescription, setSaveDescription] = useState("");
  const [isComingFromMatcher, setIsComingFromMatcher] = useState(true);

  // If the user is coming after saving the listing.
  const { saveID } = useParams();
  // Search for Amazon Product if user is not coming from matcher
  const [searchString, setSearchString] = useState("");
  const [country, setCountry] = useState(COUNTRY_OPTIONS[0].value);

  // Amazon Product to be used in this page
  const [amazonProduct, setAmazonProduct] = useState<TAmazonProduct | null>(
    amazonProductFromState
  );
  const [alibabaProduct, setAlibabaProduct] = useState<TAlibabaProduct | null>(
    alibabaProductFromState
  );

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  //getCategory
  const { data, refetch } = useQuery({
    queryKey: ["getCategories"],
    queryFn: getCategory,
  });

  useEffect(() => {
    if (!newCategory) {
      refetch(); // Refetch when newCategory is reset (meaning a new category was added)
    }
  }, [newCategory, refetch]);

  //createCategory

  useEffect(() => {
    if (data) {
      setCategories(data.data);
    }
  }, [data]);

  // Data for the final profit cards
  const [profitAndRev, setProfitAndRev] = useState({
    revPerUnt: 0,
    totalRev: 0,

    totalCostPerUnit: 0,
    totalCostForQty: 0,

    grossProfitPerUnit: 0,
    grossProfitForQty: 0,

    netProfitBeforeTaxesPerUnit: 0,
    netProfitBeforeTaxesForQty: 0,

    netProfitAfterTaxesPerUnit: 0,
    netProfitAfterTaxesForQty: 0,

    totalNetProfitAfterTaxes: 0,
  });

  // Check if the user is coming from the matcher flow

  // API to get ProfitPro Calculations in case user is coming after saving the listing.
  const {
    data: profitProCalculationsFromAPI,
    isFetching: isLoadingProfitProCalculations,
  } = useQuery({
    queryKey: ["getProfitProCalculations", saveID],
    queryFn: () => {
      // Empty string is passed to avoid linter errors. The API will run only if saveID is present, ensured by `enabled` flag
      return getProfitProCalculations({ saveID: saveID || "" });
    },
    staleTime: 0,
    enabled: !!saveID,
  });
  const {
    quotaDetails,
    updateQuota,
    isLoading: isQuotaLoading,
    checkAccess,
  } = useUserSubscriptionAndSearchQuota(QuotaNames.NoOfNetProfitCalculations);

  // API to get Amazon Product Detail in case of a new search
  const {
    data: amazonProductFromAPI,
    refetch: productDetailRefetch,
    isLoading: isAmazonProductLoading,
    error: amazonProductError,
  } = useQuery({
    queryKey: [
      "getAmazonProductDetail",
      searchString,
      country,
      QuotaNames.NoOfNetProfitCalculations,
    ],
    queryFn: () =>
      getAmazonProductDetail({
        asin: searchString,
        country: country,
        source: QuotaNames.NoOfNetProfitCalculations,
      }),
    enabled: false, // Disable automatic fetching
    retry: false,
  });

  const { mutate: saveProductsMutate } = useMutation({
    mutationFn: saveProducts,
    onSuccess: () => {
      toast.success("Product Saved");
      setIsPopupLoading(false);
      setSaveDescription("");
      setSaveTitle("");
      // setIsPopupOpen(false);
      navigate("/listings");
    },
    onError: (e) => {
      toast.error(e.message);
      setIsPopupLoading(false);
      // setIsPopupOpen(false);
    },
  });

  const { mutate: updateProductsMutate } = useMutation({
    mutationFn: updateProducts,
    onSuccess: () => {
      toast.success("Product Updated");
      setIsPopupLoading(false);
      // setSaveDescription('');
      // setSaveTitle('');
      // setIsPopupOpen(false);
      navigate(-1);
    },
    onError: (e) => {
      toast.error(e.message);
      setIsPopupLoading(false);
      // setIsPopupOpen(false);
    },
  });

  const { mutate: updateCategoryMutate, isPending } = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("New Category Created");
      setIsPopupLoading(false);
      setIsSecondPopupOpen(false);
      setNewCategory("");
    },
    onError: (e) => {
      toast.error(e.message);
      setIsPopupLoading(false);
      setIsSecondPopupOpen(false);
    },
  });

  const getTaxNotes = () => {
    const taxRegion = TAX_OPTIONS.find(
      (opt) => opt.code === formik.values.tax_region
    );

    if (!taxRegion) return null;

    return (
      <>
        {taxRegion?.vatNote && (
          <p className="text-sm text-gray-500">{taxRegion?.vatNote}</p>
        )}
        {taxRegion?.gstNote && (
          <p className="text-sm text-gray-500">{taxRegion?.gstNote}</p>
        )}
        {taxRegion?.salesTaxNote && (
          <p className="text-sm text-gray-500">{taxRegion?.salesTaxNote}</p>
        )}
      </>
    );
  };

  const roundOffToTwoDecimals = (num: number) => {
    return Math.round(num * 100) / 100;
  };

  const saveProductSubmit = () => {
    saveProductsMutate(getDataForMutation());
    // setIsPopupOpen(false);
    setSaveTitle("");
    setSaveDescription("");
    setIsPopupLoading(true);
    setSelectedCategory("");
  };

  const openSecondPopup = () => {
    setIsSecondPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const closeSecondPopup = () => {
    setIsSecondPopupOpen(false);
  };

  const getInitialValues = () => {
    const selectedProductRegion = amazonProduct
      ? amazonProduct.parameters.country
      : COUNTRY_OPTIONS[0].value;
    const taxRegion = TAX_OPTIONS.find(
      (opt) => opt.code === selectedProductRegion
    );

    if (!profitProCalculationsFromAPI) {
      return {
        // Product Information -> pi
        pi_sellingPrice: 0,
        pi_totalRevenue: 0,
        pi_quantity: 0,

        // Product Sourcing Cost -> psc
        psc_manufacturingCost: 0,
        psc_shippingCost: 0,
        psc_productLogoCost: 0,
        psc_orderQuantity: 0,
        oc_preLaunchSamples: 0,
        psc_miscCost: 0,
        psc_perUnitCost: 0,
        psc_totalCost: 0,

        // Fulfillment model -> fm
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
        fm_totalCost: 0,
        fm_perUnitCost: 0,

        // Marketing, Advertisement and Ranking Cost -> marc
        marc_marketingCost: 0,
        marc_attributionCost: 0,
        marc_influencerCost: 0,
        marc_miscCost: 0,
        marc_marketingVATCost: 0,
        marc_totalCost: 0,
        marc_perUnitCost: 0,

        // Taxes
        tax_region: taxRegion?.code || "",
        tax_VAT: taxRegion?.vat || 0,
        tax_GST: taxRegion?.gst || 0,
        tax_salesTax: taxRegion?.salesTax || 0,
        tax_miscCost: taxRegion?.misc || 0,
        tax_perUnitCost: 0,
        tax_totalCost: 0,

        // Graphics Cost -> gc
        gc_imagingAndPhotographyCost: 0,
        gc_videographyCost: 0,
        gc_productPackingCost: 0,
        gc_3dAnimationCost: 0,
        gc_miscCost: 0,
        gc_totalCost: 0,
        gc_perUnitCost: 0,

        // Product Feedback Cost -> pfc
        pfc_vineProgramCost: 0,
        pfc_miscCost: 0,
        pfc_totalCost: 0,
        pfc_perUnitCost: 0,
        // Other costs -> oc
        oc_competitorProductSamples: 0,
        oc_employeesCost: 0,
        oc_anyOtherCost: 0,
        oc_totalCost: 0,
        oc_perUnitCost: 0,
      };
    } else {
      const data = profitProCalculationsFromAPI?.data;

      return {
        // Product Information -> pi
        pi_sellingPrice: parseFloat(data.product?.selling_price) || 0,
        pi_totalRevenue: parseFloat(data.product?.total_revenue) || 0,
        pi_quantity: parseFloat(data.product?.quantity) || 0,

        // Product Sourcing Cost -> psc
        psc_manufacturingCost:
          parseFloat(data.sourcing_cost?.manufacturing_cost) || 0,
        psc_shippingCost: parseFloat(data.sourcing_cost?.shipping_cost) || 0,
        psc_productLogoCost: parseFloat(data.sourcing_cost?.logo_box_cost) || 0,
        psc_orderQuantity: parseFloat(data.sourcing_cost?.order_quantity) || 0,
        psc_miscCost: parseFloat(data.sourcing_cost?.miscellaneous_cost) || 0,
        psc_perUnitCost: parseFloat(data.sourcing_cost?.cost_per_unit) || 0,
        psc_totalCost: parseFloat(data.sourcing_cost?.total) || 0,

        // Fulfillment model -> fm
        fm_model: data.fulfillment?.fulfillment_type || "FBA",
        fm_referrfalFees: parseFloat(data.fulfillment?.referral_fees) || 0,
        fm_fbaFulfillmentFees:
          parseFloat(data.fulfillment?.fba_fulfillment_fees) || 0,
        fm_monthlyStorageFees:
          parseFloat(data.fulfillment?.monthly_storage_fees) || 0,
        fm_longTermStorageFees:
          parseFloat(data.fulfillment?.long_term_storage_fees) || 0,
        fm_inboundShippingCost:
          parseFloat(data.fulfillment?.inbound_shipping_cost) || 0,
        fm_returnsRate: parseFloat(data.fulfillment?.returns_refunds_rate) || 0,

        fm_shippingFees: parseFloat(data.fulfillment?.shipping_fee) || 0,
        fm_handlingCost: parseFloat(data.fulfillment?.handling_cost) || 0,
        fm_storageCost: parseFloat(data.fulfillment?.storage_cost) || 0,
        fm_miscCost: parseFloat(data.fulfillment?.miscellaneous_cost) || 0,
        fm_perUnitCost: parseFloat(data.fulfillment?.cost_per_unit) || 0,
        fm_totalCost: parseFloat(data.fulfillment?.total) || 0,

        // Marketing, Advertisement and Ranking Cost -> marc
        marc_marketingCost: parseFloat(data.marketing?.ppc_costs) || 0,
        marc_attributionCost: parseFloat(data.marketing?.attribution_costs) || 0,
        marc_influencerCost:
          parseFloat(data.marketing?.influencer_promotion_costs) || 0,
        marc_miscCost: parseFloat(data.marketing?.miscellaneous_cost) || 0,
        marc_marketingVATCost: parseFloat(data.marketing?.ppc_vat_costs) || 0,
        marc_totalCost: parseFloat(data.marketing?.total) || 0,
        marc_perUnitCost: parseFloat(data.marketing?.cost_per_unit) || 0,

        // Taxes
        tax_region: data.taxes?.region || "",
        tax_VAT: parseFloat(data.taxes?.vat) || 0,
        tax_GST: parseFloat(data.taxes?.gst) || 0,
        tax_salesTax: parseFloat(data.taxes?.sales_tax) || 0,
        tax_miscCost: parseFloat(data.taxes?.miscellaneous_cost) || 0,
        tax_perUnitCost: parseFloat(data.taxes?.total_taxes_unit) || 0,
        tax_totalCost: parseFloat(data.taxes?.total_taxes_qty) || 0,

        // Graphics Cost -> gc
        gc_imagingAndPhotographyCost:
          parseFloat(data.graphics?.imaging_photography) || 0,
        gc_videographyCost: parseFloat(data.graphics?.videography_cost) || 0,
        gc_productPackingCost:
          parseFloat(data.graphics?.product_packaging_cost) || 0,
        gc_3dAnimationCost: parseFloat(data.graphics?.animation_cost) || 0,
        gc_miscCost: parseFloat(data.graphics?.miscellaneous_cost) || 0,
        gc_totalCost: parseFloat(data.graphics?.total) || 0,
        gc_perUnitCost: parseFloat(data.graphics?.cost_per_unit) || 0,

        // Product Feedback Cost -> pfc
        pfc_vineProgramCost: parseFloat(data.vine_misc?.vine_program) || 0,
        pfc_miscCost: parseFloat(data.vine_misc?.miscellaneous_cost) || 0,
        pfc_totalCost: parseFloat(data.vine_misc?.total) || 0,
        pfc_perUnitCost: parseFloat(data.vine_misc?.cost_per_unit) || 0,

        // Other costs -> oc
        oc_competitorProductSamples:
          parseFloat(data.other_costs?.competitor_samples) || 0,
        oc_preLaunchSamples:
          parseFloat(data.other_costs?.pre_launch_samples) || 0,
        oc_employeesCost: parseFloat(data.other_costs?.employee_cost) || 0,
        oc_anyOtherCost: parseFloat(data.other_costs?.other_cost) || 0,
        oc_totalCost: parseFloat(data.other_costs?.total) || 0,
        oc_perUnitCost: parseFloat(data.other_costs?.cost_per_unit) || 0,
      };
    }
  };

  const getDataForMutation = () => {
    // Helper function to safely convert to fixed decimal
    const toFixed = (value: any, decimals: number = 2) => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return isNaN(num) ? '0.00' : num.toFixed(decimals);
    };

    // ✅ Get Shop Analysis price if available
    const shopPrice = shopAnalysisData?.products?.[0]?.price;
    const hasShopPrice = shopPrice !== undefined && shopPrice !== null;

    console.log('💰 getDataForMutation - Shop Analysis Price Check:', {
      hasShopAnalysisData: !!shopAnalysisData,
      hasProducts: !!shopAnalysisData?.products,
      shopPrice: shopPrice,
      hasShopPrice: hasShopPrice,
      formikSellingPrice: formik.values.pi_sellingPrice
    });

    const data: any = {
      name: saveTitle,
      description: saveDescription,
      category:
        selectedCategory ||
        profitProCalculationsFromAPI?.data?.product?.category,
      saveNewCategory: newCategory,

      // Product Information -> pi
      // ✅ Use Shop Analysis price if available, otherwise use formik value
      selling_price: hasShopPrice ? toFixed(shopPrice) : toFixed(formik.values.pi_sellingPrice),
      quantity: formik.values.pi_quantity,
      total_revenue: hasShopPrice ? toFixed(shopPrice * formik.values.pi_quantity) : toFixed(formik.values.pi_totalRevenue),

      // Product Sourcing Cost -> psc
      sourcing_cost: {
        manufacturing_cost: toFixed(formik.values.psc_manufacturingCost),
        shipping_cost: toFixed(formik.values.psc_shippingCost),
        logo_box_cost: toFixed(formik.values.psc_productLogoCost),
        order_quantity: formik.values.psc_orderQuantity,
        miscellaneous_cost: toFixed(formik.values.psc_miscCost),
        cost_per_unit: toFixed(formik.values.psc_perUnitCost),
        total_cost_qty: toFixed(formik.values.psc_totalCost), // redundant after pre-launch samples was moved to Other Costs from Product Sourcing Cost
        total: toFixed(formik.values.psc_totalCost),
      },

      // Fulfillment model -> fm
      fulfillment: {
        fulfillment_type: formik.values.fm_model,
        referral_fees: toFixed(formik.values.fm_referrfalFees),
        fba_fulfillment_fees: toFixed(formik.values.fm_fbaFulfillmentFees),
        monthly_storage_fees: toFixed(formik.values.fm_monthlyStorageFees),
        long_term_storage_fees:
          toFixed(formik.values.fm_longTermStorageFees),
        inbound_shipping_cost: toFixed(formik.values.fm_inboundShippingCost),
        returns_refunds_rate: formik.values.fm_returnsRate,
        shipping_fee: toFixed(formik.values.fm_shippingFees),
        handling_cost: toFixed(formik.values.fm_handlingCost),
        miscellaneous_cost: toFixed(formik.values.fm_miscCost),
        cost_per_unit: toFixed(formik.values.fm_perUnitCost),
        total: toFixed(formik.values.fm_totalCost),
      },

      // Marketing, Advertisement and Ranking Cost -> marc
      marketing: {
        ppc_costs: toFixed(formik.values.marc_marketingCost),
        attribution_costs: toFixed(formik.values.marc_attributionCost),
        influencer_promotion_costs:
          toFixed(formik.values.marc_influencerCost),
        ppc_vat_costs: toFixed(formik.values.marc_marketingVATCost),
        miscellaneous_cost: toFixed(formik.values.marc_miscCost),
        cost_per_unit: toFixed(formik.values.marc_perUnitCost),
        total: toFixed(formik.values.marc_totalCost),
      },

      // Taxes
      taxes: {
        region: formik.values.tax_region,
        vat: toFixed(formik.values.tax_VAT),
        gst: toFixed(formik.values.tax_GST),
        sales_tax: toFixed(formik.values.tax_salesTax),
        miscellaneous_cost: toFixed(formik.values.tax_miscCost),
        total_taxes_unit: formik.values.tax_perUnitCost,
        total_taxes_qty: formik.values.tax_totalCost,
      },

      // Graphics Cost -> gc
      graphics: {
        imaging_photography:
          toFixed(formik.values.gc_imagingAndPhotographyCost),
        videography_cost: toFixed(formik.values.gc_videographyCost),
        product_packaging_cost: toFixed(formik.values.gc_productPackingCost),
        animation_cost: toFixed(formik.values.gc_3dAnimationCost),
        miscellaneous_cost: toFixed(formik.values.gc_miscCost),
        cost_per_unit: toFixed(formik.values.gc_perUnitCost),
        total: toFixed(formik.values.gc_totalCost),
      },

      // Product Feedback Cost -> pfc
      vine_misc: {
        vine_program: toFixed(formik.values.pfc_vineProgramCost),
        miscellaneous_cost: toFixed(formik.values.pfc_miscCost),
        cost_per_unit: toFixed(formik.values.pfc_perUnitCost),
        total: toFixed(formik.values.pfc_totalCost),
      },

      // Other costs -> oc
      other_costs: {
        pre_launch_samples: toFixed(formik.values.oc_preLaunchSamples),
        competitor_samples:
          toFixed(formik.values.oc_competitorProductSamples),
        employee_cost: toFixed(formik.values.oc_employeesCost),
        other_cost: toFixed(formik.values.oc_anyOtherCost),
        cost_per_unit: toFixed(formik.values.oc_perUnitCost),
        total: toFixed(formik.values.oc_totalCost),
      },

      profit_calculation: {
        data: {
          revenue_per_unit: toFixed(profitAndRev.revPerUnt),
          total_revenue: toFixed(profitAndRev.totalRev),

          productSourcing_cost_per_unit:
            toFixed(formik.values.psc_perUnitCost),
          productSourcing_cost_for_qty: toFixed(formik.values.psc_totalCost),
          productSourcing_cost_total: toFixed(formik.values.psc_totalCost),

          fullfilment_cost_per_unit: toFixed(formik.values.fm_perUnitCost),
          fullfilment_cost_total: toFixed(formik.values.fm_totalCost),

          gross_profit_per_unit: toFixed(profitAndRev.grossProfitPerUnit),
          gross_profit_for_qty: toFixed(profitAndRev.grossProfitForQty),

          marketing_cost_per_unit: toFixed(formik.values.marc_perUnitCost),
          marketing_cost_total: toFixed(formik.values.marc_totalCost),

          graphics_cost_per_unit: toFixed(formik.values.gc_perUnitCost),
          graphics_cost_total: toFixed(formik.values.gc_totalCost),

          product_feedback_cost_per_unit:
            toFixed(formik.values.pfc_perUnitCost),
          product_feedback_cost_total: toFixed(formik.values.pfc_totalCost),

          other_costs_per_unit: toFixed(formik.values.oc_perUnitCost),
          other_costs_total: toFixed(formik.values.oc_totalCost),

          net_profit_before_taxes_per_unit:
            toFixed(profitAndRev.netProfitBeforeTaxesPerUnit),
          net_profit_before_taxes_for_qty:
            toFixed(profitAndRev.netProfitBeforeTaxesForQty),

          tax_amount_for_qty: formik.values.tax_totalCost,

          net_profit_after_taxes_per_unit:
            toFixed(profitAndRev.netProfitAfterTaxesPerUnit),
          net_profit_after_taxes_for_qty:
            toFixed(profitAndRev.netProfitAfterTaxesForQty),

          total_net_profit_after_taxes:
            toFixed(profitAndRev.totalNetProfitAfterTaxes),
        },
      },
    };

    if (!saveID) {
      // Include TikTok/Amazon product data
      data.amazon_product = product || amazonProduct || {};

      // ✅ Include Shop Analysis data if available
      console.log('🔍 analysisPriceData - Checking shop analysis data before save:', {
        hasShopAnalysisData: !!shopAnalysisData,
        hasProducts: !!shopAnalysisData?.products,
        productsCount: shopAnalysisData?.products?.length || 0,
        shopAnalysisData: shopAnalysisData,
      });

      if (shopAnalysisData && shopAnalysisData.products && shopAnalysisData.products.length > 0) {
        const firstShopProduct = shopAnalysisData.products[0];

        // ✅ Save shop analysis data in nested structure
        data.amazon_product.shop_analysis = {
          products: shopAnalysisData.products,
          total: shopAnalysisData.total,
          saved_at: new Date().toISOString(),
        };

        // ✅ ALSO save the first product price at root level for easy access
        data.amazon_product.shop_price = firstShopProduct.price;
        data.amazon_product.shop_product_title = firstShopProduct.title;
        data.amazon_product.shop_currency = firstShopProduct.currency;

        // ✅ Override the product's cost field with Shop Analysis price
        data.amazon_product.cost = firstShopProduct.price;
        data.amazon_product.price = `$${firstShopProduct.price.toFixed(2)}`;

        console.log('✅ analysisPriceData - Successfully saving Shop Analysis data:', {
          productsCount: shopAnalysisData.products.length,
          firstShopProduct: firstShopProduct,
          price: firstShopProduct.price,
          priceType: typeof firstShopProduct.price,
          title: firstShopProduct.title,
          currency: firstShopProduct.currency,
          shop_name: firstShopProduct.shop_name,
          allProducts: shopAnalysisData.products,
          shopAnalysisStructure: data.amazon_product.shop_analysis,
          rootLevelPrice: data.amazon_product.shop_price,
          savedCost: data.amazon_product.cost,
          savedPrice: data.amazon_product.price,
        });
      } else {
        console.log('⚠️ analysisPriceData - No shop analysis data to save');
      }

      // Include Alibaba/Supplier product data
      data.alibaba_product = alibabaProduct || {};

      // Include supplier info (for Product Vault display)
      if (supplier) {
        data.supplier_info = {
          // Supplier basic info
          id: supplier.id || supplier.item?.id || '',
          name: supplier.name || supplier.supplier_name || supplier.item?.company?.companyName || '',
          supplier_name: supplier.supplier_name || supplier.name || '',
          location: supplier.location || supplier.item?.company_details?.companyAddress?.country || '',

          // Verification and badges
          verification_status: supplier.verification_status || supplier.verification_badge || '',
          verification_badge: supplier.verification_badge || supplier.verification_status || '',
          is_gold: supplier.is_gold || supplier.item?.company_details?.status?.gold || false,
          verified_supplier: supplier.verified_supplier || supplier.item?.company_details?.status?.verified || false,
          trade_assurance: supplier.trade_assurance || supplier.item?.company_details?.status?.tradeAssurance || false,
          is_assessed: supplier.is_assessed || supplier.item?.company_details?.status?.assessed || false,
          verified_pro: supplier.verified_pro || false,
          alibaba_guaranteed: supplier.alibaba_guaranteed || false,

          // Business info
          years_in_business: supplier.years_in_business || 0,
          main_products: supplier.main_products || '',
          certifications: supplier.certifications || [],

          // Pricing and ordering
          moq: supplier.moq || supplier.minimum_order || 0,
          min_order_quantity: supplier.min_order_quantity || `${supplier.moq || supplier.minimum_order || 0} pieces`,
          minimum_order: supplier.minimum_order || supplier.moq || 0,
          lead_time: supplier.lead_time || 'Contact supplier',
          estimated_price: supplier.estimated_price || supplier.price_per_unit || '',
          price_per_unit: supplier.price_per_unit || supplier.estimated_price || '',

          // Contact and ratings
          contact_method: supplier.contact_method || supplier.contact_url || '',
          contact_url: supplier.contact_url || supplier.contact_method || '',
          response_rate: supplier.response_rate || 'N/A',
          rating: supplier.rating || 0,
          total_transactions: supplier.total_transactions || 0,

          // AI matching
          ai_match_score: supplier.ai_match_score || 0,
          match_explanation: supplier.match_explanation || '',

          // Images
          supplier_product_image: supplier.supplier_product_image || supplier.item?.images?.[0] || '',

          // Raw item data (for future reference)
          _raw_item: supplier._raw_item || supplier.item || {},

          // Source tracking
          source: 'tiktok_trends',
          saved_at: new Date().toISOString(),
        };
      }
    }

    return data;
  };

  const resetFulfillmentModelFields = () => {
    formik.setFieldValue("fm_referrfalFees", 0);

    formik.setFieldValue("fm_shippingFees", 0);
    formik.setFieldValue("fm_handlingCost", 0);
    formik.setFieldValue("fm_storageCost", 0);
    formik.setFieldValue("fm_miscCost", 0);

    formik.setFieldValue("fm_fbaFulfillmentFees", 0);
    formik.setFieldValue("fm_monthlyStorageFees", 0);
    formik.setFieldValue("fm_longTermStorageFees", 0);
    formik.setFieldValue("fm_inboundShippingCost", 0);

    formik.setFieldValue("fm_totalCost", 0);
    formik.setFieldValue("fm_PerUnitCost", 0);

    formik.setFieldValue("fm_returnsRate", 0);
  };

  const calculateTotalRevenue = (
    pi_sellingPrice: number,
    pi_quantity: number
  ) => {
    const ans =
      Number(pi_sellingPrice) * (pi_quantity ? Number(pi_quantity) : 0);

    formik.setFieldValue(
      "pi_totalRevenue",
      ans ? roundOffToTwoDecimals(ans) : 0
    );
  };

  const calculateProductSourcingTotals = (
    psc_manufacturingCost: any,
    psc_shippingCost: any,
    psc_productLogoCost: any,
    psc_orderQuantity: any,
    psc_miscCost: any
  ) => {
    const manufacturingCost = parseFloat(psc_manufacturingCost) || 0;
    const shippingCost = parseFloat(psc_shippingCost) || 0;
    const productLogoCost = parseFloat(psc_productLogoCost) || 0;
    const orderQuantity = parseFloat(psc_orderQuantity) || 0;
    const miscCost = parseFloat(psc_miscCost) || 0;

    const costPerUnit =
      manufacturingCost + shippingCost + productLogoCost + miscCost;
    const totalCost = costPerUnit * orderQuantity;

    formik.setFieldValue("psc_perUnitCost", roundOffToTwoDecimals(costPerUnit));

    formik.setFieldValue("psc_totalCost", roundOffToTwoDecimals(totalCost));
  };

  const calculateFulfillmentTotals = (
    fm_fulfillmentType: string,
    fm_referrfalFees: any,
    fm_fbaFulfillmentFees: any,
    fm_monthlyStorageFees: any,
    fm_longTermStorageFees: any,
    fm_inboundShippingCost: any,
    fm_shippingFees: any,
    fm_handlingCost: any,
    fm_storageCost: any,
    fm_miscCost: any,
    fm_returnsRate: any,
    pi_quantity: any = 0
  ) => {
    const referrfalFees = parseFloat(fm_referrfalFees) || 0;
    const fbaFulfillmentFees = parseFloat(fm_fbaFulfillmentFees) || 0;
    const monthlyStorageFees = parseFloat(fm_monthlyStorageFees) || 0;
    const longTermStorageFees = parseFloat(fm_longTermStorageFees) || 0;
    const inboundShippingCost = parseFloat(fm_inboundShippingCost) || 0;
    const shippingFees = parseFloat(fm_shippingFees) || 0;
    const handlingCost = parseFloat(fm_handlingCost) || 0;
    const storageCost = parseFloat(fm_storageCost) || 0;
    const miscCost = parseFloat(fm_miscCost) || 0;
    const returnsRate = parseFloat(fm_returnsRate) || 0;
    const quantity = parseFloat(pi_quantity) || formik.values.pi_quantity || 0;

    let sum = 0;
    if (fm_fulfillmentType === "FBA") {
      sum =
        referrfalFees +
        fbaFulfillmentFees +
        monthlyStorageFees +
        longTermStorageFees +
        inboundShippingCost +
        miscCost;
    } else {
      sum =
        referrfalFees + shippingFees + handlingCost + storageCost + miscCost;
    }
    // const perUnitCost = sum + (returnsRate / 100) * sum;
    // const totalCost = perUnitCost * (quantity || 0);
    const refundLoss =
      ((quantity || 0) * (returnsRate / 100) * (sum - referrfalFees)) /
      (quantity || 1);
    console.log(refundLoss);
    const perUnitCost = sum + refundLoss;
    console.log(sum);
    const totalCost = perUnitCost * quantity;

    formik.setFieldValue("fm_totalCost", roundOffToTwoDecimals(totalCost));
    formik.setFieldValue("fm_PerUnitCost", roundOffToTwoDecimals(perUnitCost));
    formik.setFieldValue("fm_refundLoss", roundOffToTwoDecimals(refundLoss)); // Per unit refund loss
  };
  const calculateMarketingTotals = (
    marc_marketingCost: any,
    marc_attributionCost: any,
    marc_influencerCost: any,
    marc_miscCost: any,
    marc_marketingVATCost: any,
    pi_quantity: any = 0
  ) => {
    const marketingCost = parseFloat(marc_marketingCost) || 0;
    const attributionCost = parseFloat(marc_attributionCost) || 0;
    const influencerCost = parseFloat(marc_influencerCost) || 0;
    const miscCost = parseFloat(marc_miscCost) || 0;
    const marketingVATCost = parseFloat(marc_marketingVATCost) || 0;
    const quantity = parseFloat(pi_quantity) || formik.values.pi_quantity || 0;

    const totalCost =
      marketingCost +
      attributionCost +
      influencerCost +
      miscCost +
      marketingVATCost;
    const perUnitCost = totalCost / (quantity || 1); // Avoid division by zero

    formik.setFieldValue("marc_totalCost", roundOffToTwoDecimals(totalCost));
    formik.setFieldValue(
      "marc_perUnitCost",
      roundOffToTwoDecimals(perUnitCost)
    );
  };

  const calculateTaxes = (
    tax_VAT: any,
    tax_GST: any,
    tax_salesTax: any,
    tax_miscCost: any,
    pi_sellingPrice: any = 0,
    pi_quantity: any = 0
  ) => {
    const vat = parseFloat(tax_VAT) || 0;
    const gst = parseFloat(tax_GST) || 0;
    const salesTax = parseFloat(tax_salesTax) || 0;
    const miscCost = parseFloat(tax_miscCost) || 0;
    const sellingPrice =
      parseFloat(pi_sellingPrice) || formik.values.pi_sellingPrice || 0;
    const quantity = parseFloat(pi_quantity) || formik.values.pi_quantity || 0;

    const perUnitTotal =
      (vat / 100) * sellingPrice +
      (gst / 100) * sellingPrice +
      (salesTax / 100) * sellingPrice;

    const taxForQty = perUnitTotal * quantity + miscCost;

    formik.setFieldValue(
      "tax_perUnitCost",
      roundOffToTwoDecimals(perUnitTotal)
    );
    formik.setFieldValue("tax_totalCost", roundOffToTwoDecimals(taxForQty));
  };

  const calculateGraphicsCost = (
    gc_imagingAndPhotographyCost: any,
    gc_videographyCost: any,
    gc_productPackingCost: any,
    gc_3dAnimationCost: any,
    gc_miscCost: any,
    pi_quantity: any = 0
  ) => {
    const imagingAndPhotographyCost =
      parseFloat(gc_imagingAndPhotographyCost) || 0;
    const videographyCost = parseFloat(gc_videographyCost) || 0;
    const productPackingCost = parseFloat(gc_productPackingCost) || 0;
    const animationCost = parseFloat(gc_3dAnimationCost) || 0;
    const miscCost = parseFloat(gc_miscCost) || 0;
    const quantity = parseFloat(pi_quantity) || formik.values.pi_quantity || 0;

    const totalGraphicsCost =
      imagingAndPhotographyCost +
      videographyCost +
      productPackingCost +
      animationCost +
      miscCost;

    const gc_perUnitCost = totalGraphicsCost / (quantity || 1); // Avoid division by zero

    formik.setFieldValue(
      "gc_totalCost",
      roundOffToTwoDecimals(totalGraphicsCost)
    );
    formik.setFieldValue(
      "gc_perUnitCost",
      roundOffToTwoDecimals(gc_perUnitCost)
    );
  };

  const calculateProductFeedbackTotals = (
    pfc_vineProgramCost: any,
    pfc_miscCost: any,
    pi_quantity: any = 0
  ) => {
    const vineProgramCost = parseFloat(pfc_vineProgramCost) || 0;
    const miscCost = parseFloat(pfc_miscCost) || 0;
    const quantity = parseFloat(pi_quantity) || formik.values.pi_quantity || 0;

    const totalCost = vineProgramCost + miscCost;
    const perUnitCost = totalCost / (quantity || 1); // Avoid division by zero

    formik.setFieldValue("pfc_totalCost", roundOffToTwoDecimals(totalCost));
    formik.setFieldValue("pfc_perUnitCost", roundOffToTwoDecimals(perUnitCost));
  };

  const calculateOtherCostsTotals = (
    oc_competitorProductSamples: any,
    oc_employeesCost: any,
    oc_anyOtherCost: any,
    oc_preLaunchSamples: any,
    pi_quantity: any = 0
  ) => {
    const preLaunchSamples = parseFloat(oc_preLaunchSamples) || 0;
    const competitorProductSamples =
      parseFloat(oc_competitorProductSamples) || 0;
    const employeesCost = parseFloat(oc_employeesCost) || 0;
    const anyOtherCost = parseFloat(oc_anyOtherCost) || 0;
    const quantity = parseFloat(pi_quantity) || formik.values.pi_quantity || 0;

    const totalCost =
      competitorProductSamples +
      employeesCost +
      anyOtherCost +
      preLaunchSamples;

    const perUnitCost = totalCost / (quantity || 1); // Avoid division by zero

    formik.setFieldValue("oc_totalCost", roundOffToTwoDecimals(totalCost));
    formik.setFieldValue("oc_perUnitCost", roundOffToTwoDecimals(perUnitCost));
  };

  const calculateFinalProfitAndRevenue = (values: any) => {
    setProfitAndRev((prevState: any) => {
      let revPerUnit = prevState.revPerUnt; //Revenue (Excl. Taxes) per Unit
      let totalRev = prevState.totalRev; // Total Revenue (Excl. Taxes)
      let totalCostPerUnit = prevState.totalCostPerUnit; //Total Cost (FBA/FBM) per Unit
      let totalCostForQty = prevState.totalCostForQty; //Total cost (FBA/FBM) for Qty
      let perUnitTotal = prevState.perUnitTotal; // Per Unit Total (Excl. Taxes)
      let grossProfitPerUnit = prevState.grossProfitPerUnit; // Gross Profit Per Unit
      let grossProfitForQty = prevState.grossProfitForQty; // Gross Profit per Qty

      let netProfitBeforeTaxesPerUnit = prevState.netProfitBeforeTaxesPerUnit;
      let netProfitBeforeTaxesForQty = prevState.netProfitBeforeTaxesForQty;

      let netProfitAfterTaxesPerUnit = prevState.netProfitAfterTaxesPerUnit;
      let netProfitAfterTaxesForQty = prevState.netProfitAfterTaxesForQty;
      const refundLoss = parseFloat(values.fm_refundLoss) || 0; // get refundLoss here

      if (values.pi_totalRevenue && values.pi_quantity) {
        revPerUnit = values.pi_totalRevenue / values.pi_quantity;
        totalRev = values.pi_totalRevenue;
      }

      if (values.fm_totalCost && values.psc_orderQuantity) {
        totalCostPerUnit = values.fm_totalCost / values.psc_orderQuantity;
        totalCostForQty = values.fm_totalCost;
      }

      if (
        values.psc_totalCost &&
        values.psc_orderQuantity &&
        values.pi_quantity
      ) {
        grossProfitForQty =
          totalRev - values.psc_totalCost - values.fm_totalCost;
        grossProfitForQty = grossProfitForQty;
        grossProfitPerUnit = grossProfitForQty / values.pi_quantity;

        netProfitBeforeTaxesPerUnit =
          grossProfitPerUnit -
          values.marc_totalCost / values.psc_orderQuantity -
          values.gc_totalCost / values.psc_orderQuantity -
          values.pfc_totalCost / values.psc_orderQuantity -
          values.oc_totalCost / values.psc_orderQuantity;

        netProfitBeforeTaxesForQty =
          grossProfitForQty -
          values.marc_totalCost -
          values.gc_totalCost -
          values.pfc_totalCost -
          values.oc_totalCost;
      } else if (
        values.psc_totalCost === 0 &&
        values.psc_orderQuantity === 0 &&
        values.pi_quantity === 0
      ) {
        grossProfitForQty = 0;
      } else {
        grossProfitForQty =
          totalRev - values.psc_totalCost - values.fm_totalCost;
      }

      //
      if (values.tax_totalCost >= 0) {
        // Calculate total net profit after taxes
        netProfitAfterTaxesForQty =
          netProfitBeforeTaxesForQty - values.tax_totalCost;
        // Avoid division by zero
        if (values.psc_orderQuantity > 0) {
          netProfitAfterTaxesPerUnit =
            netProfitAfterTaxesForQty / values.psc_orderQuantity;
        } else {
          netProfitAfterTaxesPerUnit = 0;
          netProfitAfterTaxesForQty = 0;

        }
      } else {
        // Handle invalid tax cost
        netProfitAfterTaxesForQty = 0;
        netProfitAfterTaxesPerUnit = 0;
      }

      return {
        revPerUnt: roundOffToTwoDecimals(revPerUnit),
        totalRev: roundOffToTwoDecimals(totalRev),

        totalCostPerUnit: roundOffToTwoDecimals(totalCostPerUnit),
        totalCostForQty: roundOffToTwoDecimals(totalCostForQty),

        grossProfitPerUnit: roundOffToTwoDecimals(grossProfitPerUnit),
        grossProfitForQty: roundOffToTwoDecimals(grossProfitForQty),

        netProfitBeforeTaxesPerUnit: roundOffToTwoDecimals(
          netProfitBeforeTaxesPerUnit
        ),
        netProfitBeforeTaxesForQty: roundOffToTwoDecimals(
          netProfitBeforeTaxesForQty
        ),

        netProfitAfterTaxesPerUnit: roundOffToTwoDecimals(
          netProfitAfterTaxesPerUnit
        ),
        netProfitAfterTaxesForQty: roundOffToTwoDecimals(
          netProfitAfterTaxesForQty
        ), // REDUNDANT AFTER Pre-Launch Prices is moved to others from PSC

        totalNetProfitAfterTaxes: roundOffToTwoDecimals(
          netProfitAfterTaxesForQty
        ),
      };
    });
  };

  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: () => {
      setIsPopupOpen(true);
    },
  });
  useEffect(() => {
    if (Object.keys(scannerSelectedSupplier).length > 0) {
      setAmazonProduct(scannerSelectedSupplier?.amazonProduct);
      setAlibabaProduct(scannerSelectedSupplier?.alibabaProduct);
      setVisualSearchImageURL(scannerSelectedSupplier?.visualSearchImageURL);
      setIsComingFromMatcher(true);
    } else {
      setAmazonProduct(null);
      setAlibabaProduct(null);
      setVisualSearchImageURL(null);
      setIsComingFromMatcher(false);
    }
  }, [scannerSelectedSupplier]);

  // On change of any of the formik values, calculate the final profit and revenue
  useEffect(() => {
    calculateFinalProfitAndRevenue(formik.values);
  }, [formik.values]);

  useEffect(() => {
    if (!isLoadingProfitProCalculations && profitProCalculationsFromAPI) {
      calculateFinalProfitAndRevenue(getInitialValues());

      setSaveTitle(profitProCalculationsFromAPI.data.name);
      setSaveDescription(profitProCalculationsFromAPI.data.description);
      formik.setValues(getInitialValues()); // When we set the values of fields, the final profit and revenue is calculated automatically due to the useEffect hook above

      setAmazonProduct(
        profitProCalculationsFromAPI.data.product.amazon_product
      );
      setAlibabaProduct(
        profitProCalculationsFromAPI.data.product.alibaba_product
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingProfitProCalculations]);

  useEffect(() => {
    const error = amazonProductError as AxiosError;
    if (error) {
      if (error.status === 402) {
        let remainingQuota = (error.response?.data as any).remaining_searches;
        remainingQuota = remainingQuota ? +remainingQuota : null;
        toast.error(
          "You have already exceeded your search quota. Please upgrade your plan or purchase more searches."
        );
        updateQuota(remainingQuota);
      }
      // else {
      //   toast.error("No Product Found with this ASIN");
      // }
    }
  }, [amazonProductError]);

  useEffect(() => {
    // If the search button is clicked, the API is called.
    // If the API is called, the product retrieved from the API is set to the state.
    if (amazonProductFromAPI) {
      updateQuota(amazonProductFromAPI.remaining_quota);
      setAmazonProduct(amazonProductFromAPI);
      setAlibabaProduct(null);
    }
  }, [amazonProductFromAPI]);

  useEffect(() => {
    if (saveID) {
      setIsComingFromMatcher(true);
    }
  }, [saveID]);
  // useEffect(() => {
  //   if (
  //     !isComingFromMatcher &&
  //     !checkAccess(EAccessTypes.access_to_net_profit)
  //   ) {
  //     navigate("/settings/subscription");
  //   }
  // }, [checkAccess]);

  // Don't render if modal is not open
  if (!isOpen) return null;

  // Debug: Log product and supplier data
  console.log('🔍 Product data in modal:', product);
  console.log('🔍 Product image URLs:', {
    image_url: product?.image_url,
    cover_url: product?.cover_url,
    product_photo: product?.data?.product_photo
  });
  console.log('🔍 Supplier data in modal:', supplier);

  return (
    <>
      {/* Full-screen modal backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-80 flex items-center justify-center z-50 p-0">
        {/* Full-screen modal container */}
        <div className="bg-white dark:bg-gray-900 w-full h-full overflow-y-auto">
          {/* Modal Header with Close Button */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Profit Calculator
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Product and Supplier Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Left Side - Product Details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Details
                </h3>
                {product ? (
                  <div className="space-y-4">
                    {/* Product Image and Name */}
                    <div className="flex gap-4">
                      <img
                        src={product.image_url || product.cover_url || product.data?.product_photo || 'https://via.placeholder.com/96x96?text=Product'}
                        alt={product.title || product.data?.product_title || 'Product'}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600 flex-shrink-0"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96x96?text=Product';
                        }}
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                          {product.url_title || product.data?.product_title || 'Product Name'}
                        </h5>
                      </div>
                    </div>

                    {/* Product Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {(product.price !== undefined || product.data?.product_price) && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            ${typeof product.price === 'number' ? product.price.toFixed(2) : (product.price || product.data?.product_price)}
                          </p>
                        </div>
                      )}

                      {(product.rating || product.data?.product_star_rating) && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {product.rating || product.data?.product_star_rating}
                          </p>
                        </div>
                      )}

                      {(product.review_count || product.data?.product_num_ratings) && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Reviews</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {(product.review_count || product.data?.product_num_ratings || 0).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* First E-commerce Category */}
                      {(product.category || product.first_ecom_category?.value || (product.data?.category_path && product.data.category_path.length > 0)) && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                            {product.category || product.first_ecom_category?.value || product.data?.category_path[product.data.category_path.length - 1]?.name}
                          </p>
                        </div>
                      )}

                      {/* Second E-commerce Category */}
                      {product.second_ecom_category?.value && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Sub-Category</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                            {product.second_ecom_category.value}
                          </p>
                        </div>
                      )}

                      {/* Third E-commerce Category */}
                      {product.third_ecom_category?.value && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Sub-Sub-Category</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                            {product.third_ecom_category.value}
                          </p>
                        </div>
                      )}

                      {(product.sales_count || product.data?.sales_volume) && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Sales</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {(product.sales_count || product.data?.sales_volume || '').toLocaleString()}
                          </p>
                        </div>
                      )}

                      {product.seller_name && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Seller</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                            {product.seller_name}
                          </p>
                        </div>
                      )}

                      {/* Impression */}
                      {product.impression && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Impressions</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.impression.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {(product.views_count || product.impression) && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {(product.views_count || product.impression || 0).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Likes */}
                      {(product.likes_count || product.like) && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Likes</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {(product.likes_count || product.like || 0).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Share */}
                      {product.share && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Shares</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.share.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Comment */}
                      {product.comment && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Comments</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.comment.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Post */}
                      {product.post && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Posts</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.post.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Post Change */}
                      {product.post_change && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Post Change</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.post_change}%
                          </p>
                        </div>
                      )}

                      {/* CTR (Click-Through Rate) */}
                      {product.ctr && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">CTR</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.ctr}%
                          </p>
                        </div>
                      )}

                      {/* CVR (Conversion Rate) */}
                      {product.cvr && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">CVR</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.cvr}%
                          </p>
                        </div>
                      )}

                      {/* CPA (Cost Per Acquisition) */}
                      {product.cpa && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">CPA</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            ${product.cpa}
                          </p>
                        </div>
                      )}

                      {/* Cost */}
                      {product.cost && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Cost</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            ${product.cost.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Play Six Rate */}
                      {product.play_six_rate && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">6s Play Rate</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.play_six_rate}%
                          </p>
                        </div>
                      )}

                      {/* E-commerce Type */}
                      {product.ecom_type && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">E-com Type</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.ecom_type.toUpperCase()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      {product.source && (
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full">
                          {product.source === 'tiktok_creative_center' ? 'TikTok Creative' : product.source}
                        </span>
                      )}
                      {product.free_shipping && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                          Free Shipping
                        </span>
                      )}
                      {product.data?.is_amazon_choice && (
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs font-medium rounded-full">
                          Amazon's Choice
                        </span>
                      )}
                      {product.data?.is_prime && (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                          Prime
                        </span>
                      )}
                      {product.data?.climate_pledge_friendly && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                          Climate Pledge Friendly
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No product selected</p>
                )}
              </div>

              {/* Right Side - Supplier Details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Supplier Details
                </h3>
                {supplier ? (
                  <div className="space-y-4">
                    {/* Supplier Image and Name */}
                    <div className="flex gap-4">
                      {(supplier.supplier_product_image || (supplier.item?.images && supplier.item.images.length > 0)) && (
                        <img
                          src={supplier.supplier_product_image || supplier.item?.images[0]}
                          alt={supplier.name || supplier.supplier_name || supplier.item?.title}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                          {supplier.name || supplier.supplier_name || supplier.item?.title}
                        </h4>
                        {(supplier.item?.company?.companyName || supplier.location) && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {supplier.item?.company?.companyName || supplier.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Supplier Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {(supplier.estimated_price || supplier.price_per_unit || (supplier.item?.sku?.def?.priceModule?.priceList && supplier.item.sku.def.priceModule.priceList.length > 0)) && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {supplier.estimated_price || supplier.price_per_unit || `${supplier.item?.sku?.def?.priceModule?.currencyCode || '$'} ${supplier.item?.sku?.def?.priceModule?.priceList[0]?.priceFormatted}`}
                          </p>
                        </div>
                      )}

                      {(supplier.moq || supplier.min_order_quantity || supplier.minimum_order || supplier.item?.sku?.def?.quantityModule?.minOrder) && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">MOQ</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {supplier.moq || supplier.min_order_quantity || supplier.minimum_order || supplier.item?.sku?.def?.quantityModule?.minOrder?.quantityFormatted || supplier.item?.sku?.def?.quantityModule?.minOrder?.quantity} {supplier.item?.sku?.def?.quantityModule?.minOrder?.unit || 'units'}
                          </p>
                        </div>
                      )}

                      {(supplier.years_in_business || supplier.item?.seller_store?.storeAge) && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {supplier.years_in_business ? `${supplier.years_in_business} years` : supplier.item?.seller_store?.storeAge}
                          </p>
                        </div>
                      )}

                      {(supplier.rating || (supplier.item?.seller_store?.storeEvaluates && supplier.item.seller_store.storeEvaluates.length > 0)) && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {supplier.rating || supplier.item?.seller_store?.storeEvaluates[0]?.score}
                          </p>
                        </div>
                      )}

                      {(supplier.response_rate || supplier.item?.company?.companyEmployeesCount) && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{supplier.response_rate ? 'Response Rate' : 'Employees'}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {supplier.response_rate || supplier.item?.company?.companyEmployeesCount}
                          </p>
                        </div>
                      )}

                      {(supplier.location || supplier.item?.company_details?.companyAddress?.country) && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {supplier.location || supplier.item?.company_details?.companyAddress?.country}
                          </p>
                        </div>
                      )}

                      {supplier.lead_time && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Lead Time</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {supplier.lead_time}
                          </p>
                        </div>
                      )}

                      {supplier.ai_match_score && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">AI Match Score</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {supplier.ai_match_score}%
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Main Products / Properties as Tags */}
                    {((supplier.main_products && (Array.isArray(supplier.main_products) ? supplier.main_products.length > 0 : supplier.main_products)) || (supplier.item?.properties?.list && supplier.item.properties.list.length > 0)) && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {supplier.main_products ? 'Main Products' : 'Product Properties'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {supplier.main_products && (
                            Array.isArray(supplier.main_products) ? (
                              supplier.main_products.slice(0, 6).map((product: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full"
                                >
                                  {product}
                                </span>
                              ))
                            ) : (
                              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                                {supplier.main_products}
                              </span>
                            )
                          )}
                          {supplier.item?.properties?.list && supplier.item.properties.list.slice(0, 6).map((prop: any, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full"
                              title={`${prop.name}: ${prop.value}`}
                            >
                              {prop.name}: {prop.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications/Badges */}
                    {((supplier.trade_assurance || supplier.verified_supplier || supplier.is_gold || supplier.is_assessed || supplier.verification_badges) || supplier.item?.company_details?.status) && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Certifications</p>
                        <div className="flex flex-wrap gap-2">
                          {(supplier.verified_supplier || supplier.item?.company_details?.status?.verified) && (
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                          {(supplier.is_gold || supplier.item?.company_details?.status?.gold) && (
                            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Gold Supplier
                            </span>
                          )}
                          {(supplier.trade_assurance || supplier.item?.company_details?.status?.tradeAssurance) && (
                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Trade Assurance
                            </span>
                          )}
                          {(supplier.is_assessed || supplier.item?.company_details?.status?.assessed) && (
                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium rounded-full flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Assessed
                            </span>
                          )}
                          {supplier.verification_badges && Array.isArray(supplier.verification_badges) && supplier.verification_badges.map((badge: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 text-xs font-medium rounded-full flex items-center gap-1"
                            >
                              <Shield className="w-3 h-3" />
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No supplier selected</p>
                )}
              </div>
            </div>

            {/* Calculator Content */}
              {isLoadingProfitProCalculations || isAmazonProductLoading ? (
                <div className="p-6 space-y-6 mt-10 box min-h-screen">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-1/2 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-12 w-1/4 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-12 w-32 bg-gray-400 rounded animate-pulse"></div>
                  </div>
                  {Array.from({ length: 3 }).map((_, sectionIndex) => (
                    <div
                      key={sectionIndex}
                      className="bg-gray-200 rounded-lg p-4 space-y-4"
                    >
                      <div className="h-6 w-1/4 bg-gray-400 rounded animate-pulse"></div>
                      <div className="grid grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, fieldIndex) => (
                          <div
                            key={fieldIndex}
                            className="h-12 bg-gray-300 rounded animate-pulse"
                          ></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Stepper container */}
                  <div className="w-full rounded-md p-3 text-black bg-white dark:bg-[#1A1C1E] dark:text-white">
                    <div className="mt-2 px-3">
                      {isComingFromMatcher && <Stepper currentStep={3} />}
                    </div>
                  </div>

                  <div className="box p-5">
                    {/* Show search for Amazon Product when the user NOT coming from the matcher flow */}
                    {!isComingFromMatcher ? (
                      <div className="flex w-full flex-col gap-y-4 lg:gap-y-0 lg:flex-row gap-x-2 rounded-md text-black">
                        <div className="w-full lg:w-3/5 flex flex-col">
                          <Input
                            containerClassName="w-full"
                            placeholder={"Search ASIN"}
                            value={searchString}
                            onChange={(e) => setSearchString(e.target.value)}
                          />
                        </div>

                        <Select
                          value={country}
                          onValueChange={(value) => setCountry(value)}
                        >
                          <SelectTrigger className="w-full lg:w-1/5 h-[50px] bg-white dark:bg-transparent dark:text-white/80 text-black border border-gray-300 shadow-none">
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            className="bg-white dark:bg-light"
                          >
                            <SelectGroup>
                              <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                {COUNTRY_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    className="cursor-pointer"
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </div>
                            </SelectGroup>
                          </SelectContent>
                        </Select>

                        <div>
                          <Button
                            className="cursor-pointer  p-2 text-sm duration-150 border border-success bg-success text-white ti-btn ti-btn-success-full !rounded-full ti-btn-wave"
                            variant="success"
                            onClick={async () => {
                              if (!searchString || searchString.trim() === "") {
                                toast.error("Please enter ASIN.");
                                return;
                              }
                              productDetailRefetch();
                              // ✅ Quota will be updated from backend response - no hardcoded calculation
                            }}
                            disabled={
                              !quotaDetails.quotaValue ||
                              quotaDetails.quotaValue === 0
                            }
                          >
                            <i className="bi bi-search text-white" />
                            Search Now
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                    <div className="flex justify-end">
                      <div className="flex mt-1">
                        <div
                          onClick={() => {
                            if (saveID) {
                              updateProductsMutate({
                                saveID: saveID,
                                ...getDataForMutation(),
                              });
                            } else {
                              formik.submitForm();
                            }
                          }}
                          className="text-xs cursor-pointer flex bg-success items-center justify-center text-light py-2 px-4 rounded-full font-medium hover:bg-green-600 transition-colors"
                        >
                          <i className="las la-save text-lg pr-2"></i>
                          {saveID ? 'Update Product' : 'Save to Product Vault'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-2 mt-3 lg:flex-row flex-col items-stretch">
                      {amazonProduct ? (
                        <div className="box flex-1 border rounded-md flex flex-col">
                          <div className="font-bold p-4 text-gray-700">
                            <i className="bi bi-journal-bookmark-fill"></i>
                            {"  "}
                            Selected Product
                          </div>
                          <AmazonCard amazonProduct={amazonProduct} />
                        </div>
                      ) : (
                        <>
                          {isComingFromMatcher ? null : (
                            <>
                              {visualSearchImageURL ? (
                                <div className="flex w-full items-center justify-between rounded-md border border-primary bg-white p-2">
                                  <img
                                    src={visualSearchImageURL}
                                    alt="Visual Search Image"
                                    className="w-full"
                                  />
                                </div>
                              ) : null}
                            </>
                          )}
                        </>
                      )}

                      {/* Alibaba product card */}
                      {alibabaProduct ? (
                        <div className="box flex-1 border rounded-md flex flex-col">
                          <div className="font-bold p-4 text-gray-700">
                            <i className="bi bi-journal-bookmark-fill"></i>
                            {"  "}
                            Selected Supplier
                          </div>
                          <AlibabaCard alibabaProduct={alibabaProduct} />
                        </div>
                      ) : null}
                    </div>

                    {/* Form container */}
                    <div className="mt-4 w-full gap-4">
                      {/* Left vertical container */}
                      <form onSubmit={formik.handleSubmit} className="w-full">
                        {/* Error container */}
                        {Object.keys(formik.errors).length > 0 ? (
                          <div className="mb-2 rounded-md bg-white p-3 text-red-500">
                            <ul>
                              {Object.values(formik.errors).map(
                                (error, index) => (
                                  <li key={index}>{error as string}</li>
                                )
                              )}
                            </ul>
                          </div>
                        ) : (
                          <></>
                        )}
                        {/* Form container */}
                        <div className="relative group w-fit">
                          <p className="text-gray-600 dark:text-white text-[1rem] cursor-pointer font-bold mt-[-5px]  mb-4 px-1">
                            Calculate your Profit
                          </p>
                          <span className="absolute top-1/2 left-full translate-y-[-50%] ml-2 hidden group-hover:block bg-[rgba(250,250,245,0.9)] text-gray-900 text-xs font-medium px-2 py-1 rounded shadow-sm z-10 w-[350px] whitespace-normal border">
                            <strong className="block mb-1">
                              Input Costs & Prices — Let MarginMax Do the Rest
                            </strong>
                            Please input cost and price details so MarginMax can
                            automatically calculate your profit at every step.
                            Simulate pricing easily—know your profit, we will do
                            the math!
                          </span>
                        </div>

                        <div className="flex w-full flex-col">
                          {/* Product Information Section */}
                          <div className="box !mb-0">
                            <div className="box-header border bg-blue-900 !py-3">
                              <div className="box-title !text-white">
                                <i className="ti ti-anchor text-[1.2rem] me-2"></i>
                                Product Revenue
                              </div>
                            </div>
                            <div className="flex flex-col lg:flex-row">
                              <div className="p-5 w-full lg:w-4/6 grid  grid-cols-1 xl:grid-cols-4 gap-2">
                                {/* Selling price */}
                                <FormInput
                                  label="Selling Price"
                                  className="flex flex-col justify-end"
                                  placeholder=""
                                  prefix="$"
                                  required
                                  type="number"
                                  error={
                                    formik.errors.pi_sellingPrice &&
                                      formik.submitCount > 0
                                      ? (formik.errors.pi_sellingPrice as string)
                                      : ""
                                  }
                                  onFocus={(e) => e.target.select()}
                                  {...formik.getFieldProps("pi_sellingPrice")}
                                  onChange={(e) => {
                                    formik.handleChange(e);

                                    const sellingPricePerUnit = parseFloat(
                                      e.target.value
                                    );
                                    // ----------------------- Total Revenue -----------------------

                                    const { pi_quantity } = formik.values;

                                    calculateTotalRevenue(
                                      sellingPricePerUnit,
                                      pi_quantity
                                    );

                                    // ----------------------- Taxes -----------------------
                                    const {
                                      tax_VAT,
                                      tax_GST,
                                      tax_salesTax,
                                      tax_miscCost,
                                    } = formik.values;

                                    calculateTaxes(
                                      tax_VAT,
                                      tax_GST,
                                      tax_salesTax,
                                      tax_miscCost,
                                      sellingPricePerUnit,
                                      pi_quantity
                                    );
                                  }}
                                />
                                {/* Quantity */}
                                <FormInput
                                  label="Product Quantity"
                                  placeholder=""
                                  className="flex flex-col justify-end"
                                  required
                                  type="number"
                                  error={
                                    formik.errors.pi_quantity &&
                                      formik.submitCount > 0
                                      ? (formik.errors.pi_quantity as string)
                                      : ""
                                  }
                                  onFocus={(e) => e.target.select()}
                                  {...formik.getFieldProps("pi_quantity")}
                                  onChange={(e) => {
                                    let quantity = parseFloat(e.target.value);

                                    // The selling quantity can not be more than the quantity of products sourced.
                                    // if (
                                    //   quantity > formik.values.psc_orderQuantity
                                    // ) {
                                    //   quantity = formik.values.psc_orderQuantity;
                                    //   e.target.value =
                                    //     formik.values.psc_orderQuantity.toString();

                                    //   toast.warning(
                                    //     "Selling quantity can not be more than the quantity of products sourced."
                                    //   );
                                    // }

                                    formik.handleChange(e);

                                    // ----------------------- Total Revenue -----------------------

                                    const { pi_sellingPrice } = formik.values;

                                    calculateTotalRevenue(
                                      pi_sellingPrice,
                                      quantity
                                    );

                                    // ----------------------- Fulfillment Costs -----------------------
                                    const {
                                      fm_model,
                                      fm_returnsRate,
                                      fm_fbaFulfillmentFees,
                                      fm_handlingCost,
                                      fm_inboundShippingCost,
                                      fm_longTermStorageFees,
                                      fm_miscCost,
                                      fm_monthlyStorageFees,
                                      fm_referrfalFees,
                                      fm_shippingFees,
                                      fm_storageCost,
                                    } = formik.values;

                                    calculateFulfillmentTotals(
                                      fm_model,
                                      fm_referrfalFees,
                                      fm_fbaFulfillmentFees,
                                      fm_monthlyStorageFees,
                                      fm_longTermStorageFees,
                                      fm_inboundShippingCost,
                                      fm_shippingFees,
                                      fm_handlingCost,
                                      fm_storageCost,
                                      fm_miscCost,
                                      fm_returnsRate,
                                      quantity
                                    );

                                    // ----------------------- Marketing Costs -----------------------

                                    const {
                                      marc_marketingCost,
                                      marc_influencerCost,
                                      marc_miscCost,
                                      marc_attributionCost,
                                      marc_marketingVATCost,
                                    } = formik.values;

                                    calculateMarketingTotals(
                                      marc_marketingCost,
                                      marc_attributionCost,
                                      marc_influencerCost,
                                      marc_miscCost,
                                      marc_marketingVATCost,
                                      quantity
                                    );

                                    // ----------------------- Graphics Costs -----------------------
                                    const {
                                      gc_imagingAndPhotographyCost,
                                      gc_videographyCost,
                                      gc_productPackingCost,
                                      gc_3dAnimationCost,
                                      gc_miscCost,
                                    } = formik.values;

                                    calculateGraphicsCost(
                                      gc_imagingAndPhotographyCost,
                                      gc_videographyCost,
                                      gc_productPackingCost,
                                      gc_3dAnimationCost,
                                      gc_miscCost,
                                      quantity
                                    );

                                    // ----------------------- Product Feedback Costs -----------------------
                                    const { pfc_vineProgramCost, pfc_miscCost } =
                                      formik.values;

                                    calculateProductFeedbackTotals(
                                      pfc_vineProgramCost,
                                      pfc_miscCost,
                                      quantity
                                    );

                                    // ----------------------- Other Costs -----------------------
                                    const {
                                      oc_competitorProductSamples,
                                      oc_employeesCost,
                                      oc_anyOtherCost,
                                      oc_preLaunchSamples,
                                    } = formik.values;

                                    calculateOtherCostsTotals(
                                      oc_competitorProductSamples,
                                      oc_employeesCost,
                                      oc_anyOtherCost,
                                      oc_preLaunchSamples,
                                      quantity
                                    );

                                    // ----------------------- Taxes -----------------------
                                    const {
                                      tax_VAT,
                                      tax_GST,
                                      tax_salesTax,
                                      tax_miscCost,
                                    } = formik.values;

                                    calculateTaxes(
                                      tax_VAT,
                                      tax_GST,
                                      tax_salesTax,
                                      tax_miscCost,
                                      pi_sellingPrice,
                                      quantity
                                    );
                                  }}
                                />
                              </div>
                              <div
                                className="p-3 grid  w-[190px] lg:w-2/6 grid-cols-1 lg:grid-cols-2 gap-3 bg-gray-200 dark:bg-black "
                                style={{ borderLeft: "2px solid #f4f4f4" }}
                              >
                                {/* Selling price */}
                                <FormInput
                                  label="Product Revenue/Unit"
                                  className="flex flex-col"
                                  placeholder=""
                                  prefix="$"
                                  required
                                  type="number"
                                  error={
                                    formik.errors.pi_sellingPrice &&
                                      formik.submitCount > 0
                                      ? (formik.errors.pi_sellingPrice as string)
                                      : ""
                                  }
                                  onFocus={(e) => e.target.select()}
                                  {...formik.getFieldProps("pi_sellingPrice")}
                                  onChange={(e) => {
                                    formik.handleChange(e);

                                    const sellingPricePerUnit = parseFloat(
                                      e.target.value
                                    );
                                    // ----------------------- Total Revenue -----------------------

                                    const { pi_quantity } = formik.values;

                                    calculateTotalRevenue(
                                      sellingPricePerUnit,
                                      pi_quantity
                                    );

                                    // ----------------------- Taxes -----------------------
                                    const {
                                      tax_VAT,
                                      tax_GST,
                                      tax_salesTax,
                                      tax_miscCost,
                                    } = formik.values;

                                    calculateTaxes(
                                      tax_VAT,
                                      tax_GST,
                                      tax_salesTax,
                                      tax_miscCost,
                                      sellingPricePerUnit,
                                      pi_quantity
                                    );
                                  }}
                                />
                                {/* Total Revenue */}
                                <FormInput
                                  label="Total Product Revenue"
                                  placeholder=""
                                  className="flex flex-col"
                                  prefix="$"
                                  type="number"
                                  disabled
                                  required
                                  error={
                                    formik.errors.pi_totalRevenue &&
                                      formik.submitCount > 0
                                      ? formik.errors.pi_totalRevenue
                                      : ""
                                  }
                                  onFocus={(e) => e.target.select()}
                                  {...formik.getFieldProps("pi_totalRevenue")}
                                />
                              </div>
                            </div>
                          </div>
                          {/* Product Sourcing Cost */}
                          <div className="box !mb-0">
                            <div className="box-header border bg-blue-900 !py-3">
                              <div className="box-title !text-white">
                                <i className="ti ti-anchor text-[1.2rem] me-2"></i>
                                Product Sourcing Cost
                              </div>
                            </div>
                            <div className="flex flex-col lg:flex-row">
                              <div className="p-5 w-full lg:w-4/6 grid grid-cols-1 xl:grid-cols-4 gap-2">
                                {/* Manufacturing Cost */}
                                <FormInput
                                  className="flex flex-col justify-end"
                                  label="Product Manufacturing"
                                  placeholder=""
                                  prefix="$"
                                  required
                                  onFocus={(e) => e.target.select()}
                                  type="number"
                                  error={
                                    formik.errors.psc_manufacturingCost &&
                                      formik.submitCount > 0
                                      ? (formik.errors
                                        .psc_manufacturingCost as string)
                                      : ""
                                  }
                                  {...formik.getFieldProps(
                                    "psc_manufacturingCost"
                                  )}
                                  onChange={(e) => {
                                    formik.handleChange(e);

                                    const manufacturingCost = parseFloat(
                                      e.target.value
                                    );

                                    const {
                                      psc_shippingCost,
                                      psc_productLogoCost,
                                      psc_miscCost,
                                      psc_orderQuantity,
                                    } = formik.values;

                                    calculateProductSourcingTotals(
                                      manufacturingCost,
                                      psc_shippingCost,
                                      psc_productLogoCost,
                                      psc_orderQuantity,
                                      psc_miscCost
                                    );
                                  }}
                                />

                                {/* Shipping Cost */}
                                <FormInput
                                  className="flex flex-col justify-end"
                                  label="Shipping Cost"
                                  placeholder=""
                                  prefix="$"
                                  type="number"
                                  required
                                  error={
                                    formik.errors.psc_shippingCost &&
                                      formik.submitCount > 0
                                      ? (formik.errors.psc_shippingCost as string)
                                      : ""
                                  }
                                  onFocus={(e) => e.target.select()}
                                  {...formik.getFieldProps("psc_shippingCost")}
                                  onChange={(e) => {
                                    formik.handleChange(e);

                                    const shippingCost = parseFloat(
                                      e.target.value
                                    );

                                    const {
                                      psc_manufacturingCost,
                                      psc_productLogoCost,
                                      psc_miscCost,
                                      psc_orderQuantity,
                                    } = formik.values;

                                    calculateProductSourcingTotals(
                                      psc_manufacturingCost,
                                      shippingCost,
                                      psc_productLogoCost,
                                      psc_orderQuantity,
                                      psc_miscCost
                                    );
                                  }}
                                />
                                {/* Miscellaneous Cost */}
                                <FormInput
                                  label="Other Sourcing Costs"
                                  className="flex flex-col justify-end"
                                  placeholder=""
                                  prefix="$"
                                  type="number"
                                  error={
                                    formik.errors.psc_miscCost &&
                                      formik.submitCount > 0
                                      ? (formik.errors.psc_miscCost as string)
                                      : ""
                                  }
                                  onFocus={(e) => e.target.select()}
                                  {...formik.getFieldProps("psc_miscCost")}
                                  onChange={(e) => {
                                    formik.handleChange(e);

                                    const miscCost = parseFloat(e.target.value);

                                    const {
                                      psc_manufacturingCost,
                                      psc_shippingCost,
                                      psc_productLogoCost,
                                      psc_orderQuantity,
                                    } = formik.values;

                                    calculateProductSourcingTotals(
                                      psc_manufacturingCost,
                                      psc_shippingCost,
                                      psc_productLogoCost,
                                      psc_orderQuantity,
                                      miscCost
                                    );
                                  }}
                                />

                                {/* Order Quantity */}
                                <FormInput
                                  label="Order Quantity"
                                  className="flex flex-col justify-end"
                                  placeholder=""
                                  type="number"
                                  min={0}
                                  required
                                  onFocus={(e) => e.target.select()}
                                  error={
                                    formik.errors.psc_orderQuantity &&
                                      formik.submitCount > 0
                                      ? (formik.errors
                                        .psc_orderQuantity as string)
                                      : ""
                                  }
                                  {...formik.getFieldProps("psc_orderQuantity")}
                                  onChange={(e) => {
                                    formik.handleChange(e);

                                    const orderQuantity = parseFloat(
                                      e.target.value
                                    );

                                    const {
                                      psc_manufacturingCost,
                                      psc_productLogoCost,
                                      psc_miscCost,
                                      psc_shippingCost,
                                    } = formik.values;

                                    calculateProductSourcingTotals(
                                      psc_manufacturingCost,
                                      psc_shippingCost,
                                      psc_productLogoCost,
                                      orderQuantity,
                                      psc_miscCost
                                    );
                                  }}
                                  onBlur={(e) => {
                                    formik.handleBlur(e);

                                    const orderQuantity = parseFloat(
                                      e.target.value
                                    );
                                    if (
                                      orderQuantity < formik.values.pi_quantity
                                    ) {
                                      toast.warning(
                                        "Product sourced quantity should be greater than selling quantity."
                                      );
                                      formik.setFieldValue(
                                        "psc_orderQuantity",
                                        ""
                                      );
                                      // Re-focus on the input field
                                      setTimeout(() => {
                                        e.target.focus();
                                      }, 0);
                                    }
                                  }}
                                />

                                {/* Product Logo / Box Customization / Printing Cost */}
                                {/* <FormInput
                                className="flex flex-col justify-end"
                                label="Product Logo / Box Customization / Printing Cost"
                                placeholder=""
                                prefix="$"
                                type="number"
                                error={
                                  formik.errors.psc_productLogoCost &&
                                  formik.submitCount > 0
                                    ? (formik.errors
                                        .psc_productLogoCost as string)
                                    : ""
                                }
                                {...formik.getFieldProps("psc_productLogoCost")}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                  formik.handleChange(e);

                                  const productLogoCost = parseFloat(
                                    e.target.value
                                  );

                                  const {
                                    psc_manufacturingCost,
                                    psc_shippingCost,
                                    psc_miscCost,
                                    psc_orderQuantity,
                                  } = formik.values;

                                  calculateProductSourcingTotals(
                                    psc_manufacturingCost,
                                    psc_shippingCost,
                                    productLogoCost,
                                    psc_orderQuantity,
                                    psc_miscCost
                                  );
                                }}
                              /> */}
                              </div>
                              <div
                                className="p-4 grid w-full lg:w-2/6 grid-cols-1 lg:grid-cols-2 gap-2 bg-gray-200 dark:bg-black"
                                style={{ borderLeft: "2px solid #f4f4f4" }}
                              >
                                {/* Cost Per Unit (Without Pre-Launch Samples) */}
                                <FormInput
                                  label="Sourcing Cost/Unit"
                                  className="flex flex-col"
                                  placeholder=""
                                  prefix="$"
                                  disabled
                                  type="number"
                                  {...formik.getFieldProps("psc_perUnitCost")}
                                />
                                {/* Total Cost */}
                                <FormInput
                                  label="Total Sourcing Cost"
                                  className="flex flex-col"
                                  placeholder=""
                                  prefix="$"
                                  disabled
                                  type="number"
                                  onFocus={(e) => e.target.select()}
                                  error={
                                    formik.errors.psc_totalCost &&
                                      formik.submitCount > 0
                                      ? (formik.errors.psc_totalCost as string)
                                      : ""
                                  }
                                  {...formik.getFieldProps("psc_totalCost")}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Fulfillment Cost */}
                          <div className="box !mb-0">
                            <div className="box-header border bg-blue-900 !py-3">
                              <div className="box-title !text-white">
                                <i className="ti ti-anchor text-[1.2rem] me-2"></i>
                                Fulfillment Cost
                              </div>
                            </div>
                            <div className="flex flex-col lg:flex-row">
                              <div className="p-5 w-full lg:w-4/6 flex flex-col">
                                {/* Fulfillment Model */}
                                <div className="col-span-4 mb-5 flex flex-col">
                                  <p className="mb-1 text-base font-normal text-dark">
                                    Fulfillment Model
                                    <span className="text-red-500">*</span>
                                  </p>
                                  <div className="flex items-center justify-evenly">
                                    <div className="flex items-center gap-x-2">
                                      <label>FBA</label>
                                      <input
                                        type="radio"
                                        {...formik.getFieldProps("fm_model")}
                                        value={"FBA"}
                                        checked={formik.values.fm_model === "FBA"}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => {
                                          formik.handleChange(e);
                                          resetFulfillmentModelFields();
                                        }}
                                      />
                                    </div>
                                    <div className="flex items-center gap-x-2">
                                      <label>FBM</label>
                                      <input
                                        type="radio"
                                        {...formik.getFieldProps("fm_model")}
                                        value={"FBM"}
                                        onFocus={(e) => e.target.select()}
                                        checked={formik.values.fm_model === "FBM"}
                                        onChange={(e) => {
                                          formik.handleChange(e);
                                          resetFulfillmentModelFields();
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="w-full grid  grid-cols-1 xl:grid-cols-4 gap-2">
                                  {/* Referral fees */}
                                  <FormInput
                                    label="Amazon Fees"
                                    type="number"
                                    className="flex flex-col justify-end"
                                    placeholder=""
                                    prefix="$"
                                    required
                                    onFocus={(e) => e.target.select()}
                                    error={
                                      formik.errors.fm_referrfalFees &&
                                        formik.submitCount > 0
                                        ? (formik.errors
                                          .fm_referrfalFees as string)
                                        : ""
                                    }
                                    {...formik.getFieldProps("fm_referrfalFees")}
                                    onChange={(e) => {
                                      formik.handleChange(e);

                                      const referralFees = parseFloat(
                                        e.target.value
                                      );

                                      const {
                                        fm_model,
                                        fm_fbaFulfillmentFees,
                                        fm_monthlyStorageFees,
                                        fm_longTermStorageFees,
                                        fm_inboundShippingCost,
                                        fm_shippingFees,
                                        fm_handlingCost,
                                        fm_storageCost,
                                        fm_miscCost,
                                        fm_returnsRate,
                                      } = formik.values;

                                      calculateFulfillmentTotals(
                                        fm_model,
                                        referralFees,
                                        fm_fbaFulfillmentFees,
                                        fm_monthlyStorageFees,
                                        fm_longTermStorageFees,
                                        fm_inboundShippingCost,
                                        fm_shippingFees,
                                        fm_handlingCost,
                                        fm_storageCost,
                                        fm_miscCost,
                                        fm_returnsRate
                                      );
                                    }}
                                  />

                                  {/* FBA and FBM dependant fields */}
                                  {formik.values.fm_model === "FBA" ? (
                                    <>
                                      <FormInput
                                        label="Fulfillment Cost"
                                        placeholder=""
                                        className="flex flex-col justify-end"
                                        prefix="$"
                                        type="number"
                                        required
                                        onFocus={(e) => e.target.select()}
                                        error={
                                          formik.errors.fm_fbaFulfillmentFees &&
                                            formik.submitCount > 0
                                            ? (formik.errors
                                              .fm_fbaFulfillmentFees as string)
                                            : ""
                                        }
                                        {...formik.getFieldProps(
                                          "fm_fbaFulfillmentFees"
                                        )}
                                        onChange={(e) => {
                                          formik.handleChange(e);

                                          const fbaFulfillmentFees = parseFloat(
                                            e.target.value
                                          );

                                          const {
                                            fm_model,
                                            fm_referrfalFees,
                                            fm_monthlyStorageFees,
                                            fm_longTermStorageFees,
                                            fm_inboundShippingCost,
                                            fm_shippingFees,
                                            fm_handlingCost,
                                            fm_storageCost,
                                            fm_miscCost,
                                            fm_returnsRate,
                                          } = formik.values;

                                          calculateFulfillmentTotals(
                                            fm_model,
                                            fm_referrfalFees,
                                            fbaFulfillmentFees,
                                            fm_monthlyStorageFees,
                                            fm_longTermStorageFees,
                                            fm_inboundShippingCost,
                                            fm_shippingFees,
                                            fm_handlingCost,
                                            fm_storageCost,
                                            fm_miscCost,
                                            fm_returnsRate
                                          );
                                        }}
                                      />

                                      <FormInput
                                        label="Storage Cost"
                                        placeholder=""
                                        className="flex flex-col justify-end"
                                        prefix="$"
                                        type="number"
                                        required
                                        onFocus={(e) => e.target.select()}
                                        error={
                                          formik.errors.fm_monthlyStorageFees &&
                                            formik.submitCount > 0
                                            ? (formik.errors
                                              .fm_monthlyStorageFees as string)
                                            : ""
                                        }
                                        {...formik.getFieldProps(
                                          "fm_monthlyStorageFees"
                                        )}
                                        onChange={(e) => {
                                          formik.handleChange(e);

                                          const monthlyStorageFees = parseFloat(
                                            e.target.value
                                          );

                                          const {
                                            fm_model,
                                            fm_referrfalFees,
                                            fm_longTermStorageFees,
                                            fm_inboundShippingCost,
                                            fm_shippingFees,
                                            fm_handlingCost,
                                            fm_storageCost,
                                            fm_miscCost,
                                            fm_returnsRate,
                                            fm_fbaFulfillmentFees,
                                          } = formik.values;

                                          calculateFulfillmentTotals(
                                            fm_model,
                                            fm_referrfalFees,
                                            fm_fbaFulfillmentFees,
                                            monthlyStorageFees,
                                            fm_longTermStorageFees,
                                            fm_inboundShippingCost,
                                            fm_shippingFees,
                                            fm_handlingCost,
                                            fm_storageCost,
                                            fm_miscCost,
                                            fm_returnsRate
                                          );
                                        }}
                                      />

                                      <FormInput
                                        label="Inbounding Cost"
                                        placeholder=""
                                        className="flex flex-col justify-end"
                                        prefix="$"
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        error={
                                          formik.errors.fm_longTermStorageFees &&
                                            formik.submitCount > 0
                                            ? (formik.errors
                                              .fm_longTermStorageFees as string)
                                            : ""
                                        }
                                        {...formik.getFieldProps(
                                          "fm_longTermStorageFees"
                                        )}
                                        onChange={(e) => {
                                          formik.handleChange(e);

                                          const longTermStorageFees = parseFloat(
                                            e.target.value
                                          );

                                          const {
                                            fm_model,
                                            fm_referrfalFees,
                                            fm_monthlyStorageFees,
                                            fm_inboundShippingCost,
                                            fm_shippingFees,
                                            fm_handlingCost,
                                            fm_storageCost,
                                            fm_miscCost,
                                            fm_returnsRate,
                                            fm_fbaFulfillmentFees,
                                          } = formik.values;

                                          calculateFulfillmentTotals(
                                            fm_model,
                                            fm_referrfalFees,
                                            fm_fbaFulfillmentFees,
                                            fm_monthlyStorageFees,
                                            longTermStorageFees,
                                            fm_inboundShippingCost,
                                            fm_shippingFees,
                                            fm_handlingCost,
                                            fm_storageCost,
                                            fm_miscCost,
                                            fm_returnsRate
                                          );
                                        }}
                                      />

                                      <FormInput
                                        label="Other FBA Costs"
                                        placeholder=""
                                        className="flex flex-col justify-end"
                                        prefix="$"
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        error={
                                          formik.errors.fm_inboundShippingCost &&
                                            formik.submitCount > 0
                                            ? (formik.errors
                                              .fm_inboundShippingCost as string)
                                            : ""
                                        }
                                        {...formik.getFieldProps(
                                          "fm_inboundShippingCost"
                                        )}
                                        onChange={(e) => {
                                          formik.handleChange(e);

                                          const inboundShippingCost = parseFloat(
                                            e.target.value
                                          );

                                          const {
                                            fm_model,
                                            fm_referrfalFees,
                                            fm_monthlyStorageFees,
                                            fm_longTermStorageFees,
                                            fm_shippingFees,
                                            fm_handlingCost,
                                            fm_storageCost,
                                            fm_miscCost,
                                            fm_returnsRate,
                                            fm_fbaFulfillmentFees,
                                          } = formik.values;

                                          calculateFulfillmentTotals(
                                            fm_model,
                                            fm_referrfalFees,
                                            fm_fbaFulfillmentFees,
                                            fm_monthlyStorageFees,
                                            fm_longTermStorageFees,
                                            inboundShippingCost,
                                            fm_shippingFees,
                                            fm_handlingCost,
                                            fm_storageCost,
                                            fm_miscCost,
                                            fm_returnsRate
                                          );
                                        }}
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <FormInput
                                        label="Shipping Delivery Charges"
                                        placeholder=""
                                        className="flex flex-col justify-end"
                                        prefix="$"
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        error={
                                          formik.errors.fm_shippingFees &&
                                            formik.submitCount > 0
                                            ? (formik.errors
                                              .fm_shippingFees as string)
                                            : ""
                                        }
                                        {...formik.getFieldProps(
                                          "fm_shippingFees"
                                        )}
                                        onChange={(e) => {
                                          formik.handleChange(e);

                                          const shippingFees = parseFloat(
                                            e.target.value
                                          );

                                          const {
                                            fm_model,
                                            fm_referrfalFees,
                                            fm_monthlyStorageFees,
                                            fm_inboundShippingCost,
                                            fm_longTermStorageFees,
                                            fm_handlingCost,
                                            fm_storageCost,
                                            fm_miscCost,
                                            fm_returnsRate,
                                            fm_fbaFulfillmentFees,
                                          } = formik.values;

                                          calculateFulfillmentTotals(
                                            fm_model,
                                            fm_referrfalFees,
                                            fm_fbaFulfillmentFees,
                                            fm_monthlyStorageFees,
                                            fm_longTermStorageFees,
                                            fm_inboundShippingCost,
                                            shippingFees,
                                            fm_handlingCost,
                                            fm_storageCost,
                                            fm_miscCost,
                                            fm_returnsRate
                                          );
                                        }}
                                      />

                                      <FormInput
                                        label="Fulfillment Cost"
                                        placeholder=""
                                        className="flex flex-col justify-end"
                                        prefix="$"
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        error={
                                          formik.errors.fm_handlingCost &&
                                            formik.submitCount > 0
                                            ? (formik.errors
                                              .fm_handlingCost as string)
                                            : ""
                                        }
                                        {...formik.getFieldProps(
                                          "fm_handlingCost"
                                        )}
                                        onChange={(e) => {
                                          formik.handleChange(e);

                                          const handlingCost = parseFloat(
                                            e.target.value
                                          );

                                          const {
                                            fm_model,
                                            fm_referrfalFees,
                                            fm_monthlyStorageFees,
                                            fm_inboundShippingCost,
                                            fm_longTermStorageFees,
                                            fm_shippingFees,
                                            fm_storageCost,
                                            fm_miscCost,
                                            fm_returnsRate,
                                            fm_fbaFulfillmentFees,
                                          } = formik.values;

                                          calculateFulfillmentTotals(
                                            fm_model,
                                            fm_referrfalFees,
                                            fm_fbaFulfillmentFees,
                                            fm_monthlyStorageFees,
                                            fm_longTermStorageFees,
                                            fm_inboundShippingCost,
                                            fm_shippingFees,
                                            handlingCost,
                                            fm_storageCost,
                                            fm_miscCost,
                                            fm_returnsRate
                                          );
                                        }}
                                      />

                                      <FormInput
                                        label="Storage Cost"
                                        placeholder=""
                                        className="flex flex-col justify-end"
                                        prefix="$"
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        error={
                                          formik.errors.fm_storageCost &&
                                            formik.submitCount > 0
                                            ? (formik.errors
                                              .fm_storageCost as string)
                                            : ""
                                        }
                                        {...formik.getFieldProps(
                                          "fm_storageCost"
                                        )}
                                        onChange={(e) => {
                                          formik.handleChange(e);

                                          const storageCost = parseFloat(
                                            e.target.value
                                          );

                                          const {
                                            fm_model,
                                            fm_referrfalFees,
                                            fm_monthlyStorageFees,
                                            fm_inboundShippingCost,
                                            fm_shippingFees,
                                            fm_handlingCost,
                                            fm_longTermStorageFees,
                                            fm_miscCost,
                                            fm_returnsRate,
                                            fm_fbaFulfillmentFees,
                                          } = formik.values;

                                          calculateFulfillmentTotals(
                                            fm_model,
                                            fm_referrfalFees,
                                            fm_fbaFulfillmentFees,
                                            fm_monthlyStorageFees,
                                            fm_longTermStorageFees,
                                            fm_inboundShippingCost,
                                            fm_shippingFees,
                                            fm_handlingCost,
                                            storageCost,
                                            fm_miscCost,
                                            fm_returnsRate
                                          );
                                        }}
                                      />

                                      <FormInput
                                        label="Other FBM Costs"
                                        placeholder=""
                                        className="flex flex-col justify-end"
                                        prefix="$"
                                        onFocus={(e) => e.target.select()}
                                        type="number"
                                        error={
                                          formik.errors.fm_miscCost &&
                                            formik.submitCount > 0
                                            ? (formik.errors
                                              .fm_miscCost as string)
                                            : ""
                                        }
                                        {...formik.getFieldProps("fm_miscCost")}
                                        onChange={(e) => {
                                          formik.handleChange(e);

                                          const miscCost = parseFloat(
                                            e.target.value
                                          );

                                          const {
                                            fm_model,
                                            fm_referrfalFees,
                                            fm_monthlyStorageFees,
                                            fm_inboundShippingCost,
                                            fm_shippingFees,
                                            fm_handlingCost,
                                            fm_storageCost,
                                            fm_longTermStorageFees,
                                            fm_returnsRate,
                                            fm_fbaFulfillmentFees,
                                          } = formik.values;

                                          calculateFulfillmentTotals(
                                            fm_model,
                                            fm_referrfalFees,
                                            fm_fbaFulfillmentFees,
                                            fm_monthlyStorageFees,
                                            fm_longTermStorageFees,
                                            fm_inboundShippingCost,
                                            fm_shippingFees,
                                            fm_handlingCost,
                                            fm_storageCost,
                                            miscCost,
                                            fm_returnsRate
                                          );
                                        }}
                                      />
                                    </>
                                  )}

                                  <SliderInput
                                    value={Number(formik.values.fm_returnsRate)}
                                    name="Returns/Refund Rate (Sellable)%"
                                    error={
                                      formik.errors.fm_returnsRate &&
                                        formik.submitCount > 0
                                        ? (formik.errors.fm_returnsRate as string)
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const returnsRate = parseFloat(
                                        e.target.value
                                      );

                                      formik.setFieldValue(
                                        "fm_returnsRate",
                                        returnsRate
                                      );
                                      formik.handleChange(e);

                                      const {
                                        fm_model,
                                        fm_referrfalFees,
                                        fm_monthlyStorageFees,
                                        fm_inboundShippingCost,
                                        fm_shippingFees,
                                        fm_handlingCost,
                                        fm_storageCost,
                                        fm_miscCost,
                                        fm_longTermStorageFees,
                                        fm_fbaFulfillmentFees,
                                      } = formik.values;

                                      calculateFulfillmentTotals(
                                        fm_model,
                                        fm_referrfalFees,
                                        fm_fbaFulfillmentFees,
                                        fm_monthlyStorageFees,
                                        fm_longTermStorageFees,
                                        fm_inboundShippingCost,
                                        fm_shippingFees,
                                        fm_handlingCost,
                                        fm_storageCost,
                                        fm_miscCost,
                                        returnsRate
                                      );
                                    }}
                                  />

                                  {formik.errors.fm_returnsRate &&
                                    formik.submitCount > 0 ? (
                                    <p className="text-red-500">
                                      {formik.errors.fm_returnsRate as string}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                              <div
                                className="lg:w-2/6 w-full bg-gray-200 dark:bg-black"
                                style={{ borderLeft: "2px solid #f4f4f4" }}
                              >
                                {/* <div className=""> */}
                                <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-2">
                                  <FormInput
                                    label="Cost/Unit"
                                    className="flex flex-col"
                                    placeholder=""
                                    prefix="$"
                                    required
                                    disabled
                                    type="number"
                                    onFocus={(e) => e.target.select()}
                                    error={
                                      formik.errors.fm_totalCost &&
                                        formik.submitCount > 0
                                        ? (formik.errors.fm_perUnitCost as string)
                                        : ""
                                    }
                                    {...formik.getFieldProps("fm_PerUnitCost")}
                                  />
                                  <FormInput
                                    label="Total Cost"
                                    placeholder=""
                                    className="flex flex-col"
                                    prefix="$"
                                    required
                                    disabled
                                    type="number"
                                    onFocus={(e) => e.target.select()}
                                    error={
                                      formik.errors.fm_totalCost &&
                                        formik.submitCount > 0
                                        ? (formik.errors.fm_totalCost as string)
                                        : ""
                                    }
                                    {...formik.getFieldProps("fm_totalCost")}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-12">
                              <div
                                className="lg:col-start-9 mt-8 lg:mt-0 lg:col-span-4 "
                                style={{ backgroundColor: "#f4f4f4" }}
                              >
                                <RevenueCalculationCard
                                  bgColor=""
                                  data={[
                                    {
                                      section: "Gross Profit",
                                      items: [
                                        {
                                          label: "Gross Profit/Unit",
                                          value:
                                            profitAndRev.grossProfitPerUnit ||
                                            0.0,
                                        },
                                        {
                                          label: "Total Gross Profit",
                                          value:
                                            profitAndRev.grossProfitForQty || 0.0,
                                        },
                                      ],
                                    },
                                  ]}
                                />
                              </div>
                            </div>
                          </div>

                          {(checkAccess(EAccessTypes.access_to_net_profit) ||
                            !isComingFromMatcher) && (
                              <div className="relative">
                                {!checkAccess(
                                  EAccessTypes.access_to_net_profit
                                ) && (
                                    <div className="absolute inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center z-10">
                                      <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
                                        <i className="ti ti-lock text-3xl mb-3 text-gray-700"></i>
                                        <p className="text-gray-800 font-semibold text-lg mb-2">
                                          Upgrade your package to access Net Profit
                                        </p>
                                        <p className="text-gray-600 mb-4">
                                          Get access to detailed profit calculations
                                          and analytics
                                        </p>
                                        <Link
                                          to="/settings/subscription"
                                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                          <i className="ti ti-arrow-right mr-2"></i>
                                          Update Subscription
                                        </Link>
                                      </div>
                                    </div>
                                  )}
                                <>
                                  {/* Marketing, Advertisement and Ranking Cost */}
                                  <div className="box !mb-0">
                                    <div className="box-header border bg-blue-900 !py-3">
                                      <div className="box-title !text-white">
                                        <i className="ti ti-anchor text-[1.2rem] me-2"></i>
                                        Marketing and Ads Cost
                                      </div>
                                    </div>
                                    <div className="flex flex-col lg:flex-row">
                                      <div className="p-5 w-full lg:w-4/6 grid  grid-cols-1 xl:grid-cols-4 gap-2">
                                        <FormInput
                                          label="Pay-per-Click(PPC)"
                                          type="number"
                                          className="flex flex-col justify-end"
                                          placeholder=""
                                          prefix="$"
                                          required
                                          onFocus={(e) => e.target.select()}
                                          error={
                                            formik.errors.marc_marketingCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .marc_marketingCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "marc_marketingCost"
                                          )}
                                          onChange={(e) => {
                                            formik.handleChange(e);

                                            const marketingCost = parseFloat(
                                              e.target.value
                                            );

                                            const {
                                              marc_attributionCost,
                                              marc_influencerCost,
                                              marc_miscCost,
                                              marc_marketingVATCost,
                                            } = formik.values;

                                            calculateMarketingTotals(
                                              marketingCost,
                                              marc_attributionCost,
                                              marc_influencerCost,
                                              marc_miscCost,
                                              marc_marketingVATCost
                                            );
                                          }}
                                        />

                                        <FormInput
                                          label="Attribution Links"
                                          className="flex flex-col justify-end"
                                          placeholder=""
                                          prefix="$"
                                          type="number"
                                          onFocus={(e) => e.target.select()}
                                          error={
                                            formik.errors.marc_attributionCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .marc_attributionCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "marc_attributionCost"
                                          )}
                                          onChange={(e) => {
                                            formik.handleChange(e);

                                            const attributionCost = parseFloat(
                                              e.target.value
                                            );

                                            const {
                                              marc_marketingCost,
                                              marc_influencerCost,
                                              marc_miscCost,
                                              marc_marketingVATCost,
                                            } = formik.values;

                                            calculateMarketingTotals(
                                              marc_marketingCost,
                                              attributionCost,
                                              marc_influencerCost,
                                              marc_miscCost,
                                              marc_marketingVATCost
                                            );
                                          }}
                                        />

                                        <FormInput
                                          label="Promotion/Other Costs"
                                          className="flex flex-col justify-end"
                                          placeholder=""
                                          prefix="$"
                                          type="number"
                                          error={
                                            formik.errors.marc_influencerCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .marc_influencerCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "marc_influencerCost"
                                          )}
                                          onFocus={(e) => e.target.select()}
                                          onChange={(e) => {
                                            formik.handleChange(e);

                                            const influencerCost = parseFloat(
                                              e.target.value
                                            );

                                            const {
                                              marc_marketingCost,
                                              marc_attributionCost,
                                              marc_miscCost,
                                              marc_marketingVATCost,
                                            } = formik.values;

                                            calculateMarketingTotals(
                                              marc_marketingCost,
                                              marc_attributionCost,
                                              influencerCost,
                                              marc_miscCost,
                                              marc_marketingVATCost
                                            );
                                          }}
                                        />

                                        <FormInput
                                          label="PPC VAT(if Applicable)"
                                          className="flex flex-col justify-end"
                                          placeholder=""
                                          prefix="$"
                                          type="number"
                                          onFocus={(e) => e.target.select()}
                                          error={
                                            formik.errors.marc_miscCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .marc_miscCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps("marc_miscCost")}
                                          onChange={(e) => {
                                            formik.handleChange(e);

                                            const miscCost = parseFloat(
                                              e.target.value
                                            );

                                            const {
                                              marc_marketingCost,
                                              marc_attributionCost,
                                              marc_influencerCost,
                                              marc_marketingVATCost,
                                            } = formik.values;

                                            calculateMarketingTotals(
                                              marc_marketingCost,
                                              marc_attributionCost,
                                              marc_influencerCost,
                                              miscCost,
                                              marc_marketingVATCost
                                            );
                                          }}
                                        />

                                        {/* <FormInput
                                    className="flex flex-col justify-end"
                                    label="Marketing & Advertising (PPC) VAT Costs (if applicable)"
                                    placeholder=""
                                    prefix="$"
                                    type="number"
                                    onFocus={(e) => e.target.select()}
                                    error={
                                      formik.errors.marc_marketingVATCost &&
                                      formik.submitCount > 0
                                        ? (formik.errors
                                            .marc_marketingVATCost as string)
                                        : ""
                                  }
                                  {...formik.getFieldProps(
                                    "marc_marketingVATCost"
                                  )}
                                  onChange={(e) => {
                                    formik.handleChange(e);

                                    const marketingVATCost = parseFloat(
                                      e.target.value
                                    );

                                    const {
                                      marc_marketingCost,
                                      marc_influencerCost,
                                      marc_miscCost,
                                      marc_attributionCost,
                                    } = formik.values;

                                    calculateMarketingTotals(
                                      marc_marketingCost,
                                      marc_attributionCost,
                                      marc_influencerCost,
                                      marc_miscCost,
                                      marketingVATCost
                                    );
                                  }}
                                /> */}
                                      </div>
                                      <div
                                        className="p-3.5 grid w-full lg:w-2/6 grid-cols-1 lg:grid-cols-2 gap-2 bg-gray-200 dark:bg-black"
                                        style={{ borderLeft: "2px solid #f4f4f4" }}
                                      >
                                        <FormInput
                                          label="Marketing Cost/Unit"
                                          placeholder=""
                                          className="flex flex-col"
                                          prefix="$"
                                          type="number"
                                          disabled
                                          onFocus={(e) => e.target.select()}
                                          error={
                                            formik.errors.marc_perUnitCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .marc_perUnitCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "marc_perUnitCost"
                                          )}
                                        />
                                        <FormInput
                                          label="Total Marketing Cost"
                                          className="flex flex-col"
                                          placeholder=""
                                          prefix="$"
                                          type="number"
                                          disabled
                                          onFocus={(e) => e.target.select()}
                                          error={
                                            formik.errors.marc_totalCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .marc_totalCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "marc_totalCost"
                                          )}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Graphics Cost */}
                                  <div className="box !mb-0">
                                    <div className="box-header border bg-blue-900 !py-3">
                                      <div className="box-title !text-white">
                                        <i className="ti ti-anchor text-[1.2rem] me-2"></i>
                                        Graphics Design Cost
                                      </div>
                                    </div>
                                    <div className="flex flex-col lg:flex-row">
                                      <div className="p-5 w-full lg:w-4/6 grid  grid-cols-1 xl:grid-cols-4 gap-2">
                                        <FormInput
                                          className="flex flex-col justify-end"
                                          label="A+ Content"
                                          type="number"
                                          placeholder=""
                                          prefix="$"
                                          onFocus={(e) => e.target.select()}
                                          required
                                          error={
                                            formik.errors
                                              .gc_imagingAndPhotographyCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .gc_imagingAndPhotographyCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "gc_imagingAndPhotographyCost"
                                          )}
                                          onChange={(e) => {
                                            formik.handleChange(e);

                                            const imagingAndPhotographyCost =
                                              parseFloat(e.target.value);

                                            const {
                                              gc_videographyCost,
                                              gc_productPackingCost,
                                              gc_3dAnimationCost,
                                              gc_miscCost,
                                            } = formik.values;

                                            calculateGraphicsCost(
                                              imagingAndPhotographyCost,
                                              gc_videographyCost,
                                              gc_productPackingCost,
                                              gc_3dAnimationCost,
                                              gc_miscCost
                                            );
                                          }}
                                        />
                                        <FormInput
                                          label="Videography"
                                          placeholder=""
                                          prefix="$"
                                          type="number"
                                          className="flex flex-col justify-end"
                                          onFocus={(e) => e.target.select()}
                                          error={
                                            formik.errors.gc_videographyCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .gc_videographyCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "gc_videographyCost"
                                          )}
                                          onChange={(e) => {
                                            formik.handleChange(e);

                                            const videographyCost = parseFloat(
                                              e.target.value
                                            );

                                            const {
                                              gc_imagingAndPhotographyCost,
                                              gc_productPackingCost,
                                              gc_3dAnimationCost,
                                              gc_miscCost,
                                            } = formik.values;

                                            calculateGraphicsCost(
                                              gc_imagingAndPhotographyCost,
                                              videographyCost,
                                              gc_productPackingCost,
                                              gc_3dAnimationCost,
                                              gc_miscCost
                                            );
                                          }}
                                        />
                                        <FormInput
                                          label="Product Packaging"
                                          className="flex flex-col justify-end"
                                          placeholder=""
                                          prefix="$"
                                          type="number"
                                          onFocus={(e) => e.target.select()}
                                          error={
                                            formik.errors.gc_productPackingCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .gc_productPackingCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "gc_productPackingCost"
                                          )}
                                          onChange={(e) => {
                                            formik.handleChange(e);

                                            const productPackingCost = parseFloat(
                                              e.target.value
                                            );

                                            const {
                                              gc_imagingAndPhotographyCost,
                                              gc_videographyCost,
                                              gc_3dAnimationCost,
                                              gc_miscCost,
                                            } = formik.values;

                                            calculateGraphicsCost(
                                              gc_imagingAndPhotographyCost,
                                              gc_videographyCost,
                                              productPackingCost,
                                              gc_3dAnimationCost,
                                              gc_miscCost
                                            );
                                          }}
                                        />
                                        {/* <FormInput
                                    label="3D Animation Cost"
                                    className="flex flex-col justify-end"
                                    placeholder=""
                                    prefix="$"
                                    type="number"
                                    onFocus={(e) => e.target.select()}
                                    error={
                                      formik.errors.gc_3dAnimationCost &&
                                      formik.submitCount > 0
                                        ? (formik.errors
                                            .gc_3dAnimationCost as string)
                                        : ""
                                  }
                                  {...formik.getFieldProps("gc_3dAnimationCost")}
                                  onChange={(e) => {
                                    formik.handleChange(e);

                                    const threeDAnimationCost = parseFloat(
                                      e.target.value
                                    );

                                    const {
                                      gc_imagingAndPhotographyCost,
                                      gc_videographyCost,
                                      gc_productPackingCost,
                                      gc_miscCost,
                                    } = formik.values;

                                    calculateGraphicsCost(
                                      gc_imagingAndPhotographyCost,
                                      gc_videographyCost,
                                      gc_productPackingCost,
                                      threeDAnimationCost,
                                      gc_miscCost
                                    );
                                  }}
                                /> */}
                                        <FormInput
                                          label="Other Content Costs"
                                          className="flex flex-col justify-end"
                                          placeholder=""
                                          prefix="$"
                                          type="number"
                                          onFocus={(e) => e.target.select()}
                                          error={
                                            formik.errors.gc_miscCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .gc_miscCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps("gc_miscCost")}
                                          onChange={(e) => {
                                            formik.handleChange(e);

                                            const miscCost = parseFloat(
                                              e.target.value
                                            );

                                            const {
                                              gc_imagingAndPhotographyCost,
                                              gc_videographyCost,
                                              gc_productPackingCost,
                                              gc_3dAnimationCost,
                                            } = formik.values;

                                            calculateGraphicsCost(
                                              gc_imagingAndPhotographyCost,
                                              gc_videographyCost,
                                              gc_productPackingCost,
                                              gc_3dAnimationCost,
                                              miscCost
                                            );
                                          }}
                                        />
                                      </div>
                                      <div
                                        className="p-5 grid w-full lg:w-2/6 grid-cols-1 bg-gray-200 dark:bg-black lg:grid-cols-2 gap-2"
                                        style={{ borderLeft: "2px solid #f4f4f4" }}
                                      >
                                        <FormInput
                                          label="Graphics Cost/Unit"
                                          className="flex flex-col"
                                          placeholder=""
                                          prefix="$"
                                          disabled
                                          type="number"
                                          onFocus={(e) => e.target.select()}
                                          error={
                                            formik.errors.gc_perUnitCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .gc_perUnitCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "gc_perUnitCost"
                                          )}
                                        />
                                        <FormInput
                                          label="Total Graphics Cost"
                                          className="flex flex-col"
                                          placeholder=""
                                          prefix="$"
                                          disabled
                                          type="number"
                                          onFocus={(e) => e.target.select()}
                                          error={
                                            formik.errors.gc_totalCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .gc_totalCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps("gc_totalCost")}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Reviewer Program Cost */}
                                  <div className="box !mb-0">
                                    <div className="box-header border bg-blue-900 !py-3">
                                      <div className="box-title !text-white">
                                        <i className="ti ti-anchor text-[1.2rem] me-2"></i>
                                        Reviewer Program Cost
                                      </div>
                                    </div>
                                    <div className="flex flex-col lg:flex-row">
                                      <div className="p-5 w-full lg:w-4/6 grid  grid-cols-1 xl:grid-cols-4 gap-2">
                                        <FormInput
                                          label="Review Related Expenses"
                                          className="flex flex-col justify-end"
                                          placeholder=""
                                          prefix="$"
                                          type="number"
                                          onFocus={(e) => e.target.select()}
                                          error={
                                            formik.errors.pfc_vineProgramCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .pfc_vineProgramCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "pfc_vineProgramCost"
                                          )}
                                          onChange={(e) => {
                                            formik.handleChange(e);

                                            const vineProgramCost = parseFloat(
                                              e.target.value
                                            );

                                            const { pfc_miscCost } = formik.values;

                                            calculateProductFeedbackTotals(
                                              vineProgramCost,
                                              pfc_miscCost
                                            );
                                          }}
                                        />

                                        <FormInput
                                          label="Other Associated Costs"
                                          className="flex flex-col justify-end"
                                          placeholder=""
                                          prefix="$"
                                          type="number"
                                          onFocus={(e) => e.target.select()}
                                          error={
                                            formik.errors.pfc_miscCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .pfc_miscCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps("pfc_miscCost")}
                                          onChange={(e) => {
                                            formik.handleChange(e);

                                            const miscCost = parseFloat(
                                              e.target.value
                                            );

                                            const { pfc_vineProgramCost } =
                                              formik.values;

                                            calculateProductFeedbackTotals(
                                              pfc_vineProgramCost,
                                              miscCost
                                            );
                                          }}
                                        />
                                      </div>
                                      <div
                                        className="p-5 grid w-full lg:w-2/6 grid-cols-1 lg:grid-cols-2 gap-2 bg-gray-200 dark:bg-black"
                                        style={{ borderLeft: "2px solid #f4f4f4" }}
                                      >
                                        <FormInput
                                          label="Review Cost/Unit "
                                          className="flex flex-col"
                                          placeholder=""
                                          prefix="$"
                                          onFocus={(e) => e.target.select()}
                                          disabled
                                          error={
                                            formik.errors.pfc_perUnitCost &&
                                              formik.submitCount > 0
                                              ? formik.errors.pfc_perUnitCost
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "pfc_perUnitCost"
                                          )}
                                        />
                                        <FormInput
                                          label="Total Review Prog. Cost"
                                          className="flex flex-col"
                                          placeholder=""
                                          prefix="$"
                                          disabled
                                          onFocus={(e) => e.target.select()}
                                          error={
                                            formik.errors.pfc_totalCost &&
                                              formik.submitCount > 0
                                              ? formik.errors.pfc_totalCost
                                              : ""
                                          }
                                          {...formik.getFieldProps("pfc_totalCost")}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Other Costs */}
                                  <div className="box !mb-0">
                                    <div className="box-header border bg-blue-900 !py-3">
                                      <div className="box-title !text-white">
                                        <i className="ti ti-anchor text-[1.2rem] me-2"></i>
                                        Additional Costs
                                      </div>
                                    </div>
                                    <div className="flex flex-col lg:flex-row">
                                      <div className="p-5 w-full lg:w-4/6 grid  grid-cols-1 xl:grid-cols-4 gap-2">
                                        {/* Pre-launch QA samples (if requested) */}
                                        <FormInput
                                          label="Pre-launch Samples"
                                          className="flex flex-col justify-end"
                                          placeholder=""
                                          prefix="$"
                                          type="number"
                                          error={
                                            formik.errors.oc_preLaunchSamples &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .oc_preLaunchSamples as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "oc_preLaunchSamples"
                                          )}
                                          onFocus={(e) => e.target.select()}
                                          onChange={(e) => {
                                            formik.handleChange(e);

                                            const preLaunchSamples = parseFloat(
                                              e.target.value
                                            );

                                            const {
                                              oc_competitorProductSamples,
                                              oc_employeesCost,
                                              oc_anyOtherCost,
                                            } = formik.values;

                                            calculateOtherCostsTotals(
                                              oc_competitorProductSamples,
                                              oc_employeesCost,
                                              oc_anyOtherCost,
                                              preLaunchSamples
                                            );
                                          }}
                                        />
                                        <FormInput
                                          className="flex flex-col justify-end"
                                          label="Competitor Samples"
                                          type="number"
                                          prefix="$"
                                          placeholder=""
                                          onFocus={(e) => e.target.select()}
                                          error={
                                            formik.errors
                                              .oc_competitorProductSamples &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .oc_competitorProductSamples as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "oc_competitorProductSamples"
                                          )}
                                          onChange={(e) => {
                                            formik.handleChange(e);

                                            const competitorProductSamples =
                                              parseFloat(e.target.value);

                                            const {
                                              oc_employeesCost,
                                              oc_anyOtherCost,
                                              oc_preLaunchSamples,
                                            } = formik.values;

                                            calculateOtherCostsTotals(
                                              competitorProductSamples,
                                              oc_employeesCost,
                                              oc_anyOtherCost,
                                              oc_preLaunchSamples
                                            );
                                          }}
                                        />

                                        <FormInput
                                          label="Employees Cost"
                                          className="flex flex-col justify-end"
                                          placeholder=""
                                          prefix="$"
                                          type="number"
                                          error={
                                            formik.errors.oc_employeesCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .oc_employeesCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "oc_employeesCost"
                                          )}
                                          onFocus={(e) => e.target.select()}
                                          onChange={(e) => {
                                            formik.handleChange(e);

                                            const employeesCost = parseFloat(
                                              e.target.value
                                            );

                                            const {
                                              oc_competitorProductSamples,
                                              oc_anyOtherCost,
                                              oc_preLaunchSamples,
                                            } = formik.values;

                                            calculateOtherCostsTotals(
                                              oc_competitorProductSamples,
                                              employeesCost,
                                              oc_anyOtherCost,
                                              oc_preLaunchSamples
                                            );
                                          }}
                                        />

                                        <FormInput
                                          label="Miscellaneous Cost"
                                          placeholder=""
                                          className="flex flex-col justify-end"
                                          prefix="$"
                                          type="number"
                                          onFocus={(e) => e.target.select()}
                                          error={
                                            formik.errors.oc_anyOtherCost &&
                                              formik.submitCount > 0
                                              ? formik.errors.oc_anyOtherCost
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "oc_anyOtherCost"
                                          )}
                                          onChange={(e) => {
                                            formik.handleChange(e);

                                            const anyOtherCost = parseFloat(
                                              e.target.value
                                            );

                                            const {
                                              oc_competitorProductSamples,
                                              oc_employeesCost,
                                              oc_preLaunchSamples,
                                            } = formik.values;

                                            calculateOtherCostsTotals(
                                              oc_competitorProductSamples,
                                              oc_employeesCost,
                                              anyOtherCost,
                                              oc_preLaunchSamples
                                            );
                                          }}
                                        />
                                      </div>
                                      <div
                                        className="p-4 grid w-full lg:w-2/6 grid-cols-1 lg:grid-cols-2 gap-2 bg-gray-200 dark:bg-black"
                                        style={{ borderLeft: "2px solid #f4f4f4" }}
                                      >
                                        <FormInput
                                          label="Additional Cost/Unit"
                                          className="flex flex-col"
                                          placeholder=""
                                          prefix="$"
                                          type="number"
                                          disabled
                                          error={
                                            formik.errors.oc_perUnitCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .oc_perUnitCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "oc_perUnitCost"
                                          )}
                                        />

                                        <FormInput
                                          label="Total Additional Cost"
                                          className="flex flex-col"
                                          placeholder=""
                                          prefix="$"
                                          disabled
                                          type="number"
                                          error={
                                            formik.errors.oc_totalCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .oc_totalCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps("oc_totalCost")}
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-12">
                                      <div
                                        className="lg:col-start-9 mt-8 lg:mt-0 lg:col-span-4"
                                        style={{ backgroundColor: "#f4f4f4" }}
                                      >
                                        <div className="relative">
                                          <RevenueCalculationCard
                                            // bgColor="primary"
                                            bgColor=""
                                            data={[
                                              {
                                                section: "Gross Profit",
                                                items: [
                                                  {
                                                    label: "Net Profit/Unit",
                                                    value:
                                                      profitAndRev.netProfitBeforeTaxesPerUnit ||
                                                      0.0,
                                                  },
                                                  {
                                                    label: "Total Net Profit",
                                                    value:
                                                      profitAndRev.netProfitBeforeTaxesForQty ||
                                                      0.0,
                                                  },
                                                ],
                                              },
                                            ]}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Taxes */}
                                  <div className="box !mb-0">
                                    <div className="box-header border bg-blue-900 !py-3">
                                      <div className="box-title !text-white">
                                        <i className="ti ti-anchor text-[1.2rem] me-2"></i>
                                        Taxes{" "}
                                        <span className="text-sm">
                                          (if applicable)
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col lg:flex-row">
                                      <div className="p-5 w-full lg:w-4/6 flex  flex-col gap-2">
                                        <div className="flex w-full flex-col gap-y-2">
                                          <div className="text-sm font-semibold text-dark mb-1 flex items-center space-x-2">
                                            <span>Select Region</span>
                                            <div className="relative inline-block group">
                                              <button className="p-1">
                                                <img
                                                  src={Icon}
                                                  alt=""
                                                  className="w-5 dark:bg-white rounded-xl"
                                                />
                                              </button>

                                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[rgba(250,250,245,0.9)] text-gray-900 text-xs font-medium px-2 py-1 rounded shadow-sm z-10 w-[320px] whitespace-normal border">
                                                Check and adjust VAT, GST, Sales
                                                Tax, or Other taxes manually per
                                                your selling marketplace. Tax
                                                regulations vary by region.
                                              </span>
                                            </div>
                                          </div>

                                          <select
                                            className="w-full bg-white border border-gray-300 text-gray-500 rounded-md p-2"
                                            value={formik.values.tax_region}
                                            onChange={(e) => {
                                              const newOpt = {
                                                label: e.target.value,
                                                value: e.target.value,
                                              };
                                              formik.setFieldValue(
                                                "tax_region",
                                                newOpt.value
                                              );

                                              const taxRate = TAX_OPTIONS.find(
                                                (tax) => tax.code === newOpt.value
                                              );

                                              formik.setFieldValue(
                                                "tax_VAT",
                                                taxRate?.vat || 0
                                              );

                                              formik.setFieldValue(
                                                "tax_GST",
                                                taxRate?.gst || 0
                                              );

                                              formik.setFieldValue(
                                                "tax_salesTax",
                                                taxRate?.salesTax || 0
                                              );

                                              formik.setFieldValue(
                                                "tax_miscCost",
                                                taxRate?.misc || 0
                                              );

                                              calculateTaxes(
                                                taxRate?.vat || 0,
                                                taxRate?.gst || 0,
                                                taxRate?.salesTax || 0,
                                                taxRate?.misc || 0
                                              );
                                            }}
                                          >
                                            <option value="">Select Region</option>
                                            {COUNTRY_OPTIONS.map((option) => (
                                              <option
                                                key={option.value}
                                                value={option.value}
                                              >
                                                {option.label}
                                              </option>
                                            ))}
                                          </select>

                                          {formik.values.tax_region ? (
                                            getTaxNotes()
                                          ) : (
                                            <></>
                                          )}

                                          {formik.errors.tax_region &&
                                            formik.submitCount > 0 ? (
                                            <p className="text-red-500">
                                              {formik.errors.tax_region as string}
                                            </p>
                                          ) : (
                                            <></>
                                          )}
                                        </div>
                                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-2">
                                          <SliderInput
                                            value={Number(formik.values.tax_VAT)}
                                            name="VAT"
                                            error={
                                              formik.errors.tax_VAT &&
                                                formik.submitCount > 0
                                                ? (formik.errors.tax_VAT as string)
                                                : ""
                                            }
                                            onChange={(e) => {
                                              const vatTax = Number(e.target.value);

                                              formik.setFieldValue(
                                                "tax_VAT",
                                                vatTax
                                              );

                                              const {
                                                tax_GST,
                                                tax_salesTax,
                                                tax_miscCost,
                                              } = formik.values;

                                              calculateTaxes(
                                                vatTax,
                                                tax_GST,
                                                tax_salesTax,
                                                tax_miscCost
                                              );
                                            }}
                                          />

                                          <SliderInput
                                            value={Number(formik.values.tax_GST)}
                                            name="GST"
                                            error={
                                              formik.errors.tax_GST &&
                                                formik.submitCount > 0
                                                ? (formik.errors.tax_GST as string)
                                                : ""
                                            }
                                            onChange={(e) => {
                                              // formik.handleChange(e);
                                              const gstTax = Number(e.target.value);

                                              formik.setFieldValue(
                                                "tax_GST",
                                                gstTax
                                              );

                                              const {
                                                tax_VAT,
                                                tax_salesTax,
                                                tax_miscCost,
                                              } = formik.values;

                                              calculateTaxes(
                                                tax_VAT,
                                                gstTax,
                                                tax_salesTax,
                                                tax_miscCost
                                              );
                                            }}
                                          />

                                          <SliderInput
                                            value={Number(
                                              formik.values.tax_salesTax
                                            )}
                                            name="Sales Tax"
                                            error={
                                              formik.errors.tax_salesTax &&
                                                formik.submitCount > 0
                                                ? (formik.errors
                                                  .tax_salesTax as string)
                                                : ""
                                            }
                                            onChange={(e) => {
                                              const salesTax = Number(
                                                e.target.value
                                              );

                                              formik.setFieldValue(
                                                "tax_salesTax",
                                                salesTax
                                              );

                                              const {
                                                tax_VAT,
                                                tax_GST,
                                                tax_miscCost,
                                              } = formik.values;

                                              calculateTaxes(
                                                tax_VAT,
                                                tax_GST,
                                                salesTax,
                                                tax_miscCost
                                              );
                                            }}
                                          />

                                          <FormInput
                                            label="Miscellaneous Cost"
                                            className="flex flex-col justify-end"
                                            placeholder=""
                                            prefix="$"
                                            type="number"
                                            error={
                                              formik.errors.tax_miscCost &&
                                                formik.submitCount > 0
                                                ? (formik.errors
                                                  .tax_miscCost as string)
                                                : ""
                                            }
                                            {...formik.getFieldProps(
                                              "tax_miscCost"
                                            )}
                                            onChange={(e) => {
                                              const miscCost = Number(
                                                e.target.value
                                              );

                                              formik.setFieldValue(
                                                "tax_miscCost",
                                                miscCost
                                              );

                                              const {
                                                tax_VAT,
                                                tax_GST,
                                                tax_salesTax,
                                              } = formik.values;

                                              calculateTaxes(
                                                tax_VAT,
                                                tax_GST,
                                                tax_salesTax,
                                                miscCost
                                              );
                                            }}
                                          />
                                        </div>
                                      </div>
                                      <div
                                        className="p-5 grid w-full lg:w-2/6 grid-cols-1 lg:grid-cols-2 gap-2 bg-gray-200 dark:bg-black"
                                        style={{ borderLeft: "2px solid #f4f4f4" }}
                                      >
                                        <FormInput
                                          label="Taxes/Unit"
                                          className="flex flex-col"
                                          placeholder=""
                                          prefix="$"
                                          type="number"
                                          disabled
                                          error={
                                            formik.errors.tax_perUnitCost &&
                                              formik.submitCount > 0
                                              ? (formik.errors
                                                .tax_perUnitCost as string)
                                              : ""
                                          }
                                          {...formik.getFieldProps(
                                            "tax_perUnitCost"
                                          )}
                                        />

                                        <FormInput
                                          label="Total Taxes"
                                          className="flex flex-col"
                                          placeholder=""
                                          prefix="$"
                                          type="number"
                                          disabled
                                          onFocus={(e) => e.target.select()}
                                          error={
                                            formik.errors.tax_totalCost &&
                                              formik.submitCount > 0
                                              ? formik.errors.tax_totalCost
                                              : ""
                                          }
                                          {...formik.getFieldProps("tax_totalCost")}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 lg:grid-cols-12">
                                    <div
                                      className="lg:col-start-9 mt-8 lg:mt-0 lg:col-span-4"
                                      style={{ backgroundColor: "#f4f4f4" }}
                                    >
                                      <div className="relative">
                                        <RevenueCalculationCard
                                          bgColor=""
                                          data={[
                                            {
                                              section: "Gross Profit",
                                              items: [
                                                {
                                                  label: "Net Profit/Unit",
                                                  value:
                                                    profitAndRev.netProfitAfterTaxesPerUnit ||
                                                    0.0,
                                                },
                                                {
                                                  label: "Total Net Profit",
                                                  value:
                                                    profitAndRev.netProfitAfterTaxesForQty ||
                                                    0.0,
                                                },
                                              ],
                                            },
                                          ]}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </>
                              </div>
                            )}
                        </div>
                      </form>
                    </div>

                    <div
                      id="hs-stacked-overlays"
                      className={`hs-overlay ${isPopupOpen ? "block" : "hidden"
                        } hs-overlay-backdrop-open:bg-gray-900/50 size-full fixed top-0 start-0 z-[60] overflow-x-hidden overflow-y-auto backdrop-blur-sm bg-gray-900/50`}
                    >
                      <div className="mt-7 hs-overlay-open:opacity-100  hs-overlay-open:duration-500 opacity-100 ease-out transition-all sm:max-w-2xl sm:w-full m-3 sm:mx-auto">
                        <div className="flex flex-col bg-white border shadow-sm rounded-sm dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70">
                          <div className="flex justify-between items-center py-3 px-4 border-b dark:border-neutral-700">
                            <h6 className="font-bold text-gray-800 dark:text-white">
                              Save Search
                            </h6>
                            <button
                              type="button"
                              className="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700"
                              onClick={closePopup}
                            >
                              <span className="sr-only">Close</span>
                              <svg
                                className="flex-shrink-0 size-4"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                              </svg>
                            </button>
                          </div>

                          <div className="p-4 overflow-y-auto">
                            {isPopupLoading ? (
                              <div className="space-y-4">
                                <div className="h-6 w-3/4 bg-gray-300 rounded animate-pulse"></div>
                                <div className="h-4 w-full bg-gray-300 rounded animate-pulse"></div>
                                <div className="h-4 w-5/6 bg-gray-300 rounded animate-pulse"></div>
                                <div className="h-4 w-4/6 bg-gray-300 rounded animate-pulse"></div>
                                <div className="flex justify-end space-x-2">
                                  <div className="h-8 w-14 bg-gray-400 rounded-full animate-pulse"></div>
                                  <div className="h-8 w-14 bg-gray-400 rounded-full animate-pulse"></div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex flex-col gap-y-5">
                                  {/* <input
                                  placeholder="Enter title"
                                  onChange={(e) => setSaveTitle(e.target.value)}
                                  className="w-full border border-gray-500"
                                  value={saveTitle}
                                  required
                                /> */}
                                  <div>
                                    <div className="text-xs font-semibold text-dark mb-1">
                                      Select Category
                                    </div>
                                    <select
                                      className="w-full bg-white border border-gray-300 text-gray-500 rounded-md p-2"
                                      value={selectedCategory}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (value) {
                                          setSelectedCategory(value);
                                        }
                                      }}
                                    >
                                      <option value="">Select Category</option>
                                      {categories.map((cat: any) => (
                                        <option key={cat.id} value={cat.id}>
                                          {cat.name}
                                        </option>
                                      ))}
                                    </select>
                                    {/* Button to open second level modal */}
                                    <button
                                      className="inline-flex text-xs mt-2 text-primary disabled:opacity-50 disabled:pointer-events-none"
                                      onClick={openSecondPopup}
                                    >
                                      Add Category
                                    </button>
                                  </div>

                                  <div className="flex justify-end items-center gap-x-2 py-3 border-t dark:border-neutral-700">
                                    <div
                                      onClick={() => {
                                        setSaveTitle("");
                                        setSaveDescription("");
                                        setSelectedCategory("");
                                        setIsPopupOpen(false);
                                      }}
                                      className="rounded-full py-2 px-4 bg-danger text-white hover:bg-red-600"
                                    >
                                      Cancel
                                    </div>
                                    <div
                                      onClick={() => {
                                        if (selectedCategory.trim()) {
                                          saveProductSubmit();
                                        } else {
                                          formik.submitForm();
                                          toast.error(
                                            "Title and Category is required"
                                          );
                                        }
                                      }}
                                      className="bg-success py-2 px-4 rounded-full text-white hover:bg-green-500 cursor-pointer"
                                    >
                                      Save
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Second Modal Level */}
                    <div
                      id="advanced-options-overlay"
                      className={`hs-overlay ${isSecondPopupOpen ? "block" : "hidden"
                        } hs-overlay-backdrop-open:bg-gray-900/70 size-full fixed top-0 start-0 z-[70] overflow-x-hidden overflow-y-auto backdrop-blur-sm bg-gray-900/70`}
                    >
                      <div className="mt-32 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 opacity-100 ease-out transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                        <div className="flex flex-col bg-white border shadow-sm rounded-sm dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70">
                          <div className="flex justify-between items-center py-3 px-4 border-b dark:border-neutral-700">
                            <h6 className="font-bold text-gray-800 dark:text-white">
                              Add Category
                            </h6>
                            <button
                              type="button"
                              className="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700"
                              onClick={closeSecondPopup}
                            >
                              <span className="sr-only">Close</span>
                              <svg
                                className="flex-shrink-0 size-4"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                              </svg>
                            </button>
                          </div>

                          <div className="p-4 overflow-y-auto">
                            <div className="flex flex-col">
                              <FormInput
                                label="Enter New Category"
                                className="flex flex-col"
                                placeholder="Enter New Category"
                                prefix=""
                                required
                                value={newCategory}
                                type="string"
                                onChange={(e) => setNewCategory(e.target.value)}
                                onFocus={(e) => e.target.select()}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end items-center gap-x-2 py-3 px-4 border-t dark:border-neutral-700">
                            <button
                              className="rounded-full py-2 px-4 bg-danger text-white hover:bg-red-600"
                              onClick={closeSecondPopup}
                            >
                              Cancel
                            </button>
                            <button
                              className="bg-success py-2 px-4 rounded-full text-white hover:bg-green-500 cursor-pointer"
                              onClick={() => {
                                if (newCategory.trim()) {
                                  updateCategoryMutate({ name: newCategory });
                                } else {
                                  formik.submitForm();
                                  toast.error("Category is required");
                                }
                              }}
                              disabled={isPending}
                            >
                              {isPending ? "Saving..." : "Add Category"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* <Popup modal open={isPopupOpen} closeOnDocumentClick={false}>
                    <div className="flex flex-col gap-y-5 p-3">
                      {isPopupLoading ? (
                        <h1>Loading...</h1>
                      ) : (
                        <>
                          <p className="text-lg text-gray-600">Save Search</p>
                          <input
                            placeholder="Enter title"
                            onChange={(e) => setSaveTitle(e.target.value)}
                            className="w-full border border-gray-500"
                            value={saveTitle}
                          />
                          <textarea
                            value={saveDescription}
                            placeholder="Enter description"
                            onChange={(e) => setSaveDescription(e.target.value)}
                            rows={4}
                            className="w-full border border-gray-500"
                          />
                          <div className="flex gap-x-2 items-center justify-end">
                            <div
                              onClick={() => {
                                setSaveTitle("");
                                setSaveDescription("");
                                setIsPopupOpen(false);
                              }}
                              className="rounded-full py-2 px-4 bg-danger text-white hover:bg-red-600"
                            >
                              Cancel
                            </div>
                            <div
                              onClick={saveProductSubmit}
                              className="bg-success py-2 px-4 rounded-full text-white hover:bg-green-500 cursor-pointer"
                            >
                              Save
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </Popup> */}
                  </div>
                </>
              )}
          </div>
        </div>
      </div>
    </>
  );
};
export default TikTokProfitCalculatorModal;

