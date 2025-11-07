import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, Loader, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../../../../../api';

// Product interface
export interface BestSellerProduct {
  rank: number;
  asin: string;
  product_title: string;
  product_price: string;
  product_star_rating: string;
  product_num_ratings: number;
  product_url: string;
  product_photo: string;
  rank_change_label?: string | null;
  [key: string]: any;
}

// Default category for best sellers
const DEFAULT_CATEGORY = 'amazon-devices';

// Country options for Amazon marketplace
const COUNTRY_OPTIONS = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
];

// Loading Skeleton Component
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State Component
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <TrendingUp className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" />
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No Products Available</h3>
    <p className="text-xs text-gray-600 dark:text-gray-400">Check back later for best sellers!</p>
  </div>
);

// Product Card Component
interface ProductCardProps {
  product: BestSellerProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-[#ffa41c] dark:hover:border-[#ffa41c] hover:shadow-md dark:hover:shadow-lg transition-all duration-300 p-2 xl:p-3 overflow-hidden">
      {/* Product Image */}
      <div className="w-full h-20 xl:h-24 bg-gray-200 dark:bg-gray-700 rounded mb-2 overflow-hidden flex items-center justify-center">
        <img
          src={product.product_photo}
          alt={product.product_title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E';
          }}
        />
      </div>

      {/* Rank Badge */}
      <div className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-1.5 xl:px-2 py-0.5 xl:py-1 rounded-full text-[10px] xl:text-xs font-semibold mb-1.5 xl:mb-2">
        <span className="w-1 h-1 xl:w-1.5 xl:h-1.5 bg-orange-500 dark:bg-orange-400 rounded-full"></span>
        #{product.rank}
      </div>

      {/* Product Title */}
      <h3 className="font-semibold text-xs xl:text-sm text-gray-900 dark:text-white mb-1.5 xl:mb-2 line-clamp-2">
        {product.product_title}
      </h3>

      {/* Price */}
      <p className="text-base xl:text-lg font-bold text-[#ffa41c] dark:text-[#ffa41c] mb-1.5 xl:mb-2">
        {product.product_price}
      </p>

      {/* Rating */}
      <div className="flex items-center gap-1.5 xl:gap-2 mb-2 xl:mb-3">
        <div className="flex items-center">
          <span className="text-yellow-400 text-xs xl:text-sm">★</span>
          <span className="text-[10px] xl:text-xs font-semibold text-gray-900 dark:text-white ml-0.5 xl:ml-1">
            {product.product_star_rating || 'N/A'}
          </span>
        </div>
        {product.product_num_ratings && (
          <span className="text-[10px] xl:text-xs text-gray-600 dark:text-gray-400">
            ({product.product_num_ratings.toLocaleString()})
          </span>
        )}
      </div>

      {/* View Product Link */}
      <a
        href={product.product_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block w-full text-center px-2 py-1 xl:py-1.5 rounded-md bg-gradient-to-r from-[#ffa41c] to-[#ff6201] hover:bg-[#ff6201] dark:bg-[#ff6201] dark:hover:bg-[#ff6201] text-white text-[10px] xl:text-xs font-medium transition-colors"
      >
        View on Amazon →
      </a>
    </div>
  );
};

// Main TopInfluencersWidget Component
export const TopInfluencersWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  const location = useLocation();
  const [products, setProducts] = useState<BestSellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('GB');
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Determine if we're on Amazon page
  const isAmazonPage = location.pathname.includes('/socialpulse/amazon');

  // Fetch best sellers products
  useEffect(() => {
    if (!isAmazonPage) return;

    const fetchBestSellers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/products/amazon-trends/best-sellers-by-category/', {
          params: {
            category: DEFAULT_CATEGORY,
            type: 'BEST_SELLERS',
            page: '1',
            country: selectedCountry
          }
        });

        const data = response.data;
        console.log('Best sellers data:', data);

        if (data.data && data.data.best_sellers && Array.isArray(data.data.best_sellers)) {
          setProducts(data.data.best_sellers);
        } else {
          setError('No products found');
        }
      } catch (err) {
        console.error('Error fetching best sellers:', err);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBestSellers();
  }, [isAmazonPage, selectedCountry]);

  // Auto-scroll effect
  useEffect(() => {
    if (!scrollContainerRef.current || products.length === 0 || isLoading) return;

    const container = scrollContainerRef.current;
    let scrollInterval: NodeJS.Timeout;
    let isHovering = false;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (!isHovering && container) {
          container.scrollTop += 2;
          if (container.scrollTop >= container.scrollHeight - container.clientHeight - 10) {
            container.scrollTop = 0;
          }
        }
      }, 50);
    };

    const handleMouseEnter = () => {
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    startAutoScroll();

    return () => {
      clearInterval(scrollInterval);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [products, isLoading]);

  // Don't render if not on Amazon page
  if (!isAmazonPage) {
    return null;
  }

  return (
    <>
      {/* Desktop Widget - Show only on md screens and above (hidden on mobile) */}
      <div className={`
        hidden md:block fixed top-20 right-6 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto z-30
        transition-all duration-300 ease-in-out
        ${className}
      `}>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-md dark:shadow-lg h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-[#ffa41c] dark:text-[#ffa41c]" />
                Turn Trends Profitable
              </h2>
            </div>

            {/* Country Dropdown */}
            <div className="w-full">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Amazon Marketplace
              </label>
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 pr-10 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-[#ffa41c] focus:border-[#ffa41c] transition-colors appearance-none cursor-pointer"
                >
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
          <div
            ref={scrollContainerRef}
            className="flex-1 p-2 xl:p-4 overflow-y-auto scroll-smooth"
          >
            {isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="flex items-center gap-2 text-[#ffa41c] text-sm p-3 bg-red-50 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-2 xl:space-y-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.asin}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TopInfluencersWidget;