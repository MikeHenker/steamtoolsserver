import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ rating, onRate, readonly = false, size = "md" }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  const displayRating = hoverRating || rating;

  const handleClick = (value: number) => {
    if (!readonly && onRate) {
      onRate(value);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${sizeClasses[size]} ${
            readonly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"
          }`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          data-testid={`star-${star}`}
        >
          <i
            className={`${
              star <= displayRating
                ? "fas fa-star text-chart-4"
                : "far fa-star text-muted-foreground"
            }`}
          ></i>
        </button>
      ))}
    </div>
  );
}
