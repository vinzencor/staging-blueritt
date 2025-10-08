import React from "react";

interface SubscriptionData {
  plan: string;
  balance: number;
  dueDate: string;
  billingCycle: string;
  lastFilledAmount: number;
  lastPaymentDate: string;
  autoRenew: boolean;
  activeSubscription: boolean;
}

interface SubscriptionTabProps {
  subscriptionData: SubscriptionData;
  onCancelClick: () => void;
  onToggleAutoRenew: () => void;
  onNavigateToTab: (tabName: string) => void;
  isTogglingAutoRenew?: boolean;
  hasActiveSubscription?: boolean;
}

const SubscriptionTab: React.FC<SubscriptionTabProps> = ({
  subscriptionData,
  onCancelClick,
  onToggleAutoRenew,
  onNavigateToTab,
  isTogglingAutoRenew = false,
}) => {
  const today = new Date();
  const dueDate = new Date(subscriptionData.dueDate);
  const isExpired = dueDate < today;
  const isTrial = subscriptionData.plan === "Trial";
  const isSubscribed = subscriptionData.activeSubscription === true; // Assuming this flag exists
console.log(isSubscribed,"this is subscribed false")
  // define variable for condition base
  const isTrialCencel = isTrial && !isSubscribed && !isExpired;
  const isTrialCencelExpierd = isTrial && !isSubscribed && isExpired;
  const isTrialActiveSubscribed = isTrial && isSubscribed;
  const isNoTrialNoSubscription = !isTrial;
  const isTrialExpiredUnsubscribed = isTrial && isExpired && isSubscribed;
console.log(isTrialCencel,"this is cansell trail")

  return (
    <div className="divide-y">
      <div className="py-4 flex">
        <div className="w-1/2">
          <div className="font-medium">
            Current Plan: {subscriptionData.plan}
          </div>

          <>
            {isTrialCencel && (
              // Case 1: User Cancels during Trial (trial active, no subscription)
              <div className="text-gray-600 text-sm">
                Trial active and ending on{" "}
                {dueDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                .{" "}
                <a
                  href="#"
                  className="text-gray-600 underline text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToTab("Plans");
                  }}
                >
                  Resubscribe Now
                </a>{" "}
                to maintain full access to your selected plan
              </div>
            )}

            {isTrialActiveSubscribed && (
              // Case 2: Trial in progress and subscribed
              <div className="text-gray-600 text-sm">
                Trial in progress.{" "}
                <a
                  href="#"
                  className="text-gray-600 underline text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToTab("Plans");
                  }}
                >
                  Subscribe Now
                </a>{" "}
                to unlock full access to your selected plan
              </div>
            )}

            {isTrialExpiredUnsubscribed && (
              // Case 3: Trial expired and not subscribed
              <div className="text-gray-600 text-sm">
                Trial expired <br />
                <a
                  href="#"
                  className="text-gray-600 underline text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToTab("Plans");
                  }}
                >
                  Update Your Plan
                </a>
              </div>
            )}
            {isTrialCencelExpierd && (
              // Case 3: Trial expired and not subscribed
              <div className="text-gray-600 text-sm">
                Trial expired <br />
                <a
                  href="#"
                  className="text-gray-600 underline text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToTab("Plans");
                  }}
                >
                  Update Your Plan
                </a>
              </div>
            )}

            {isNoTrialNoSubscription && !isSubscribed && (
              // Case 5: No trial, no subscription
              <div className="text-gray-600 text-sm">
                <a
                  href="#"
                  className="text-gray-600 underline text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToTab("Plans");
                  }}
                >
                  Update Your Plan
                </a>
              </div>
            )}
            {isNoTrialNoSubscription && isSubscribed && (
              // Case 5: No trial, no subscription
              <div className="text-gray-600 text-sm">
                <a
                  href="#"
                  className="text-gray-600 underline text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToTab("Plans");
                  }}
                >
                  Update Your Plan
                </a>
              </div>
            )}
          </>
        </div>

        <div className="w-1/2 text-right">
          <div>Due on {subscriptionData.dueDate}</div>
          <div className="text-gray-500">{subscriptionData.billingCycle}</div>
        </div>
      </div>
      <div className="py-4 flex">
        <div className="w-1/2">
          <div>Last Filled Amount</div>
          <a
            href="#"
            className="text-gray-600 underline text-sm"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToTab("Add-ons Balance History");
            }}
          >
            Balance History
          </a>
        </div>
        <div className="w-1/2 text-right">
          <div>${subscriptionData.lastFilledAmount.toFixed(2)}</div>
          <div>{subscriptionData.lastPaymentDate}</div>
        </div>
      </div>
      <div className="py-4 flex">
        <div className="w-1/2">
          <div>Last Payment Cleared At</div>
          <a
            href="#"
            className="text-gray-600 underline text-sm"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToTab("Invoices");
            }}
          >
            Payment History
          </a>
        </div>
        <div className="w-1/2 text-right">
          <div>{subscriptionData.lastPaymentDate}</div>
        </div>
      </div>
      <div className="py-4 flex justify-between items-center">
        <div>Renew Automatically</div>
        <div>
          {isTogglingAutoRenew ? (
            <div className="w-12 h-6 flex items-center justify-center">
              <div className="animate-pulse bg-gray-200 w-6 h-6 rounded-full"></div>
            </div>
          ) : (
            <div
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
                subscriptionData.autoRenew ? "bg-indigo-600" : "bg-gray-300"
              }`}
              onClick={onToggleAutoRenew}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform ${
                  subscriptionData.autoRenew ? "translate-x-6" : "translate-x-0"
                } transition-transform duration-300`}
              ></div>
            </div>
          )}
        </div>
      </div>
      <div className="py-4">
        <button
          disabled={!subscriptionData.activeSubscription}
          onClick={onCancelClick}
            className="text-gray-600 underline text-sm"
        >
          {subscriptionData.activeSubscription ? (
            "Cancel Subscription"
          ) : !isExpired ? (
            <p>
              Your subscription remains active and is scheduled for cancellation
              at the end of the current billing period.
              <br />
              <span className="flex justify-start">
                {`You will retain full access until ${subscriptionData.dueDate}.`}
              </span>
            </p>
          ) : isExpired ? (
            <p>
             Your subscription is currently inactive and cancelled.
            </p>
          ) : null}
        </button>
        
      </div>
    </div>
  );
};

export default SubscriptionTab;
