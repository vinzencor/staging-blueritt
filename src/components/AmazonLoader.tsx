import React from 'react';
import { ShoppingCart, Package, Star, Zap, Truck, Gift, CreditCard } from 'lucide-react';

interface AmazonLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

const AmazonLoader: React.FC<AmazonLoaderProps> = ({
  size = 'md',
  text = 'Loading Amazon products...',
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
      {/* Amazon-themed animated loader */}
      <div className="relative">
        {/* Outer rotating rings with Amazon colors */}
        <div className={`${sizeClasses[size]} border-4 border-orange-200 border-t-orange-500 border-r-orange-400 rounded-full animate-spin`}></div>
        <div className={`${sizeClasses[size]} absolute inset-0 border-4 border-transparent border-b-yellow-400 border-l-yellow-300 rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>

        {/* Amazon smile logo in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Amazon "a" with smile */}
            <div className="relative">
              <div className={`${iconSizeClasses[size]} text-orange-500 animate-pulse`}>
                <ShoppingCart className="w-full h-full" />
              </div>
              {/* Amazon smile curve - enhanced */}
              <div className="absolute -bottom-1 left-0 right-0">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full animate-pulse"></div>
                <div className="h-px bg-orange-400 rounded-full mt-0.5 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced floating icons with Amazon services */}
        <div className="absolute inset-0">
          {/* Prime Package icon */}
          <div className="absolute -top-3 -right-3 animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}>
            <div className="relative">
              <Package className={`${iconSizeClasses[size]} text-blue-600 opacity-80 drop-shadow-sm`} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Prime Star rating */}
          <div className="absolute -bottom-3 -left-3 animate-bounce" style={{ animationDelay: '0.7s', animationDuration: '2.2s' }}>
            <div className="relative">
              <Star className={`${iconSizeClasses[size]} text-yellow-500 opacity-80 fill-current drop-shadow-sm`} />
              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Fast delivery truck */}
          <div className="absolute -top-3 -left-3 animate-bounce" style={{ animationDelay: '1.4s', animationDuration: '1.8s' }}>
            <div className="relative">
              <Truck className={`${iconSizeClasses[size]} text-green-600 opacity-80 drop-shadow-sm`} />
              <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Gift/Deal icon */}
          <div className="absolute -bottom-3 -right-3 animate-bounce" style={{ animationDelay: '2.1s', animationDuration: '2.5s' }}>
            <div className="relative">
              <Gift className={`${iconSizeClasses[size]} text-red-500 opacity-80 drop-shadow-sm`} />
              <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-red-400 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>

        {/* Pulsing outer glow effect */}
        <div className={`${sizeClasses[size]} absolute inset-0 border-2 border-orange-300 rounded-full animate-ping opacity-30`}></div>
        <div className={`${sizeClasses[size]} absolute inset-0 border border-yellow-300 rounded-full animate-ping opacity-20`} style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Enhanced loading text with Amazon branding */}
      {text && (
        <div className="text-center space-y-3">
          <p className={`${textSizeClasses[size]} text-gray-800 font-semibold animate-pulse`}>
            {text}
          </p>

          {/* Amazon-style loading dots */}
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0s' }}></div>
            <div className="w-2.5 h-2.5 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-2.5 h-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.3s' }}></div>
          </div>

          {/* Amazon Prime-style subtitle */}
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Prime</span>
            </div>
            <span>•</span>
            <span>Fast & Reliable</span>
          </div>
        </div>
      )}

      {/* Enhanced Amazon-style progress bar */}
      <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-400 rounded-full animate-pulse shadow-sm"></div>
        <div className="absolute inset-0 w-40 h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Amazon logo-inspired elements */}
      <div className="flex items-center justify-center space-x-4 opacity-60">
        <div className="flex items-center space-x-1">
          <CreditCard className="w-3 h-3 text-gray-500" />
          <span className="text-xs text-gray-500">Secure</span>
        </div>
        <div className="w-px h-3 bg-gray-300"></div>
        <div className="flex items-center space-x-1">
          <Truck className="w-3 h-3 text-gray-500" />
          <span className="text-xs text-gray-500">Fast</span>
        </div>
        <div className="w-px h-3 bg-gray-300"></div>
        <div className="flex items-center space-x-1">
          <Star className="w-3 h-3 text-gray-500 fill-current" />
          <span className="text-xs text-gray-500">Trusted</span>
        </div>
      </div>
    </div>
  );
};

export default AmazonLoader;
