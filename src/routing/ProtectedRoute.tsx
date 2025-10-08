import { ReactNode, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { userAuthContext } from "@/contexts/UserAuth";

type IProtectedRoutePropTypes = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: IProtectedRoutePropTypes) => {
  const { accessToken, loading, needsSubscription, dueDate } =
    useContext(userAuthContext);
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6 mt-10 bg-white min-h-screen">
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
    );
  }

  // If not authenticated, redirect to login
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  console.log("needsSubscription", dueDate,needsSubscription);
  // If user needs a subscription and is not already on the subscription page, redirect to plans
  if (
    (needsSubscription &&
      (dueDate && new Date() > new Date(dueDate))) &&
    !location.pathname.includes("/settings/subscription")
  ) {
    return (
      <Navigate
        to="/settings/subscription"
        state={{
          activeTab: "Plans",
          subscriptionType: "general",
          trialEnabled: false,
        }}
        replace
      />
    );
  }

  // Otherwise, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
