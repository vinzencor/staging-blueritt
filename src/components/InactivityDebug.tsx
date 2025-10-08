/**
 * Debug component to test inactivity detection
 * This can be temporarily added to any page to test the inactivity functionality
 */

import React, { useState, useEffect } from 'react';
import { useInactivity } from './InactivityProvider';
import { Clock, Activity, AlertTriangle } from 'lucide-react';

const InactivityDebug: React.FC = () => {
  const { isInactive, showAlert, timeUntilInactive, resetTimer } = useInactivity();
  const [timeDisplay, setTimeDisplay] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const minutes = Math.floor(timeUntilInactive / (1000 * 60));
      const seconds = Math.floor((timeUntilInactive % (1000 * 60)) / 1000);
      setTimeDisplay(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeUntilInactive]);

  // For testing purposes, we can reduce the timeout to 30 seconds
  const testInactivity = () => {
    // This would trigger the inactivity detection immediately for testing
    console.log('Testing inactivity detection...');
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-40">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Inactivity Debug</h3>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status:</span>
          <span className={`font-medium ${isInactive ? 'text-red-600' : 'text-green-600'}`}>
            {isInactive ? 'Inactive' : 'Active'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Alert Shown:</span>
          <span className={`font-medium ${showAlert ? 'text-red-600' : 'text-gray-400'}`}>
            {showAlert ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Time Until Inactive:</span>
          <span className="font-mono text-blue-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeDisplay}
          </span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={resetTimer}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Reset Timer
        </button>
      </div>
      
      {showAlert && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-red-700 text-xs">Inactivity alert is showing!</span>
        </div>
      )}
    </div>
  );
};

export default InactivityDebug;
