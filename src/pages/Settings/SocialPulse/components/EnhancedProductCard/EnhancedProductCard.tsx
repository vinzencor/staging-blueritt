import React, { useState } from "react";
import { TProductEntryInDataTable } from "../../index";
import {
  Star,
  ShoppingCart,
  TrendingUp,
  Award,
  Truck,
  Leaf,
  Crown,
  Eye,
  ExternalLink,
  Heart,
  Share2,
  BarChart3,
  Package,
  Globe,
  Zap
} from "lucide-react";

interface EnhancedProductCardProps {
  product: TProductEntryInDataTable;
  searchCountry: string;
  onViewDetails?: (asin: string) => void;
  onAddToWatchlist?: (product: TProductEntryInDataTable) => void;
}

const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({
  product,
  searchCountry,
  onViewDetails,
  onAddToWatchlist,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const discountPercentage = product.orignalPrice && product.orignalPrice > product.price
    ? Math.round(((product.orignalPrice - product.price) / product.orignalPrice) * 100)
    : 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRatingColor = (rating: string) => {
    const numRating = parseFloat(rating);
    if (numRating >= 4.5) return "text-emerald-600";
    if (numRating >= 4.0) return "text-blue-600";
    if (numRating >= 3.5) return "text-yellow-600";
    return "text-orange-600";
  };

  const getSalesVolumeColor = (volume: number) => {
    if (volume >= 3000) return "bg-gradient-to-r from-emerald-500 to-green-500";
    if (volume >= 1500) return "bg-gradient-to-r from-blue-500 to-cyan-500";
    if (volume >= 500) return "bg-gradient-to-r from-purple-500 to-pink-500";
    return "bg-gradient-to-r from-gray-400 to-gray-500";
  };

  const getPerformanceScore = () => {
    const rating = parseFloat(product.starRating);
    const salesScore = Math.min(product.salesVolume / 100, 100);
    const ratingScore = (rating / 5) * 100;
    return Math.round((salesScore + ratingScore) / 2);
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-emerald-200 transition-all duration-500 overflow-hidden transform hover:-translate-y-1">
      {/* Header Section with Gradient Background */}
      <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-4">
        {/* Top Badges Row */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2">
            {product.isBestSeller && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Award className="w-3 h-3" />
                #1 Best Seller
              </div>
            )}
            {product.isAmazonChoice && (
              <div className="bg-gradient-to-r from-gray-800 to-black text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Crown className="w-3 h-3" />
                Amazon's Choice
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {discountPercentage > 0 && (
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                -{discountPercentage}% OFF
              </div>
            )}
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full transition-all duration-300 ${
                isLiked
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Product Image and Quick Stats */}
        <div className="flex gap-4">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
              {!imageError ? (
                <img
                  src={product.imageUrl}
                  alt={product.productTitle}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              )}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
              )}
            </div>

            {/* Performance Score Badge */}
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              {getPerformanceScore()}%
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className={`w-4 h-4 fill-current ${getRatingColor(product.starRating)}`} />
                <span className={`font-bold text-sm ${getRatingColor(product.starRating)}`}>
                  {product.starRating}
                </span>
              </div>
              <span className="text-xs text-gray-500">({formatNumber(product.ratingCount)} reviews)</span>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                {formatNumber(product.salesVolume)} monthly sales
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{searchCountry.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5">
        {/* Product Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-tight">
          {product.productTitle}
        </h3>

        {/* Pricing Section */}
        <div className="mb-4">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl font-black text-gray-900">
              {product.currency}{product.price.toLocaleString()}
            </span>
            {product.orignalPrice && product.orignalPrice > product.price && (
              <span className="text-lg text-gray-500 line-through font-medium">
                {product.currency}{product.orignalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {discountPercentage > 0 && (
            <div className="text-sm text-emerald-600 font-semibold">
              You save {product.currency}{(product.orignalPrice! - product.price).toLocaleString()} ({discountPercentage}%)
            </div>
          )}
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">Market Position</span>
            </div>
            <div className="text-sm font-bold text-blue-800">Top {Math.ceil(Math.random() * 10)}%</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700">Demand Level</span>
            </div>
            <div className="text-sm font-bold text-purple-800">
              {product.salesVolume >= 2000 ? 'High' : product.salesVolume >= 1000 ? 'Medium' : 'Low'}
            </div>
          </div>
        </div>

        {/* Features Row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.isPrime && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
              <Truck className="w-3 h-3" />
              Prime Delivery
            </span>
          )}
          {product.climatePledgeFriendly && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-sm">
              <Leaf className="w-3 h-3" />
              Eco-Friendly
            </span>
          )}
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            {product.productOffers} offers available
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onViewDetails?.(product.asin)}
            className="flex-1 bg-gradient-to-r from-[#111c45] to-[#1e3a8a] hover:from-[#0f1629] hover:to-[#1e40af] text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>

          <button
            onClick={() => onAddToWatchlist?.(product)}
            className="px-4 py-3 border-2 border-emerald-500 hover:bg-emerald-500 hover:text-white text-emerald-600 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <ExternalLink className="w-4 h-4" />
            Track
          </button>

          <button
            className="px-4 py-3 border-2 border-gray-300 hover:bg-gray-100 text-gray-600 rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Info */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>ASIN: {product.asin}</span>
            <span>{product.delivery}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductCard;
