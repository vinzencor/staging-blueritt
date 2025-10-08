import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, ShoppingCart, AlertCircle, ChevronLeft, ChevronRight, Package, Zap, Tag } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAmazonDeals, getAmazonTrendsProductOffers } from '../../../../../api/amazonTrends';
import { getTikTokTrendingProducts } from '../../../../../api/tiktokTrends';

// Types and Interfaces
export interface Deal {
  id: string;
  title: string;
  offer: string;
  dealEndTime: string;
  imageUrl: string;
  originalPrice?: number;
  discountedPrice?: number;
}

export interface Offer {
  id: string;
  title: string;
  offer: string;
  offerEndTime: string;
  imageUrl: string;
  originalPrice?: number;
  discountedPrice?: number;
  seller?: string;
  condition?: string;
}

export interface BestDealsWidgetProps {
  deals: Deal[];
  offers?: Offer[];
  autoScrollInterval?: number;
  onDealClick?: (deal: Deal) => void;
  onOfferClick?: (offer: Offer) => void;
  isLoading?: boolean;
  isOffersLoading?: boolean;
  className?: string;
  themeColors?: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    accent: string;
    badge: string;
    button: string;
    border: string;
    ring: string;
  };
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

// Countdown Timer Component
const CountdownTimer: React.FC<{ endTime: string; className?: string }> = ({ 
  endTime, 
  className = ''
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = (): TimeRemaining => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, total: difference };
    };

    const updateTimer = () => {
      setTimeRemaining(calculateTimeRemaining());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const isUrgent = timeRemaining.total <= 24 * 60 * 60 * 1000 && timeRemaining.total > 0;
  const isVeryUrgent = timeRemaining.total <= 60 * 60 * 1000 && timeRemaining.total > 0;

  const formatTime = (value: number): string => {
    return value.toString().padStart(2, '0');
  };

  if (timeRemaining.total <= 0) {
    return (
      <div className={`flex items-center text-red-600 font-semibold ${className}`}>
        <Clock className="w-3 h-3 mr-1" />
        <span className="text-xs">Deal Expired</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${isVeryUrgent ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-gray-600'} ${className}`}>
      <Clock className="w-3 h-3 mr-1" />
      <div className="flex items-center space-x-1 text-xs font-medium">
        {timeRemaining.days > 0 && (
          <>
            <span className={`px-1.5 py-0.5 rounded ${isVeryUrgent ? 'bg-red-100 text-red-800' : isUrgent ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
              {formatTime(timeRemaining.days)}d
            </span>
            <span>:</span>
          </>
        )}
        <span className={`px-1.5 py-0.5 rounded ${isVeryUrgent ? 'bg-red-100 text-red-800' : isUrgent ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
          {formatTime(timeRemaining.hours)}h
        </span>
        <span>:</span>
        <span className={`px-1.5 py-0.5 rounded ${isVeryUrgent ? 'bg-red-100 text-red-800' : isUrgent ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
          {formatTime(timeRemaining.minutes)}m
        </span>
      </div>
    </div>
  );
};

// Deal Card Component
const DealCard: React.FC<{
  deal: Deal;
  onClick?: (deal: Deal) => void;
  isActive?: boolean;
  themeColors?: any;
}> = ({ deal, onClick, isActive = false, themeColors }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleClick = () => {
    onClick?.(deal);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border transition-all duration-300 cursor-pointer hover:shadow-md transform hover:scale-[1.02] ${
        isActive ? `ring-2 ${themeColors?.ring} shadow-md` : `border-gray-200 ${themeColors?.border}`
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Deal: ${deal.title} - ${deal.offer}`}
    >
      <div className="p-3 space-y-3">
        {/* Product Image */}
        <div className="relative h-24 sm:h-28 bg-gray-100 rounded-lg overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
          ) : (
            <img
              src={deal.imageUrl}
              alt={deal.title}
              className="w-full h-full object-cover transition-all duration-300"
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ opacity: imageLoading ? 0 : 1 }}
            />
          )}
          {/* Offer Badge */}
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
            <span className={`${themeColors?.badge} text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-bold shadow-sm`}>
              {deal.offer}
            </span>
          </div>
        </div>

        {/* Deal Information */}
        <div className="space-y-1.5 sm:space-y-2">
          <h3 className="text-xs sm:text-sm font-semibold text-[#232F3E] line-clamp-2 leading-tight min-h-[1.2rem] sm:min-h-[1.5rem]">
            {deal.title}
          </h3>

          {/* Pricing */}
          {(deal.originalPrice || deal.discountedPrice) && (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {deal.discountedPrice && (
                <span className="font-bold text-[#232F3E] text-sm sm:text-lg">
                  ${deal.discountedPrice.toFixed(2)}
                </span>
              )}
              {deal.originalPrice && (
                <span className="text-gray-500 text-xs sm:text-sm line-through">
                  ${deal.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          )}

          {/* Countdown Timer */}
          <CountdownTimer endTime={deal.dealEndTime} />

          {/* Action Button */}
          <button
            className={`w-full ${themeColors?.button} text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-semibold transition-colors duration-200 flex items-center justify-center space-x-1 sm:space-x-2`}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Offer Card Component
const OfferCard: React.FC<{
  offer: Offer;
  onClick?: (offer: Offer) => void;
  isActive?: boolean;
  themeColors?: any;
}> = ({ offer, onClick, isActive = false, themeColors }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleClick = () => {
    onClick?.(offer);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border transition-all duration-300 cursor-pointer hover:shadow-md transform hover:scale-[1.02] ${
        isActive ? `ring-2 ${themeColors?.ring} shadow-md` : `border-gray-200 ${themeColors?.border}`
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Offer: ${offer.title} - ${offer.offer}`}
    >
      <div className="p-3 space-y-3">
        {/* Product Image */}
        <div className="relative h-24 sm:h-28 bg-gray-100 rounded-lg overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
          ) : (
            <img
              src={offer.imageUrl}
              alt={offer.title}
              className="w-full h-full object-cover transition-all duration-300"
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ opacity: imageLoading ? 0 : 1 }}
            />
          )}
          {/* Offer Badge */}
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
            <span className={`${themeColors?.badge} text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-bold shadow-sm flex items-center`}>
              <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
              {offer.offer}
            </span>
          </div>
        </div>

        {/* Offer Information */}
        <div className="space-y-1.5 sm:space-y-2">
          <h3 className="text-xs sm:text-sm font-semibold text-[#232F3E] line-clamp-2 leading-tight min-h-[2rem] sm:min-h-[2.5rem]">
            {offer.title}
          </h3>

          {/* Seller Info */}
          {offer.seller && (
            <div className="text-xs text-gray-600">
              Sold by: <span className="font-medium">{offer.seller}</span>
            </div>
          )}

          {/* Condition */}
          {offer.condition && (
            <div className="text-xs text-gray-600">
              Condition: <span className="font-medium">{offer.condition}</span>
            </div>
          )}

          {/* Pricing */}
          {(offer.originalPrice || offer.discountedPrice) && (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {offer.discountedPrice && (
                <span className="font-bold text-[#232F3E] text-sm sm:text-lg">
                  ${offer.discountedPrice.toFixed(2)}
                </span>
              )}
              {offer.originalPrice && (
                <span className="text-gray-500 text-xs sm:text-sm line-through">
                  ${offer.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          )}

          {/* Countdown Timer */}
          <CountdownTimer endTime={offer.offerEndTime} />

          {/* Action Button */}
          <button
            className={`w-full ${themeColors?.button} text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-semibold transition-colors duration-200 flex items-center justify-center space-x-1 sm:space-x-2`}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>View Offer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3 sm:space-y-4">
    {Array.from({ length: 2 }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-3">
        <div className="space-y-2 sm:space-y-3">
          <div className="h-24 sm:h-28 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-2.5 sm:h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="h-4 sm:h-5 bg-gray-200 rounded animate-pulse w-16 sm:w-20"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-12 sm:w-16"></div>
            </div>
            <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse w-20 sm:w-24"></div>
            <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State Component
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <Package className="w-12 h-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-semibold text-[#232F3E] mb-2">No Deals Available</h3>
    <p className="text-gray-600 text-sm max-w-48">
      Check back later for exciting deals and offers!
    </p>
  </div>
);

// Main BestDealsWidget Component
export const BestDealsWidget: React.FC<BestDealsWidgetProps> = ({
  deals,
  offers = [],
  autoScrollInterval = 4000,
  onDealClick,
  onOfferClick,
  isLoading = false,
  isOffersLoading = false,
  className = '',
  themeColors,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isOffersPaused, setIsOffersPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const offersIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const validDeals = deals.filter(deal => deal && deal.id);
  const validOffers = offers.filter(offer => offer && offer.id);

  const nextDeal = useCallback(() => {
    if (validDeals.length > 1) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % validDeals.length);
    }
  }, [validDeals.length]);

  const prevDeal = useCallback(() => {
    if (validDeals.length > 1) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + validDeals.length) % validDeals.length);
    }
  }, [validDeals.length]);

  const goToDeal = useCallback((index: number) => {
    if (index >= 0 && index < validDeals.length) {
      setCurrentIndex(index);
    }
  }, [validDeals.length]);

  // Offers navigation functions
  const nextOffer = useCallback(() => {
    if (validOffers.length > 1) {
      setCurrentOfferIndex((prevIndex) => (prevIndex + 1) % validOffers.length);
    }
  }, [validOffers.length]);

  const prevOffer = useCallback(() => {
    if (validOffers.length > 1) {
      setCurrentOfferIndex((prevIndex) => (prevIndex - 1 + validOffers.length) % validOffers.length);
    }
  }, [validOffers.length]);

  const goToOffer = useCallback((index: number) => {
    if (index >= 0 && index < validOffers.length) {
      setCurrentOfferIndex(index);
    }
  }, [validOffers.length]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isPaused && validDeals.length > 1) {
      intervalRef.current = setInterval(nextDeal, autoScrollInterval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, nextDeal, autoScrollInterval, validDeals.length]);

  // Auto-scroll functionality for offers
  useEffect(() => {
    if (!isOffersPaused && validOffers.length > 1) {
      offersIntervalRef.current = setInterval(nextOffer, autoScrollInterval + 1000); // Slightly offset from deals
    } else if (offersIntervalRef.current) {
      clearInterval(offersIntervalRef.current);
      offersIntervalRef.current = null;
    }

    return () => {
      if (offersIntervalRef.current) {
        clearInterval(offersIntervalRef.current);
      }
    };
  }, [isOffersPaused, nextOffer, autoScrollInterval, validOffers.length]);

  // Reset current index when deals change
  useEffect(() => {
    if (currentIndex >= validDeals.length && validDeals.length > 0) {
      setCurrentIndex(0);
    }
  }, [validDeals.length, currentIndex]);

  // Reset current offer index when offers change
  useEffect(() => {
    if (currentOfferIndex >= validOffers.length && validOffers.length > 0) {
      setCurrentOfferIndex(0);
    }
  }, [validOffers.length, currentOfferIndex]);

  const handleDealClick = (deal: Deal) => {
    onDealClick?.(deal);
  };

  const handleOfferClick = (offer: Offer) => {
    onOfferClick?.(offer);
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-50 rounded-lg px-2 sm:px-4 py-2 sm:py-4 ${className}`}>
        <div className="mb-2 sm:mb-3">
          <h2 className="text-sm sm:text-lg font-bold text-[#232F3E] flex items-center">
            <Zap className={`w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 ${themeColors?.accent || 'text-orange-500'}`} />
            <span className="hidden sm:inline">Best Deals</span>
            <span className="sm:hidden">Deals</span>
          </h2>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (validDeals.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg px-2 sm:px-4 py-2 sm:py-4 ${className}`}>
        <div className="mb-3 sm:mb-4">
          <h2 className="text-sm sm:text-lg font-bold text-[#232F3E] flex items-center">
            <Zap className={`w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 ${themeColors?.accent || 'text-orange-500'}`} />
            <span className="hidden sm:inline">Best Deals</span>
            <span className="sm:hidden">Deals</span>
          </h2>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div
      ref={widgetRef}
      className={`bg-gray-50 rounded-lg px-2 sm:px-4 py-2 sm:py-4 ${className}`}
      onMouseEnter={() => {
        setIsPaused(true);
        setIsOffersPaused(true);
      }}
      onMouseLeave={() => {
        setIsPaused(false);
        setIsOffersPaused(false);
      }}
      aria-label="Best Deals and Offers Widget"
      role="region"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-sm sm:text-lg font-bold text-gray-900 flex items-center">
          <Zap className={`w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 ${themeColors?.accent || 'text-orange-500'}`} />
          <span className="hidden sm:inline">Best Deals</span>
          <span className="sm:hidden">Deals</span>
        </h2>
        {validDeals.length > 1 && (
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={prevDeal}
              className="p-1 sm:p-1.5 rounded-full bg-white shadow-sm border border-gray-200 hover:text-white transition-all duration-200"
              style={{
                '--tw-ring-color': themeColors?.primary,
                backgroundColor: 'white'
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors?.primary || '#FF9900';
                e.currentTarget.style.borderColor = themeColors?.primary || '#FF9900';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
              aria-label="Previous deal"
              disabled={validDeals.length <= 1}
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={nextDeal}
              className="p-1 sm:p-1.5 rounded-full bg-white shadow-sm border border-gray-200 hover:text-white transition-all duration-200"
              style={{
                '--tw-ring-color': themeColors?.primary,
                backgroundColor: 'white'
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors?.primary || '#FF9900';
                e.currentTarget.style.borderColor = themeColors?.primary || '#FF9900';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
              aria-label="Next deal"
              disabled={validDeals.length <= 1}
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Current Deal */}
      <div className="relative">
        <DealCard
          deal={validDeals[currentIndex]}
          onClick={handleDealClick}
          isActive={true}
          themeColors={themeColors}
        />
      </div>

      {/* Progress Indicators */}
      {validDeals.length > 1 && (
        <div className="flex justify-center mt-3 sm:mt-4 space-x-1.5 sm:space-x-2">
          {validDeals.map((_, index) => (
            <button
              key={index}
              onClick={() => goToDeal(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'w-4 sm:w-6'
                  : 'w-1.5 sm:w-2 hover:bg-gray-400'
              }`}
              style={{
                backgroundColor: index === currentIndex ? (themeColors?.primary || '#FF9900') : '#d1d5db'
              }}
              aria-label={`Go to deal ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Deal Counter */}
      {validDeals.length > 1 && (
        <div className="text-center mt-2 sm:mt-3">
          <span className="text-xs text-gray-500">
            {currentIndex + 1} of {validDeals.length} deals
          </span>
        </div>
      )}

      {/* Best Offers Section */}
      {validOffers.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          {/* Offers Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-lg font-bold text-gray-900 flex items-center">
              <Tag className={`w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 ${themeColors?.accent || 'text-orange-500'}`} />
              <span className="hidden sm:inline">Best Offers</span>
              <span className="sm:hidden">Offers</span>
            </h3>
            {validOffers.length > 1 && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={prevOffer}
                  className="p-1 sm:p-1.5 rounded-full bg-white shadow-sm border border-gray-200 hover:text-white transition-all duration-200"
                  style={{
                    '--tw-ring-color': themeColors?.primary,
                    backgroundColor: 'white'
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = themeColors?.primary || '#FF9900';
                    e.currentTarget.style.borderColor = themeColors?.primary || '#FF9900';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                  aria-label="Previous offer"
                  disabled={validOffers.length <= 1}
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={nextOffer}
                  className="p-1 sm:p-1.5 rounded-full bg-white shadow-sm border border-gray-200 hover:text-white transition-all duration-200"
                  style={{
                    '--tw-ring-color': themeColors?.primary,
                    backgroundColor: 'white'
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = themeColors?.primary || '#FF9900';
                    e.currentTarget.style.borderColor = themeColors?.primary || '#FF9900';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                  aria-label="Next offer"
                  disabled={validOffers.length <= 1}
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Current Offer */}
          <div className="relative">
            <OfferCard
              offer={validOffers[currentOfferIndex]}
              onClick={handleOfferClick}
              isActive={true}
              themeColors={themeColors}
            />
          </div>

          {/* Offers Progress Indicators */}
          {validOffers.length > 1 && (
            <div className="flex justify-center mt-3 sm:mt-4 space-x-1.5 sm:space-x-2">
              {validOffers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToOffer(index)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-200 ${
                    index === currentOfferIndex
                      ? 'w-4 sm:w-6'
                      : 'w-1.5 sm:w-2 hover:bg-gray-400'
                  }`}
                  style={{
                    backgroundColor: index === currentOfferIndex ? (themeColors?.primary || '#FF9900') : '#d1d5db'
                  }}
                  aria-label={`Go to offer ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Offers Counter */}
          {validOffers.length > 1 && (
            <div className="text-center mt-2 sm:mt-3">
              <span className="text-xs text-gray-500">
                {currentOfferIndex + 1} of {validOffers.length} offers
              </span>
            </div>
          )}
        </div>
      )}

      {/* Loading state for offers */}
      {isOffersLoading && validOffers.length === 0 && (
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-lg font-bold text-gray-900 flex items-center">
              <Tag className={`w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 ${themeColors?.accent || 'text-orange-500'}`} />
              <span className="hidden sm:inline">Best Offers</span>
              <span className="sm:hidden">Offers</span>
            </h3>
          </div>
          <LoadingSkeleton />
        </div>
      )}
    </div>
  );
};

// Helper function to convert API data to Deal format
const convertAmazonProductToDeal = (product: any): Deal => {
  const originalPrice = parseFloat(product.product_original_price?.replace(/[^0-9.]/g, '') || '0');
  const currentPrice = parseFloat(product.product_price?.replace(/[^0-9.]/g, '') || '0');
  const discount = originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  return {
    id: product.asin || product.product_id || Math.random().toString(),
    title: product.product_title || 'Amazon Product',
    offer: discount > 0 ? `${discount}% OFF` : 'Deal',
    dealEndTime: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: product.product_photo || product.product_main_image_url || '/placeholder-product.png',
    originalPrice: originalPrice || undefined,
    discountedPrice: currentPrice || undefined,
  };
};

const convertTikTokProductToDeal = (product: any): Deal => {
  const originalPrice = parseFloat(product.original_price || '0');
  const currentPrice = parseFloat(product.price || '0');
  const discount = originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  return {
    id: product.id || product.product_id || Math.random().toString(),
    title: product.title || product.name || 'TikTok Product',
    offer: discount > 0 ? `${discount}% OFF` : 'Trending',
    dealEndTime: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: product.image_url || product.main_image || '/placeholder-product.png',
    originalPrice: originalPrice || undefined,
    discountedPrice: currentPrice || undefined,
  };
};

// Helper functions to convert API data to Offer format
const convertAmazonProductToOffer = (product: any): Offer => {
  const originalPrice = parseFloat(product.product_original_price?.replace(/[^0-9.]/g, '') || '0');
  const currentPrice = parseFloat(product.product_price?.replace(/[^0-9.]/g, '') || '0');
  const discount = originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  return {
    id: product.asin || product.product_id || Math.random().toString(),
    title: product.product_title || 'Amazon Product Offer',
    offer: discount > 0 ? `${discount}% OFF` : 'Special Offer',
    offerEndTime: new Date(Date.now() + Math.random() * 48 * 60 * 60 * 1000).toISOString(), // 48 hours for offers
    imageUrl: product.product_photo || product.product_main_image_url || '/placeholder-product.png',
    originalPrice: originalPrice || undefined,
    discountedPrice: currentPrice || undefined,
    seller: product.seller_name || 'Amazon',
    condition: product.product_condition || 'New',
  };
};

const convertTikTokProductToOffer = (product: any): Offer => {
  const originalPrice = parseFloat(product.original_price || '0');
  const currentPrice = parseFloat(product.price || '0');
  const discount = originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  return {
    id: product.id || product.product_id || Math.random().toString(),
    title: product.title || product.name || 'TikTok Product Offer',
    offer: discount > 0 ? `${discount}% OFF` : 'Hot Offer',
    offerEndTime: new Date(Date.now() + Math.random() * 36 * 60 * 60 * 1000).toISOString(), // 36 hours for offers
    imageUrl: product.image_url || product.main_image || '/placeholder-product.png',
    originalPrice: originalPrice || undefined,
    discountedPrice: currentPrice || undefined,
    seller: product.seller || 'TikTok Shop',
    condition: 'New',
  };
};

// Platform-specific wrapper component
export const PlatformBestDealsWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  const location = useLocation();

  // Determine platform based on URL
  const isAmazonPage = location.pathname.includes('/socialpulse/amazon');
  const isTikTokPage = location.pathname.includes('/socialpulse/tiktok');

  // Amazon Deals Query
  const { data: amazonDealsData, isLoading: amazonLoading } = useQuery({
    queryKey: ['amazon-deals'],
    queryFn: () => getAmazonDeals({
      country: 'US',
      discount_range: '30-100',
      min_product_star_rating: '4.0',
    }),
    enabled: isAmazonPage,
    staleTime: 1000 * 60 * 15,
    retry: 2,
  });

  // TikTok Trending Products Query (as deals)
  const { data: tiktokDealsData, isLoading: tiktokLoading } = useQuery({
    queryKey: ['tiktok-trending-deals'],
    queryFn: () => getTikTokTrendingProducts({
      country: 'US',
      limit: 10,
      page: 1,
    }),
    enabled: isTikTokPage,
    staleTime: 1000 * 60 * 15,
    retry: 2,
  });

  // Amazon Offers Query - Using trending products as offers
  const { data: amazonOffersData, isLoading: amazonOffersLoading } = useQuery({
    queryKey: ['amazon-offers'],
    queryFn: () => getAmazonDeals({
      country: 'US',
      discount_range: '20-100',
      min_product_star_rating: '3.5',
    }),
    enabled: isAmazonPage,
    staleTime: 1000 * 60 * 15,
    retry: 2,
  });

  // TikTok Offers Query - Using different trending products as offers
  const { data: tiktokOffersData, isLoading: tiktokOffersLoading } = useQuery({
    queryKey: ['tiktok-trending-offers'],
    queryFn: () => getTikTokTrendingProducts({
      country: 'US',
      limit: 8,
      page: 2, // Different page for variety
    }),
    enabled: isTikTokPage,
    staleTime: 1000 * 60 * 15,
    retry: 2,
  });

  // Fallback deals data
  const fallbackAmazonDeals: Deal[] = [
    {
      id: 'amazon-fallback-1',
      title: 'Echo Dot (5th Gen) Smart Speaker',
      offer: '50% OFF',
      dealEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://m.media-amazon.com/images/I/714Rdc+9wWL._AC_SL1500_.jpg',
      originalPrice: 49.99,
      discountedPrice: 24.99,
    },
    {
      id: 'amazon-fallback-2',
      title: 'Fire TV Stick 4K Max',
      offer: '40% OFF',
      dealEndTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://m.media-amazon.com/images/I/51TjJOTfslL._AC_SL1000_.jpg',
      originalPrice: 54.99,
      discountedPrice: 32.99,
    },
  ];

  const fallbackTikTokDeals: Deal[] = [
    {
      id: 'tiktok-fallback-1',
      title: 'Viral LED Strip Lights',
      offer: '60% OFF',
      dealEndTime: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      originalPrice: 29.99,
      discountedPrice: 11.99,
    },
    {
      id: 'tiktok-fallback-2',
      title: 'Trending Phone Case',
      offer: '45% OFF',
      dealEndTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400',
      originalPrice: 19.99,
      discountedPrice: 10.99,
    },
  ];

  // Fallback offers data
  const fallbackAmazonOffers: Offer[] = [
    {
      id: 'amazon-offer-1',
      title: 'Kindle Paperwhite (11th Gen)',
      offer: '35% OFF',
      offerEndTime: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://m.media-amazon.com/images/I/61IBBVJvSDL._AC_SL1000_.jpg',
      originalPrice: 139.99,
      discountedPrice: 89.99,
      seller: 'Amazon',
      condition: 'New',
    },
    {
      id: 'amazon-offer-2',
      title: 'Apple AirPods (3rd Generation)',
      offer: '25% OFF',
      offerEndTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg',
      originalPrice: 179.00,
      discountedPrice: 134.25,
      seller: 'Amazon',
      condition: 'New',
    },
  ];

  const fallbackTikTokOffers: Offer[] = [
    {
      id: 'tiktok-offer-1',
      title: 'Viral Skincare Set',
      offer: '70% OFF',
      offerEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
      originalPrice: 89.99,
      discountedPrice: 26.99,
      seller: 'TikTok Shop',
      condition: 'New',
    },
    {
      id: 'tiktok-offer-2',
      title: 'Trending Wireless Earbuds',
      offer: '55% OFF',
      offerEndTime: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
      originalPrice: 79.99,
      discountedPrice: 35.99,
      seller: 'TikTok Shop',
      condition: 'New',
    },
  ];

  // Convert API data to Deal format with fallback
  const amazonDeals: Deal[] = amazonDealsData?.data?.products?.slice(0, 5).map(convertAmazonProductToDeal) || fallbackAmazonDeals;
  const tiktokDeals: Deal[] = tiktokDealsData?.data?.products?.slice(0, 5).map(convertTikTokProductToDeal) || fallbackTikTokDeals;

  // Convert API data to Offer format with fallback
  const amazonOffers: Offer[] = amazonOffersData?.data?.products?.slice(0, 4).map(convertAmazonProductToOffer) || fallbackAmazonOffers;
  const tiktokOffers: Offer[] = tiktokOffersData?.data?.products?.slice(0, 4).map(convertTikTokProductToOffer) || fallbackTikTokOffers;

  // Don't render if not on a supported platform page
  if (!isAmazonPage && !isTikTokPage) {
    return null;
  }

  const deals = isAmazonPage ? amazonDeals : tiktokDeals;
  const offers = isAmazonPage ? amazonOffers : tiktokOffers;
  const platformTitle = isAmazonPage ? 'Amazon Best Deals and Offers' : 'TikTok Best Deals and Offers';
  const isLoading = isAmazonPage ? amazonLoading : tiktokLoading;
  const isOffersLoading = isAmazonPage ? amazonOffersLoading : tiktokOffersLoading;

  // Platform-specific theming
  const themeColors = isAmazonPage ? {
    primary: '#fc8804',
    primaryHover: '#fc8804',
    primaryLight: '#fc8804',
    accent: 'text-[#fc8804]',
    badge: 'bg-[#fc8804]',
    button: 'bg-[#fc8804] hover:bg-[#e6890a]',
    border: 'hover:border-[#FF9900]',
    ring: 'ring-[#fc8804] border-[#fc8804]'
  } : {
    primary: '#fc8804',
    primaryHover: '#fc8804',
    primaryLight: '#fc8804',
    accent: 'text-[#fc8804]',
    badge: 'bg-[#fc8804]',
    button: 'bg-[#fc8804] hover:bg-[#fc8804]',
    border: 'hover:border-[#fc8804]',
    ring: 'ring-[#fc8804] border-[#fc8804]'
  };

  const handleDealClick = (deal: Deal) => {
    console.log('Deal clicked:', deal);
  };

  const handleOfferClick = (offer: Offer) => {
    console.log('Offer clicked:', offer);
  };

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
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 35px 60px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
          }}
        >
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <ShoppingCart className={`w-5 h-5 mr-2 ${themeColors.accent}`} />
              {platformTitle}
            </h2>
          </div>
          <div className="p-4">
            <BestDealsWidget
              deals={deals}
              offers={offers}
              onDealClick={handleDealClick}
              onOfferClick={handleOfferClick}
              autoScrollInterval={5000}
              isLoading={isLoading}
              isOffersLoading={isOffersLoading}
              themeColors={themeColors}
              className="bg-transparent p-0"
            />
          </div>
        </div>
      </div>

      {/* Large Desktop Widget - Positioned on right side */}
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
              <ShoppingCart className={`w-4 h-4 mr-2 ${themeColors.accent}`} />
              {platformTitle}
            </h2>
          </div>
          <div className="p-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
            <BestDealsWidget
              deals={deals}
              offers={offers}
              onDealClick={handleDealClick}
              onOfferClick={handleOfferClick}
              autoScrollInterval={5000}
              isLoading={isLoading}
              isOffersLoading={isOffersLoading}
              themeColors={themeColors}
              className="bg-transparent p-0"
            />
          </div>
        </div>
      </div>

      {/* Tablet Widget - Positioned on right side */}
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
              <ShoppingCart className={`w-4 h-4 mr-2 ${themeColors.accent}`} />
              <span className="truncate">{platformTitle}</span>
            </h2>
          </div>
          <div className="p-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
            <BestDealsWidget
              deals={deals}
              offers={offers}
              onDealClick={handleDealClick}
              onOfferClick={handleOfferClick}
              autoScrollInterval={5000}
              isLoading={isLoading}
              isOffersLoading={isOffersLoading}
              themeColors={themeColors}
              className="bg-transparent p-0"
            />
          </div>
        </div>
      </div>

      {/* Mobile Widget - Collapsible bottom drawer */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-30
        block lg:hidden
        transition-all duration-300 ease-in-out
        ${className}
      `}>
        <div
          className="bg-white/98 backdrop-blur-md border-t border-white/30 ring-1 ring-black/5"
          style={{
            boxShadow: '0 -25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 flex items-center justify-center">
              <ShoppingCart className={`w-4 h-4 mr-2 ${themeColors.accent}`} />
              {platformTitle}
            </h2>
          </div>
          <div className="p-3 max-h-[50vh] overflow-y-auto">
            <BestDealsWidget
              deals={deals}
              offers={offers}
              onDealClick={handleDealClick}
              onOfferClick={handleOfferClick}
              autoScrollInterval={6000}
              isLoading={isLoading}
              isOffersLoading={isOffersLoading}
              themeColors={themeColors}
              className="bg-transparent p-0"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default BestDealsWidget;
