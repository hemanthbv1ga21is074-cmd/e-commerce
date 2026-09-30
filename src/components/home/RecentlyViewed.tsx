import React from 'react';
import { History, Trash2 } from 'lucide-react';
import { useRecentlyViewedStore } from '../../store/useRecentlyViewedStore';
import { products as allProducts } from '../../data/products';
import { ProductCard } from '../product/ProductCard';
import { Carousel } from '../ui/Carousel';

export const RecentlyViewed: React.FC = () => {
  const { productIds, clear } = useRecentlyViewedStore();

  if (!productIds || productIds.length === 0) return null;

  // Retrieve products in order of recently viewed
  const viewedProducts = productIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is typeof allProducts[0] => Boolean(p));

  if (viewedProducts.length === 0) return null;

  return (
    <section className="my-12 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <History size={18} className="text-muted" />
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-primary">
            Recently Viewed
          </h2>
        </div>

        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent font-medium"
        >
          <Trash2 size={13} />
          Clear
        </button>
      </div>

      <Carousel scrollStep={380}>
        {viewedProducts.map((p) => (
          <div
            key={p.id}
            className="w-44 sm:w-52 md:w-60 flex-shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </Carousel>
    </section>
  );
};
