import React, { useState } from 'react';
import { Users, TrendingUp, Heart, MessageCircle, Share2, Play, Search, Filter } from 'lucide-react';

interface Influencer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  followers: number;
  engagement_rate: number;
  avg_likes: number;
  avg_comments: number;
  avg_shares: number;
  category: string;
  verified: boolean;
  bio: string;
}

const SAMPLE_INFLUENCERS: Influencer[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    handle: '@sarahchen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    followers: 2500000,
    engagement_rate: 8.5,
    avg_likes: 125000,
    avg_comments: 8500,
    avg_shares: 3200,
    category: 'Fashion & Beauty',
    verified: true,
    bio: 'Fashion influencer | Beauty enthusiast | Lifestyle content creator',
  },
  {
    id: '2',
    name: 'Alex Rodriguez',
    handle: '@alexrodriguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    followers: 1800000,
    engagement_rate: 7.2,
    avg_likes: 95000,
    avg_comments: 6200,
    avg_shares: 2800,
    category: 'Tech & Gadgets',
    verified: true,
    bio: 'Tech reviewer | Gadget enthusiast | Innovation lover',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    handle: '@emmawilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    followers: 3200000,
    engagement_rate: 9.1,
    avg_likes: 165000,
    avg_comments: 11200,
    avg_shares: 4500,
    category: 'Lifestyle & Travel',
    verified: true,
    bio: 'Travel vlogger | Lifestyle content | Adventure seeker',
  },
  {
    id: '4',
    name: 'James Park',
    handle: '@jamespark',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    followers: 1500000,
    engagement_rate: 6.8,
    avg_likes: 78000,
    avg_comments: 5100,
    avg_shares: 2200,
    category: 'Fitness & Health',
    verified: false,
    bio: 'Fitness coach | Health enthusiast | Workout tips',
  },
];

const InfluencersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredInfluencers, setFilteredInfluencers] = useState(SAMPLE_INFLUENCERS);

  const categories = ['Fashion & Beauty', 'Tech & Gadgets', 'Lifestyle & Travel', 'Fitness & Health'];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterInfluencers(query, selectedCategory);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    filterInfluencers(searchQuery, category);
  };

  const filterInfluencers = (query: string, category: string) => {
    let filtered = SAMPLE_INFLUENCERS;

    if (query) {
      filtered = filtered.filter(
        (inf) =>
          inf.name.toLowerCase().includes(query.toLowerCase()) ||
          inf.handle.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter((inf) => inf.category === category);
    }

    setFilteredInfluencers(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Influencers</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and analyze top influencers in your niche
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search influencers..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Influencers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfluencers.map((influencer) => (
            <div
              key={influencer.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              {/* Header with Avatar */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-6 text-center">
                <img
                  src={influencer.avatar}
                  alt={influencer.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white dark:border-gray-700"
                />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{influencer.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{influencer.handle}</p>
                {influencer.verified && (
                  <span className="inline-block mt-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-3 py-1 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>

              {/* Bio */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">{influencer.bio}</p>
              </div>

              {/* Stats */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Followers</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {(influencer.followers / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Engagement Rate</span>
                  <span className="font-bold text-pink-600 dark:text-pink-400">
                    {influencer.engagement_rate.toFixed(1)}%
                  </span>
                </div>

                {/* Engagement Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <Heart className="w-4 h-4 text-red-500 mx-auto mb-1" />
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {(influencer.avg_likes / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-gray-500">Likes</div>
                  </div>
                  <div className="text-center">
                    <MessageCircle className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {(influencer.avg_comments / 1000).toFixed(1)}K
                    </div>
                    <div className="text-xs text-gray-500">Comments</div>
                  </div>
                  <div className="text-center">
                    <Share2 className="w-4 h-4 text-green-500 mx-auto mb-1" />
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {(influencer.avg_shares / 1000).toFixed(1)}K
                    </div>
                    <div className="text-xs text-gray-500">Shares</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-6 pb-6">
                <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredInfluencers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No influencers found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencersPage;

