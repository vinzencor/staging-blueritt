import { updatePaymentMethod } from "@/api/pricing";
import { useEffect, useState } from "react";
import { fetchAccountSummary } from "@/api/pricing";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

interface SpkJobsCardsProps {
  path?: string;
}

export const OverviewCard: React.FC<SpkJobsCardsProps> = ({ path }) => {
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    plan: "N/A",
    balance: 0,
    dueDate: "N/A",
    billingCycle: "Monthly",
    lastFilledAmount: 0,
    lastPaymentDate: "N/A",
    remainingBalance: "0",
    autoRenew: false,
    isActiveSubscription: false,
    package_price: 0,
  });

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
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const getAccountSummary = async () => {
    try {
      setIsLoading(true);
      const response = await fetchAccountSummary();
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
          isActiveSubscription: response.data.activeSubscription || false,
          package_price: response.data.package_price || 0,
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

  useEffect(() => {
    getAccountSummary();
  }, []);

  const today = new Date();
  const dueDate = new Date(subscriptionData.dueDate);
  const isExpired = dueDate < today;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[290px]">
        {/* Subscription Information Card */}
        <div className="p-4 rounded-md box bg-white dark:bg-black text-black dark:text-white">
          {isLoading ? (
            <div>Loading subscription data...</div>
          ) : (
            <>
              <div className="font-semibold text-base">Subscription Information</div>
              <hr className="my-1" />
              <div className="mt-1 flex flex-col md:flex-row items-center justify-between gap-2">
                <p>Your Add-on Balance: ${subscriptionData.balance.toFixed(2)}</p>
                <Link to={`${import.meta.env.BASE_URL}settings/subscription/`}>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg w-full md:w-auto">
                    Fill Balance for Add-ons
                  </button>
                </Link>
              </div>
              <hr className="my-1" />
              <p className="my-1">
                Current Plan:{" "}
                {subscriptionData.plan === "Trial" ? "Advance" : subscriptionData.plan}
              </p>
              <p className="my-1">
                Subscription Status:{" "}
                {subscriptionData.plan === "Trial" && subscriptionData.isActiveSubscription
                  ? "Trial"
                  : subscriptionData.isActiveSubscription
                  ? "Active"
                  : !subscriptionData.isActiveSubscription && !isExpired
                  ? "Scheduled for Cancellation"
                  : !subscriptionData.isActiveSubscription && isExpired
                  ? "Cancelled"
                  : "Inactive"}
              </p>
              <p className="my-1">
                Billing Cycle: ${subscriptionData.package_price} / {subscriptionData.billingCycle}
              </p>
              <p className="my-1">
                Next Payment Date:{" "}
                {subscriptionData.isActiveSubscription ? subscriptionData.dueDate : "N/A"}
              </p>
              <p className="my-1">
                Subscription Start Date: {subscriptionData.lastPaymentDate}
              </p>
              <p className="my-1">
                Subscription End Date:{" "}
                {subscriptionData.plan === "Trial" ? "N/A" : subscriptionData.dueDate}
              </p>
            </>
          )}
        </div>

        {/* Quick Action Card */}
        <div className="p-4 rounded-md box bg-white dark:bg-black text-black dark:text-white">
          <div className="font-semibold text-base">Quick Action</div>
          <hr className="my-2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div className="flex flex-col space-y-5 mx-3">
              <Link to={`${import.meta.env.BASE_URL}settings/profile`}>
                <button className="bg-primary text-white py-2 px-2 rounded-md flex items-center gap-3 w-44">
                  <span className="bg-white text-primary rounded-full flex items-center justify-center text-right w-5 h-5">
                    <i className="bx bxs-user"></i>
                  </span>
                  Edit Profile
                </button>
              </Link>

              <button
                className="bg-primary text-white py-2 px-2 rounded-md flex items-center gap-3 w-44"
                onClick={handleUpdatePaymentMethod}
                disabled={isUpdatingPayment}
              >
                <span className="bg-white text-primary rounded-full flex items-center justify-center w-5 h-5">
                  <i className="ri-bank-card-fill"></i>
                </span>
                {isUpdatingPayment ? "Updating..." : "Update Card"}
              </button>

              <Link
                to={`${import.meta.env.BASE_URL}settings/subscription`}
                state={{ activeTab: "Purchase Add-ons" }}
              >
                <button className="bg-primary text-white py-2 px-2 rounded-md flex items-center gap-3 w-44">
                  <span className="bg-white text-primary p-1 rounded-full flex items-center justify-center w-5 h-5">
                    <i className="ri-sticky-note-add-fill"></i>
                  </span>
                  View Addons
                </button>
              </Link>
            </div>

            <div className="flex flex-col space-y-5 mx-3">
              <Link to={`${import.meta.env.BASE_URL}settings/profile`}>
                <button className="bg-primary text-white py-2 px-2 rounded-md flex items-center gap-3 w-44">
                  <span className="bg-white text-primary p-1 rounded-full flex items-center justify-center w-5 h-5">
                    <i className="ri-lock-unlock-fill"></i>
                  </span>
                  Change Password
                </button>
              </Link>

              <Link
                to={`${import.meta.env.BASE_URL}settings/subscription`}
                state={{ activeTab: "Plans" }}
              >
                <button className="bg-primary text-white py-2 px-2 rounded-md flex items-center gap-3 w-44">
                  <span className="bg-white text-primary p-1 rounded-full flex items-center justify-center w-5 h-5">
                    <i className="ri-file-list-fill"></i>
                  </span>
                  Update Plan
                </button>
              </Link>

              <Link
                to={`${import.meta.env.BASE_URL}settings/subscription`}
                state={{ activeTab: "Invoices" }}
              >
                <button className="bg-primary text-white py-2 px-2 rounded-md flex items-center gap-3 w-44">
                  <span className="bg-white text-primary p-1 rounded-full flex items-center justify-center w-5 h-5">
                    <i className="ri-file-history-fill"></i>
                  </span>
                  Invoice History
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewCard;
