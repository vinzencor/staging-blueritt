import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, Loader, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// Add CSS for auto-scroll animation
const scrollStyles = `
  @keyframes autoScroll {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-100%);
    }
  }

  .auto-scroll-container {
    animation: autoScroll 40s linear infinite;
  }

  .auto-scroll-container:hover {
    animation-play-state: paused;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollStyles;
  document.head.appendChild(style);
}

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

// Country options for Amazon marketplace - Only 13 countries from BlueRitt Explorer
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
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-[#ffa41c] dark:hover:border-[#ffa41c] hover:shadow-md dark:hover:shadow-lg transition-all duration-300 p-3 overflow-hidden">
      {/* Product Image */}
      <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded mb-3 overflow-hidden flex items-center justify-center">
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
      <div className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-2 py-1 rounded-full text-xs font-semibold mb-2">
        <span className="w-1.5 h-1.5 bg-orange-500 dark:bg-orange-400 rounded-full"></span>
        #{product.rank}
      </div>

      {/* Product Title */}
      <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">
        {product.product_title}
      </h3>

      {/* Price */}
      <p className="text-lg font-bold text-[#ffa41c] dark:text-[#ffa41c] mb-2">
        {product.product_price}
      </p>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center">
          <span className="text-yellow-400">★</span>
          <span className="text-xs font-semibold text-gray-900 dark:text-white ml-1">
            {product.product_star_rating || 'N/A'}
          </span>
        </div>
        {product.product_num_ratings && (
          <span className="text-xs text-gray-600 dark:text-gray-400">
            ({product.product_num_ratings.toLocaleString()})
          </span>
        )}
      </div>

      {/* View Product Link */}
      <a
        href={product.product_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block w-full text-center px-2 py-1.5 rounded-md bg-gradient-to-r from-[#ffa41c] to-[#ff6201] hover:bg-[#ff6201] dark:bg-[#ff6201] dark:hover:bg-[#ff6201] text-white text-xs font-medium transition-colors"
      >
        View on Amazon →
      </a>
    </div>
  );
};

// Mobile Toggle Button Component
interface MobileToggleProps {
  isOpen: boolean;
  onClick: () => void;
  productCount: number;
}

const MobileToggle: React.FC<MobileToggleProps> = ({ isOpen, onClick, productCount }) => (
  <button
    onClick={onClick}
    className="lg:hidden fixed top-20 right-4 z-40 bg-[#ffa41c] hover:bg-[#ff6201] text-white p-3 rounded-full shadow-lg transition-all duration-300"
  >
    <div className="flex items-center gap-2">
      <TrendingUp className="w-5 h-5" />
      <span className="text-sm font-medium">Trending Products({productCount})</span>
      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </div>
  </button>
);

// Main TopInfluencersWidget Component
export const TopInfluencersWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  const location = useLocation();
  const [products, setProducts] = useState<BestSellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('US');
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
        const response = await fetch(
          `https://real-time-amazon-data.p.rapidapi.com/best-sellers?category=${DEFAULT_CATEGORY}&type=BEST_SELLERS&page=1&country=${selectedCountry}`,
          {
            method: 'GET',
            headers: {
              'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
              'x-rapidapi-key': '60cb7bd196mshfa4299228d59ae3p16cdb0jsn5bf954e1e4a5'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Best sellers data:', data);

          if (data.data && data.data.best_sellers && Array.isArray(data.data.best_sellers)) {
            setProducts(data.data.best_sellers);
          } else {
            setError('No products found');
          }
        } else {
          setError(`Failed to load products (Status: ${response.status})`);
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

  // Auto-scroll effect - continuous carousel scroll
  useEffect(() => {
    if (!scrollContainerRef.current || products.length === 0 || isLoading) return;

    const container = scrollContainerRef.current;
    let scrollInterval: NodeJS.Timeout;
    let isHovering = false;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (!isHovering && container) {
          // Scroll down continuously
          container.scrollTop += 2;

          // Reset to top when reaching bottom for infinite loop
          if (container.scrollTop >= container.scrollHeight - container.clientHeight - 10) {
            container.scrollTop = 0;
          }
        }
      }, 50); // Smooth scrolling speed
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

  // Close mobile widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileOpen && !target.closest('.mobile-influencer-widget') && !target.closest('.mobile-toggle-button')) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen]);

  // Don't render if not on Amazon page
  if (!isAmazonPage) {
    return null;
  }

  // Widget content component to avoid duplication
  const WidgetContent = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-md dark:shadow-lg h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          {/* Icon only on mobile, with hover tooltip */}
          <div className="relative group">
            {/* Mobile: Icon only */}
            <div className="lg:hidden flex items-center">
              <TrendingUp className="w-5 h-5 text-[#ffa41c] dark:text-[#ffa41c]" />
              {/* Hover tooltip for mobile */}
              <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                Turn Trends Profitable
              </div>
            </div>

            {/* Desktop: Full text */}
            <h2 className="hidden lg:flex text-lg font-bold text-gray-900 dark:text-white items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-[#ffa41c] dark:text-[#ffa41c]" />
              Turn Trends Profitable

            </h2>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Close products panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Country Dropdown */}
        <div className="w-full">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amazon Marketplace
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-[#ffa41c] focus:border-[#ffa41c] transition-colors"
          >
            {COUNTRY_OPTIONS.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex-1 p-4 overflow-y-auto scroll-smooth"
      >
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="flex items-center gap-2 text-[#ffa41c] text-sm p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-3">
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
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <MobileToggle
        isOpen={isMobileOpen}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        productCount={products.length}
      />

      {/* Mobile Bottom Sheet */}
      <div className={`
        lg:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-y-0' : 'translate-y-full'}
        mobile-products-widget
      `}>
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl border border-gray-200 dark:border-gray-700 shadow-2xl h-[70vh] max-h-[70vh] mx-2 mb-2">
          <WidgetContent />
        </div>
      </div>

      {/* Tablet Widget (768px - 1023px) */}
      <div className={`
        hidden lg:block xl:hidden fixed top-20 right-[2rem] w-80 max-h-[calc(100vh-6rem)] overflow-y-auto z-30
        transition-all duration-300 ease-in-out
        ${className}
      `}>
        <WidgetContent />
      </div>

      {/* Large Desktop Widget (1024px - 1279px) */}
      <div className={`
        hidden xl:block 2xl:hidden fixed top-20 right-[3rem] w-80 max-h-[calc(100vh-6rem)] overflow-y-auto z-30
        transition-all duration-300 ease-in-out
        ${className}
      `}>
        <WidgetContent />
      </div>

      {/* Extra Large Desktop Widget (1280px+) */}
      <div className={`
        hidden 2xl:block fixed top-20 right-6 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto z-30
        transition-all duration-300 ease-in-out
        ${className}
      `}>
        <WidgetContent />
      </div>
    </>
  );
};

export default TopInfluencersWidget;