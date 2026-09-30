import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight } from 'lucide-react';
import type { DealOfTheDay as DealType, Product } from '../../types';
import { CountdownTimer } from '../ui/CountdownTimer';
import { ProductCard } from '../product/ProductCard';
import { Carousel } from '../ui/Carousel';

interface DealOfTheDayProps {
  deal: DealType;
  products: Product[];
}

export const DealOfTheDay: React.FC<DealOfTheDayProps> = ({ deal, products }) => {
  if (!deal || products.length === 0) return null;

  return (
    <section className="my-10 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 border border-rose-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-md animate-bounce">
            <Flame size={22} className="fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-primary">
                {deal.title}
              </h2>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-accent text-white px-2 py-0.5 rounded-full">
                Hot
              </span>
            </div>
            <p className="text-xs text-muted">{deal.subtitle}</p>
          </div>
        </div>

        {/* Live Countdown */}
        <div className="flex items-center gap-4">
          <CountdownTimer targetDate={deal.endTime} variant="boxed" />
          <Link
            to="/search?discount=50"
            className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline uppercase tracking-wider"
          >
            All Deals <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Deals Carousel */}
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
