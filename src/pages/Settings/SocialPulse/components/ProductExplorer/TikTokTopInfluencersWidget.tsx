import React, { useState, useEffect } from 'react';
import { Flame, ChevronDown, ChevronUp, Loader, Hash, Loader2, X, Zap } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useUserSubscriptionAndSearchQuota } from '../../../../../hooks/useUserDetails';
import { QuotaNames } from '../../../../../enum';
import api from '../../../../../api';

// TikTok Hashtag interface
export interface TikTokHashtag {
  hashtag_id: string;
  hashtag_name: string;
  publish_cnt: number;
  video_views: number;
  rank: number;
  rank_diff?: number;
  rank_diff_type?: number;
  [key: string]: any;
}

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
    animation: autoScroll 30s linear infinite;
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



// Mobile Toggle Button Component
interface MobileToggleProps {
  isOpen: boolean;
  onClick: () => void;
  hashtagCount: number;
}

const MobileToggle: React.FC<MobileToggleProps> = ({ isOpen, onClick, hashtagCount }) => (
  <button
    onClick={onClick}
    className="lg:hidden fixed top-20 right-4 z-40 bg-[#0072D6] hover:bg-[#111c43] text-white p-3 rounded-full shadow-lg transition-all duration-300 mobile-toggle-button"
  >
    <div className="flex items-center gap-2">
      <Flame className="w-5 h-5" />
      <span className="text-sm font-medium">TikTok Trending Hashtags ({hashtagCount})</span>
      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </div>
  </button>
);

// Constants for hashtag filters
const HASHTAG_PERIOD_OPTIONS = [
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '120', label: 'Last 120 Days' },
];

// Country options - 60 TikTok supported countries (same as TikTokTrends)
const COUNTRY_OPTIONS = [
  // Americas
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CL', label: 'Chile' },
  { value: 'CO', label: 'Colombia' },
  { value: 'PE', label: 'Peru' },

  // Europe
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'PL', label: 'Poland' },
  { value: 'SE', label: 'Sweden' },
  { value: 'NO', label: 'Norway' },
  { value: 'DK', label: 'Denmark' },
  { value: 'FI', label: 'Finland' },
  { value: 'BE', label: 'Belgium' },
  { value: 'AT', label: 'Austria' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'IE', label: 'Ireland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'GR', label: 'Greece' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'RO', label: 'Romania' },
  { value: 'HU', label: 'Hungary' },

  // Asia Pacific
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'SG', label: 'Singapore' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'TH', label: 'Thailand' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'PH', label: 'Philippines' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'BD', label: 'Bangladesh' },

  // Middle East & Africa
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'EG', label: 'Egypt' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'IL', label: 'Israel' },
  { value: 'TR', label: 'Turkey' },
  { value: 'QA', label: 'Qatar' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'OM', label: 'Oman' },
  { value: 'BH', label: 'Bahrain' },
  { value: 'JO', label: 'Jordan' },
  { value: 'LB', label: 'Lebanon' },
  { value: 'MA', label: 'Morocco' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'KE', label: 'Kenya' },
  { value: 'GH', label: 'Ghana' },
];

const INDUSTRY_OPTIONS = [
  { id: '22000000000', name: 'Apparel & Accessories' },
  { id: '16000000000', name: 'Appliances' },
  { id: '20000000000', name: 'Apps' },
  { id: '12000000000', name: 'Baby, Kids & Maternity' },
  { id: '14000000000', name: 'Beauty & Personal Care' },
  { id: '24000000000', name: 'Business Services' },
  { id: '30000000000', name: 'E-Commerce (Non-app)' },
  { id: '10000000000', name: 'Education' },
  { id: '13000000000', name: 'Financial Services' },
  { id: '27000000000', name: 'Food & Beverage' },
  { id: '25000000000', name: 'Games' },
  { id: '29000000000', name: 'Health' },
  { id: '21000000000', name: 'Home Improvement' },
  { id: '18000000000', name: 'Household Products' },
  { id: '26000000000', name: 'Life Services' },
  { id: '23000000000', name: 'News & Entertainment' },
  { id: '19000000000', name: 'Pets' },
  { id: '28000000000', name: 'Sports & Outdoor' },
  { id: '15000000000', name: 'Tech & Electronics' },
  { id: '17000000000', name: 'Travel' },
  { id: '11000000000', name: 'Vehicle & Transportation' },
];

// Main TikTokTrendingHashtagsWidget Component
export const TikTokTopInfluencersWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Hashtag quota management - Separate quota for hashtags
  const { quotaDetails: hashtagQuotaDetails, updateQuota: updateHashtagQuota } = useUserSubscriptionAndSearchQuota(QuotaNames.TikTokHashtagSearch);

  // New state for hashtag filters
  const [trendingHashtags, setTrendingHashtags] = useState<any[]>([]);
  const [isHashtagsLoading, setIsHashtagsLoading] = useState(false);
  const [hashtagsError, setHashtagsError] = useState<string | null>(null);
  const [hashtagPeriod, setHashtagPeriod] = useState('120');
  const [hashtagCountry, setHashtagCountry] = useState('GB'); // ? Default to UK
  const [hashtagIndustry, setHashtagIndustry] = useState('');
  const [isCachedData, setIsCachedData] = useState<boolean | null>(null); // Track if data is from cache

  // Determine if we're on TikTok page
  const isTikTokPage = location.pathname.includes('/socialpulse/tiktok');



  // Close mobile widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileOpen && !target.closest('.mobile-creator-widget') && !target.closest('.mobile-toggle-button')) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen]);

  // Handle fetching trending hashtags with filters, quota deduction, and 7-day caching
  const handleFetchTrendingHashtags = async () => {
    // Check quota before making API call
    if (hashtagQuotaDetails.quotaValue <= 0) {
      setHashtagsError('No hashtag searches remaining. Please purchase add-ons to continue.');
      return;
    }

    setIsHashtagsLoading(true);
    setHashtagsError(null);
    try {
      const params = {
        page: '1',
        limit: '50',
        period: hashtagPeriod,
        country: hashtagCountry,
        sort_by: 'popular',
        ...(hashtagIndustry && { industry_id: hashtagIndustry })
      };

      // ? Call backend endpoint with 7-day caching and quota deduction
      const response = await api.get('/products/tiktok-trends/hashtags/', { params });
      const data = response.data;

      // ? Update quota from backend response (handles cache hit/miss automatically)
      if (data.remaining_quota !== undefined) {
        console.log('?? Hashtag Discovery - Updating quota from backend:', data.remaining_quota);
        console.log('?? Cache hit:', data.cache_hit ? 'YES (no quota deducted)' : 'NO (quota deducted)');
        updateHashtagQuota(data.remaining_quota);
      }

      // Set cache status for UI indicator
      setIsCachedData(data.cache_hit === true);

      if (data.data && data.data.list && Array.isArray(data.data.list)) {
        setTrendingHashtags(data.data.list);
      } else {
        setHashtagsError('No hashtags found');
      }
    } catch (err) {
      console.error('Error fetching hashtags:', err);
      setHashtagsError('Error fetching hashtags. Please try again.');
    } finally {
      setIsHashtagsLoading(false);
    }
  };

  // Don't render if not on TikTok page
  if (!isTikTokPage) {
    return null;
  }

  // Widget content component to avoid duplication
  const WidgetContent = () => (
    <div className="lg:col-span-1">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-pink-600" />
              TikTok Trending Hashtags
            </h2>
            {/* Cache/New Search Indicator in Colored Box */}
            {isCachedData !== null && trendingHashtags.length > 0 && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md w-fit ${
                isCachedData
                  ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                  : 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  isCachedData
                    ? 'bg-green-600 dark:bg-green-400'
                    : 'bg-blue-600 dark:bg-blue-400'
                }`}></span>
                <span className={`text-xs font-semibold ${
                  isCachedData
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-blue-700 dark:text-blue-300'
                }`}>
                  {isCachedData ? 'Quota Not Deducted' : 'Quota Deducted'}
                </span>
              </div>
            )}
          </div>
          {/* Close button - only visible on mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Close hashtags panel"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Hashtag Quota Counter */}
        <div className="mb-6 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-pink-200 dark:border-pink-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hashtag Searches
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg xl:text-xl font-bold text-pink-600 dark:text-pink-400">
                {hashtagQuotaDetails.quotaValue === -1 ? '8' : hashtagQuotaDetails.quotaValue}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                remaining
              </div>
            </div>
          </div>

          {/* Quota Warning */}
          {hashtagQuotaDetails.quotaValue <= 10 && hashtagQuotaDetails.quotaValue > 0 && (
            <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Low quota! Consider purchasing add-ons.</span>
            </div>
          )}

          {hashtagQuotaDetails.quotaValue === 0 && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Quota exhausted! Purchase add-ons to continue.</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-4">
          {/* Period Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Period
            </label>
            <select
              value={hashtagPeriod}
              onChange={(e) => setHashtagPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {HASHTAG_PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Country Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country
            </label>
            <select
              value={hashtagCountry}
              onChange={(e) => setHashtagCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {COUNTRY_OPTIONS.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>

          {/* Industry Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category (Optional)
            </label>
            <select
              value={hashtagIndustry}
              onChange={(e) => setHashtagIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Industries</option>
              {INDUSTRY_OPTIONS.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fetch Button */}
        <button
          onClick={handleFetchTrendingHashtags}
          disabled={isHashtagsLoading}
          className="w-full px-4 py-2.5 bg-[#081c64] text-white font-semibold rounded-lg hover:bg-[#0a237a] focus:ring-2 focus:ring-[#081c64] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm mb-4"
        >
          {isHashtagsLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Hash className="w-4 h-4" />
              Fetch Hashtags
            </>
          )}
        </button>

        {/* Error State */}
        {hashtagsError && !isHashtagsLoading && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
              Error Loading Hashtags
            </h3>
            <p className="text-xs text-red-600 dark:text-red-400 mb-3">{hashtagsError}</p>
            <button
              onClick={handleFetchTrendingHashtags}
              className="w-full px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isHashtagsLoading && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-[#081c64] mx-auto mb-2 animate-spin" />
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Fetching hashtags...
            </p>
          </div>
        )}

        {/* Hashtags List */}
        {trendingHashtags.length > 0 && !isHashtagsLoading && (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {/* Results Summary */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-50 dark:from-orange-900/30 dark:to-orange-900/30 rounded-lg p-3 border border-orange-200 dark:border-orange-500 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {trendingHashtags.length} Hashtags
              </h3>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <p>{HASHTAG_PERIOD_OPTIONS.find(p => p.value === hashtagPeriod)?.label}</p>
                <p>{COUNTRY_OPTIONS.find(c => c.value === hashtagCountry)?.label}</p>
              </div>
            </div>

            {/* Hashtags List */}
            {trendingHashtags.map((hashtag, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-orange-50 to-orange-50 dark:from-orange-900/20 dark:to-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-500 hover:shadow-md transition-all duration-200"
              >
                <div className="mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    #{hashtag.hashtag_name || hashtag.name || `Hashtag ${index + 1}`}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Rank: #{index + 1}
                  </p>
                </div>

                {/* Hashtag Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {hashtag.post_count !== undefined && (
                    <div className="bg-white dark:bg-gray-700 rounded p-2 text-center">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Posts</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {(hashtag.post_count / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  )}
                  {hashtag.view_count !== undefined && (
                    <div className="bg-white dark:bg-gray-700 rounded p-2 text-center">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Views</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {(hashtag.view_count / 1000000000).toFixed(1)}B
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Initial State */}
        {!isHashtagsLoading && trendingHashtags.length === 0 && !hashtagsError && (
          <div className="text-center py-8">
            <Hash className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Ready to Fetch
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Click "Fetch Hashtags" to discover trending hashtags
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button - Only show on screens smaller than XL */}
      <div className="xl:hidden">
        <MobileToggle
          isOpen={isMobileOpen}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          hashtagCount={trendingHashtags.length}
        />
      </div>

      {/* Mobile Bottom Sheet - Hidden on XL+ screens */}
      <div className={`
        xl:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-y-0' : 'translate-y-full'}
        mobile-creator-widget
      `}>
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl border border-gray-200 dark:border-gray-700 shadow-2xl h-[70vh] max-h-[70vh] mx-2 mb-2">
          <WidgetContent />
        </div>
      </div>

      {/* Desktop Widget (XL screens: 1280px - 1535px) - Compact size */}
      <div className={`
        hidden xl:block 2xl:hidden fixed top-20 right-6 w-[270px] max-h-[calc(100vh-6rem)] overflow-y-auto z-30
        transition-all duration-300 ease-in-out
        ${className}
      `}>
        <WidgetContent />
      </div>

      {/* Extra Large Desktop Widget (2XL screens: 1536px+) - Full size */}
      <div className={`
        hidden 2xl:block fixed top-20 right-4 w-[330px] max-h-[calc(100vh-6rem)] overflow-y-auto z-30
        transition-all duration-300 ease-in-out
        ${className}
      `}>
        <WidgetContent />
      </div>
    </>
  );
};

export default TikTokTopInfluencersWidget;
