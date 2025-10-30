import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingCart, CreditCard } from 'lucide-react';

interface AddOnsChoiceModalAmazonProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddOnsChoiceModalAmazon: React.FC<AddOnsChoiceModalAmazonProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handlePurchaseAddOns = () => {
    // Navigate to Subscription page with "Purchase Add-ons" tab active
    navigate('/settings/subscription', { state: { activeTab: 'Purchase Add-ons' } });
  };

  const handleUpdateSubscription = () => {
    // Navigate to Subscription page with "Plans" tab active
    navigate('/settings/subscription', { state: { activeTab: 'Plans' } });
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Upgrade Your Plan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            Choose how you'd like to enhance your search capabilities:
          </p>

          {/* Option 1: Purchase Product Search Add-ons */}
          <button
            onClick={handlePurchaseAddOns}
            className="w-full p-4 border-2 border-green-200 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 text-left group"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                  Purchase Product Search Add-ons
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Buy additional search credits to increase your quota limits
                </p>
              </div>
            </div>
          </button>

          {/* Option 2: Update Subscription */}
          <button
            onClick={handleUpdateSubscription}
            className="w-full p-4 border-2 border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-left group"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                  Update your Subscription
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upgrade to a higher plan for more features and unlimited searches
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOnsChoiceModalAmazon ;

