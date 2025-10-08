import React from "react";
import {
  TrendingUp,
  Star,
  DollarSign,
  BarChart3,
  Target,
  Zap,
  Award,
  ShoppingBag
} from "lucide-react";

type TCardsCarouselProps = {
  insights: {
    metrics: {
      avg_star_rating: number;
      avg_price: number;
      avg_num_reviews: number;
      avg_revenue: number;
      total_revenue: number;
      competing_products: number;
    };
    search_id: string;
    search_date: string;
  };
  isDataLoading: boolean;
  isEmptyState: boolean;
  handleVolumeCardClick: () => void;
};

const ModernMetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  subtitleValue?: string | number;
  icon: React.ReactNode;
  gradient: string;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
}> = ({ title, value, subtitle, subtitleValue, icon, gradient, trend, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl  transition-all duration-500 overflow-hidden transform hover:-translate-y-1 rounded-[15px]  overflow-hidden group">
      <div className={`${gradient} p-6 relative`}>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              trend === 'up' ? 'bg-green-500/20 text-green-100' :
              trend === 'down' ? 'bg-red-500/20 text-red-100' :
              'bg-gray-500/20 text-gray-100'
            }`}>
              <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
              {trend === 'up' ? '+12%' : trend === 'down' ? '-5%' : '0%'}
            </div>
          )}
        </div>

        <div className="text-white">
          <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
          <p className="text-3xl font-black mb-2">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {subtitle && (
            <p className="text-xs opacity-75">
              {subtitle}: <span className="font-semibold">{typeof subtitleValue === 'number' ? subtitleValue.toLocaleString() : subtitleValue}</span>
            </p>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
      </div>
    </div>
  );
};

const CardsCarousel: React.FC<TCardsCarouselProps> = ({
  insights,
  isDataLoading,
  isEmptyState,
  handleVolumeCardClick,
}) => {
  if (isEmptyState && !isDataLoading) return null;

  const { metrics } = insights || {};

  // Calculate market opportunity score
  const getMarketOpportunity = () => {
    if (!metrics) return 0;
    const priceScore = metrics.avg_price > 50 ? 80 : 60;
    const ratingScore = metrics.avg_star_rating * 20;
    const reviewScore = Math.min(metrics.avg_num_reviews / 100, 100);
    return Math.round((priceScore + ratingScore + reviewScore) / 3);
  };

  const formatCurrency = (amount: number) => {
    return `$${Number(String(amount).replace(/[^0-9.-]+/g, "")).toLocaleString()}`;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Market Intelligence</h2>
          <p className="text-gray-600 text-sm">Real-time insights from your search results</p>
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <ModernMetricCard
          title="Market Opportunity"
          value={`${getMarketOpportunity()}%`}
          subtitle="Potential Score"
          subtitleValue="High Demand"
          icon={<Target className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          trend="up"
          loading={isDataLoading || !metrics}
        />

        <ModernMetricCard
          title="Average Rating"
          value={metrics?.avg_star_rating?.toFixed(1) || "0.0"}
          subtitle="Review Count"
          subtitleValue={metrics?.avg_num_reviews || 0}
          icon={<Star className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          trend="up"
          loading={isDataLoading || !metrics}
        />

        <ModernMetricCard
          title="Average Price"
          value={formatCurrency(metrics?.avg_price || 0)}
          subtitle="Price Range"
          subtitleValue="Competitive"
          icon={<DollarSign className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-purple-500 to-pink-600"
          trend="neutral"
          loading={isDataLoading || !metrics}
        />

        <ModernMetricCard
          title="Revenue Potential"
          value={formatCurrency(metrics?.avg_revenue || 0)}
          subtitle="Monthly Est."
          subtitleValue={formatCurrency(metrics?.total_revenue || 0)}
          icon={<BarChart3 className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-orange-500 to-red-600"
          trend="up"
          loading={isDataLoading || !metrics}
        />
      </div>

      {/* Additional Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Quality Score</h3>
              <p className="text-sm text-gray-600">Based on ratings & reviews</p>
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {metrics ? Math.round(metrics.avg_star_rating * 20) : 0}%
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Demand Level</h3>
              <p className="text-sm text-gray-600">Market activity indicator</p>
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {metrics?.avg_revenue && metrics.avg_revenue > 15000 ? 'High' :
             metrics?.avg_revenue && metrics.avg_revenue > 8000 ? 'Medium' : 'Low'}
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-100 rounded-2xl p-6 border border-purple-200 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Market Size</h3>
              <p className="text-sm text-gray-600">Total addressable market</p>
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            ${metrics ? (metrics.total_revenue / 1000).toFixed(0) : 0}K
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardsCarousel;
