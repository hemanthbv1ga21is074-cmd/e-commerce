import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface StarRatingProps {
  rating: number; // 0 to 5
  count?: number; // review count e.g. 1200
  size?: 'sm' | 'md' | 'lg';
  variant?: 'stars' | 'chip';
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  count,
  size = 'md',
  variant = 'chip',
  className,
}) => {
  const roundedRating = Math.round(rating * 10) / 10;

  if (variant === 'chip') {
    const sizeClasses = {
      sm: 'text-xs px-1.5 py-0.5 gap-1',
      md: 'text-xs px-2 py-0.5 gap-1.5 font-semibold',
      lg: 'text-sm px-2.5 py-1 gap-2 font-bold',
    };

    const starSizes = {
      sm: 11,
      md: 13,
      lg: 15,
    };

    // Rating color threshold: 4+ is green, 3-3.9 is orange, below is red
    const badgeColor =
      roundedRating >= 4.0
        ? 'bg-emerald-600 text-white'
        : roundedRating >= 3.0
        ? 'bg-amber-500 text-white'
        : 'bg-rose-500 text-white';

    return (
      <div
        className={cn(
          'inline-flex items-center rounded-sm',
          badgeColor,
          sizeClasses[size],
          className
        )}
      >
        <span className="leading-none">{roundedRating.toFixed(1)}</span>
        <Star
          size={starSizes[size]}
          className="fill-current stroke-current"
          aria-hidden="true"
        />
        {count !== undefined && (
          <>
            <span className="opacity-60 text-[10px]">|</span>
            <span className="opacity-90 font-normal">
              {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
            </span>
          </>
        )}
      </div>
    );
  }

  // Multi-star variant
  const stars = [];
  const fullStars = Math.floor(roundedRating);
  const hasHalfStar = roundedRating % 1 >= 0.4 && roundedRating % 1 <= 0.8;

  const starDimension = size === 'sm' ? 14 : size === 'md' ? 18 : 22;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(
        <Star
          key={i}
          size={starDimension}
          className="fill-amber-400 text-amber-400"
          aria-hidden="true"
        />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <StarHalf
          key={i}
          size={starDimension}
          className="fill-amber-400 text-amber-400"
          aria-hidden="true"
        />
      );
    } else {
      stars.push(
        <Star
          key={i}
          size={starDimension}
          className="text-gray-300 fill-gray-100"
          aria-hidden="true"
        />
      );
    }
  }

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">{stars}</div>
      <span className="text-sm font-semibold text-gray-700">
        {roundedRating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-xs text-muted">
          ({count.toLocaleString('en-IN')} ratings)
        </span>
      )}
    </div>
  );
};
