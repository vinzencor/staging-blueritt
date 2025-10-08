import Card from "./components/Card";

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
    <>
      <div className="">
        {isDataLoading || !metrics ? (
          <div className="flex w-full gap-x-4 xl:flex-row flex-col pt-5">
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
          <div className="xxl:col-span-8  xl:col-span-8  col-span-12 mt-5">
            <div className="grid grid-cols-12 gap-3">
              <Card
                primaryText1="Competing Products"
                secondaryText1={metrics.competing_products}
                primaryText2="Avg. Price"
                secondaryText2={metrics.avg_price}
                loading={isDataLoading}
                iconSrc="las la-spinner"
                bgColor="danger"
                onClick={handleVolumeCardClick}
                icon={true}
                className="xxl:col-span-4 xl:col-span-4 col-span-12"
              />
              <Card
                primaryText1="Avg. Reviews"
                secondaryText1={metrics.avg_num_reviews}
                primaryText2="Avg. Rating"
                secondaryText2={metrics.avg_star_rating}
                loading={isDataLoading}
                iconSrc="ti ti-activity-heartbeat"
                bgColor="info"
                className="xxl:col-span-4 xl:col-span-4 col-span-12"
              />
              <Card
                primaryText1="Avg. Monthly Revenue"
                // secondaryText1={metrics.avg_revenue.toLocaleString()}
                 secondaryText1={`$${Number(String(metrics.avg_revenue).replace(/[^0-9.-]+/g, "")).toLocaleString()}`}

                primaryText2="Total Annual Revenue"
                secondaryText2={metrics.total_revenue.toLocaleString()}
                loading={isDataLoading}
                iconSrc="las la-gas-pump"
                bgColor="success"
                className="xxl:col-span-4 xl:col-span-4 col-span-12"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CardsCarousel;
