import Spktalignmentcards from "@/@spk/uielements/spkalignmentcards";

type ICardProps = {
  primaryText1: string;
  secondaryText1: string | number;
  primaryText2?: string;
  secondaryText2?: string | number;
  bgColor: string;
  iconSrc: string;
  loading?: boolean;
  icon?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const Card: React.FC<ICardProps> = ({
  primaryText1,
  secondaryText1,
  primaryText2,
  secondaryText2,
  loading = false,
  iconSrc,
  bgColor,
  icon = false,
  className,
  ...props
}) => {
  const getTitle = (metricName: string) => {
    switch (metricName) {
      case "avg_star_rating":
        return "Average Rating";

      case "avg_price":
        return "Average Price";

      case "avg_num_reviews":
        return "Average Reviews";

      case "avg_revenue":
        return "Average Revenue";

      case "total_revenue":
        return "Total Revenue";

      case "competing_products":
        return "Competing Products";

      case "search_volume":
        return "Search Volume";

      default:
        return metricName;
    }
  };

  return (
    <div {...props} className={className}>
      <Spktalignmentcards
        Iconsrc={iconSrc}
        bgColor={bgColor}
        Customtitleclass="!font-medium"
        Customclass=""
        Title1={getTitle(primaryText1)}
        Text1={secondaryText1}
        Title2={primaryText2 ? getTitle(primaryText2) : ""}
        Text2={secondaryText2}
        Loading={loading}
        Icon={icon}
      />
    </div>
  );
};

export default Card;
