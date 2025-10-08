import { FC } from "react";
import { useNavigate } from "react-router-dom";

interface TrialSuccessProps {}

const TrialSuccess: FC<TrialSuccessProps> = () => {
  const navigate = useNavigate();

  const handleNavigateToDashboard = () => {
    navigate(`/`);
  };

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
            Subscription Activated Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            Your subscription has been activated. You now have access to
            App.
          </p>
          <button
            onClick={handleNavigateToDashboard}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrialSuccess;
