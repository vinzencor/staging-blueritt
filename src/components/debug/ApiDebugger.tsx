import React, { useState } from 'react';
import { getAmazonExplorerBestSellers, searchAmazonExplorerProducts } from '@/api/amazonExplorer';
import { getAmazonTopProducts } from '@/api/product';

interface ApiResponse {
  success: boolean;
  data: any;
  error?: string;
  timestamp: string;
}

const ApiDebugger: React.FC = () => {
  const [responses, setResponses] = useState<ApiResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const addResponse = (success: boolean, data: any, error?: string) => {
    const response: ApiResponse = {
      success,
      data,
      error,
      timestamp: new Date().toISOString()
    };
    setResponses(prev => [response, ...prev]);
  };

  const testBestSellers = async () => {
    setLoading(true);
    try {
      console.log('Testing Best Sellers API...');
      const result = await getAmazonExplorerBestSellers({ 
        category: 'software', 
        country: 'US', 
        page: 1 
      });
      console.log('Best Sellers Result:', result);
      addResponse(true, result);
    } catch (error: any) {
      console.error('Best Sellers Error:', error);
      addResponse(false, null, error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testSearch = async () => {
    setLoading(true);
    try {
      console.log('Testing Search API...');
      const result = await searchAmazonExplorerProducts({ 
        query: 'laptop', 
        country: 'US', 
        page: 1 
      });
      console.log('Search Result:', result);
      addResponse(true, result);
    } catch (error: any) {
      console.error('Search Error:', error);
      addResponse(false, null, error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testTopProducts = async () => {
    setLoading(true);
    try {
      console.log('Testing Top Products API...');
      const result = await getAmazonTopProducts();
      console.log('Top Products Result:', result);
      addResponse(true, result.data);
    } catch (error: any) {
      console.error('Top Products Error:', error);
      addResponse(false, null, error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const clearResponses = () => {
    setResponses([]);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">API Debugger</h2>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={testBestSellers}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Best Sellers
        </button>
        
        <button
          onClick={testSearch}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Search
        </button>
        
        <button
          onClick={testTopProducts}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Top Products
        </button>
        
        <button
          onClick={clearResponses}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Testing API...</p>
        </div>
      )}

      <div className="space-y-4">
        {responses.map((response, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              response.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`font-semibold ${
                response.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {response.success ? '✅ Success' : '❌ Error'}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(response.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            {response.error && (
              <div className="text-red-600 mb-2">
                <strong>Error:</strong> {response.error}
              </div>
            )}
            
            <details className="cursor-pointer">
              <summary className="font-medium mb-2">Response Data</summary>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </details>
            
            {response.success && response.data && (
              <div className="mt-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Status:</strong> {response.data.status || 'N/A'}
                  </div>
                  <div>
                    <strong>Products Count:</strong> {
                      response.data.data?.products?.length || 
                      response.data.length || 
                      'N/A'
                    }
                  </div>
                  <div>
                    <strong>Total:</strong> {response.data.data?.total || 'N/A'}
                  </div>
                  <div>
                    <strong>Remaining Quota:</strong> {response.data.remaining_quota || 'N/A'}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {responses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No API tests run yet. Click a button above to test an endpoint.
        </div>
      )}
    </div>
  );
};

export default ApiDebugger;
