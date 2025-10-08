import React from 'react';

interface ProductLoadingSkeletonProps {
  count?: number;
  className?: string;
}

const ProductLoadingSkeleton: React.FC<ProductLoadingSkeletonProps> = ({ 
  count = 8, 
  className = '' 
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
        >
          {/* Product Image Skeleton */}
          <div className="h-48 bg-gray-200 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
          </div>
          
          {/* Product Content Skeleton */}
          <div className="p-4 space-y-3">
            {/* Title Skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
            
            {/* Price Skeleton */}
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            
            {/* Rating Skeleton */}
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
            
            {/* Badges Skeleton */}
            <div className="flex flex-wrap gap-2">
              <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
            </div>
            
            {/* Button Skeleton */}
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductLoadingSkeleton;
