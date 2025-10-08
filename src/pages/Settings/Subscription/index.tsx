import { useState, useEffect, act } from "react";
import { useLocation } from "react-router-dom";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import SubscriptionTab from "./components/SubscriptionTab";
import InvoicesTab from "./components/InvoicesTab";
import BalanceHistoryTab from "./components/BalanceHistoryTab";
import AddonsTab from "./components/AddonsTab";
import PlansTab from "./components/PlansTab";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  updatePaymentMethod,
  toggleAutoRenew,
  cancelSubscription,
  chargeCard,
  fetchAccountSummary,
} from "@/api/pricing";
import { toast } from "react-toastify";
import { useUserSubscriptionAndSearchQuota } from "@/hooks/useUserDetails";
import Pageheader from "@/components/common/page-header/pageheader";
import { QuotaNames } from "@/enum";

const Subscription = () => {
  interface SubscriptionData {
    plan: string;
    balance: number;
    dueDate: string;
    remainingBalance: string;
    billingCycle: string;
    lastFilledAmount: number;
    lastPaymentDate: string;
    autoRenew: boolean;
    activeSubscription: boolean;
    lastPaymentDateWallet: string;
    lastFilledAmountWallet: number;
  }

  const location = useLocation();
  const subscriptionDataHook = useUserSubscriptionAndSearchQuota();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    plan: "N/A",
    balance: 0,
    dueDate: "N/A",
    billingCycle: "Monthly",
    lastFilledAmount: 0.0,
    lastPaymentDate: "N/A",
    remainingBalance: "0",
    autoRenew: false,
    activeSubscription: false,
    lastPaymentDateWallet: "N/A",
    lastFilledAmountWallet: 0,
  });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showFillBalanceModal, setShowFillBalanceModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Subscription");
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isTogglingAutoRenew, setIsTogglingAutoRenew] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isChargingCard, setIsChargingCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch subscription data
  const getAccountSummary = async () => {
    try {
      setIsLoading(true);
      const response = await fetchAccountSummary();
      console.log(response.data, "pricing data subscription");
      if (response?.data) {
        setSubscriptionData({
          plan: response.data.plan || "N/A",
          balance: response.data.balance || 0,
          dueDate: response.data.dueDate || "N/A",
          billingCycle: response.data.billingCycle || "Monthly",
          lastFilledAmount: response.data.lastFilledAmount || 0,
          lastPaymentDate: response.data.lastPaymentDate || "N/A",
          remainingBalance: response.data.remainingBalance || "0",
          autoRenew: response.data.autoRenew || false,
          activeSubscription: response.data.activeSubscription || false,
          lastPaymentDateWallet: response.data.lastPaymentDateWallet || "N/A",
          lastFilledAmountWallet: response.data.lastFilledAmountWallet || 0,
        });
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to fetch subscription data"
      );
      console.error("Error fetching account summary:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const refreshAccountData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    getAccountSummary();
  }, [refreshTrigger]);

  // From your Subscription component
  useEffect(() => {
    if (location.state) {
      if (location.state.activeTab) {
        setActiveTab(location.state.activeTab);
      }
    }
  }, [location]);

  const [subscriptionType, setSubscriptionType] = useState("trial");
  const [trialEnabled, setTrialEnabled] = useState(false);

  // Set subscription type and trial flag from location state
  useEffect(() => {
    if (location.state) {
      if (location.state.subscriptionType) {
        setSubscriptionType(location.state.subscriptionType);
      }
      if (location.state.trialEnabled !== undefined) {
        setTrialEnabled(location.state.trialEnabled);
      }
    }
  }, [location]);

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleCloseModal = () => {
    setShowCancelModal(false);
  };

  const handleToggleAutoRenew = async () => {
    try {
      setIsTogglingAutoRenew(true);
      await toggleAutoRenew();

      setSubscriptionData({
        ...subscriptionData,
        autoRenew: !subscriptionData.autoRenew,
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
    } finally {
      setIsTogglingAutoRenew(false);
    }
  };

  const handleNavigateToTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleFillBalanceClick = () => {
    if (subscriptionData.plan === "Trial") {
      toast.error(
        "A valid subscription is required to use Fill Balance for Add-ons. Please subscribe now to enable this feature."
      );
      return;
    }
    setShowFillBalanceModal(true);
  };
  const handleCloseFillBalanceModal = () => {
    setShowFillBalanceModal(false);
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      setIsUpdatingPayment(true);
      const response = await updatePaymentMethod();

      if (response?.data?.url) {
        window.location.href = response.data.url;
      } else {
        console.log("Payment method update initiated");
      }
    } catch (error) {
      console.error("Error updating payment method:", error);
      setIsUpdatingPayment(false);
    }
  };

  const cancelSubscriptionSchema = Yup.object().shape({
    cancelReason: Yup.string()
      .min(10, "Please provide at least 10 characters of feedback")
      .required("Please tell us why you're canceling"),
  });

  const fillBalanceSchema = Yup.object().shape({
    fillAmount: Yup.number()
      .positive("Amount must be positive")
      .min(5, "Minimum amount is $5")
      .max(10000, "Maximum amount is $10,000")
      .required("Please enter an amount"),
  });

  return (
    <>
      <Pageheader
        currentpage="Settings"
        activepage="Payments"
        mainpage={activeTab}
      />
      <div className="p-6 rounded-md bg-white box">
        {subscriptionDataHook.quotaDetails.hasPaymentIssues && (
          <div className="border border-gray-300 rounded-md p-3 mb-6 text-center">
            Your card attempt is failed,{" "}
            <span
              className="text-blue-500 font-medium cursor-pointer"
              onClick={handleUpdatePaymentMethod}
            >
              {isUpdatingPayment ? "PROCESSING..." : "UPDATE YOUR CARD"}
            </span>{" "}
            to keep on using the application
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <button
            className="text-primary hover:underline flex items-center"
            onClick={refreshAccountData}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
                Refresh Data
              </>
            )}
          </button>

          <div className="flex items-center gap-4">
            <div>Your balance: ${subscriptionData.balance.toFixed(2)}</div>
            <button
              disabled={trialEnabled || isLoading}
              className={`border rounded-md bg-primary cursor-pointer px-4 py-1 text-white 
      `}
              onClick={handleFillBalanceClick}
            >
              Fill Balance
            </button>
          </div>
        </div>

        <div className="w-full">
          <div className="hidden sm:flex border-b border-gray-200">
            {[
              "Subscription",
              "Invoices",
              "Add-ons Balance History",
              "Purchase Add-ons",
              "Plans",
            ].map((tab) => (
              <button
                key={tab}
                className={`relative mr-2 border-x border-t rounded-t-md py-2 px-4 sm:px-6
                  ${
                    activeTab === tab
                      ? "text-primary font-medium"
                      : "text-black hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700"
                  }`}
                onClick={() => setActiveTab(tab)}
                style={activeTab === tab ? { marginBottom: "-1px" } : {}}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Mobile Listbox */}
          <div className="sm:hidden mb-4">
            <Listbox
              value={activeTab}
              onChange={(value) => setActiveTab(value)}
            >
              <div className="relative">
                <ListboxButton className="form-control border form-control-lg w-full !rounded-md py-2 px-3">
                  <div className="flex justify-between items-center">
                    <span>{activeTab}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </ListboxButton>
                <ListboxOptions className="absolute left-0 top-full w-full mt-1 overflow-y-auto bg-white shadow-lg z-50 rounded-md max-h-60">
                  {[
                    "Subscription",
                    "Invoices",
                    "Add-ons Balance History",
                    "Purchase Add-ons",
                    "Plans",
                  ].map((tab) => (
                    <ListboxOption
                      key={tab}
                      value={tab}
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    >
                      {tab}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>

          <div className="border border-gray-200 p-3 rounded-b-md relative z-0">
            {activeTab === "Subscription" && isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading subscription details...
              </div>
            ) : activeTab === "Subscription" && subscriptionData ? (
              <SubscriptionTab
                subscriptionData={subscriptionData}
                onCancelClick={handleCancelClick}
                onToggleAutoRenew={handleToggleAutoRenew}
                onNavigateToTab={handleNavigateToTab}
                isTogglingAutoRenew={isTogglingAutoRenew}
              />
            ) : null}

            {activeTab === "Invoices" && (
              <InvoicesTab
                dueDate={subscriptionData.dueDate}
                refreshTrigger={refreshTrigger}
              />
            )}

            {activeTab === "Add-ons Balance History" && (
              <BalanceHistoryTab
                remainingBalance={subscriptionData.remainingBalance}
                refreshTrigger={refreshTrigger}
              />
            )}

            {activeTab === "Purchase Add-ons" && (
              <AddonsTab refreshAccountData={refreshAccountData} />
            )}

            {activeTab === "Plans" && (
              <PlansTab
                subscriptionType={subscriptionType}
                subscriptionData={subscriptionData}
                trialEnabled={trialEnabled}
              />
            )}
          </div>
        </div>
        {showCancelModal && (
          <div
            id="hs-stacked-overlays"
            className="hs-overlay block hs-overlay-backdrop-open:bg-gray-900/50 size-full fixed top-0 start-0 z-[60] overflow-x-hidden overflow-y-auto backdrop-blur-sm bg-gray-900/50"
          >
            <div className="mt-40 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 opacity-100 ease-out transition-all sm:max-w-2xl sm:w-full m-3 sm:mx-auto">
              <div className="flex flex-col bg-white border shadow-sm rounded-lg dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70">
                <div className="flex justify-between items-center py-3 px-4 border-b dark:border-neutral-700">
                  <h6 className="font-bold text-gray-800 dark:text-white">
                    Cancel Subscription
                  </h6>
                  <button
                    type="button"
                    className="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700"
                    onClick={handleCloseModal}
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
                  <Formik
                    initialValues={{ cancelReason: "" }}
                    validationSchema={cancelSubscriptionSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                      try {
                        setIsCancelling(true);
                        await cancelSubscription(values.cancelReason);
                        toast.success(
                          "Your subscription has been cancelled successfully"
                        );
                        handleCloseModal();

                        refreshAccountData();
                      } catch (error: any) {
                        toast.error(
                          error?.response?.data?.error ||
                            "Failed to cancel subscription"
                        );
                      } finally {
                        setIsCancelling(false);
                        setSubmitting(false);
                      }
                    }}
                  >
                    {({ isSubmitting, isValid }) => (
                      <Form className="flex flex-col gap-y-5">
                        <div>
                          <p className="mb-4 text-gray-600">
                            Please tell us why you are canceling your
                            subscription:
                          </p>
                          <div className="mb-4">
                            <Field
                              as="textarea"
                              name="cancelReason"
                              className="w-full border box rounded p-2 mb-1 h-32 focus:ring-2 focus:ring-primary focus:outline-none"
                              placeholder="Your feedback helps us improve our service..."
                            />
                            <ErrorMessage
                              name="cancelReason"
                              component="div"
                              className="text-red-500 text-sm"
                            />
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={handleCloseModal}
                              className="mr-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={
                                isSubmitting || !isValid || isCancelling
                              }
                              className={`px-4 py-2 text-white rounded ${
                                isValid && !isCancelling
                                  ? "bg-primary hover:bg-primary"
                                  : "bg-gray-400"
                              }`}
                            >
                              {isCancelling
                                ? "Processing..."
                                : "Confirm Cancellation"}
                            </button>
                          </div>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        )}

        {showFillBalanceModal && (
          <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
            <div className="w-full max-w-md box rounded-lg shadow-lg">
              <div className="p-6">
                <div className="box p-6 rounded-lg mb-6">
                  <div className="flex items-center gap-3">
                    <div className="text-primary">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="2"
                          y="6"
                          width="20"
                          height="12"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="4"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">
                        Available Balance
                      </div>
                      <div className="text-xl font-semibold">
                        ${subscriptionData.balance.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <Formik
                  initialValues={{ fillAmount: "" }}
                  validationSchema={fillBalanceSchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    try {
                      const numAmount = parseFloat(values.fillAmount);
                      if (isNaN(numAmount) || numAmount <= 0) {
                        toast.error("Please enter a valid amount");
                        return;
                      }

                      setIsChargingCard(true);
                      // Call the API to charge the card
                      const response = await chargeCard(numAmount);

                      if (response?.data?.url) {
                        window.location.href = response.data.url;
                      } else {
                        // Handle direct success (no redirect needed)
                        toast.success(
                          `Successfully added $${numAmount.toFixed(
                            2
                          )} to your balance`
                        );

                        handleCloseFillBalanceModal();

                        // Refresh data instead of manually updating
                        refreshAccountData();
                      }
                    } catch (error: any) {
                      toast.error(
                        error?.response?.data?.error ||
                          "Failed to charge card. Please try again."
                      );
                    } finally {
                      setIsChargingCard(false);
                      setSubmitting(false);
                    }
                  }}
                >
                  {({ isSubmitting, isValid, touched, errors }) => (
                    <Form>
                      <div className="mb-8">
                        <h2 className="text-lg font-medium mb-4">
                          Fill Your Balance
                        </h2>
                        <div className="mb-4">
                          <label className="block text-sm text-gray-600 mb-2">
                            Write the amount you want to fill ($)
                          </label>
                          <Field
                            type="number"
                            name="fillAmount"
                            className={`w-full p-2 box border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                              touched.fillAmount && errors.fillAmount
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            min="5"
                            step="0.01"
                            placeholder="Enter amount"
                          />
                          <ErrorMessage
                            name="fillAmount"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleCloseFillBalanceModal}
                          className="mr-2 px-4 py-2  hover:bg-gray-400 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || !isValid || isChargingCard}
                          className={`px-4 py-2 text-white rounded ${
                            isValid && touched.fillAmount && !isChargingCard
                              ? "bg-primary hover:bg-primary"
                              : "bg-gray-400"
                          }`}
                        >
                          {isChargingCard
                            ? "Processing..."
                            : "Proceed to checkout"}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Subscription;
