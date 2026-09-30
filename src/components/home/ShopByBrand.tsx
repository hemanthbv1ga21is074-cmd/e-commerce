import React from 'react';
import { Link } from 'react-router-dom';
import type { Brand } from '../../types';

interface ShopByBrandProps {
  brands: Brand[];
}

export const ShopByBrand: React.FC<ShopByBrandProps> = ({ brands }) => {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="my-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-primary font-display">
            Grand Brands Spotlight
          </h2>
          <p className="text-xs text-muted mt-0.5">Top labels with guaranteed authentic quality</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {brands.slice(0, 12).map((b) => (
          <Link
            key={b.id}
            to={`/search?brand=${encodeURIComponent(b.name)}`}
            className="group relative bg-white border border-border rounded-xl p-4 flex flex-col items-center justify-between text-center transition-all duration-300 hover:shadow-lg hover:border-accent"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl mb-3 shadow-inner group-hover:scale-110 transition-transform"
              style={{ background: b.gradient || 'linear-gradient(135deg, #1a1a2e, #e94560)' }}
            >
              {b.name[0]}
            </div>

            <div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-primary group-hover:text-accent transition-colors">
                {b.name}
              </h3>
              <p className="text-[10px] text-muted line-clamp-1 mt-0.5">{b.tagline}</p>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-100 w-full">
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">
                Up to 60% Off
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
