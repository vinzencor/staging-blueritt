import React, { useState, useEffect } from 'react';
import { Crown, AlertCircle, Loader } from 'lucide-react';
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

// Influencer interface
export interface Influencer {
  influencer_name: string;
  followers?: string;
  following?: string;
  post_count?: string;
  engagement_rate?: number;
  bio?: string;
  verified?: boolean;
  profile_link?: string;
  profile_description?: string;
  [key: string]: any;
}

// Influencer names to fetch
const INFLUENCER_NAMES = [
  'kylerichards18',
  'paige_desorbo',
  'jdroberto',
  'kandionline',
  'makhondlovu',
  '_giagiudice',
  'madison.lecroy',
  'lalakent',
  'harryjowsey'
];

// Loading Skeleton Component
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-28"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State Component
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <Crown className="w-12 h-12 text-gray-400 mb-3" />
    <h3 className="text-sm font-semibold text-gray-900 mb-1">No Influencers Available</h3>
    <p className="text-xs text-gray-600">Check back later for top influencers!</p>
  </div>
);

// Influencer Card Component
const InfluencerCard: React.FC<{ influencer: Influencer }> = ({ influencer }) => {
  const handleClick = () => {
    if (influencer.profile_link) {
      window.open(influencer.profile_link, '_blank');
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all duration-300 p-3 cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {influencer.influencer_name?.charAt(0).toUpperCase() || 'I'}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {influencer.influencer_name || 'Unknown'}
            </h3>
            {influencer.verified && (
              <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-1.5 mt-2 text-xs">
            {influencer.followers && (
              <div className="bg-blue-50 rounded px-1.5 py-0.5">
                <span className="text-gray-600">👥 </span>
                <span className="font-semibold text-blue-600">{influencer.followers}</span>
              </div>
            )}
            {influencer.post_count && (
              <div className="bg-purple-50 rounded px-1.5 py-0.5">
                <span className="text-gray-600">📸 </span>
                <span className="font-semibold text-purple-600">{influencer.post_count}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {influencer.bio && (
            <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">
              {influencer.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main TopInfluencersWidget Component
export const TopInfluencersWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  const location = useLocation();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Determine if we're on Amazon page
  const isAmazonPage = location.pathname.includes('/socialpulse/amazon');

  // Fetch influencers
  useEffect(() => {
    if (!isAmazonPage) return;

    const fetchInfluencers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results: Influencer[] = [];

        for (const name of INFLUENCER_NAMES) {
          try {
            const response = await fetch(
              `https://real-time-amazon-data.p.rapidapi.com/influencer-profile?influencer_name=${name}&country=US`,
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
              if (data.data) {
                results.push({
                  influencer_name: name,
                  ...data.data
                });
              }
            }
          } catch (err) {
            console.error(`Error fetching influencer ${name}:`, err);
          }
        }

        setInfluencers(results);
      } catch (err) {
        console.error('Error fetching influencers:', err);
        setError('Failed to load influencers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfluencers();
  }, [isAmazonPage]);

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

  // Don't render if not on Amazon page
  if (!isAmazonPage) {
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
        <div
          className="bg-white backdrop-blur-md rounded-2xl border border-white/30 transition-all duration-300 ring-1 ring-black/5"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Crown className="w-5 h-5 mr-2 text-purple-600" />
              Top Influencers
            </h2>
          </div>
          <div ref={scrollContainerRef} className="p-4 max-h-[calc(100vh-12rem)] overflow-y-auto scroll-smooth">
            {isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            ) : influencers.length > 0 ? (
              <div className="space-y-3">
                {influencers.map((influencer) => (
                  <InfluencerCard key={influencer.influencer_name} influencer={influencer} />
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
        <div
          className="bg-white/98 backdrop-blur-md rounded-2xl border border-white/30 ring-1 ring-black/5"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-base font-bold text-gray-900 flex items-center">
              <Crown className="w-4 h-4 mr-2 text-purple-600" />
              Top Influencers
            </h2>
          </div>
          <div className="p-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
            {isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="flex items-center gap-2 text-red-600 text-xs p-2 bg-red-50 rounded">
                <AlertCircle className="w-3 h-3" />
                {error}
              </div>
            ) : influencers.length > 0 ? (
              <div className="space-y-2">
                {influencers.map((influencer) => (
                  <InfluencerCard key={influencer.influencer_name} influencer={influencer} />
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
        <div
          className="bg-white/95 backdrop-blur-md rounded-xl border border-white/30 ring-1 ring-black/5"
          style={{
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 flex items-center">
              <Crown className="w-4 h-4 mr-2 text-purple-600" />
              <span className="truncate">Top Influencers</span>
            </h2>
          </div>
          <div className="p-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
            {isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="flex items-center gap-2 text-red-600 text-xs p-2 bg-red-50 rounded">
                <AlertCircle className="w-3 h-3" />
                {error}
              </div>
            ) : influencers.length > 0 ? (
              <div className="space-y-2">
                {influencers.map((influencer) => (
                  <InfluencerCard key={influencer.influencer_name} influencer={influencer} />
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

