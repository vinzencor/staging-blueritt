import { useLocation } from 'react-router-dom';
import ProductExplorer from "./components/ProductExplorer/ProductExplorer";
import { TopInfluencersWidget } from "./components/ProductExplorer/TopInfluencersWidget";
import { TikTokTopInfluencersWidget } from "./components/ProductExplorer/TikTokTopInfluencersWidget";
import TikTokTrends from "./components/TikTokTrends/TikTokTrends";

// Export types for backward compatibility with existing components
export enum Options {
  Product = "Product",
  ASIN = "ASIN",
  Category = "Category",
}

export type TSearchFilters = {
  starRatingMin: number;
  starRatingMax: number;
  priceMin: number;
  priceMax: number;
  numRatingsMin: number;
  numRatingsMax: number;
  isPrime?: boolean;
  category: string;
  isAmazonChoice?: boolean;
};

export type TProductEntryInDataTable = {
  sNo: number;
  productTitle: string;
  asin: string;
  Description?: string;
  price: number;
  orignalPrice: number;
  ratingCount: number;
  productOffers: number;
  currency: string;
  starRating: string;
  isBestSeller: boolean;
  isAmazonChoice: boolean;
  salesVolume: number;
  delivery: string;
  imageUrl: string;
  isPrime: boolean;
  climatePledgeFriendly: boolean;
};

const SocialPage = () => {
  const location = useLocation();

  // Determine which page we're on based on the URL
  const isAmazonPage = location.pathname.includes('/socialpulse/amazon');
  const isTikTokPage = location.pathname.includes('/socialpulse/tiktok');

  // Show Amazon content only
  if (isAmazonPage) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        {/* Fixed Top Influencers Widget - True Overlay */}
        <TopInfluencersWidget />

        {/* Main Content - Responsive with proper spacing for best deals widget */}
        <div className="p-3 sm:p-5 space-y-8 max-w-[1191px] 2xl:max-w-[1000px]">
          {/* Amazon Content */}
          <ProductExplorer />
        </div>
      </div>
    );
  }

  // Show TikTok content only
  if (isTikTokPage) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        {/* Fixed Top Creators Widget */}
        <TikTokTopInfluencersWidget />

        {/* Main Content - Responsive with proper spacing for best deals widget */}
        <div className="p-3 sm:p-5 space-y-8 max-w-[1191px] 2xl:max-w-[1000px]">
          {/* TikTok Content */}
          <TikTokTrends />
        </div>
      </div>
    );
  }

  // Fallback (shouldn't happen with proper routing)
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="p-6 space-y-8 max-w-[1400px] mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Social Pulse</h2>
          <p className="text-gray-600 dark:text-gray-400">Please navigate to Amazon Trends or TikTok Trends from the sidebar.</p>
        </div>
      </div>
    </div>
  );
};

export default SocialPage;
