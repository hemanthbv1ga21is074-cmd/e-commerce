import React from 'react';
import { Sparkles } from 'lucide-react';
import type { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';

interface RecommendedForYouProps {
  products: Product[];
}

export const RecommendedForYou: React.FC<RecommendedForYouProps> = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="my-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-primary font-display">
              Recommended For You
            </h2>
            <p className="text-xs text-muted">Handpicked styles based on trends and seasonal fashion</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {products.slice(0, 8).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};
