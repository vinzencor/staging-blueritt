/**
 * Inactivity Alert Modal Component
 * Shows when user has been inactive for 20 minutes
 */

import React from 'react';
import { AlertTriangle, Clock, LogOut, RefreshCw } from 'lucide-react';

interface InactivityAlertProps {
  isOpen: boolean;
  onSignOut: () => void;
  onStayLoggedIn: () => void;
}

const InactivityAlert: React.FC<InactivityAlertProps> = ({
  isOpen,
  onSignOut,
  onStayLoggedIn
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-200">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Session Timeout Warning
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                No activity detected for 20 minutes
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start gap-3 mb-6">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  For your security, we've detected that you haven't been active for a while. 
                  Do you want to sign out or continue your session?
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onSignOut}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Yes, Sign Out
              </button>
              
              <button
                onClick={onStayLoggedIn}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                No, Stay Logged In
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                If you choose to stay logged in, your session will be extended and the inactivity timer will reset.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InactivityAlert;
