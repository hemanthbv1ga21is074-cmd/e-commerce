import React from 'react';
import { Button } from '../ui/Button';
import { Loader2 } from 'lucide-react';

interface PaginationProps {
  currentCount: number;
  totalCount: number;
  loading?: boolean;
  onLoadMore: () => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentCount,
  totalCount,
  loading = false,
  onLoadMore,
  className,
}) => {
  if (totalCount === 0 || currentCount >= totalCount) return null;

  const progressPercent = Math.min(100, Math.round((currentCount / totalCount) * 100));

  return (
    <div className={`flex flex-col items-center justify-center py-10 space-y-4 ${className || ''}`}>
      <div className="w-full max-w-xs space-y-1.5 text-center">
        <span className="text-xs text-muted font-medium">
          Showing <strong>{currentCount}</strong> of <strong>{totalCount}</strong> items
        </span>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <Button
        variant="outline"
        size="md"
        disabled={loading}
        onClick={onLoadMore}
        className="min-w-[180px] font-bold text-xs uppercase tracking-wider hover:border-accent hover:text-accent"
        icon={loading ? <Loader2 size={16} className="animate-spin" /> : undefined}
      >
        {loading ? 'Loading...' : 'Load More Products'}
      </Button>
    </div>
  );
};
