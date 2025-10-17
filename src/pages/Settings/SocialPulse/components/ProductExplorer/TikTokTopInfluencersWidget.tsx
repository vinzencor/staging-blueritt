import React, { useState, useEffect } from 'react';
import { Crown, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// TikTok Influencer interface
export interface TikTokInfluencer {
  tcm_id: string;
  user_id: string;
  nick_name: string;
  avatar_url: string;
  country_code: string;
  follower_cnt: number;
  liked_cnt: number;
  tt_link: string;
  tcm_link: string;
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

// Loading Skeleton Component
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State Component
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <Crown className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" />
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No Creators Available</h3>
    <p className="text-xs text-gray-600 dark:text-gray-400">Check back later for top TikTok creators!</p>
  </div>
);

// TikTok Influencer Card Component
const TikTokInfluencerCard: React.FC<{ influencer: TikTokInfluencer }> = ({ influencer }) => {
  const handleClick = () => {
    if (influencer.tt_link) {
      window.open(influencer.tt_link, '_blank');
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-pink-400 dark:hover:border-pink-500 hover:shadow-md dark:hover:shadow-lg transition-all duration-300 p-3 cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {influencer.avatar_url ? (
            <img
              src={influencer.avatar_url}
              alt={influencer.nick_name}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23E91E63" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="50" fill="white" text-anchor="middle" dy=".3em"%3E%3C/text%3E%3C/svg%3E';
              }}
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {influencer.nick_name?.charAt(0).toUpperCase() || 'T'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">
            {influencer.nick_name || 'Unknown'}
          </h3>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-1.5 mt-2 text-xs">
            <div className="bg-pink-50 rounded px-1.5 py-0.5">
              <span className="text-gray-600">👥 </span>
              <span className="font-semibold text-pink-600">{formatNumber(influencer.follower_cnt)}</span>
            </div>
            <div className="bg-red-50 rounded px-1.5 py-0.5">
              <span className="text-gray-600">❤️ </span>
              <span className="font-semibold text-red-600">{formatNumber(influencer.liked_cnt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main TikTokTopInfluencersWidget Component
export const TikTokTopInfluencersWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  const location = useLocation();
  const [influencers, setInfluencers] = useState<TikTokInfluencer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Determine if we're on TikTok page
  const isTikTokPage = location.pathname.includes('/socialpulse/tiktok');

  // Fetch TikTok influencers
  useEffect(() => {
    if (!isTikTokPage) return;

    const fetchInfluencers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          'https://tiktok-creative-center-api.p.rapidapi.com/api/trending/creator?page=1&limit=20&sort_by=follower&country=US',
          {
            method: 'GET',
            headers: {
              'x-rapidapi-host': 'tiktok-creative-center-api.p.rapidapi.com',
              'x-rapidapi-key': '60cb7bd196mshfa4299228d59ae3p16cdb0jsn5bf954e1e4a5'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.creators && Array.isArray(data.creators)) {
            setInfluencers(data.creators);
          }
        } else {
          setError('Failed to load TikTok influencers');
        }
      } catch (err) {
        console.error('Error fetching TikTok influencers:', err);
        setError('Failed to load TikTok influencers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfluencers();
  }, [isTikTokPage]);

  // Auto-scroll effect - continuous carousel scroll
  useEffect(() => {
    if (!scrollContainerRef.current || influencers.length === 0 || isLoading) return;

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
  }, [influencers, isLoading]);

  // Don't render if not on TikTok page
  if (!isTikTokPage) {
    return null;
  }

  return (
    <>
      {/* Desktop Fixed Sidebar Widget - Right side positioning */}
      <div className={`
        fixed top-20 right-6 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto z-30
        hidden 2xl:block
        transition-all duration-300 ease-in-out
        ${className}
      `}>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-md dark:shadow-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Crown className="w-5 h-5 mr-2 text-pink-600 dark:text-pink-400" />
              Top Creators
            </h2>
          </div>
          <div ref={scrollContainerRef} className="p-4 max-h-[calc(100vh-12rem)] overflow-y-auto scroll-smooth">
            {isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            ) : influencers.length > 0 ? (
              <div className="space-y-3">
                {influencers.map((influencer) => (
                  <TikTokInfluencerCard key={influencer.tcm_id} influencer={influencer} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      {/* Large Desktop Widget */}
      <div className={`
        fixed top-20 right-4 w-72 max-h-[calc(100vh-6rem)] overflow-y-auto z-30
        hidden xl:block 2xl:hidden
        transition-all duration-300 ease-in-out
        ${className}
      `}>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-md dark:shadow-lg">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center">
              <Crown className="w-4 h-4 mr-2 text-pink-600 dark:text-pink-400" />
              Top Creators
            </h2>
          </div>
          <div ref={scrollContainerRef} className="p-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
            {isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <AlertCircle className="w-3 h-3" />
                {error}
              </div>
            ) : influencers.length > 0 ? (
              <div className="space-y-2">
                {influencers.map((influencer) => (
                  <TikTokInfluencerCard key={influencer.tcm_id} influencer={influencer} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      {/* Tablet Widget */}
      <div className={`
        fixed top-20 right-3 w-64 max-h-[calc(100vh-6rem)] overflow-y-auto z-30
        hidden lg:block xl:hidden
        transition-all duration-300 ease-in-out
        ${className}
      `}>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-md dark:shadow-lg">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
              <Crown className="w-4 h-4 mr-2 text-pink-600 dark:text-pink-400" />
              <span className="truncate">Top Creators</span>
            </h2>
          </div>
          <div ref={scrollContainerRef} className="p-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
            {isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <AlertCircle className="w-3 h-3" />
                {error}
              </div>
            ) : influencers.length > 0 ? (
              <div className="space-y-2">
                {influencers.map((influencer) => (
                  <TikTokInfluencerCard key={influencer.tcm_id} influencer={influencer} />
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

export default TikTokTopInfluencersWidget;

