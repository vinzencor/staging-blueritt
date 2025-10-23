import React, { useState, useEffect } from 'react';
import { Crown, AlertCircle, Loader, X, Menu, ChevronDown, ChevronUp } from 'lucide-react';
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

// Post interface
export interface InfluencerPost {
  post_url?: string;
  post_title?: string;
  is_pinned?: boolean;
  video_duration?: string;
  image_url?: string;
  post_description?: string;
  likes_count?: number;
  comments_count?: number;
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
  'harryjowsey',
  'alix_earle',
  'influencer-51db6fba',
  'rockybarnes',
  'interiordesignerella',
  'julianna_claire',
  'aspynovard',
  'teresalaucar',
  'the_broadmoor_house',
  'sweetsavingsandthings',
  'ourwintonhome',
  'thesweetimpact',
  'arinsolange',
  'alliephunter',
  'everything.envy',
  'tiffanyallison7',
  'thebargainsisters',
  'clickandlove',
  'ironmom40',
  'everyday.holly',
  'kristen.niblett',
  'balkanina',
  'heidisnipes',
  'tourdelust',
  'kirasfashionfinds',
  'shopdandy',
  'maryamishtiaq',
  'livinstyleinsta',
  'meimonstaa',
  'mikaylavallati',
  'homesweetpink',
  'theparentgame',
  'michellelei',
  'xojalonda',
  'playroominspo',
  'just.jacsy',
  'thedealparty',
  'frankietavares',
  'influencer-cb2630cb'
];

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
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No Influencers Available</h3>
    <p className="text-xs text-gray-600 dark:text-gray-400">Check back later for top influencers!</p>
  </div>
);

// Posts Modal Component
interface PostsModalProps {
  isOpen: boolean;
  influencerName: string;
  onClose: () => void;
}

const PostsModal: React.FC<PostsModalProps> = ({ isOpen, influencerName, onClose }) => {
  const [posts, setPosts] = useState<InfluencerPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      setPosts([]);
      try {
        const url = `https://real-time-amazon-data.p.rapidapi.com/influencer-posts?influencer_name=${encodeURIComponent("influencerName")}&country=US&scope=ALL&limit=100`;

        console.log('Fetching posts from:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
            'x-rapidapi-key': '60cb7bd196mshfa4299228d59ae3p16cdb0jsn5bf954e1e4a5'
          }
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);

          // Handle different response structures
          let postsData = [];
          if (data.data && Array.isArray(data.data)) {
            postsData = data.data;
          } else if (Array.isArray(data)) {
            postsData = data;
          }

          console.log('Posts extracted:', postsData.length);
          setPosts(postsData);

          if (postsData.length === 0) {
            setError('No posts found for this influencer');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', errorData);
          setError(`Failed to load posts (Status: ${response.status})`);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [isOpen, influencerName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Posts by {influencerName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-purple-600 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 text-orange-600 text-sm p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{error}</p>
                <p className="text-xs mt-1 opacity-75">Influencer: {influencerName}</p>
              </div>
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Post Image */}
                  {(post.image_url || post.image) && (
                    <div className="w-full h-40 bg-gray-200 dark:bg-gray-600 overflow-hidden">
                      <img
                        src={post.image_url || post.image}
                        alt={post.post_title || post.title || 'Post'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Post Info */}
                  <div className="p-3">
                    {(post.post_title || post.title) && (
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {post.post_title || post.title}
                      </h3>
                    )}

                    {(post.post_description || post.description) && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {post.post_description || post.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {(post.likes_count || post.likes) && (
                        <span>❤️ {post.likes_count || post.likes}</span>
                      )}
                      {(post.comments_count || post.comments) && (
                        <span>💬 {post.comments_count || post.comments}</span>
                      )}
                      {post.video_duration && (
                        <span>⏱️ {post.video_duration}</span>
                      )}
                      {post.is_pinned && (
                        <span>📌 Pinned</span>
                      )}
                    </div>

                    {/* View Post Link */}
                    {(post.post_url || post.url) && (
                      <a
                        href={post.post_url || post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
                      >
                        View Post →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">No posts available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Influencer Card Component
interface InfluencerCardProps {
  influencer: Influencer;
  onViewDetails: (influencerName: string) => void;
}

const InfluencerCard: React.FC<InfluencerCardProps> = ({ influencer, onViewDetails }) => {
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (influencer.profile_link) {
      window.open(influencer.profile_link, '_blank');
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(influencer.influencer_name);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-[#ffa41c] dark:hover:border-[#ffa41c] hover:shadow-md dark:hover:shadow-lg transition-all duration-300 p-3">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-[#ffa41c] to-[#ff6201] rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity" onClick={handleProfileClick}>
            {influencer.influencer_name?.charAt(0).toUpperCase() || 'I'}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate cursor-pointer hover:text-purple-600 dark:hover:text-purple-400" onClick={handleProfileClick}>
              {influencer.influencer_name || 'Unknown'}
            </h3>
            {influencer.verified && (
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full p-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-1.5 mt-2 text-xs">
            {influencer.followers && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded px-1.5 py-0.5">
                <span className="text-gray-600 dark:text-gray-400">👥 </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{influencer.followers}</span>
              </div>
            )}
            {influencer.post_count && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded px-1.5 py-0.5">
                <span className="text-gray-600 dark:text-gray-400">📸 </span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">{influencer.post_count}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {influencer.bio && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 line-clamp-2">
              {influencer.bio}
            </p>
          )}

          {/* View Details Button */}
          <button
            onClick={handleViewDetails}
            className="mt-2 w-full px-2 py-1 rounded-md bg-gradient-to-r from-[#ffa41c] to-[#ff6201] hover:bg-[#ff6201] dark:bg-[#ff6201] dark:hover:bg-[#ff6201] text-white text-xs font-medium rounded transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Mobile Toggle Button Component
interface MobileToggleProps {
  isOpen: boolean;
  onClick: () => void;
  influencerCount: number;
}

const MobileToggle: React.FC<MobileToggleProps> = ({ isOpen, onClick, influencerCount }) => (
  <button
    onClick={onClick}
    className="lg:hidden fixed top-20 right-4 z-40 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
  >
    <div className="flex items-center gap-2">
      <Crown className="w-5 h-5" />
      <span className="text-sm font-medium">Influencers ({influencerCount})</span>
      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </div>
  </button>
);

// Main TopInfluencersWidget Component
export const TopInfluencersWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  const location = useLocation();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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
              console.log(`Fetched data for ${name}:`, data);
              if (data.data) {
                results.push({
                  influencer_name: name,
                  ...data.data
                });
              }
            } else {
              console.warn(`Failed to fetch ${name}: ${response.status}`);
            }
          } catch (err) {
            console.error(`Error fetching influencer ${name}:`, err);
          }
        }

        console.log('Total influencers fetched:', results.length);
        setInfluencers(results);
        if (results.length === 0) {
          setError('No influencers found. Please check the API connection.');
        }
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
        <div className="flex items-center justify-between">
          {/* Icon only on mobile, with hover tooltip */}
          <div className="relative group">
            {/* Mobile: Icon only */}
            <div className="lg:hidden flex items-center">
              <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              {/* Hover tooltip for mobile */}
              <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                Top Influencers
              </div>
            </div>
            
            {/* Desktop: Full text */}
            <h2 className="hidden lg:flex text-lg font-bold text-gray-900 dark:text-white items-center">
              <Crown className="w-5 h-5 mr-2 text-[#ffa41c] dark:text-[#ffa41c ]" />
              Top Influencers
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                ({influencers.length})
              </span>
            </h2>
          </div>
          
          <button
            onClick={() => setIsMobileOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
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
        ) : influencers.length > 0 ? (
          <div className="space-y-3">
            {influencers.map((influencer) => (
              <InfluencerCard 
                key={influencer.influencer_name} 
                influencer={influencer} 
                onViewDetails={setSelectedInfluencer} 
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
        influencerCount={influencers.length}
      />

      {/* Mobile Bottom Sheet */}
      <div className={`
        lg:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-y-0' : 'translate-y-full'}
        mobile-influencer-widget
      `}>
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl border border-gray-200 dark:border-gray-700 shadow-2xl h-[70vh] max-h-[70vh] mx-2 mb-2">
          <WidgetContent />
        </div>
      </div>

      {/* Tablet Widget (768px - 1023px) */}
      <div className={`
        hidden lg:block xl:hidden fixed top-20 right-3 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto z-30
        transition-all duration-300 ease-in-out
        ${className}
      `}>
        <WidgetContent />
      </div>

      {/* Large Desktop Widget (1024px - 1279px) */}
      <div className={`
        hidden xl:block 2xl:hidden fixed top-20 right-4 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto z-30
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

      {/* Posts Modal */}
      <PostsModal
        isOpen={selectedInfluencer !== null}
        influencerName={selectedInfluencer || ''}
        onClose={() => setSelectedInfluencer(null)}
      />
    </>
  );
};

export default TopInfluencersWidget;