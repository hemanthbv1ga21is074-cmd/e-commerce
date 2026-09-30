import React from 'react';
import type { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Carousel } from '../ui/Carousel';
import { cn } from '../../utils/helpers';

interface SimilarProductsProps {
  products: Product[];
  title?: string;
  className?: string;
}

export const SimilarProducts: React.FC<SimilarProductsProps> = ({
  products,
  title = 'SIMILAR PRODUCTS',
  className,
}) => {
  if (!products || products.length === 0) return null;

  return (
    <div className={cn('space-y-4 pt-8 border-t border-border', className)}>
      <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-primary">
        {title}
      </h3>

      <Carousel scrollStep={400}>
        {products.map((p) => (
          <div
            key={p.id}
            className="w-44 sm:w-48 md:w-56 flex-shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </Carousel>
    </div>
  );
};
