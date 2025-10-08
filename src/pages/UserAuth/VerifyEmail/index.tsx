import { FC, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { startSubscription } from "@/api/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface VerifyEmailProps {}

const VerifyEmail: FC<VerifyEmailProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const packageSlug = searchParams.get("package");
  const billingPeriod = searchParams.get("billing_period");

  const mutation = useMutation({
    mutationFn: (data: {
      token: string;
      email: string;
      packageSlug: string;
      subscriptionType: string;
      billingPeriod: string;
    }) => startSubscription(data),
    onSuccess: async (response: any) => {
      if (response.data && response.data.url) {
        setRedirectUrl(response.data.url);
      } else {
        navigate(`/trial/success`);
      }
    },
    onError: (error: any) => {
      setError(
        error?.response?.data?.detail ||
          "Verification failed. Please try again or contact support."
      );
      toast.error(
        error?.response?.data?.detail ||
          "Verification failed. Please try again or contact support."
      );
    },
  });

  useEffect(() => {
    if (token) {
      mutation.mutate({
        token,
        email,
        packageSlug,
        subscriptionType: "user_customer_setup",
        billingPeriod,
      } as any);
    } else {
      setError(
        "Invalid verification link. Please check your email or contact support."
      );
      toast.error(
        "Invalid verification link. Please check your email or contact support."
      );
    }
  }, [token]);

  const handleRedirect = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full text-center">
        <img
          src="https://www.blueritt.com/wp-content/uploads/2024/08/web-header.png"
          alt=""
          className="mx-auto mb-6 w-52"
        />

        {mutation.isPending ? (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold mb-2">
              Verifying Your Email
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please wait while we verify your email address...
            </p>
          </div>
        ) : error ? (
          <div>
            <div className="text-red-500 text-5xl mb-4">
              <i className="ri-error-warning-line"></i>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-red-500">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate(`${import.meta.env.BASE_URL}login`)}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Return to Login
            </button>
          </div>
        ) : redirectUrl ? (
          <div>
            <div className="text-green-500 text-5xl mb-4">
              <i className="ri-checkbox-circle-line"></i>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-green-500">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your email has been verified. Click the button below to proceed with your subscription.
            </p>
            <button
              onClick={handleRedirect}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Continue to Subscription
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default VerifyEmail;
