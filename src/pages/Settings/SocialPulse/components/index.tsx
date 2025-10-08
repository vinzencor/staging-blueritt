import Card from "./CardCarousel/Components/Card";

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

const CardsCarousel: React.FC<TCardsCarouselProps> = ({
  insights,
  isDataLoading,
  isEmptyState,
  handleVolumeCardClick,
}) => {
  if (isEmptyState && !isDataLoading) return null;

  const { metrics } = insights || {};

  return (
    <div>
      {isDataLoading || !metrics ? (
        <div className="flex w-full gap-x-4 xl:flex-row flex-col pt-5 mb-4" >
          {[...Array(3)].map((_, index) => (
            <Card
              key={`empty-card-${index}`}
              iconSrc=""
              bgColor=""
              primaryText1=""
              secondaryText1=""
              loading={true}
              className="w-full"
            />
          ))}
        </div>
      ) : (
        <div className="xxl:col-span-8 xl:col-span-8 col-span-12 mt-2">
          <div className="grid grid-cols-12 gap-6">
            {/* Competing Products */}
            <div className="xxl:col-span-4 xl:col-span-4 col-span-12">
              <div className="group transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                <Card
                  primaryText1="Competing Products"
                  secondaryText1={metrics.competing_products}
                  primaryText2="Avg. Price"
                  secondaryText2={`$${metrics.avg_price}`}
                  loading={isDataLoading}
                  iconSrc="las la-spinner"
                  bgColor="danger"
                  onClick={handleVolumeCardClick}
                  icon={true}
                  className="shadow-md hover:shadow-2xl rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200"
                />
              </div>
            </div>

            {/* Reviews + Rating */}
            <div className="xxl:col-span-4 xl:col-span-4 col-span-12">
              <div className="group transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                <Card
                  primaryText1="Avg. Reviews"
                  secondaryText1={metrics.avg_num_reviews}
                  primaryText2="Avg. Rating"
                  secondaryText2={metrics.avg_star_rating}
                  loading={isDataLoading}
                  iconSrc="ti ti-activity-heartbeat"
                  bgColor="info"
                  className="shadow-md hover:shadow-2xl rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
                />
              </div>
            </div>

            {/* Revenue */}
            <div className="xxl:col-span-4 xl:col-span-4 col-span-12">
              <div className="group transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                <Card
                  primaryText1="Avg. Monthly Revenue"
                  secondaryText1={`$${Number(
                    String(metrics.avg_revenue).replace(/[^0-9.-]+/g, "")
                  ).toLocaleString()}`}
                  primaryText2="Total Annual Revenue"
                  secondaryText2={`$${metrics.total_revenue.toLocaleString()}`}
                  loading={isDataLoading}
                  iconSrc="las la-gas-pump"
                  bgColor="success"
                  className="shadow-md hover:shadow-2xl rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardsCarousel;
