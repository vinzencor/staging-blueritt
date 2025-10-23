import React, { useState, useEffect } from 'react';
import { Users, AlertCircle, Loader, X } from 'lucide-react';

interface Influencer {
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

interface InfluencerPost {
  post_id?: string;
  post_url?: string;
  post_title?: string;
  post_type?: string;
  is_pinned?: boolean;
  video_duration?: string;
  post_thumbnail?: string;
  image_url?: string;
  post_description?: string;
  likes_count?: number;
  comments_count?: number;
  list_items_count?: number;
  [key: string]: any;
}

// Manual influencer data
const MANUAL_INFLUENCERS: Influencer[] = [
  {
    influencer_name: 'kylerichards18',
    followers: '125K',
    following: '890',
    post_count: '1.2K',
    engagement_rate: 4.2,
    bio: 'Lifestyle content creator sharing daily inspiration',
    verified: true,
    profile_link: 'https://amazon.com/influencer/kylerichards18'
  },
  {
    influencer_name: 'paige_desorbo',
    followers: '89K',
    following: '1.2K',
    post_count: '856',
    engagement_rate: 3.8,
    bio: 'Fashion & beauty enthusiast',
    verified: true,
    profile_link: 'https://amazon.com/influencer/paige_desorbo'
  },
  {
    influencer_name: 'jdroberto',
    followers: '156K',
    following: '765',
    post_count: '2.1K',
    engagement_rate: 5.1,
    bio: 'Tech reviewer and gadget lover',
    verified: true,
    profile_link: 'https://amazon.com/influencer/jdroberto'
  },
  {
    influencer_name: 'kandionline',
    followers: '78K',
    following: '432',
    post_count: '654',
    engagement_rate: 4.5,
    bio: 'Home organization expert',
    verified: false,
    profile_link: 'https://amazon.com/influencer/kandionline'
  },
  {
    influencer_name: 'makhondlovu',
    followers: '203K',
    following: '1.5K',
    post_count: '1.8K',
    engagement_rate: 6.2,
    bio: 'Travel content creator exploring the world',
    verified: true,
    profile_link: 'https://amazon.com/influencer/makhondlovu'
  },
  {
    influencer_name: '_giagiudice',
    followers: '167K',
    following: '987',
    post_count: '1.4K',
    engagement_rate: 4.8,
    bio: 'Foodie sharing delicious recipes',
    verified: true,
    profile_link: 'https://amazon.com/influencer/_giagiudice'
  },
  {
    influencer_name: 'madison.lecroy',
    followers: '94K',
    following: '654',
    post_count: '723',
    engagement_rate: 3.9,
    bio: 'Fashion influencer with southern charm',
    verified: false,
    profile_link: 'https://amazon.com/influencer/madison.lecroy'
  },
  {
    influencer_name: 'lalakent',
    followers: '145K',
    following: '876',
    post_count: '1.1K',
    engagement_rate: 4.3,
    bio: 'Mom life and parenting tips',
    verified: true,
    profile_link: 'https://amazon.com/influencer/lalakent'
  },
  {
    influencer_name: 'harryjowsey',
    followers: '189K',
    following: '1.3K',
    post_count: '987',
    engagement_rate: 5.4,
    bio: 'Fitness and wellness coach',
    verified: true,
    profile_link: 'https://amazon.com/influencer/harryjowsey'
  },
  {
    influencer_name: 'alix_earle',
    followers: '256K',
    following: '2.1K',
    post_count: '1.5K',
    engagement_rate: 7.1,
    bio: 'Beauty guru and makeup artist',
    verified: true,
    profile_link: 'https://amazon.com/influencer/alix_earle'
  },
  {
    influencer_name: 'influencer-51db6fba',
    followers: '67K',
    following: '321',
    post_count: '432',
    engagement_rate: 3.2,
    bio: 'Amazon product reviewer',
    verified: false,
    profile_link: 'https://amazon.com/influencer/influencer-51db6fba'
  },
  {
    influencer_name: 'rockybarnes',
    followers: '178K',
    following: '765',
    post_count: '1.3K',
    engagement_rate: 4.9,
    bio: 'Adventure photographer',
    verified: true,
    profile_link: 'https://amazon.com/influencer/rockybarnes'
  },
  {
    influencer_name: 'interiordesignerella',
    followers: '112K',
    following: '543',
    post_count: '876',
    engagement_rate: 4.1,
    bio: 'Interior design expert',
    verified: true,
    profile_link: 'https://amazon.com/influencer/interiordesignerella'
  },
  {
    influencer_name: 'julianna_claire',
    followers: '83K',
    following: '432',
    post_count: '567',
    engagement_rate: 3.7,
    bio: 'Lifestyle and fashion content',
    verified: false,
    profile_link: 'https://amazon.com/influencer/julianna_claire'
  },
  {
    influencer_name: 'aspynovard',
    followers: '198K',
    following: '876',
    post_count: '1.6K',
    engagement_rate: 5.6,
    bio: 'Beauty and lifestyle creator',
    verified: true,
    profile_link: 'https://amazon.com/influencer/aspynovard'
  },
  {
    influencer_name: 'teresalaucar',
    followers: '134K',
    following: '654',
    post_count: '987',
    engagement_rate: 4.4,
    bio: 'Fashion stylist and consultant',
    verified: true,
    profile_link: 'https://amazon.com/influencer/teresalaucar'
  },
  {
    influencer_name: 'the_broadmoor_house',
    followers: '76K',
    following: '234',
    post_count: '345',
    engagement_rate: 3.5,
    bio: 'Home renovation journey',
    verified: false,
    profile_link: 'https://amazon.com/influencer/the_broadmoor_house'
  },
  {
    influencer_name: 'sweetsavingsandthings',
    followers: '156K',
    following: '543',
    post_count: '1.2K',
    engagement_rate: 4.7,
    bio: 'Budget-friendly finds and deals',
    verified: true,
    profile_link: 'https://amazon.com/influencer/sweetsavingsandthings'
  },
  {
    influencer_name: 'ourwintonhome',
    followers: '89K',
    following: '321',
    post_count: '456',
    engagement_rate: 3.8,
    bio: 'Family life and home decor',
    verified: false,
    profile_link: 'https://amazon.com/influencer/ourwintonhome'
  },
  {
    influencer_name: 'thesweetimpact',
    followers: '123K',
    following: '432',
    post_count: '789',
    engagement_rate: 4.2,
    bio: 'Positive lifestyle content',
    verified: true,
    profile_link: 'https://amazon.com/influencer/thesweetimpact'
  },
  {
    influencer_name: 'arinsolange',
    followers: '167K',
    following: '765',
    post_count: '1.1K',
    engagement_rate: 5.0,
    bio: 'Beauty and skincare expert',
    verified: true,
    profile_link: 'https://amazon.com/influencer/arinsolange'
  },
  {
    influencer_name: 'alliephunter',
    followers: '98K',
    following: '543',
    post_count: '654',
    engagement_rate: 3.9,
    bio: 'Fashion and travel content',
    verified: false,
    profile_link: 'https://amazon.com/influencer/alliephunter'
  },
  {
    influencer_name: 'everything.envy',
    followers: '145K',
    following: '654',
    post_count: '876',
    engagement_rate: 4.6,
    bio: 'Luxury lifestyle and fashion',
    verified: true,
    profile_link: 'https://amazon.com/influencer/everything.envy'
  },
  {
    influencer_name: 'tiffanyallison7',
    followers: '112K',
    following: '432',
    post_count: '567',
    engagement_rate: 4.0,
    bio: 'Mom blogger and product reviewer',
    verified: false,
    profile_link: 'https://amazon.com/influencer/tiffanyallison7'
  },
  {
    influencer_name: 'thebargainsisters',
    followers: '189K',
    following: '876',
    post_count: '1.4K',
    engagement_rate: 5.3,
    bio: 'Sisters sharing the best deals',
    verified: true,
    profile_link: 'https://amazon.com/influencer/thebargainsisters'
  },
  {
    influencer_name: 'clickandlove',
    followers: '76K',
    following: '234',
    post_count: '345',
    engagement_rate: 3.4,
    bio: 'Amazon finds and recommendations',
    verified: false,
    profile_link: 'https://amazon.com/influencer/clickandlove'
  },
  {
    influencer_name: 'ironmom40',
    followers: '134K',
    following: '543',
    post_count: '789',
    engagement_rate: 4.3,
    bio: 'Fitness mom and health coach',
    verified: true,
    profile_link: 'https://amazon.com/influencer/ironmom40'
  },
  {
    influencer_name: 'everyday.holly',
    followers: '89K',
    following: '321',
    post_count: '456',
    engagement_rate: 3.7,
    bio: 'Everyday lifestyle content',
    verified: false,
    profile_link: 'https://amazon.com/influencer/everyday.holly'
  },
  {
    influencer_name: 'kristen.niblett',
    followers: '156K',
    following: '654',
    post_count: '987',
    engagement_rate: 4.8,
    bio: 'Beauty and makeup tutorials',
    verified: true,
    profile_link: 'https://amazon.com/influencer/kristen.niblett'
  },
  {
    influencer_name: 'balkanina',
    followers: '123K',
    following: '432',
    post_count: '678',
    engagement_rate: 4.1,
    bio: 'Cultural content and recipes',
    verified: true,
    profile_link: 'https://amazon.com/influencer/balkanina'
  },
  {
    influencer_name: 'heidisnipes',
    followers: '98K',
    following: '543',
    post_count: '654',
    engagement_rate: 3.8,
    bio: 'Home organization expert',
    verified: false,
    profile_link: 'https://amazon.com/influencer/heidisnipes'
  },
  {
    influencer_name: 'tourdelust',
    followers: '178K',
    following: '765',
    post_count: '1.2K',
    engagement_rate: 5.2,
    bio: 'Travel guides and adventures',
    verified: true,
    profile_link: 'https://amazon.com/influencer/tourdelust'
  },
  {
    influencer_name: 'kirasfashionfinds',
    followers: '145K',
    following: '654',
    post_count: '876',
    engagement_rate: 4.7,
    bio: 'Affordable fashion finds',
    verified: true,
    profile_link: 'https://amazon.com/influencer/kirasfashionfinds'
  },
  {
    influencer_name: 'shopdandy',
    followers: '112K',
    following: '432',
    post_count: '567',
    engagement_rate: 4.0,
    bio: 'Shopping recommendations',
    verified: false,
    profile_link: 'https://amazon.com/influencer/shopdandy'
  },
  {
    influencer_name: 'maryamishtiaq',
    followers: '167K',
    following: '765',
    post_count: '1.1K',
    engagement_rate: 4.9,
    bio: 'Beauty and lifestyle content',
    verified: true,
    profile_link: 'https://amazon.com/influencer/maryamishtiaq'
  },
  {
    influencer_name: 'livinstyleinsta',
    followers: '89K',
    following: '321',
    post_count: '456',
    engagement_rate: 3.6,
    bio: 'Style inspiration daily',
    verified: false,
    profile_link: 'https://amazon.com/influencer/livinstyleinsta'
  },
  {
    influencer_name: 'meimonstaa',
    followers: '134K',
    following: '543',
    post_count: '789',
    engagement_rate: 4.4,
    bio: 'Creative content and art',
    verified: true,
    profile_link: 'https://amazon.com/influencer/meimonstaa'
  },
  {
    influencer_name: 'mikaylavallati',
    followers: '156K',
    following: '654',
    post_count: '987',
    engagement_rate: 4.8,
    bio: 'Food and recipe creator',
    verified: true,
    profile_link: 'https://amazon.com/influencer/mikaylavallati'
  },
  {
    influencer_name: 'homesweetpink',
    followers: '98K',
    following: '432',
    post_count: '567',
    engagement_rate: 3.9,
    bio: 'Pink-themed home decor',
    verified: false,
    profile_link: 'https://amazon.com/influencer/homesweetpink'
  },
  {
    influencer_name: 'theparentgame',
    followers: '189K',
    following: '876',
    post_count: '1.3K',
    engagement_rate: 5.1,
    bio: 'Parenting tips and tricks',
    verified: true,
    profile_link: 'https://amazon.com/influencer/theparentgame'
  },
  {
    influencer_name: 'michellelei',
    followers: '123K',
    following: '543',
    post_count: '678',
    engagement_rate: 4.2,
    bio: 'Lifestyle and fashion',
    verified: true,
    profile_link: 'https://amazon.com/influencer/michellelei'
  },
  {
    influencer_name: 'xojalonda',
    followers: '145K',
    following: '654',
    post_count: '876',
    engagement_rate: 4.6,
    bio: 'Beauty and self-care',
    verified: true,
    profile_link: 'https://amazon.com/influencer/xojalonda'
  },
  {
    influencer_name: 'playroominspo',
    followers: '76K',
    following: '234',
    post_count: '345',
    engagement_rate: 3.3,
    bio: 'Kids room inspiration',
    verified: false,
    profile_link: 'https://amazon.com/influencer/playroominspo'
  },
  {
    influencer_name: 'just.jacsy',
    followers: '112K',
    following: '432',
    post_count: '567',
    engagement_rate: 4.0,
    bio: 'Minimalist lifestyle',
    verified: false,
    profile_link: 'https://amazon.com/influencer/just.jacsy'
  },
  {
    influencer_name: 'thedealparty',
    followers: '167K',
    following: '765',
    post_count: '1.1K',
    engagement_rate: 4.9,
    bio: 'Daily deals and discounts',
    verified: true,
    profile_link: 'https://amazon.com/influencer/thedealparty'
  },
  {
    influencer_name: 'frankietavares',
    followers: '134K',
    following: '543',
    post_count: '789',
    engagement_rate: 4.3,
    bio: 'Fitness and nutrition',
    verified: true,
    profile_link: 'https://amazon.com/influencer/frankietavares'
  },
  {
    influencer_name: 'influencer-cb2630cb',
    followers: '67K',
    following: '321',
    post_count: '432',
    engagement_rate: 3.1,
    bio: 'Product reviews and testing',
    verified: false,
    profile_link: 'https://amazon.com/influencer/influencer-cb2630cb'
  }
];

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
        const url = `https://real-time-amazon-data.p.rapidapi.com/influencer-posts?influencer_name=${encodeURIComponent(influencerName)}&country=US&scope=ALL&limit=100`;

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
          let postsData: InfluencerPost[] = [];

          // Check for the correct response structure from the API
          if (data.data && data.data.posts && Array.isArray(data.data.posts)) {
            postsData = data.data.posts;
          } else if (data.data && Array.isArray(data.data)) {
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
                  key={post.post_id || index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Post Image/Thumbnail */}
                  {(post.post_thumbnail || post.image_url || post.image) && (
                    <div className="w-full h-40 bg-gray-200 dark:bg-gray-600 overflow-hidden">
                      <img
                        src={post.post_thumbnail || post.image_url || post.image}
                        alt={post.post_title || 'Post'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Post Info */}
                  <div className="p-3">
                    {/* Post Type Badge */}
                    {post.post_type && (
                      <div className="mb-2">
                        <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-2 py-1 rounded">
                          {post.post_type}
                        </span>
                      </div>
                    )}

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
                      {post.list_items_count && (
                        <span>📋 {post.list_items_count} items</span>
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

const InfluencersPage: React.FC = () => {
  const [influencers] = useState<Influencer[]>(MANUAL_INFLUENCERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null);

  // Filter influencers based on search
  const filteredInfluencers = influencers.filter((inf) =>
    inf.influencer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Amazon Influencers</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and analyze top Amazon influencers
          </p>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search influencers by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Influencers Grid */}
        {filteredInfluencers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInfluencers.map((influencer) => (
              <div
                key={influencer.influencer_name}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                {/* Header with Avatar */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl">
                    {influencer.influencer_name?.charAt(0).toUpperCase() || 'I'}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{influencer.influencer_name}</h3>
      
                </div>

                {/* Action Button */}
                <div className="px-6 pb-6 space-y-2">
                  <button
                    onClick={() => setSelectedInfluencer(influencer.influencer_name)}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm"
                  >
                    View Posts
                  </button>
                  {influencer.profile_link && (
                    <a
                      href={influencer.profile_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-medium text-sm text-center"
                    >
                      View Profile
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredInfluencers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No influencers found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>

      {/* Posts Modal */}
      <PostsModal
        isOpen={selectedInfluencer !== null}
        influencerName={selectedInfluencer || ''}
        onClose={() => setSelectedInfluencer(null)}
      />
    </div>
  );
};

export default InfluencersPage;