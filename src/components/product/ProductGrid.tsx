import React from 'react';
import type { Product, ProductCardData } from '../../types';
import { ProductCard } from './ProductCard';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../../utils/helpers';

interface ProductGridProps {
  products: (Product | ProductCardData)[];
  loading?: boolean;
  skeletonCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  skeletonCount = 8,
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your filters or search criteria.',
  onResetFilters,
  className,
}) => {
  if (loading) {
    return (
      <div
        className={cn(
          'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6',
          className
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="flex flex-col bg-white rounded-md overflow-hidden p-0">
            <Skeleton variant="rect" className="w-full aspect-[3/4] rounded-none mb-3" />
            <div className="p-3 pt-0 space-y-2">
              <Skeleton variant="text" width="40%" height={14} />
              <Skeleton variant="text" width="80%" height={12} />
              <Skeleton variant="text" width="60%" height={16} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onResetFilters ? 'Clear All Filters' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6',
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
