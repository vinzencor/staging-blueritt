import React from 'react';
import { Icon } from '@iconify-icon/react';
import { type TProductEntryInDataTable } from '../..';

interface EnhancedProductCardProps {
  product: TProductEntryInDataTable;
  searchCountry: string;
  onViewDetails: (asin: string) => void;
  onAddToWatchlist: (asin: string) => void;
}

const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({
  product,
  searchCountry,
  onViewDetails,
  onAddToWatchlist,
}) => {
  const formatPrice = (price: number, currency: string) => {
    return `${currency}${price.toFixed(2)}`;
  };

  const formatRating = (rating: string) => {
    return parseFloat(rating).toFixed(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
        <img
          src={product.imageUrl}
          alt={product.productTitle}
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (!img.src.includes('placeholder')) {
              img.src = '/placeholder-product.png';
            }
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isBestSeller && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-md font-semibold">
              Best Seller
            </span>
          )}
          {product.isAmazonChoice && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-semibold">
              Amazon's Choice
            </span>
          )}
          {product.isPrime && (
            <span className="bg-cyan-500 text-white text-xs px-2 py-1 rounded-md font-semibold flex items-center gap-1">
              <Icon icon="mdi:lightning-bolt" className="w-3 h-3" />
              Prime
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 min-h-[2.5rem]">
          {product.productTitle}
        </h3>

        {/* ASIN */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          ASIN: {product.asin}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            <Icon icon="mdi:star" className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white ml-1">
              {formatRating(product.starRating)}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({product.ratingCount?.toLocaleString() || 0} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.orignalPrice && product.orignalPrice > product.price && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                {formatPrice(product.orignalPrice, product.currency)}
              </span>
            )}
          </div>
        </div>

        {/* Sales Volume */}
        {product.salesVolume > 0 && (
          <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
            <Icon icon="mdi:cart" className="w-3 h-3 inline mr-1" />
            {product.salesVolume.toLocaleString()} sold
          </div>
        )}

        {/* Delivery */}
        {product.delivery && (
          <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
            <Icon icon="mdi:truck-delivery" className="w-3 h-3 inline mr-1" />
            {product.delivery}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto pt-3 flex gap-2">
          <button
            onClick={() => onViewDetails(product.asin)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <Icon icon="mdi:eye" className="w-4 h-4" />
            View Details
          </button>
          <button
            onClick={() => onAddToWatchlist(product.asin)}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200"
            title="Add to Watchlist"
          >
            <Icon icon="mdi:bookmark-outline" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductCard;

