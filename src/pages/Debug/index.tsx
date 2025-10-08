import React from 'react';
import ApiDebugger from '@/components/debug/ApiDebugger';

const DebugPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Debug Dashboard</h1>
        <ApiDebugger />
      </div>
    </div>
  );
};

export default DebugPage;
