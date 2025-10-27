import React, { useState, useEffect } from 'react';
import { Users, AlertCircle, Loader, X, ExternalLink } from 'lucide-react';

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
  profile_image?: string;
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

// Complete manual influencer data with all 45 profiles
const MANUAL_INFLUENCERS: Influencer[] = [
  {
    influencer_name: 'kylerichards18',
    followers: '125K',
    following: '890',
    post_count: '1.2K',
    engagement_rate: 4.2,
    bio: 'Lifestyle content creator sharing daily inspiration',
    verified: true,
    profile_link: 'https://amazon.com/influencer/kylerichards18',
    profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'paige_desorbo',
    followers: '89K',
    following: '1.2K',
    post_count: '856',
    engagement_rate: 3.8,
    bio: 'Fashion & beauty enthusiast',
    verified: true,
    profile_link: 'https://amazon.com/influencer/paige_desorbo',
    profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'jdroberto',
    followers: '156K',
    following: '765',
    post_count: '2.1K',
    engagement_rate: 5.1,
    bio: 'Tech reviewer and gadget lover',
    verified: true,
    profile_link: 'https://amazon.com/influencer/jdroberto',
    profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'kandionline',
    followers: '78K',
    following: '432',
    post_count: '654',
    engagement_rate: 4.5,
    bio: 'Home organization expert',
    verified: false,
    profile_link: 'https://amazon.com/influencer/kandionline',
    profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'makhondlovu',
    followers: '203K',
    following: '1.5K',
    post_count: '1.8K',
    engagement_rate: 6.2,
    bio: 'Travel content creator exploring the world',
    verified: true,
    profile_link: 'https://amazon.com/influencer/makhondlovu',
    profile_image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: '_giagiudice',
    followers: '167K',
    following: '987',
    post_count: '1.4K',
    engagement_rate: 4.8,
    bio: 'Foodie sharing delicious recipes',
    verified: true,
    profile_link: 'https://amazon.com/influencer/_giagiudice',
    profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'madison.lecroy',
    followers: '94K',
    following: '654',
    post_count: '723',
    engagement_rate: 3.9,
    bio: 'Fashion influencer with southern charm',
    verified: false,
    profile_link: 'https://amazon.com/influencer/madison.lecroy',
    profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'lalakent',
    followers: '145K',
    following: '876',
    post_count: '1.1K',
    engagement_rate: 4.3,
    bio: 'Mom life and parenting tips',
    verified: true,
    profile_link: 'https://amazon.com/influencer/lalakent',
    profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'harryjowsey',
    followers: '189K',
    following: '1.3K',
    post_count: '987',
    engagement_rate: 5.4,
    bio: 'Fitness and wellness coach',
    verified: true,
    profile_link: 'https://amazon.com/influencer/harryjowsey',
    profile_image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'alix_earle',
    followers: '256K',
    following: '2.1K',
    post_count: '1.5K',
    engagement_rate: 7.1,
    bio: 'Beauty guru and makeup artist',
    verified: true,
    profile_link: 'https://amazon.com/influencer/alix_earle',
    profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'influencer-51db6fba',
    followers: '67K',
    following: '321',
    post_count: '432',
    engagement_rate: 3.2,
    bio: 'Amazon product reviewer',
    verified: false,
    profile_link: 'https://amazon.com/influencer/influencer-51db6fba',
    profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'rockybarnes',
    followers: '178K',
    following: '765',
    post_count: '1.3K',
    engagement_rate: 4.9,
    bio: 'Adventure photographer',
    verified: true,
    profile_link: 'https://amazon.com/influencer/rockybarnes',
    profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'interiordesignerella',
    followers: '112K',
    following: '543',
    post_count: '876',
    engagement_rate: 4.1,
    bio: 'Interior design expert',
    verified: true,
    profile_link: 'https://amazon.com/influencer/interiordesignerella',
    profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'julianna_claire',
    followers: '83K',
    following: '432',
    post_count: '567',
    engagement_rate: 3.7,
    bio: 'Lifestyle and fashion content',
    verified: false,
    profile_link: 'https://amazon.com/influencer/julianna_claire',
    profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'aspynovard',
    followers: '198K',
    following: '876',
    post_count: '1.6K',
    engagement_rate: 5.6,
    bio: 'Beauty and lifestyle creator',
    verified: true,
    profile_link: 'https://amazon.com/influencer/aspynovard',
    profile_image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'teresalaucar',
    followers: '134K',
    following: '654',
    post_count: '987',
    engagement_rate: 4.4,
    bio: 'Fashion stylist and consultant',
    verified: true,
    profile_link: 'https://amazon.com/influencer/teresalaucar',
    profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'the_broadmoor_house',
    followers: '76K',
    following: '234',
    post_count: '345',
    engagement_rate: 3.5,
    bio: 'Home renovation journey',
    verified: false,
    profile_link: 'https://amazon.com/influencer/the_broadmoor_house',
    profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'sweetsavingsandthings',
    followers: '156K',
    following: '543',
    post_count: '1.2K',
    engagement_rate: 4.7,
    bio: 'Budget-friendly finds and deals',
    verified: true,
    profile_link: 'https://amazon.com/influencer/sweetsavingsandthings',
    profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'ourwintonhome',
    followers: '89K',
    following: '321',
    post_count: '456',
    engagement_rate: 3.8,
    bio: 'Family life and home decor',
    verified: false,
    profile_link: 'https://amazon.com/influencer/ourwintonhome',
    profile_image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'thesweetimpact',
    followers: '123K',
    following: '432',
    post_count: '789',
    engagement_rate: 4.2,
    bio: 'Positive lifestyle content',
    verified: true,
    profile_link: 'https://amazon.com/influencer/thesweetimpact',
    profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'arinsolange',
    followers: '167K',
    following: '765',
    post_count: '1.1K',
    engagement_rate: 5.0,
    bio: 'Beauty and skincare expert',
    verified: true,
    profile_link: 'https://amazon.com/influencer/arinsolange',
    profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'alliephunter',
    followers: '98K',
    following: '543',
    post_count: '654',
    engagement_rate: 3.9,
    bio: 'Fashion and travel content',
    verified: false,
    profile_link: 'https://amazon.com/influencer/alliephunter',
    profile_image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'everything.envy',
    followers: '145K',
    following: '654',
    post_count: '876',
    engagement_rate: 4.6,
    bio: 'Luxury lifestyle and fashion',
    verified: true,
    profile_link: 'https://amazon.com/influencer/everything.envy',
    profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'tiffanyallison7',
    followers: '112K',
    following: '432',
    post_count: '567',
    engagement_rate: 4.0,
    bio: 'Mom blogger and product reviewer',
    verified: false,
    profile_link: 'https://amazon.com/influencer/tiffanyallison7',
    profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'thebargainsisters',
    followers: '189K',
    following: '876',
    post_count: '1.4K',
    engagement_rate: 5.3,
    bio: 'Sisters sharing the best deals',
    verified: true,
    profile_link: 'https://amazon.com/influencer/thebargainsisters',
    profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'clickandlove',
    followers: '76K',
    following: '234',
    post_count: '345',
    engagement_rate: 3.4,
    bio: 'Amazon finds and recommendations',
    verified: false,
    profile_link: 'https://amazon.com/influencer/clickandlove',
    profile_image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'ironmom40',
    followers: '134K',
    following: '543',
    post_count: '789',
    engagement_rate: 4.3,
    bio: 'Fitness mom and health coach',
    verified: true,
    profile_link: 'https://amazon.com/influencer/ironmom40',
    profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'everyday.holly',
    followers: '89K',
    following: '321',
    post_count: '456',
    engagement_rate: 3.7,
    bio: 'Everyday lifestyle content',
    verified: false,
    profile_link: 'https://amazon.com/influencer/everyday.holly',
    profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'kristen.niblett',
    followers: '156K',
    following: '654',
    post_count: '987',
    engagement_rate: 4.8,
    bio: 'Beauty and makeup tutorials',
    verified: true,
    profile_link: 'https://amazon.com/influencer/kristen.niblett',
    profile_image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'balkanina',
    followers: '123K',
    following: '432',
    post_count: '678',
    engagement_rate: 4.1,
    bio: 'Cultural content and recipes',
    verified: true,
    profile_link: 'https://amazon.com/influencer/balkanina',
    profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'heidisnipes',
    followers: '98K',
    following: '543',
    post_count: '654',
    engagement_rate: 3.8,
    bio: 'Home organization expert',
    verified: false,
    profile_link: 'https://amazon.com/influencer/heidisnipes',
    profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'tourdelust',
    followers: '178K',
    following: '765',
    post_count: '1.2K',
    engagement_rate: 5.2,
    bio: 'Travel guides and adventures',
    verified: true,
    profile_link: 'https://amazon.com/influencer/tourdelust',
    profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'kirasfashionfinds',
    followers: '145K',
    following: '654',
    post_count: '876',
    engagement_rate: 4.7,
    bio: 'Affordable fashion finds',
    verified: true,
    profile_link: 'https://amazon.com/influencer/kirasfashionfinds',
    profile_image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'shopdandy',
    followers: '112K',
    following: '432',
    post_count: '567',
    engagement_rate: 4.0,
    bio: 'Shopping recommendations',
    verified: false,
    profile_link: 'https://amazon.com/influencer/shopdandy',
    profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'maryamishtiaq',
    followers: '167K',
    following: '765',
    post_count: '1.1K',
    engagement_rate: 4.9,
    bio: 'Beauty and lifestyle content',
    verified: true,
    profile_link: 'https://amazon.com/influencer/maryamishtiaq',
    profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'livinstyleinsta',
    followers: '89K',
    following: '321',
    post_count: '456',
    engagement_rate: 3.6,
    bio: 'Style inspiration daily',
    verified: false,
    profile_link: 'https://amazon.com/influencer/livinstyleinsta',
    profile_image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'meimonstaa',
    followers: '134K',
    following: '543',
    post_count: '789',
    engagement_rate: 4.4,
    bio: 'Creative content and art',
    verified: true,
    profile_link: 'https://amazon.com/influencer/meimonstaa',
    profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'mikaylavallati',
    followers: '156K',
    following: '654',
    post_count: '987',
    engagement_rate: 4.8,
    bio: 'Food and recipe creator',
    verified: true,
    profile_link: 'https://amazon.com/influencer/mikaylavallati',
    profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'homesweetpink',
    followers: '98K',
    following: '432',
    post_count: '567',
    engagement_rate: 3.9,
    bio: 'Pink-themed home decor',
    verified: false,
    profile_link: 'https://amazon.com/influencer/homesweetpink',
    profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'theparentgame',
    followers: '189K',
    following: '876',
    post_count: '1.3K',
    engagement_rate: 5.1,
    bio: 'Parenting tips and tricks',
    verified: true,
    profile_link: 'https://amazon.com/influencer/theparentgame',
    profile_image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'michellelei',
    followers: '123K',
    following: '543',
    post_count: '678',
    engagement_rate: 4.2,
    bio: 'Lifestyle and fashion',
    verified: true,
    profile_link: 'https://amazon.com/influencer/michellelei',
    profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'xojalonda',
    followers: '145K',
    following: '654',
    post_count: '876',
    engagement_rate: 4.6,
    bio: 'Beauty and self-care',
    verified: true,
    profile_link: 'https://amazon.com/influencer/xojalonda',
    profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'playroominspo',
    followers: '76K',
    following: '234',
    post_count: '345',
    engagement_rate: 3.3,
    bio: 'Kids room inspiration',
    verified: false,
    profile_link: 'https://amazon.com/influencer/playroominspo',
    profile_image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'just.jacsy',
    followers: '112K',
    following: '432',
    post_count: '567',
    engagement_rate: 4.0,
    bio: 'Minimalist lifestyle',
    verified: false,
    profile_link: 'https://amazon.com/influencer/just.jacsy',
    profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'thedealparty',
    followers: '167K',
    following: '765',
    post_count: '1.1K',
    engagement_rate: 4.9,
    bio: 'Daily deals and discounts',
    verified: true,
    profile_link: 'https://amazon.com/influencer/thedealparty',
    profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'frankietavares',
    followers: '134K',
    following: '543',
    post_count: '789',
    engagement_rate: 4.3,
    bio: 'Fitness and nutrition',
    verified: true,
    profile_link: 'https://amazon.com/influencer/frankietavares',
    profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  },
  {
    influencer_name: 'influencer-cb2630cb',
    followers: '67K',
    following: '321',
    post_count: '432',
    engagement_rate: 3.1,
    bio: 'Product reviews and testing',
    verified: false,
    profile_link: 'https://amazon.com/influencer/influencer-cb2630cb',
    profile_image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
  }
];

// Posts Modal Component (same as before)
interface PostsModalProps {
  isOpen: boolean;
  influencerName: string;
  onClose: () => void;
}

const PostsModal: React.FC<PostsModalProps> = ({ isOpen, influencerName, onClose }) => {
  const [posts, setPosts] = useState<InfluencerPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<InfluencerPost | null>(null);

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
  <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
          {posts.map((post, index) => (
            <div
              key={post.post_id || index}
              className="bg-white h-[294px] dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Image and Content Side by Side */}
              <div className="flex flex-1 justify-center items-center">
                {/* Post Image/Thumbnail */}
                {(post.post_thumbnail || post.image_url || post.image) && (
                  <div className="w-1/3 flex-shrink-0">
                    <div className="h-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                      <img
                        src={post.post_thumbnail || post.image_url || post.image}
                        alt={post.post_title || 'Post'}
                        className="w-full h-[215px] object-cover p-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Post Info */}
                <div className="flex-1 p-4 flex flex-col">
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
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3 flex-1">
                      {post.post_description || post.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                    {(post.likes_count || post.likes) && (
                      <span className="flex items-center gap-1">
                        <span>❤️</span>
                        <span>{post.likes_count || post.likes}</span>
                      </span>
                    )}
                    {(post.comments_count || post.comments) && (
                      <span className="flex items-center gap-1">
                        <span>💬</span>
                        <span>{post.comments_count || post.comments}</span>
                      </span>
                    )}
                    {post.video_duration && (
                      <span className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{post.video_duration}</span>
                      </span>
                    )}
                    {post.list_items_count && (
                      <span className="flex items-center gap-1">
                        <span>📋</span>
                        <span>{post.list_items_count} items</span>
                      </span>
                    )}
                    {post.is_pinned && (
                      <span className="flex items-center gap-1">
                        <span>📌</span>
                        <span>Pinned</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* View Post Button - Full width at bottom */}
              {(post.post_url || post.url) && (
                <div className="border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="w-full bg-[#ffa41c] hover:bg-[#e59419] text-white text-center py-3 px-4 text-sm font-medium transition-colors duration-200"
                  >
                    View Post
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No posts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            No posts available for {influencerName}. This influencer might not have any public posts or there might be an issue with the data source.
          </p>
        </div>
      )}
    </div>
  </div>

  {/* Post Detail Modal */}
  {selectedPost && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Post Details
          </h2>
          <button
            onClick={() => setSelectedPost(null)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Post Image */}
          {(selectedPost.post_thumbnail || selectedPost.image_url || selectedPost.image) && (
            <div className="w-full rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
              <img
                src={selectedPost.post_thumbnail || selectedPost.image_url || selectedPost.image}
                alt={selectedPost.post_title || 'Post'}
                className="w-full h-auto object-cover max-h-96"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Post Type Badge */}
          {selectedPost.post_type && (
            <div>
              <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm px-3 py-1 rounded-full font-medium">
                {selectedPost.post_type}
              </span>
            </div>
          )}

          {/* Post Title */}
          {(selectedPost.post_title || selectedPost.title) && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedPost.post_title || selectedPost.title}
              </h3>
            </div>
          )}

          {/* Post Description */}
          {(selectedPost.post_description || selectedPost.description) && (
            <div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {selectedPost.post_description || selectedPost.description}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(selectedPost.likes_count || selectedPost.likes) && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">❤️</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Likes</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedPost.likes_count || selectedPost.likes}
                </div>
              </div>
            )}
            {(selectedPost.comments_count || selectedPost.comments) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">💬</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Comments</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedPost.comments_count || selectedPost.comments}
                </div>
              </div>
            )}
            {selectedPost.video_duration && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">⏱️</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedPost.video_duration}
                </div>
              </div>
            )}
            {selectedPost.list_items_count && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">📋</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Items</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedPost.list_items_count}
                </div>
              </div>
            )}
          </div>

          {/* Pinned Badge */}
          {selectedPost.is_pinned && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 flex items-center gap-3">
              <span className="text-2xl">📌</span>
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-300">Pinned Post</p>
                <p className="text-sm text-yellow-800 dark:text-yellow-400">This post is pinned on the influencer's profile</p>
              </div>
            </div>
          )}

          {/* View Original Button */}
          {(selectedPost.post_url || selectedPost.url) && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <a
                href={selectedPost.post_url || selectedPost.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#ffa41c] hover:bg-[#e59419] text-white py-3 px-4 rounded-lg text-center font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                View Original Post
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )}
</div>
  );
};

const InfluencersPage: React.FC = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch influencer data with profile images
  useEffect(() => {
    const fetchInfluencerData = async () => {
      setIsLoading(true);
      try {
        const influencersWithImages = MANUAL_INFLUENCERS.map(influencer => ({
          ...influencer,
          profile_image: influencer.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.influencer_name)}&background=random&size=150`
        }));

        setInfluencers(influencersWithImages);
      } catch (error) {
        console.error('Error fetching influencer data:', error);
        setInfluencers(MANUAL_INFLUENCERS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfluencerData();
  }, []);

  // Filter influencers based on search
  const filteredInfluencers = influencers.filter((inf) =>
    inf.influencer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inf.bio?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Influencers Link</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and analyze top influencers
          </p>
        </div>

        {/* Search */}
        {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search influencers by name or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div> */}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        )}

        {/* Influencers Grid */}
        {!isLoading && filteredInfluencers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredInfluencers.map((influencer) => (
              <div
                key={influencer.influencer_name}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col"
              >
                {/* Profile Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <img
                        src={influencer.profile_image}
                        alt={influencer.influencer_name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.influencer_name)}&background=random&size=150`;
                        }}
                      />
                      {influencer.verified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        {influencer.influencer_name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {influencer.followers || 'N/A'} followers
                    </p>
                    <a
                      href={influencer.profile_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Bio */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                    {influencer.bio || 'No bio available'}
                  </p>
                </div>

                {/* Stats */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {influencer.post_count || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Posts</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {influencer.following || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {influencer.engagement_rate ? `${influencer.engagement_rate}%` : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Engagement</div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 mt-auto">
                  <button
                    onClick={() => setSelectedInfluencer(influencer.influencer_name)}
                    className="w-full bg-[#ffa41c] hover:bg-[#e59419] text-white py-3 px-4 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm"
                  >
                    View Posts
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredInfluencers.length === 0 && (
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