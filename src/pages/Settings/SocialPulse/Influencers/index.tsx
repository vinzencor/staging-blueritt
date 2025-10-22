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
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null);

  // Fetch influencers on mount
  useEffect(() => {
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
  }, []);

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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading influencers...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Influencers Grid */}
        {!isLoading && filteredInfluencers.length > 0 && (
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
                  {influencer.verified && (
                    <span className="inline-block mt-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-3 py-1 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </div>

                {/* Bio */}
                {influencer.bio && (
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{influencer.bio}</p>
                  </div>
                )}

                {/* Stats */}
                <div className="p-6 space-y-3">
                  {influencer.followers && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">👥 Followers</span>
                      <span className="font-bold text-gray-900 dark:text-white">{influencer.followers}</span>
                    </div>
                  )}
                  {influencer.post_count && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">📸 Posts</span>
                      <span className="font-bold text-gray-900 dark:text-white">{influencer.post_count}</span>
                    </div>
                  )}
                  {influencer.following && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">➡️ Following</span>
                      <span className="font-bold text-gray-900 dark:text-white">{influencer.following}</span>
                    </div>
                  )}
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
        {!isLoading && filteredInfluencers.length === 0 && !error && (
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

