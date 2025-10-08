import { FC, Fragment, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SpkButton from "../../../@spk/uielements/spk-button";
import { countries } from "@/utils/constants";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useSearchParams } from "react-router-dom";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { Switch } from "@headlessui/react";
import ReCAPTCHA from "react-google-recaptcha";

import * as Yup from "yup";
import authenticationImage from "@/assets/images/authentication/1.jpg";
import { useMutation, useQuery } from "@tanstack/react-query";
import { signup } from "@/api/auth";
import { getPackages } from "@/api/pricing";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AxiosError } from "axios";

interface SignupcoverProps {}

interface Plan {
  id: string;
  name: string;
  slug: string;
  amazon_searches: number;
  alibaba_searches: number;
  pintrest_searches: number;
  tiktok_searches: number;
  price: number;
  yearly_price: number;
  features: {
    access_to_gross_profit?: boolean;
    access_to_net_profit?: boolean;
    alibaba_match_per_product?: number;
    amazon_detail_access?: boolean;
    amazon_search?: number;
    customer_review_access?: boolean;
    marketplace_access?: boolean;
    no_of_customer_review?: number;
    no_of_gross_profit_calculations?: number;
    no_of_net_profit_calculations?: number;
    no_of_product_offer?: number;
    no_of_supplier_per_ai_match?: number;
    product_offer_access?: boolean;
  };
}

interface DisplayPackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  features: string[];
}

const SignupSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  country: Yup.string().required("Country is required"),
  phone: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional(),
  package: Yup.string().required("Please select a package"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  recaptcha: import.meta.env.VITE_RECAPTCHA_SITE_KEY
    ? Yup.string().required("Please complete the reCAPTCHA verification")
    : Yup.string(), // Optional for development
  agreeToTerms: Yup.boolean()
    .oneOf([true], "You must agree to terms and conditions")
    .required("You must agree to terms and conditions"),
});

const Signupcover: FC<SignupcoverProps> = () => {
  const navigate = useNavigate();
  const [passwordshow1, setpasswordshow1] = useState(false);
  const [passwordshow2, setpasswordshow2] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [isYearlyBilling, setIsYearlyBilling] = useState(false);
  const [searchParams] = useSearchParams();
  const [isIpBlocked, setIsIpBlocked] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phone: "",
    package: "",
    password: "",
    confirmPassword: "",
    recaptcha: "",
    agreeToTerms: false,
  });

  const {
    data: packages = [],
    isLoading,
    error,
  } = useQuery<Plan[]>({
    queryKey: ["packages"],
    queryFn: async () => {
      const response = await getPackages();
      return response.data as Plan[];
    },
  });

  const mapFeaturesToStrings = (pkg: any): string[] => {
    const features = [];

    // Safety check for package and features
    if (!pkg || !pkg.features) {
      return ["Package features not available"];
    }

    // Helper function to format numbers
    const formatNumber = (num: number | undefined | null) => {
      if (num === undefined || num === null) return "0";
      return num === -1 ? "Unlimited" : num.toString();
    };

    // Amazon searches
    if (pkg.features?.description !== undefined) {
      features.push(
        `${formatNumber(pkg.features.description)} Amazon searches`
      );
    }

    // Alibaba matches
    if (pkg.features?.alibaba_match_per_product !== undefined) {
      features.push(
        `${formatNumber(
          pkg.features.alibaba_match_per_product
        )} Discover Suppliers (X Times)`
      );
    }

    // Pinterest searches (kept for backward compatibility)
    if (pkg.pintrest_searches !== undefined) {
      features.push(
        `${formatNumber(pkg.pintrest_searches)} Pinterest searches`
      );
    }

    // TikTok searches (kept for backward compatibility)
    if (pkg.tiktok_searches !== undefined) {
      features.push(`${formatNumber(pkg.tiktok_searches)} TikTok searches`);
    }

    // Gross profit calculations
    if (pkg.features?.no_of_gross_profit_calculations !== undefined) {
      features.push(
        `${formatNumber(
          pkg.features.no_of_gross_profit_calculations
        )} Gross profit calculations`
      );
    }

    // Net profit calculations
    if (pkg.features?.no_of_net_profit_calculations !== 0) {
      features.push(
        `${formatNumber(
          pkg.features.no_of_net_profit_calculations
        )} Net profit calculations`
      );
    }

    // Supplier per AI match
    if (pkg.features?.no_of_supplier_per_ai_match !== undefined) {
      const value = pkg.features.no_of_supplier_per_ai_match;
      features.push(
        value === -1 || value === "unlimited"
          ? "All Matched Suppliers"
          : `${formatNumber(value)} Max Supplier Matches`
      );
    }

    // Number of users
    if (pkg.no_of_users !== undefined) {
      features.push(
        `${pkg.no_of_users} ${pkg.no_of_users === 1 ? "User" : "Users"}`
      );
    }

    return features;
  };

  const getPackageDescription = (pkg: any): string => {
    if (
      pkg.features?.description !== undefined &&
      pkg.features?.alibaba_match_per_product !== undefined
    ) {
      const amazonSearches =
        pkg.features.description === -1
          ? "Unlimited"
          : pkg.features.description;
      const alibabaMatches =
        pkg.features.alibaba_match_per_product === -1
          ? "Unlimited"
          : pkg.features.alibaba_match_per_product;
      return `${amazonSearches} Amazon searches, ${alibabaMatches} Alibaba matches`;
    }
    return pkg.description || "";
  };

  const getPackagePrice = (pkg: any): string => {
    if (isYearlyBilling && pkg.yearly_price) {
      const price = parseFloat(pkg.yearly_price);
      return `$${price.toFixed(2)}/year`;
    } else {
      const price = parseFloat(pkg.price);
      return `$${price.toFixed(2)}/month`;
    }
  };

  const displayPackages =
    isLoading || error
      ? []
      : packages
          .filter((pkg: any) => {
            return pkg.slug !== "trial" && pkg.is_active === true;
          })
          .map((pkg) => ({
            id: pkg.id,
            name: pkg.name,
            slug: pkg.slug,
            description: getPackageDescription(pkg),
            price: getPackagePrice(pkg),
            features: mapFeaturesToStrings(pkg),
          }));

  // Find the basic package to set as default
  useEffect(() => {
    const pkgFromUrl = searchParams.get("pkg"); // Get package from URL

    if (displayPackages.length > 0 && !selectedPackage) {
      const selectedPkg =
        displayPackages.find((pkg) => pkg.slug === pkgFromUrl) || // Check URL param
        displayPackages.find((pkg) => pkg.slug === "basic") || // Default to "basic"
        displayPackages[0]; // Default to first package

      if (selectedPkg) {
        setSelectedPackage(selectedPkg.id);
        setFormValues((prev) => ({
          ...prev,
          package: selectedPkg.id,
        }));
      }
    }
  }, [displayPackages, selectedPackage, searchParams]); // Added `searchParams` to dependencies

  const selectedPackageDetails = displayPackages.find(
    (pkg) => pkg.id === selectedPackage
  );

  const mutation = useMutation({
    mutationFn: (data: {
      firstName: string;
      lastName: string;
      email: string;
      country: string;
      packages: string;
      phone: string;
      password: string;
      confirmPassword: string;
      plan: string;
      billingType: string;
      recaptchaToken: string;
    }) => signup(data),
    onSuccess: () => {
      toast.success("Verification Email Sent", {
        autoClose: 30000,
      });

      navigate(`${import.meta.env.BASE_URL}login`);
    },
  });

  useEffect(() => {
    if (mutation.isError) {
      toast.dismiss();

      const error = mutation.error as AxiosError;

      if (error?.response?.data) {
        const errorData = error.response.data as any;
        if (error.status == 422 && errorData.message == "ip_blocked") {
          setIsIpBlocked(true);
          return;
        }
        if (
          errorData.detail === "Email already exists" ||
          errorData.message === "Email already exists" ||
          (Array.isArray(errorData.email) &&
            errorData.email.some((msg: string) =>
              msg.toLowerCase().includes("already exists")
            )) ||
          errorData.error?.includes("email") ||
          (typeof errorData === "string" &&
            errorData.toLowerCase().includes("email"))
        ) {
          toast.error(
            "This email address is already registered. Please use a different email or log in to your existing account."
          );
        } else if (errorData.detail || errorData.message) {
          toast.error(errorData.detail || errorData.message);
        } else {
          toast.error(
            "Signup failed. Please check your information and try again."
          );
        }
      } else {
        toast.error(
          error.message || "An error occurred during signup. Please try again."
        );
      }

      console.error("Signup error details:", error?.response?.data);
    }
  }, [mutation.isError]);

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    if (token) {
      setFormValues((prev) => ({
        ...prev,
        recaptcha: token,
      }));
    }
  };

  return (
    <Fragment>
      <div className="grid grid-cols-3 authentication mx-0 text-defaulttextcolor text-defaultsize">
        <div className="col-span-3 lg:col-span-2 bg-white dark:!bg-bodybg">
          <div className="flex justify-center items-center h-full">
            <div className="w-full">
              <div className="flex py-5 justify-center overflow-y-auto max-h-screen">
                <div className="w-4/6">
                  <div className="mb-4">
                    <img
                      src="https://www.blueritt.com/wp-content/uploads/2024/08/web-header.png"
                      alt=""
                      className="authentication-brand w-52"
                    />
                  </div>
                  <p className="h5 font-semibold mb-2">Sign Up</p>
                  <p className="mb-4 text-[#8c9097] dark:text-white/50 opacity-[0.7] font-normal">
                    Welcome &amp; Join us by creating a free account!
                  </p>

                  {isIpBlocked ? (
                    <div className="flex flex-col justify-center items-center h-[500px]">
                      <h3 className="font-semibold text-primary text-center mb-4">
                        Trial Access Restricted
                      </h3>
                      <p className="text-gray-800 text-center text-md">
                        It looks like a trial account has already been activated
                        from this IP address within the last 7 days.
                        <br />
                        To maintain fair usage, only one trial is allowed per IP
                        address during this period.
                        <br />
                        If you believe this is an error or you are on a shared
                        network, please contact{" "}
                        <a href="mailto:support@blueritt.com">
                          support@blueritt.com
                        </a>
                      </p>
                    </div>
                  ) : (
                    <Formik
                      initialValues={formValues}
                      enableReinitialize={true}
                      validationSchema={SignupSchema}
                      onSubmit={(values) => {
                        // Save the form values before submitting
                        setFormValues(values);

                        mutation.mutate({
                          firstName: values.firstName,
                          lastName: values.lastName,
                          email: values.email,
                          country: values.country,
                          packages: values.package,
                          phone: values.phone,
                          password: values.password,
                          confirmPassword: values.confirmPassword,
                          plan: selectedPackageDetails?.slug as string,
                          billingType: isYearlyBilling ? "yearly" : "monthly",
                          recaptchaToken: values.recaptcha,
                        });
                      }}
                    >
                      {({ errors, touched, setFieldValue, values }) => {
                        // Update form values when they change value
                        useEffect(() => {
                          setFormValues(values);
                        }, [values]);

                        return (
                          <Form>
                            <div className="gap-y-4 flex-col">
                              <div className="grid gap-x-4 grid-cols-1 lg:grid-cols-2">
                                <div className="w-full">
                                  <label
                                    htmlFor="firstName"
                                    className="form-label text-default"
                                  >
                                    First Name
                                  </label>
                                  <Field
                                    type="text"
                                    name="firstName"
                                    id="firstName"
                                    className={`form-control form-control-lg w-full !rounded-md ${
                                      errors.firstName && touched.firstName
                                        ? "border-red-500"
                                        : ""
                                    }`}
                                    placeholder="First name"
                                  />
                                  <div className="h-5">
                                    <ErrorMessage
                                      name="firstName"
                                      component="div"
                                      className="text-red-500 text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="w-full">
                                  <label
                                    htmlFor="lastName"
                                    className="form-label text-default"
                                  >
                                    Last Name
                                  </label>
                                  <Field
                                    type="text"
                                    name="lastName"
                                    id="lastName"
                                    className={`form-control form-control-lg w-full !rounded-md ${
                                      errors.lastName && touched.lastName
                                        ? "border-red-500"
                                        : ""
                                    }`}
                                    placeholder="Last name"
                                  />
                                  <div className="h-5">
                                    <ErrorMessage
                                      name="lastName"
                                      component="div"
                                      className="text-red-500 text-sm"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="grid gap-x-4 grid-cols-1 lg:grid-cols-2">
                                <div className="w-full">
                                  <label
                                    htmlFor="email"
                                    className="form-label text-default"
                                  >
                                    Email
                                  </label>
                                  <Field
                                    type="email"
                                    name="email"
                                    id="email"
                                    className={`form-control form-control-lg w-full !rounded-md ${
                                      errors.email && touched.email
                                        ? "border-red-500"
                                        : ""
                                    }`}
                                    placeholder="Email address"
                                  />
                                  <div className="h-5">
                                    <ErrorMessage
                                      name="email"
                                      component="div"
                                      className="text-red-500 text-sm"
                                    />
                                  </div>
                                </div>
                                {/* <div className="w-full">
                                  <label
                                    htmlFor="phone"
                                    className="form-label text-default"
                                  >
                                    Phone
                                  </label>
                                  <Field
                                    type="phone"
                                    name="phone"
                                    id="phone"
                                    className={`form-control border form-control-lg w-full !rounded-md ${
                                      errors.phone && touched.phone
                                        ? "border-red-500"
                                        : ""
                                    }`}
                                    placeholder="+1100-2031-1233"
                                  />
                                  <div className="h-5">
                                    <ErrorMessage
                                      name="phone"
                                      component="div"
                                      className="text-red-500 text-sm"
                                    />
                                  </div>
                                </div> */}
                                <div className="w-full relative">
                                  <label
                                    htmlFor="country"
                                    className="form-label text-default"
                                  >
                                    Country
                                  </label>
                                  <Listbox
                                    value={values.country}
                                    onChange={(value) => {
                                      setFieldValue("country", value);
                                    }}
                                  >
                                    <div className="relative">
                                      <ListboxButton className="form-control border form-control-lg w-full !rounded-md">
                                        <div className="flex justify-start">
                                          {values.country ||
                                            "Select your country"}
                                        </div>
                                      </ListboxButton>
                                      <ListboxOptions className="absolute left-0 top-0 w-full h-80 overflow-y-auto bg-white dark:bg-gray-800 shadow-lg z-50">
                                        {countries.map((country, index) => (
                                          <ListboxOption
                                            key={index}
                                            value={country}
                                            className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                                          >
                                            {country}
                                          </ListboxOption>
                                        ))}
                                      </ListboxOptions>
                                    </div>
                                  </Listbox>
                                  <div className="h-5">
                                    <ErrorMessage
                                      name="country"
                                      component="div"
                                      className="text-red-500 text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="w-full">
                                <div className="flex justify-between items-center mb-1">
                                  <label className="form-label text-default mb-0">
                                    Select Package
                                  </label>
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`text-sm ${
                                        !isYearlyBilling
                                          ? "font-medium text-primary"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Monthly
                                    </span>
                                    <Switch
                                      checked={isYearlyBilling}
                                      onChange={() => {
                                        setIsYearlyBilling(!isYearlyBilling);
                                        // When billing cycle changes, refresh display packages
                                        if (selectedPackageDetails) {
                                          setSelectedPackage(
                                            selectedPackageDetails.id
                                          );
                                        }
                                      }}
                                      className={`${
                                        isYearlyBilling
                                          ? "bg-primary"
                                          : "bg-gray-300"
                                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                                    >
                                      <span
                                        className={`${
                                          isYearlyBilling
                                            ? "translate-x-6"
                                            : "translate-x-1"
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                      />
                                    </Switch>
                                    <span
                                      className={`text-sm ${
                                        isYearlyBilling
                                          ? "font-medium text-primary"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Yearly
                                    </span>
                                  </div>
                                </div>
                                {/* Free trial note */}
                                <p className="text-sm text-gray-500 mb-2">
                                  <strong>7-Day Free Trial Included</strong> —
                                  Card required, no charge today. Billing starts
                                  after 7 days.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {isLoading ||
                                  !packages ||
                                  packages.length === 0
                                    ? [...Array(3)].map((_, index) => (
                                        <div
                                          key={index}
                                          className="border border-gray-300 rounded-md p-4 w-full bg-gray-200 dark:bg-gray-700 h-32 animate-pulse"
                                        ></div>
                                      ))
                                    : displayPackages.map((pkg) => (
                                        <div key={pkg.id} className="flex">
                                          <div
                                            className={`border border-gray-300 rounded-md p-4 w-full cursor-pointer transition-all hover:shadow-md ${
                                              selectedPackage === pkg.id
                                                ? "border-primary bg-primary/10"
                                                : "border-gray-200 dark:border-defaultborder/10"
                                            }`}
                                            onClick={() => {
                                              setSelectedPackage(pkg.id);
                                              setFieldValue("package", pkg.id);
                                            }}
                                          >
                                            <div className="flex items-center mb-2">
                                              <Field
                                                type="radio"
                                                name="package"
                                                id={`package-${pkg.id}`}
                                                value={pkg.id}
                                                className="form-check-input me-2"
                                                checked={
                                                  values.package === pkg.id
                                                }
                                              />
                                              <label
                                                htmlFor={`package-${pkg.id}`}
                                                className="font-medium"
                                              >
                                                {pkg.name}
                                              </label>
                                            </div>
                                            <p className="text-[13px] text-[#8c9097] dark:text-white/50">
                                              {pkg.name.toLowerCase() ===
                                              "basic"
                                                ? "Explore Blueritt with essential tools"
                                                : pkg.name.toLowerCase() ===
                                                  "advance"
                                                ? "More searches, deeper insights, faster growth"
                                                : pkg.name.toLowerCase() ===
                                                  "premium"
                                                ? "All features unlocked-maximum power & flexibility"
                                                : pkg.description}
                                            </p>

                                            {/* <p className="font-semibold mt-2">
                                              {pkg.price}
                                            </p> */}
                                          </div>
                                        </div>
                                      ))}
                                </div>
                                <div className="h-5">
                                  <ErrorMessage
                                    name="package"
                                    component="div"
                                    className="text-red-500 text-sm"
                                  />
                                </div>
                              </div>

                              <div className="w-full">
                                <label
                                  htmlFor="password"
                                  className="form-label text-default"
                                >
                                  Password
                                </label>
                                <div className="input-group">
                                  <Field
                                    type={passwordshow1 ? "text" : "password"}
                                    name="password"
                                    className={`form-control !border-s form-control-lg !rounded-e-none ${
                                      errors.password && touched.password
                                        ? "border-red-500"
                                        : ""
                                    }`}
                                    id="password"
                                    placeholder="Password"
                                  />
                                  <SpkButton
                                    Label="button"
                                    variant="light"
                                    customClass="ti-btn !rounded-s-none !mb-0"
                                    onclickfunc={() =>
                                      setpasswordshow1(!passwordshow1)
                                    }
                                    buttontype="button"
                                    Id="button-addon2"
                                  >
                                    <i
                                      className={`${
                                        passwordshow1
                                          ? "ri-eye-line"
                                          : "ri-eye-off-line"
                                      } align-middle`}
                                    ></i>
                                  </SpkButton>
                                </div>
                                <div className="h-5">
                                  <ErrorMessage
                                    name="password"
                                    component="div"
                                    className="text-red-500 text-sm"
                                  />
                                </div>
                              </div>

                              <div className="w-full">
                                <label
                                  htmlFor="confirmPassword"
                                  className="form-label text-default"
                                >
                                  Confirm Password
                                </label>
                                <div className="input-group">
                                  <Field
                                    type={passwordshow2 ? "text" : "password"}
                                    name="confirmPassword"
                                    className={`form-control !border-s form-control-lg !rounded-e-none ${
                                      errors.confirmPassword &&
                                      touched.confirmPassword
                                        ? "border-red-500"
                                        : ""
                                    }`}
                                    id="confirmPassword"
                                    placeholder="Confirm password"
                                  />
                                  <SpkButton
                                    Label="button"
                                    variant="light"
                                    customClass="ti-btn !rounded-s-none !mb-0"
                                    onclickfunc={() =>
                                      setpasswordshow2(!passwordshow2)
                                    }
                                    buttontype="button"
                                    Id="button-addon21"
                                  >
                                    <i
                                      className={`${
                                        passwordshow2
                                          ? "ri-eye-line"
                                          : "ri-eye-off-line"
                                      } align-middle`}
                                    ></i>
                                  </SpkButton>
                                </div>
                                <div className="h-5">
                                  <ErrorMessage
                                    name="confirmPassword"
                                    component="div"
                                    className="text-red-500 text-sm"
                                  />
                                </div>
                              </div>

                              <div className="w-full my-4">
                                <div className="flex justify-center">
                                  {import.meta.env.VITE_RECAPTCHA_SITE_KEY ? (
                                    <ReCAPTCHA
                                      ref={recaptchaRef}
                                      sitekey={
                                        import.meta.env.VITE_RECAPTCHA_SITE_KEY
                                      }
                                      onChange={(token) => {
                                        handleCaptchaChange(token);
                                        setFieldValue("recaptcha", token);
                                      }}
                                    />
                                  ) : (
                                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                                      <p className="text-gray-500 text-sm">
                                        reCAPTCHA disabled for local development
                                      </p>
                                      <button
                                        type="button"
                                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded text-sm"
                                        onClick={() => {
                                          setFieldValue("recaptcha", "dev-bypass-token");
                                          handleCaptchaChange("dev-bypass-token");
                                        }}
                                      >
                                        Bypass reCAPTCHA (Dev Mode)
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div className="h-5 flex justify-center">
                                  <ErrorMessage
                                    name="recaptcha"
                                    component="div"
                                    className="text-red-500 text-sm"
                                  />
                                </div>
                              </div>

                              <div className="w-full items-center">
                                <div className="flex items-center">
                                  <div className="form-check pt-2 !ps-0">
                                    <Field
                                      className="form-check-input align-middle"
                                      type="checkbox"
                                      name="agreeToTerms"
                                      id="agreeToTerms"
                                    />
                                  </div>
                                  <label
                                    className="form-check-label text-[#8c9097] dark:text-white/50 font-normal flex-wrap ms-2"
                                    htmlFor="agreeToTerms"
                                  >
                                    By creating an account you agree to our{" "}
                                    <Link
                                      to="https://www.blueritt.com/blueritt-terms-conditions/"
                                      className="text-success"
                                    >
                                      <u className="mx-1">
                                        Terms &amp; Conditions
                                      </u>
                                    </Link>
                                    and{" "}
                                    <Link
                                      to="https://www.blueritt.com/privacy-policy/"
                                      className="text-success"
                                    >
                                      <u className="mx-1">Privacy Policy</u>
                                    </Link>
                                  </label>
                                </div>
                                <div className="h-5">
                                  <ErrorMessage
                                    name="agreeToTerms"
                                    component="div"
                                    className="text-red-500 text-sm"
                                  />
                                </div>
                              </div>

                              <div className="grid mt-2">
                                <SpkButton
                                  type="submit"
                                  Size="lg"
                                  customClass="ti-btn bg-primary text-white !font-medium dark:border-defaultborder/10"
                                  disabled={mutation.isPending}
                                >
                                  {mutation.isPending
                                    ? "Creating Account..."
                                    : "Create Account"}
                                </SpkButton>
                              </div>
                            </div>
                          </Form>
                        );
                      }}
                    </Formik>
                  )}

                  <div className="text-center py-4">
                    <p className="text-[0.75rem] text-[#8c9097] dark:text-white/50">
                      Already have an account?{" "}
                      <Link
                        to={`${import.meta.env.BASE_URL}login`}
                        className="text-primary"
                      >
                        Sign In
                      </Link>
                    </p>
                    <p className=" text-[0.75rem] text-[#8c9097] dark:text-white/50 text-center mt-2">
                      {" "}
                      BlueRitt® is a proprietary product of ReverCe Technologies
                      Ltd. UK<br />
                      <span className="block "> © Copyright 
                        2025. All Rights Reserved
                      </span>{" "}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-0 lg:col-span-1 xl:block hidden relative">
          <div className="sticky top-0 h-screen overflow-hidden">
            {selectedPackage ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${authenticationImage})`,
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <div className="w-4/5 p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 text-primary">
                      {selectedPackageDetails?.name} Package
                    </h2>
                    <div className="mb-6">
                      <p className="text-lg font-semibold mb-2">
                        {selectedPackageDetails?.price}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedPackageDetails?.description}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-[16px] font-medium mb-2">
                        Feature Highlights:
                      </h3>
                      <ul className="space-y-2">
                        {selectedPackageDetails?.name === "Advance" ? (
                          <>
                            <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>Search up to 125 products (2.5x more)</span>
                            </li>
                            <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>
                                Product Details, Customer Reviews, Product
                                Offers (Unlocked in Advance)
                              </span>
                            </li>
                            <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>
                                Discover suppliers up to 250 times (more than
                                double)
                              </span>
                            </li>
                            <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>
                                AI based supplier matches per product (all
                                matches)
                              </span>
                            </li>
                            <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>
                                Calculate gross profit for up to 75 ASINs (3x
                                more)
                              </span>
                            </li>
                          </>
                        ) : selectedPackageDetails?.name === "Premium" ? (
                          <>
                            <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>
                                Unlock full access to product searches (up to
                                300)
                              </span>
                            </li>
                            <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>
                                Product Details, Customer Reviews, Product
                                Offers (Enhanced in Premium)
                              </span>
                            </li>
                            <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>
                                Discover suppliers with very large monthly cap
                                (up to 600)
                              </span>
                            </li>
                            <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>
                                AI based supplier matches per product (all
                                matches)
                              </span>
                            </li>
                            <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>
                                Run gross and net profit analysis for hundreds
                                of ASINs
                              </span>
                            </li>
                            <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>
                                Enjoy top-tier data access across every tool
                                (Exclusive Insights){" "}
                              </span>
                            </li>
                          </>
                        ) : (
                          <>
                            {/* <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>7 day Free Trial</span>
                            </li> */}
                            <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>Search up to 50 products</span>
                            </li>
                            <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>Discover suppliers up to 100 times</span>
                            </li>
                            <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>AI based supplier matches per product (all matches)</span>
                            </li>
                            <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>
                                Calculate gross profit for up to 25 ASINs
                              </span>
                            </li>
                            <li className="flex items-center">
                              <i className="ri-check-line text-green-500 mr-2"></i>
                              <span>Run net profit analysis on 10 ASINs</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get started with the {selectedPackageDetails?.name} plan
                        today and unlock all these amazing features.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${authenticationImage})`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Signupcover;
