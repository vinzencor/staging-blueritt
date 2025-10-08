import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { retryPayment } from "@/api/pricing";

const PaymentStatus = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const setupSuccess = queryParams.get("setup_success");
    console.log(setupSuccess,'setupSuccess');
    if (setupSuccess === "true") {
      handleRetryPayment();
    } else {
      setIsLoading(false);
      handleNavigateToSubscription()
    }
  }, [location.search, navigate]);

  const handleRetryPayment = async () => {
    try {
      setIsLoading(true);
      await retryPayment();
      setIsSuccess(true);
    } catch (err) {
      console.error("Error retrying payment:", err);
      setError("Failed to process payment. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToSubscription = () => {
    navigate("/settings/subscription");
  };

  return (
    <div className="mt-5 p-6 rounded-md bg-white">
      <div className="text-lg font-semibold pb-6">Payment Status</div>

      <div className="flex flex-col items-center justify-center py-12">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600">Processing your payment...</p>
          </div>
        ) : isSuccess ? (
          <div className="flex flex-col items-center">
            <div className="bg-green-100 rounded-full p-3 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6 text-center">
              Your payment method has been updated and payment has been processed successfully.
            </p>
            <button
              onClick={handleNavigateToSubscription}
              className="px-6 py-2 bg-primary text-white rounded hover:bg-opacity-90"
            >
              Return to Subscription
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg-red-100 rounded-full p-3 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6 text-center">
              {error || "There was an issue processing your payment."}
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleRetryPayment}
                className="px-6 py-2 bg-primary text-white rounded hover:bg-opacity-90"
              >
                Retry Payment
              </button>
              <button
                onClick={handleNavigateToSubscription}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Return to Subscription
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus; 