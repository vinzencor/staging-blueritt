/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Yup from "yup";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import Pageheader from "@/components/common/page-header/pageheader";
import SearchesAlert from "@/@spk/uielements/SearchesAlert";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { EAccessTypes, QuotaNames } from "@/enum";
import Stepper from "@/components/common/Stepper";
import { getAmazonProductDetail } from "@/api/product";
import {
  getProfitProCalculations,
  saveProducts,
  updateProducts,
  getCategory,
  createCategory,
} from "@/api/savedProducts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select/Select";

import Input from "@/components/common/input/Input";
import Button from "@/components/common/button/Button";
import { COUNTRY_OPTIONS } from "@/utils/constants";
import type { TAlibabaProduct, TAmazonProduct } from "@/types/product";

import FormInput from "../components/FormInput";
import SliderInput from "../components/SliderInput";
import AlibabaCard from "../components/AlibabaCard";
import AmazonCard from "../components/AmazonCard";
import RevenueCalculationCard from "../components/RevenueCalculationCard";
import { useUserSubscriptionAndSearchQuota } from "@/hooks/useUserDetails";

import "reactjs-popup/dist/index.css";

import { useSelector } from "react-redux";
import { AxiosError } from "axios";

// TODO: Set TAX_OPTIONS and CountryOptions in one.
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

const ProProfitPro = () => {
  const navigate = useNavigate();
  const scannerSelectedSupplier = useSelector(
    (state: any) => state.scannerSelectedSupplier
  );
  const {
    quotaDetails,
    updateQuota,
    isLoading: isQuotaLoading,
    checkAccess,
  } = useUserSubscriptionAndSearchQuota(QuotaNames.NoOfGrossProfitCalculations);

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

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSecondPopupOpen, setIsSecondPopupOpen] = useState(false);
  const [isPopupLoading, setIsPopupLoading] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const [saveDescription, setSaveDescription] = useState("");
  const [isComingFromMatcher, setIsComingFromMatcher] = useState(false);

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
      QuotaNames.NoOfGrossProfitCalculations,
    ],
    queryFn: () =>
      getAmazonProductDetail({
        asin: searchString,
        country: country,
        source: QuotaNames.NoOfGrossProfitCalculations,
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
          parseFloat(data.sourcing_cost.manufacturing_cost) || 0,
        psc_shippingCost: parseFloat(data.sourcing_cost.shipping_cost) || 0,
        psc_productLogoCost: parseFloat(data.sourcing_cost.logo_box_cost) || 0,
        psc_orderQuantity: parseFloat(data.sourcing_cost.order_quantity) || 0,
        psc_miscCost: parseFloat(data.sourcing_cost.miscellaneous_cost) || 0,
        psc_perUnitCost: parseFloat(data.sourcing_cost.cost_per_unit) || 0,
        psc_totalCost: parseFloat(data.sourcing_cost.total) || 0,

        // Fulfillment model -> fm
        fm_model: data.fulfillment.fulfillment_type || "FBA",
        fm_referrfalFees: parseFloat(data.fulfillment.referral_fees) || 0,
        fm_fbaFulfillmentFees:
          parseFloat(data.fulfillment.fba_fulfillment_fees) || 0,
        fm_monthlyStorageFees:
          parseFloat(data.fulfillment.monthly_storage_fees) || 0,
        fm_longTermStorageFees:
          parseFloat(data.fulfillment.long_term_storage_fees) || 0,
        fm_inboundShippingCost:
          parseFloat(data.fulfillment.inbound_shipping_cost) || 0,
        fm_returnsRate: parseFloat(data.fulfillment.returns_refunds_rate) || 0,

        fm_shippingFees: parseFloat(data.fulfillment.shipping_fee) || 0,
        fm_handlingCost: parseFloat(data.fulfillment.handling_cost) || 0,
        fm_storageCost: parseFloat(data.fulfillment.storage_cost) || 0,
        fm_miscCost: parseFloat(data.fulfillment.miscellaneous_cost) || 0,
        fm_perUnitCost: parseFloat(data.fulfillment.cost_per_unit) || 0,
        fm_totalCost: parseFloat(data.fulfillment.total) || 0,

        // Marketing, Advertisement and Ranking Cost -> marc
        marc_marketingCost: parseFloat(data.marketing.ppc_costs) || 0,
        marc_attributionCost: parseFloat(data.marketing.attribution_costs) || 0,
        marc_influencerCost:
          parseFloat(data.marketing.influencer_promotion_costs) || 0,
        marc_miscCost: parseFloat(data.marketing.miscellaneous_cost) || 0,
        marc_marketingVATCost: parseFloat(data.marketing.ppc_vat_costs) || 0,
        marc_totalCost: parseFloat(data.marketing.total) || 0,
        marc_perUnitCost: parseFloat(data.marketing.cost_per_unit) || 0,

        // Taxes
        tax_region: data.taxes.region || "",
        tax_VAT: parseFloat(data.taxes.vat) || 0,
        tax_GST: parseFloat(data.taxes.gst) || 0,
        tax_salesTax: parseFloat(data.taxes.sales_tax) || 0,
        tax_miscCost: parseFloat(data.taxes.miscellaneous_cost) || 0,
        tax_perUnitCost: parseFloat(data.taxes.total_taxes_unit) || 0,
        tax_totalCost: parseFloat(data.taxes.total_taxes_qty) || 0,

        // Graphics Cost -> gc
        gc_imagingAndPhotographyCost:
          parseFloat(data.graphics.imaging_photography) || 0,
        gc_videographyCost: parseFloat(data.graphics.videography_cost) || 0,
        gc_productPackingCost:
          parseFloat(data.graphics.product_packaging_cost) || 0,
        gc_3dAnimationCost: parseFloat(data.graphics.animation_cost) || 0,
        gc_miscCost: parseFloat(data.graphics.miscellaneous_cost) || 0,
        gc_totalCost: parseFloat(data.graphics.total) || 0,
        gc_perUnitCost: parseFloat(data.graphics.cost_per_unit) || 0,

        // Product Feedback Cost -> pfc
        pfc_vineProgramCost: parseFloat(data.vine_misc.vine_program) || 0,
        pfc_miscCost: parseFloat(data.vine_misc.miscellaneous_cost) || 0,
        pfc_totalCost: parseFloat(data.vine_misc.total) || 0,
        pfc_perUnitCost: parseFloat(data.vine_misc.cost_per_unit) || 0,

        // Other costs -> oc
        oc_competitorProductSamples:
          parseFloat(data.other_costs.competitor_samples) || 0,
        oc_preLaunchSamples:
          parseFloat(data.other_costs.pre_launch_samples) || 0,
        oc_employeesCost: parseFloat(data.other_costs.employee_cost) || 0,
        oc_anyOtherCost: parseFloat(data.other_costs.other_cost) || 0,
        oc_totalCost: parseFloat(data.other_costs.total) || 0,
        oc_perUnitCost: parseFloat(data.other_costs.cost_per_unit) || 0,
      };
    }
  };

  const getDataForMutation = () => {
    const data: any = {
      name: saveTitle,
      description: saveDescription,
      category:
        selectedCategory ||
        profitProCalculationsFromAPI?.data?.product?.category,
      saveNewCategory: newCategory,

      // Product Information -> pi
      selling_price: formik.values.pi_sellingPrice?.toFixed(2),
      quantity: formik.values.pi_quantity,
      total_revenue: formik.values.pi_totalRevenue?.toFixed(2),

      // Product Sourcing Cost -> psc
      sourcing_cost: {
        manufacturing_cost: formik.values.psc_manufacturingCost?.toFixed(2),
        shipping_cost: formik.values.psc_shippingCost?.toFixed(2),
        logo_box_cost: formik.values.psc_productLogoCost?.toFixed(2),
        order_quantity: formik.values.psc_orderQuantity,
        miscellaneous_cost: formik.values.psc_miscCost?.toFixed(2),
        cost_per_unit: formik.values.psc_perUnitCost?.toFixed(2),
        total_cost_qty: formik.values.psc_totalCost?.toFixed(2), // redundant after pre-launch samples was moved to Other Costs from Product Sourcing Cost
        total: formik.values.psc_totalCost?.toFixed(2),
      },

      // Fulfillment model -> fm
      fulfillment: {
        fulfillment_type: formik.values.fm_model,
        referral_fees: formik.values.fm_referrfalFees?.toFixed(2),
        fba_fulfillment_fees: formik.values.fm_fbaFulfillmentFees?.toFixed(2),
        monthly_storage_fees: formik.values.fm_monthlyStorageFees?.toFixed(2),
        long_term_storage_fees:
          formik.values.fm_longTermStorageFees?.toFixed(2),
        inbound_shipping_cost: formik.values.fm_inboundShippingCost?.toFixed(2),
        returns_refunds_rate: formik.values.fm_returnsRate,
        shipping_fee: formik.values.fm_shippingFees?.toFixed(2),
        handling_cost: formik.values.fm_handlingCost?.toFixed(2),
        miscellaneous_cost: formik.values.fm_miscCost?.toFixed(2),
        cost_per_unit: formik.values.fm_perUnitCost?.toFixed(2),
        total: formik.values.fm_totalCost?.toFixed(2),
      },

      // Marketing, Advertisement and Ranking Cost -> marc
      marketing: {
        ppc_costs: formik.values.marc_marketingCost?.toFixed(2),
        attribution_costs: formik.values.marc_attributionCost?.toFixed(2),
        influencer_promotion_costs:
          formik.values.marc_influencerCost?.toFixed(2),
        ppc_vat_costs: formik.values.marc_marketingVATCost?.toFixed(2),
        miscellaneous_cost: formik.values.marc_miscCost?.toFixed(2),
        cost_per_unit: formik.values.marc_perUnitCost?.toFixed(2),
        total: formik.values.marc_totalCost?.toFixed(2),
      },

      // Taxes
      taxes: {
        region: formik.values.tax_region,
        vat: formik.values.tax_VAT?.toFixed(2),
        gst: formik.values.tax_GST?.toFixed(2),
        sales_tax: formik.values.tax_salesTax?.toFixed(2),
        miscellaneous_cost: formik.values.tax_miscCost?.toFixed(2),
        total_taxes_unit: formik.values.tax_perUnitCost,
        total_taxes_qty: formik.values.tax_totalCost,
      },

      // Graphics Cost -> gc
      graphics: {
        imaging_photography:
          formik.values.gc_imagingAndPhotographyCost?.toFixed(2),
        videography_cost: formik.values.gc_videographyCost?.toFixed(2),
        product_packaging_cost: formik.values.gc_productPackingCost?.toFixed(2),
        animation_cost: formik.values.gc_3dAnimationCost?.toFixed(2),
        miscellaneous_cost: formik.values.gc_miscCost?.toFixed(2),
        cost_per_unit: formik.values.gc_perUnitCost?.toFixed(2),
        total: formik.values.gc_totalCost?.toFixed(2),
      },

      // Product Feedback Cost -> pfc
      vine_misc: {
        vine_program: formik.values.pfc_vineProgramCost?.toFixed(2),
        miscellaneous_cost: formik.values.pfc_miscCost?.toFixed(2),
        cost_per_unit: formik.values.pfc_perUnitCost?.toFixed(2),
        total: formik.values.pfc_totalCost?.toFixed(2),
      },

      // Other costs -> oc
      other_costs: {
        pre_launch_samples: formik.values.oc_preLaunchSamples?.toFixed(2),
        competitor_samples:
          formik.values.oc_competitorProductSamples?.toFixed(2),
        employee_cost: formik.values.oc_employeesCost?.toFixed(2),
        other_cost: formik.values.oc_anyOtherCost?.toFixed(2),
        cost_per_unit: formik.values.oc_perUnitCost?.toFixed(2),
        total: formik.values.oc_totalCost?.toFixed(2),
      },

      profit_calculation: {
        data: {
          revenue_per_unit: profitAndRev.revPerUnt?.toFixed(2),
          total_revenue: profitAndRev.totalRev?.toFixed(2),

          productSourcing_cost_per_unit:
            formik.values.psc_perUnitCost?.toFixed(2),
          productSourcing_cost_for_qty: formik.values.psc_totalCost?.toFixed(2),
          productSourcing_cost_total: formik.values.psc_totalCost?.toFixed(2),

          fullfilment_cost_per_unit: formik.values.fm_perUnitCost?.toFixed(2),
          fullfilment_cost_total: formik.values.fm_totalCost?.toFixed(2),

          gross_profit_per_unit: profitAndRev.grossProfitPerUnit?.toFixed(2),
          gross_profit_for_qty: profitAndRev.grossProfitForQty?.toFixed(2),

          marketing_cost_per_unit: formik.values.marc_perUnitCost?.toFixed(2),
          marketing_cost_total: formik.values.marc_totalCost?.toFixed(2),

          graphics_cost_per_unit: formik.values.gc_perUnitCost?.toFixed(2),
          graphics_cost_total: formik.values.gc_totalCost?.toFixed(2),

          product_feedback_cost_per_unit:
            formik.values.pfc_perUnitCost?.toFixed(2),
          product_feedback_cost_total: formik.values.pfc_totalCost?.toFixed(2),

          other_costs_per_unit: formik.values.oc_perUnitCost?.toFixed(2),
          other_costs_total: formik.values.oc_totalCost?.toFixed(2),

          net_profit_before_taxes_per_unit:
            profitAndRev.netProfitBeforeTaxesPerUnit?.toFixed(2),
          net_profit_before_taxes_for_qty:
            profitAndRev.netProfitBeforeTaxesForQty?.toFixed(2),

          tax_amount_for_qty: formik.values.tax_totalCost,

          net_profit_after_taxes_per_unit:
            profitAndRev.netProfitAfterTaxesPerUnit?.toFixed(2),
          net_profit_after_taxes_for_qty:
            profitAndRev.netProfitAfterTaxesForQty?.toFixed(2),

          total_net_profit_after_taxes:
            profitAndRev.totalNetProfitAfterTaxes?.toFixed(2),
        },
      },
    };

    if (!saveID) {
      data.amazon_product = {
        ...amazonProduct,
      };
      data.alibaba_product = {
        ...alibabaProduct,
      };
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
        // Subtract refundLoss * total quantity from grossProfitForQty
        grossProfitForQty = grossProfitForQty;
        grossProfitPerUnit = grossProfitForQty / values.pi_quantity;

        // in simple calculator net profit is not available so we will not do further calculations
        netProfitBeforeTaxesPerUnit = grossProfitPerUnit;

        netProfitBeforeTaxesForQty = grossProfitForQty;
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

      if (values.tax_totalCost) {
        netProfitAfterTaxesForQty = netProfitBeforeTaxesForQty;
        netProfitAfterTaxesPerUnit =
          netProfitAfterTaxesForQty / values.psc_orderQuantity;
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

  // useEffect(() => {
  //   if (amazonProductError) {
  //     toast.error("No Product Found with this ASIN");
  //   }
  // }, [amazonProductError]);

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
  //   if (!isComingFromMatcher && !checkAccess(EAccessTypes.access_to_gross_profit)) {
  //     // navigate('/settings/subscription')
  //   }
  // }, [checkAccess])
  return (
    <>
      {((!isComingFromMatcher && scannerActiveComponent === "") ||
        scannerActiveComponent === "ProfitCalculator" ||
        (scannerActiveComponent === "" && profitProSource === "history")) && (
        <>
          {!isComingFromMatcher && (
            <div className="mt-5">
              <SearchesAlert quotaDetails={quotaDetails} />
            </div>
          )}
          <Pageheader
            currentpage={
              isComingFromMatcher ? "Blueritt Explorer" : "Blueritt MarginMax"
            }
            activepage={isComingFromMatcher ? "Blueritt Explorer" : "Blueritt MarginMax"}
            mainpage={isComingFromMatcher ? "Blueritt MarginMax" : "Basic"}
          />

          <>
            {isLoadingProfitProCalculations || isAmazonProductLoading ? (
              <div className="p-6 space-y-6 mt-10  min-h-screen">
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
                <div className="w-full rounded-md p-3 bg-white dark:bg-[#1A1C1E] dark:text-white">
                  <div className="mt-2 px-3">
                    {isComingFromMatcher && <Stepper currentStep={3} />}
                  </div>
                </div>
                <div className="box p-5">
                  {/* Show search for Amazon Product when the user NOT coming from the matcher flow */}
                  {!isComingFromMatcher ? (
                    <div className="flex w-full flex-col gap-y-4 lg:gap-y-0 lg:flex-row gap-x-2 rounded-md ">
                      <Input
                        containerClassName="w-full lg:w-3/5"
                        placeholder={"Search ASIN"}
                        value={searchString}
                        onChange={(e) => setSearchString(e.target.value)}
                      />
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
                            await productDetailRefetch();
                            updateQuota(quotaDetails.quotaValue - 1);
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
                    {isComingFromMatcher ? (
                      <>
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
                            className="text-xs cursor-pointer flex bg-success items-center justify-center text-light py-2 px-4 rounded-full font-medium"
                          >
                            <i className="las la-save text-lg pr-2"></i>
                            Save Search
                          </div>
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className="flex gap-x-2 mt-3 lg:flex-row flex-col items-stretch">
                    {amazonProduct ? (
                      <div className="box flex-1 border border-gray-300 flex flex-col">
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
                              <div className="flex w-full items-center justify-between rounded-md border-2 border-primary bg-white p-2">
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
                      <div className="bg-white flex-1 border border-gray-300 flex flex-col">
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
                        {/* Product revenue */}
                        <div className="box !mb-0">
                          <div className="box-header border bg-blue-900 !py-3">
                            <div className="box-title !text-white">
                              <i className="ti ti-anchor text-[1.2rem] me-2"></i>
                              Product Revenue
                            </div>
                          </div>
                          <div className="flex flex-col lg:flex-row">
                            <div className="p-5 w-full lg:w-4/6 grid grid-cols-1 xl:grid-cols-4 gap-2">
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
                            <div className="p-5 w-full lg:w-4/6 grid  grid-cols-1 xl:grid-cols-4 gap-2">
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
                              className="p-5 grid w-full lg:w-2/6  grid-cols-1 lg:grid-cols-2 gap-2 bg-gray-200 dark:bg-black"
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
                                ) : (
                                  <></>
                                )}
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
                              className="lg:col-start-9 mt-8 lg:mt-0 lg:col-span-4"
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
                      </div>
                    </form>
                  </div>

                  <div
                    id="hs-stacked-overlays"
                    className={`hs-overlay ${
                      isPopupOpen ? "block" : "hidden"
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
                                  <Select
                                    value={selectedCategory}
                                    onValueChange={(value) => {
                                      setSelectedCategory(value);
                                    }}
                                  >
                                    <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-500">
                                      <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        {categories.map((cat: any) => (
                                          <SelectItem
                                            key={cat.id}
                                            value={cat.id}
                                          >
                                            {cat.name}
                                          </SelectItem>
                                        ))}
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>
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
                    className={`hs-overlay ${
                      isSecondPopupOpen ? "block" : "hidden"
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
          </>
        </>
      )}
    </>
  );
};

export default ProProfitPro;
