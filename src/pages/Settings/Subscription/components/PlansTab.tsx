import { useQuery } from "@tanstack/react-query";
import SpkBadge from "@/@spk/uielements/spk-badge";
import SpkButton from "@/@spk/uielements/spk-button";
import { getPackages, createCheckout } from "@/api/pricing";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useUserSubscriptionAndSearchQuota } from "@/hooks/useUserDetails";

interface PlanFeatures {
  access_to_gross_profit?: boolean;
  access_to_net_profit?: boolean;
  access_to_product_vault?: boolean;
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
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: string;
  description: string;
  yearly_price: string | null;
  no_of_users: number;
  features: PlanFeatures;
}
interface SubscriptionData {
  activeSubscription: boolean;
  dueDate: string;
}
interface PlansTabProps {
  subscriptionType?: string;
  trialEnabled?: boolean;
  subscriptionData?: SubscriptionData;
}

const PlansTab = ({
  subscriptionType = "trial",
  trialEnabled = false,
  subscriptionData,
}: PlansTabProps) => {
  const { quotaDetails, isLoading: isLoadingUserDetails } =
    useUserSubscriptionAndSearchQuota();

  // console.log(subscriptionData);
  const currentPlanName = quotaDetails?.packageName || "";
  const nextPackageName = quotaDetails?.nextPackageName || "";
  const currentBillingPeriod = quotaDetails?.billingPeriod || "";
  const isTrialPlan = quotaDetails?.onTrial || false;
  const showTrialMessage = isTrialPlan && subscriptionData?.activeSubscription;

  useEffect(() => {
    // example: simulate delayed showTrialMessage
    setTimeout(() => {
      showTrialMessage(true);
    }, 1000); // 1 second delay
  }, []);

  const [isProcessing, setIsProcessing] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    currentBillingPeriod
  );
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const isCurrentPlan = (plan: Plan): boolean => {
    if (
      billingPeriod != currentBillingPeriod ||
      !subscriptionData?.activeSubscription
    )
      return false;

    if (nextPackageName.toLowerCase() === "trial") {
      return plan.name === currentPlanName || plan.slug === currentPlanName;
    } else if (currentPlanName.toLowerCase() === "trial") {
      return plan.name === nextPackageName || plan.slug === nextPackageName;
    } else {
      return plan.name === currentPlanName || plan.slug === currentPlanName;
    }
  };

  const {
    data: allPlans = [],
    isLoading: isLoadingPlans,
    error,
  } = useQuery<Plan[]>({
    queryKey: ["packages", billingPeriod],
    queryFn: async () => {
      const response = await getPackages();
      return response.data as Plan[];
    },
  });
  const plans = allPlans.filter((plan) => plan.name.toLowerCase() !== "trial");
  // console.log(plans)
  const isLoading = isLoadingPlans || isLoadingUserDetails;

  const handleSubscribeClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };
  const handleConfirmSubscribe = async () => {
    if (!selectedPlan) return;

    try {
      setIsProcessing((prev) => ({ ...prev, [selectedPlan.id]: true }));
      const packageSlug = selectedPlan.slug || selectedPlan.name.toLowerCase();

      const response = await createCheckout(
        trialEnabled ? "trial" : "regular",
        packageSlug,
        billingPeriod
      );
      if (response?.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast.success(
          `Subscribing to ${selectedPlan.name} ${billingPeriod} plan. You'll be redirected to complete payment.`
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          `Failed to subscribe to ${selectedPlan.name}. Please try again.`
      );
    } finally {
      setIsProcessing((prev) => ({ ...prev, [selectedPlan.id]: false }));
      setShowModal(false);
      setSelectedPlan(null);
    }
  };

  const handleCancelSubscribe = () => {
    setShowModal(false);
    setSelectedPlan(null);
  };

  if (error)
    return <p className="text-center text-red-500">Error loading plans.</p>;

  const toggleBillingPeriod = (period: "monthly" | "yearly") => {
    setBillingPeriod(period);
  };

  const getPlanPrice = (plan: Plan): number => {
    return billingPeriod === "yearly" && plan.yearly_price
      ? Number(plan.yearly_price)
      : Number(plan.price);
  };

  const formatValue = (value: number | undefined): string => {
    if (value === undefined) return "0";
    return value === -1 ? "Unlimited" : value.toString();
  };

  useEffect(() => {
    setBillingPeriod(currentBillingPeriod);
  }, [currentBillingPeriod]);
  if (!subscriptionData?.dueDate) return null;

  const dueDate = new Date(subscriptionData.dueDate);
  console.log(dueDate, "subscription date");
  const today = new Date();
  const isExpired = dueDate <= today;
  console.log(isExpired, "subscription exierd");

  return (
    <div className="justify-center mt-10">
      <div className="flex justify-center !mb-6">
        <nav
          className="bg-primary/10 p-4 rounded-md mb-4"
          aria-label="Tabs"
          role="tablist"
        >
          <Link
            to="#"
            className={`cursor-pointer py-2 px-4 text-sm font-medium text-center rounded-sm ${
              billingPeriod === "monthly"
                ? "bg-primary text-white"
                : "text-primary hover:text-primary"
            }`}
            id="pricing-item"
            onClick={() => toggleBillingPeriod("monthly")}
            aria-controls="pricing-monthly1-pane"
          >
            Monthly
          </Link>
          <Link
            to="#"
            className={`cursor-pointer py-2 px-4 text-sm font-medium text-center rounded-sm ${
              billingPeriod === "yearly"
                ? "bg-primary text-white"
                : "text-primary hover:text-primary"
            }`}
            id="pricing-yearly1-item"
            onClick={() => toggleBillingPeriod("yearly")}
            aria-controls="pricing-yearly1-pane"
          >
            Yearly
          </Link>
        </nav>
      </div>

      <div className="container-lg">
        <div className="flex justify-center"></div>
        <div className="flex justify-center">
          <div className="">
            <h5 className="font-semibold text-center text-[1.25rem] text-defaulttextcolor">
              Pricing Plans
            </h5>
            <p className="text-[#8c9097] dark:text-white/50 text-center mb-6 text-[0.813rem]">
              Select best plans that fits your needs for your business growth,
              plans are flexible with the enterprise. Familiarize with the
              payment plans below
            </p>
          </div>
        </div>

        <div className="box">
          <div className="box-body">
            <div className="table-responsive">
              <table className="table table-bordered dark:border-defaultborder/10 whitespace-nowrap min-w-full text-center">
                <thead>
                  <tr>
                    <th scope="col">
                      <div className="">
                        <span className="text-[.9375rem] font-semibold">
                          Check Our Plans
                        </span>
                      </div>
                    </th>
                    {isLoading
                      ? Array.from({ length: 3 }).map((_, idx) => (
                          <th key={idx} className="text-center">
                            <div className="h-6 w-20 bg-gray-300 animate-pulse rounded mx-auto"></div>
                          </th>
                        ))
                      : plans.map((plan: Plan) => (
                          <th
                            key={plan.id}
                            className={`pricing- text-center ${
                              isCurrentPlan(plan)
                                ? "bg-blue-50  dark:bg-amber-900/10"
                                : ""
                            }`}
                          >
                            <div className="text-center">
                              <span className="text-[.9375rem] font-semibold">
                                {plan.name}
                                {isCurrentPlan(plan) && (
                                  <div className="mt-1">
                                    {/* <SpkBadge
                                      variant="primary"
                                      customClass="text-white text-xs !p-1 leading-none !rounded"
                                    >
                                      Current Plan
                                    </SpkBadge> */}
                                  </div>
                                )}
                              </span>
                            </div>
                            <td className="w-50">
                              <p className="whitespace-normal text-center">
                                {plan.description}
                              </p>
                            </td>
                          </th>
                        ))}
                  </tr>
                </thead>
                <tbody className="text-center">
                  <tr className="border border-defaultborder dark:border-defaultborder/10">
                    <td className="text-center"></td>
                    {isLoading
                      ? Array.from({ length: 3 }).map((_, idx) => (
                          <td key={idx} className="text-center">
                            <div className="h-8 w-full bg-gray-300 animate-pulse rounded mx-auto"></div>
                          </td>
                        ))
                      : plans.map((plan: Plan) => (
                          <td key={plan.id} className="text-center">
                            <div className="flex justify-center">
                              <div>
                                {isCurrentPlan(plan) && showTrialMessage ? (
                                  <button
                                    className={`ti-btn mt-5 ${
                                      isCurrentPlan(plan)
                                        ? "bg-success text-white"
                                        : "bg-primary text-white"
                                    }`}
                                    disabled={isProcessing[plan.id]}
                                    onClick={() => handleSubscribeClick(plan)}
                                  >
                                    {isProcessing[plan.id]
                                      ? "Processing..."
                                      : "Subscribe Now"}
                                  </button>
                                ) : (
                                  <button
                                    className={`ti-btn ${
                                      isCurrentPlan(plan)
                                        ? "bg-success text-white"
                                        : "bg-primary text-white"
                                    }`}
                                    disabled={
                                      isProcessing[plan.id] ||
                                      (isCurrentPlan(plan) && !isTrialPlan)
                                    }
                                    onClick={() => handleSubscribeClick(plan)}
                                  >
                                    {isProcessing[plan.id]
                                      ? "Processing..."
                                      : isCurrentPlan(plan)
                                      ? "Current Plan"
                                      : "Update Plan"}
                                  </button>
                                )}
                              </div>
                            </div>
                            <div>
                              {/*  Extra label for Active Trial */}
                              {isCurrentPlan(plan) && showTrialMessage && (
                                <p className="text-center">
                                  *
                                  {isExpired ? "Trial Expired" : "Active Trial"}
                                </p>
                              )}
                            </div>
                          </td>
                        ))}
                  </tr>
                  {/* Pricing Section */}
                  <tr className="text-center bg-light text-primary dark:border-defaultborder/10">
                    <td colSpan={plans.length + 1}>
                      <span className="text-[.875rem] font-semibold">
                        Pricing
                      </span>
                    </td>
                  </tr>
                  <tr className="border border-defaultborder dark:border-defaultborder/10">
                    <td className="text-center">Price</td>
                    {isLoading
                      ? Array.from({ length: 3 }).map((_, idx) => (
                          <td key={idx} className="text-center">
                            <div className="h-4 w-10 bg-gray-300 animate-pulse rounded mx-auto"></div>
                          </td>
                        ))
                      : plans.map((plan: Plan) => (
                          <td key={plan.id} className="text-center">
                            <div className="flex justify-center">
                              ${getPlanPrice(plan)}/
                              {billingPeriod === "monthly" ? "month" : "year"}
                            </div>
                          </td>
                        ))}
                  </tr>
                  {/* Global Section */}
                  <tr className="text-center bg-light text-primary  dark:border-defaultborder/10">
                    <td colSpan={plans.length + 1}>
                      <span className="text-[.875rem] font-semibold">
                        Global
                      </span>
                    </td>
                  </tr>
                  <tr className="border border-defaultborder dark:border-defaultborder/10">
                    <td className="text-center">7 Day Free Trial</td>
                    {plans.map((plan: Plan) => (
                      <td key={plan.id} className="text-center">
                        <div className="flex justify-center">
                          {true ? (
                            <SpkBadge
                              variant="success/10"
                              customClass="text-success !p-1 leading-none !rounded-full"
                            >
                              <i className="ri-check-line align-middle font-semibold"></i>
                            </SpkBadge>
                          ) : (
                            <SpkBadge
                              variant="danger/10"
                              customClass="text-danger !p-1 leading-none !rounded-full"
                            >
                              <i className="ri-close-line align-middle font-semibold"></i>
                            </SpkBadge>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* <tr className="border border-defaultborder dark:border-defaultborder/10">
                    <td className="text-center">Multiuser Login</td>
                    {plans.map((plan: Plan) => (
                      <td key={plan.id} className="text-center">
                        <div className="flex justify-center">
                          <span>{plan.no_of_users} User</span>
                        </div>
                      </td>
                    ))}
                  </tr> */}

                  <tr className="border border-defaultborder dark:border-defaultborder/10">
                    <td className="text-center">Marketplace Access</td>
                    {plans.map((plan: Plan) => (
                      <td key={plan.id} className="text-center">
                        <div className="flex justify-center">
                          {plan.features?.marketplace_access ? (
                            <p>All Amazon Marketplaces</p>
                          ) : (
                            <p>Limited Access</p>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="text-center bg-light  dark:border-defaultborder/10">
                    <td colSpan={plans.length + 1}>
                      <span className="text-primary text-[.875rem] font-semibold">
                        BlueRitt Explorer (Complete Flow)
                      </span>
                    </td>
                  </tr>

                  <tr className="border border-defaultborder dark:border-defaultborder/10">
                    <td className="text-center">Product Search Limit </td>
                    {isLoading
                      ? Array.from({ length: 3 }).map((_, idx) => (
                          <td key={idx} className="text-center">
                            <div className="h-4 w-10 bg-gray-300 animate-pulse rounded mx-auto"></div>
                          </td>
                        ))
                      : plans.map((plan: Plan) => (
                          <td key={plan.id} className="text-center">
                            <div className="flex justify-center">
                              {formatValue(plan.features?.amazon_search)}{" "}
                              Searches
                            </div>
                          </td>
                        ))}
                  </tr>

                  <tr className="border border-defaultborder dark:border-defaultborder/10">
                    <td className="text-center">Product Details</td>
                    {plans.map((plan: Plan) => (
                      <td key={plan.id} className="text-center">
                        <div className="flex justify-center">
                          {plan.features?.amazon_detail_access ? (
                            <SpkBadge
                              variant="success/10"
                              customClass="text-success !p-1 leading-none !rounded-full"
                            >
                              <i className="ri-check-line align-middle font-semibold"></i>
                            </SpkBadge>
                          ) : (
                            <SpkBadge
                              variant="danger/10"
                              customClass="text-danger !p-1 leading-none !rounded-full"
                            >
                              <i className="ri-close-line align-middle font-semibold"></i>
                            </SpkBadge>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="border border-defaultborder dark:border-defaultborder/10">
                    <td className="text-center">Customer Reviews</td>
                    {plans.map((plan: Plan) => (
                      <td key={plan.id} className="text-center">
                        <div className="flex justify-center">
                          {(plan.features?.no_of_customer_review || 0) > 0 ? (
                            <p>
                              {plan.features.no_of_customer_review} Top Reviews
                            </p>
                          ) : (
                            <SpkBadge
                              variant="danger/10"
                              customClass="text-danger !p-1 leading-none !rounded-full"
                            >
                              <i className="ri-close-line align-middle font-semibold"></i>
                            </SpkBadge>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="border border-defaultborder dark:border-defaultborder/10">
                    <td className="text-center">Product Offers</td>
                    {plans.map((plan: Plan) => (
                      <td key={plan.id} className="text-center">
                        <div className="flex justify-center">
                          {plan.features?.product_offer_access ? (
                            <div>
                              {plan.features?.no_of_product_offer === -1
                                ? "All Available Offers"
                                : plan.features?.no_of_product_offer || (
                                    <SpkBadge
                                      variant="danger/10"
                                      customClass="text-danger !p-1 leading-none !rounded-full"
                                    >
                                      <i className="ri-close-line align-middle font-semibold"></i>
                                    </SpkBadge>
                                  )}
                            </div>
                          ) : (
                            <SpkBadge
                              variant="danger/10"
                              customClass="text-danger !p-1 leading-none !rounded-full"
                            >
                              <i className="ri-close-line align-middle font-semibold"></i>
                            </SpkBadge>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="border border-defaultborder dark:border-defaultborder/10">
                    <td className="text-center">
                      Discover Suppliers (X Times)
                    </td>
                    {isLoading
                      ? Array.from({ length: 3 }).map((_, idx) => (
                          <td key={idx} className="text-center">
                            <div className="h-4 w-10 bg-gray-300 animate-pulse rounded mx-auto"></div>
                          </td>
                        ))
                      : plans.map((plan: Plan) => (
                          <td key={plan.id} className="text-center">
                            <div className="flex justify-center">
                              {formatValue(
                                plan.features?.alibaba_match_per_product
                              )}{" "}
                              Discoveries
                            </div>
                          </td>
                        ))}
                  </tr>

                  <tr className="border border-defaultborder dark:border-defaultborder/10">
                    <td className="text-center">Max Supplier Matches</td>
                    {isLoading
                      ? Array.from({ length: 3 }).map((_, idx) => (
                          <td key={idx} className="text-center">
                            <div className="h-4 w-10 bg-gray-300 animate-pulse rounded mx-auto"></div>
                          </td>
                        ))
                      : plans.map((plan: Plan) => (
                          <td key={plan?.id} className="text-center">
                            <div className="flex justify-center">
                              {plan?.features?.no_of_supplier_per_ai_match !=
                              null
                                ? plan.features.no_of_supplier_per_ai_match > 0
                                  ? `${formatValue(
                                      plan.features.no_of_supplier_per_ai_match
                                    )} Suppliers`
                                  : "All Matched Suppliers"
                                : "All Matched Suppliers"}
                            </div>
                          </td>
                        ))}
                  </tr>

                  <tr className="border border-defaultborder dark:border-defaultborder/10">
                    <td className="text-center">Gross Profit Calculation</td>
                    {plans.map((plan: Plan) => (
                      <td key={plan.id} className="text-center">
                        <div className="flex justify-center">
                          {plan.features?.access_to_gross_profit ? (
                            <SpkBadge
                              variant="success/10"
                              customClass="text-success !p-1 leading-none !rounded-full"
                            >
                              <i className="ri-check-line align-middle font-semibold"></i>
                            </SpkBadge>
                          ) : (
                            <SpkBadge
                              variant="danger/10"
                              customClass="text-danger !p-1 leading-none !rounded-full"
                            >
                              <i className="ri-close-line align-middle font-semibold"></i>
                            </SpkBadge>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="border border-defaultborder dark:border-defaultborder/10">
                    <td className="text-center">Net Profit Calculation </td>
                    {plans.map((plan: Plan) => (
                      <td key={plan.id} className="text-center">
                        <div className="flex justify-center">
                          {plan.features?.access_to_net_profit ? (
                            <SpkBadge
                              variant="success/10"
                              customClass="text-success !p-1 leading-none !rounded-full"
                            >
                              <i className="ri-check-line align-middle font-semibold"></i>
                            </SpkBadge>
                          ) : (
                            <SpkBadge
                              variant="danger/10"
                              customClass="text-danger !p-1 leading-none !rounded-full"
                            >
                              <i className="ri-close-line align-middle font-semibold"></i>
                            </SpkBadge>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="border border-defaultborder dark:border-defaultborder/10">
                    <td className="text-center">Product Vault (Save Search)</td>
                    {plans.map((plan: Plan) => (
                      <td key={plan.id} className="text-center">
                        <div className="flex justify-center">
                          {plan.features?.access_to_product_vault ? (
                            <SpkBadge
                              variant="success/10"
                              customClass="text-success !p-1 leading-none !rounded-full"
                            >
                              <i className="ri-check-line align-middle font-semibold"></i>
                            </SpkBadge>
                          ) : (
                            <SpkBadge
                              variant="danger/10"
                              customClass="text-danger !p-1 leading-none !rounded-full"
                            >
                              <i className="ri-close-line align-middle font-semibold"></i>
                            </SpkBadge>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="text-center bg-light  dark:border-defaultborder/10">
                    <td colSpan={plans.length + 1}>
                      <span className="text-primary text-[.875rem] font-semibold">
                        BlueRitt MarginMax Calculator
                      </span>
                    </td>
                  </tr>

                  <tr className="border border-defaultborder dark:border-defaultborder/10">
                    <td className="text-center">Gross Profit Calculation</td>
                    {plans.map((plan: Plan) => (
                      <td key={plan.id} className="text-center">
                        <div className="flex justify-center">
                          {plan.features?.access_to_gross_profit ? (
                            <div>
                              {plan.features
                                ?.no_of_gross_profit_calculations === -1
                                ? "Unlimited"
                                : plan.features
                                    ?.no_of_gross_profit_calculations || 0}{" "}
                              ASINs
                            </div>
                          ) : (
                            <SpkBadge
                              variant="danger/10"
                              customClass="text-danger !p-1 leading-none !rounded-full"
                            >
                              <i className="ri-close-line align-middle font-semibold"></i>
                            </SpkBadge>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="border border-defaultborder dark:border-defaultborder/10">
                    <td className="text-center">Net Profit Calculation</td>
                    {plans.map((plan: Plan) => (
                      <td key={plan.id} className="text-center">
                        <div className="flex justify-center">
                          {plan?.features?.access_to_net_profit &&
                          typeof plan?.features
                            ?.no_of_net_profit_calculations === "number" &&
                          (plan.features.no_of_net_profit_calculations > 0 ||
                            plan.features.no_of_net_profit_calculations ===
                              -1) ? (
                            <div>
                              {plan.features.no_of_net_profit_calculations ===
                              -1
                                ? "Unlimited"
                                : plan.features
                                    .no_of_net_profit_calculations}{" "}
                              ASINs
                            </div>
                          ) : (
                            <SpkBadge
                              variant="danger/10"
                              customClass="text-danger !p-1 leading-none !rounded-full"
                            >
                              <i className="ri-close-line align-middle font-semibold"></i>
                            </SpkBadge>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Modal */}
      {showModal && selectedPlan && (
        <div className="fixed px-4 lg:px-0 inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg box rounded-lg shadow-lg">
            <div className="p-6">
              <div className="box p-6 rounded-lg mb-6">
                <div className="flex items-center gap-x-2">
                  <i className="bx bxs-wallet text-primary text-2xl"></i>
                  <div>
                    <div className="font-medium text-gray-600">
                      Confirm Subscription
                    </div>
                    <p className="text-sm font-semibold">
                      Are you sure you want to subscribe to the{" "}
                      <strong>{selectedPlan.name}</strong> plan ({billingPeriod}
                      ) for ${getPlanPrice(selectedPlan)}/
                      {billingPeriod === "monthly" ? "month" : "year"}?
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  onClick={handleCancelSubscribe}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 text-white rounded ${
                    isProcessing[selectedPlan.id]
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary hover:bg-primary"
                  }`}
                  onClick={handleConfirmSubscribe}
                  disabled={isProcessing[selectedPlan.id]}
                >
                  {isProcessing[selectedPlan.id]
                    ? "Processing..."
                    : "Confirm Subscription"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansTab;
