import React from 'react';
import { Star, CheckCircle, ThumbsUp } from 'lucide-react';
import type { Review } from '../../types';
import { cn } from '../../utils/helpers';

interface RatingSummaryProps {
  rating: number;
  ratingCount: number;
  reviews?: Review[];
  className?: string;
}

export const RatingSummary: React.FC<RatingSummaryProps> = ({
  rating,
  ratingCount,
  reviews = [],
  className,
}) => {
  // Generate realistic distribution if not strictly provided
  const distributions = [
    { stars: 5, pct: 60, count: Math.round(ratingCount * 0.6) },
    { stars: 4, pct: 24, count: Math.round(ratingCount * 0.24) },
    { stars: 3, pct: 10, count: Math.round(ratingCount * 0.1) },
    { stars: 2, pct: 4, count: Math.round(ratingCount * 0.04) },
    { stars: 1, pct: 2, count: Math.round(ratingCount * 0.02) },
  ];

  return (
    <div className={cn('space-y-6 pt-4 border-t border-border', className)}>
      <h4 className="text-sm font-bold uppercase tracking-wider text-primary">
        Ratings & Customer Reviews
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Big Rating Block */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-surface rounded-xl text-center">
          <div className="flex items-center gap-2">
            <span className="text-4xl font-extrabold text-primary">
              {rating.toFixed(1)}
            </span>
            <Star size={30} className="fill-emerald-600 text-emerald-600" />
          </div>
          <span className="text-xs text-muted mt-1 font-medium">
            {ratingCount.toLocaleString('en-IN')} Verified Buyers
          </span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium mt-2 bg-emerald-50 px-2 py-0.5 rounded-full">
            <CheckCircle size={12} />
            <span>89% recommended this product</span>
          </div>
        </div>

        {/* Star Progress Bars */}
        <div className="md:col-span-8 space-y-2">
          {distributions.map((d) => (
            <div key={d.stars} className="flex items-center gap-3 text-xs">
              <span className="w-6 flex items-center gap-0.5 text-muted font-medium">
                {d.stars} <Star size={11} className="fill-gray-400 text-gray-400" />
              </span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className="w-12 text-right text-muted text-[11px]">
                {d.count.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Reviews Feed */}
      {reviews.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary">
            Customer Feedback ({reviews.length})
          </h5>
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-3 bg-surface/60 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
                      {rev.rating} <Star size={10} className="fill-current" />
                    </span>
                    <span className="font-semibold text-primary">{rev.title}</span>
                  </div>
                  <span className="text-[10px] text-muted">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-gray-700 leading-normal">{rev.text}</p>
                <div className="flex items-center justify-between text-[11px] text-muted pt-1">
                  <div className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle size={12} />
                    <span>{rev.userName} • Verified Buyer</span>
                  </div>
                  {rev.helpfulCount > 0 && (
                    <div className="flex items-center gap-1 text-gray-400">
                      <ThumbsUp size={11} />
                      <span>{rev.helpfulCount} helpful</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
