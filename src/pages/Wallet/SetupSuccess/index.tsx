import { FC, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/api";

interface WalletSetupSuccessProps {}

const WalletSetupSuccess: FC<WalletSetupSuccessProps> = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const processWalletSetup = async () => {
      const amount = searchParams.get("amount");
      const description = searchParams.get("description");

      if (!amount) {
        setError("Missing amount parameter");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Call the backend to process the wallet setup and charge the card
        const response = await api.post("/common/wallet/process_setup_success/", {
          amount: parseFloat(amount),
          description: description || "Wallet funding"
        });

        if (response.data.success) {
          setIsSuccess(true);
          toast.success(`Successfully added $${amount} to your wallet!`);
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate("/");
          }, 3000);
        } else {
          setError(response.data.error || "Failed to process wallet funding");
          toast.error(response.data.error || "Failed to process wallet funding");
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.error || "Failed to process wallet funding";
        setError(errorMessage);

        // Show more helpful error messages
        if (errorMessage.includes("No customer found") || errorMessage.includes("No payment method found")) {
          toast.error("Please set up a payment method first by going through the subscription process.");
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    processWalletSetup();
  }, [searchParams, navigate]);

  const handleGoToDashboard = () => {
    navigate("/");
  };

  const handleGoToSubscription = () => {
    navigate("/settings/subscription");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full text-center">
          <img
            src="https://www.blueritt.com/wp-content/uploads/2024/08/web-header.png"
            alt="Logo"
            className="mx-auto mb-6 w-52"
          />
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h2 className="text-2xl font-semibold mb-2">Processing Payment...</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
              Please wait while we process your wallet funding.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full text-center">
          <img
            src="https://www.blueritt.com/wp-content/uploads/2024/08/web-header.png"
            alt="Logo"
            className="mx-auto mb-6 w-52"
          />
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
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
              {error}
            </p>
            <div className="flex flex-col gap-3">
              {(error.includes("No customer found") || error.includes("No payment method found")) ? (
                <button
                  onClick={handleGoToSubscription}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  Set Up Payment Method
                </button>
              ) : null}
              <button
                onClick={handleGoToDashboard}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full text-center">
        <img
          src="https://www.blueritt.com/wp-content/uploads/2024/08/web-header.png"
          alt="Logo"
          className="mx-auto mb-6 w-52"
        />

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
          <h2 className="text-2xl font-semibold mb-2">
            Wallet Funded Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            Your wallet has been funded successfully. You will be redirected to the dashboard shortly.
          </p>
          <button
            onClick={handleGoToDashboard}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletSetupSuccess;
