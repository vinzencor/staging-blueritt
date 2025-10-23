/**
 * Demo component to test keyword filtering functionality
 * This can be temporarily added to any page to test the keyword filter
 */

import React, { useState } from 'react';
import { checkForBlockedKeywords, getBlockedContentMessage } from '../utils/keywordFilter';

const KeywordFilterDemo: React.FC = () => {
  const [testInput, setTestInput] = useState('');
  const [result, setResult] = useState<{
    isBlocked: boolean;
    matchedKeywords: string[];
    category: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTestInput(value);
    
    if (value.trim()) {
      const filterResult = checkForBlockedKeywords(value);
      setResult(filterResult);
    } else {
      setResult(null);
    }
  };

  const testCases = [
    'apple watch',
    'child porn',
    'wireless headphones',
    'buy cocaine',
    'gaming laptop',
    'fuck this',
    'bomb tutorial',
    'normal search',
    'rape porn',
    'free credit card'
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        🛡️ Keyword Filter Demo
      </h2>
      
      {/* Manual Test Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Test Keyword Filtering:
        </label>
        <input
          type="text"
          value={testInput}
          onChange={handleInputChange}
          placeholder="Type something to test..."
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            result?.isBlocked 
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
          } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
        />
        
        {/* Real-time Result Display */}
        {result && (
          <div className={`mt-3 p-3 rounded-lg ${
            result.isBlocked 
              ? 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700' 
              : 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-lg ${result.isBlocked ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {result.isBlocked ? '🚫' : '✅'}
              </span>
              <span className={`font-medium ${result.isBlocked ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'}`}>
                {result.isBlocked ? 'BLOCKED' : 'ALLOWED'}
              </span>
            </div>
            
            {result.isBlocked && (
              <>
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  <strong>Category:</strong> {result.category}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  <strong>Matched Keywords:</strong> {result.matchedKeywords.join(', ')}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  <strong>Message:</strong> {getBlockedContentMessage(result.category)}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Quick Test Buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Quick Tests:
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {testCases.map((testCase, index) => {
            const testResult = checkForBlockedKeywords(testCase);
            return (
              <button
                key={index}
                onClick={() => setTestInput(testCase)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  testResult.isBlocked
                    ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40'
                    : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/40'
                }`}
              >
                {testResult.isBlocked ? '🚫' : '✅'} "{testCase}"
              </button>
            );
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Filter Statistics:
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-green-600 dark:text-green-400">✅ Safe: </span>
            <span className="text-gray-700 dark:text-gray-300">
              {testCases.filter(test => !checkForBlockedKeywords(test).isBlocked).length}
            </span>
          </div>
          <div>
            <span className="text-red-600 dark:text-red-400">🚫 Blocked: </span>
            <span className="text-gray-700 dark:text-gray-300">
              {testCases.filter(test => checkForBlockedKeywords(test).isBlocked).length}
            </span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
          How it works:
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Type in the input field to test real-time filtering</li>
          <li>• Click quick test buttons to try predefined examples</li>
          <li>• Blocked content shows red styling and error details</li>
          <li>• Safe content shows green styling</li>
          <li>• The filter checks for inappropriate keywords across multiple categories</li>
        </ul>
      </div>
    </div>
  );
};

export default KeywordFilterDemo;
