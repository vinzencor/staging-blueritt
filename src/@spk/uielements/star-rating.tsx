import React from "react";

const StarRating: React.FC<{ rating: string }> = React.memo(
  ({ rating }) => {
    const numericRating = parseFloat(rating);
    return (
      <div className="flex items-center gap-x-1">
        {[...Array(5)].map((_, index) => (
          <i
            key={index}
            className={`${
              index < Math.floor(numericRating)
                ? "bi bi-star-fill"
                : "bi bi-star"
            } text-yellow-400`}
          ></i>
        ))}

        <span className="ml-1">{rating}</span>
      </div>
    );
  }
);

export default StarRating;