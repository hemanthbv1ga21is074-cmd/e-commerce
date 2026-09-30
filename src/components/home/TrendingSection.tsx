import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight } from 'lucide-react';
import type { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { Carousel } from '../ui/Carousel';

interface TrendingSectionProps {
  products: Product[];
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="my-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
            <TrendingUp size={18} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-primary font-display">
              Trending Now
            </h2>
            <p className="text-xs text-muted">What fashion enthusiasts are buying right now</p>
          </div>
        </div>

        <Link
          to="/search?sort=popularity"
          className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline uppercase tracking-wider"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>

      <Carousel scrollStep={380}>
        {products.map((p) => (
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
