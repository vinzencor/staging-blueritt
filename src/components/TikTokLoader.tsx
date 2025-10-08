import React from 'react';
import { Play, Heart, Share, Music, Hash, Users, Eye, MessageCircle } from 'lucide-react';

interface TikTokLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

const TikTokLoader: React.FC<TikTokLoaderProps> = ({
  size = 'md',
  text = 'Loading TikTok trends...',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
      {/* TikTok-themed animated loader */}
      <div className="relative">
        {/* Multiple rotating rings with TikTok gradient colors */}
        <div className={`${sizeClasses[size]} border-4 border-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-full animate-spin`} style={{ background: 'conic-gradient(from 0deg, #ff0050, #00f5ff, #ff0050)' }}></div>
        <div className={`${sizeClasses[size]} absolute inset-1 border-4 border-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '2s', background: 'conic-gradient(from 180deg, #00f5ff, #ff0050, #00f5ff)' }}></div>

        {/* Inner white circle for contrast */}
        <div className={`absolute inset-2 bg-white rounded-full shadow-lg`}></div>

        {/* TikTok play button in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className={`${iconSizeClasses[size]} text-black animate-pulse`}>
              <Play className="w-full h-full fill-current" />
            </div>
            {/* Glowing effect around play button */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-cyan-400 rounded-full blur-sm opacity-30 animate-pulse"></div>
          </div>
        </div>

        {/* Enhanced floating TikTok icons */}
        <div className="absolute inset-0">
          {/* Heart icon with pulse */}
          <div className="absolute -top-4 -right-4 animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.5s' }}>
            <div className="relative">
              <Heart className={`${iconSizeClasses[size]} text-red-500 opacity-90 fill-current drop-shadow-lg`} />
              <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-40 animate-pulse"></div>
            </div>
          </div>

          {/* Music note with wave effect */}
          <div className="absolute -top-4 -left-4 animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '1.8s' }}>
            <div className="relative">
              <Music className={`${iconSizeClasses[size]} text-purple-600 opacity-90 drop-shadow-lg`} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Share icon with glow */}
          <div className="absolute -bottom-4 -left-4 animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '2s' }}>
            <div className="relative">
              <Share className={`${iconSizeClasses[size]} text-cyan-500 opacity-90 drop-shadow-lg`} />
              <div className="absolute inset-0 bg-cyan-300 rounded-full blur-sm opacity-30 animate-pulse"></div>
            </div>
          </div>

          {/* Hashtag for trending */}
          <div className="absolute -bottom-4 -right-4 animate-bounce" style={{ animationDelay: '0.9s', animationDuration: '1.7s' }}>
            <div className="relative">
              <Hash className={`${iconSizeClasses[size]} text-yellow-500 opacity-90 drop-shadow-lg`} />
              <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Eye icon for views */}
          <div className="absolute top-0 -right-6 animate-bounce" style={{ animationDelay: '1.2s', animationDuration: '2.2s' }}>
            <Eye className={`w-3 h-3 text-blue-500 opacity-70 drop-shadow-sm`} />
          </div>

          {/* Users icon for followers */}
          <div className="absolute bottom-0 -left-6 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '1.9s' }}>
            <Users className={`w-3 h-3 text-green-500 opacity-70 drop-shadow-sm`} />
          </div>
        </div>

        {/* TikTok-style pulsing rings */}
        <div className={`${sizeClasses[size]} absolute inset-0 border-2 border-pink-400 rounded-full animate-ping opacity-20`}></div>
        <div className={`${sizeClasses[size]} absolute inset-0 border border-cyan-400 rounded-full animate-ping opacity-15`} style={{ animationDelay: '0.5s' }}></div>
        <div className={`${sizeClasses[size]} absolute inset-0 border border-purple-400 rounded-full animate-ping opacity-10`} style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Enhanced loading text with TikTok branding */}
      {text && (
        <div className="text-center space-y-3">
          <p className={`${textSizeClasses[size]} text-gray-800 font-bold animate-pulse bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent`}>
            {text}
          </p>

          {/* TikTok-style loading dots with gradient */}
          <div className="flex items-center justify-center space-x-1.5">
            <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.45s' }}></div>
          </div>

          {/* TikTok-style engagement metrics */}
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3 text-red-500 fill-current" />
              <span className="font-semibold">Trending</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Hash className="w-3 h-3 text-blue-500" />
              <span className="font-semibold">Viral</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Music className="w-3 h-3 text-purple-500" />
              <span className="font-semibold">Sound</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced TikTok-style progress bar */}
      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full animate-pulse shadow-sm"></div>
        <div className="absolute inset-0 w-48 h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* TikTok creator-style stats */}
      <div className="flex items-center justify-center space-x-6 opacity-70">
        <div className="flex flex-col items-center">
          <Eye className="w-4 h-4 text-gray-500 mb-1" />
          <span className="text-xs text-gray-500 font-medium">Views</span>
        </div>
        <div className="flex flex-col items-center">
          <Heart className="w-4 h-4 text-gray-500 mb-1" />
          <span className="text-xs text-gray-500 font-medium">Likes</span>
        </div>
        <div className="flex flex-col items-center">
          <MessageCircle className="w-4 h-4 text-gray-500 mb-1" />
          <span className="text-xs text-gray-500 font-medium">Comments</span>
        </div>
        <div className="flex flex-col items-center">
          <Share className="w-4 h-4 text-gray-500 mb-1" />
          <span className="text-xs text-gray-500 font-medium">Shares</span>
        </div>
      </div>
    </div>
  );
};

export default TikTokLoader;
