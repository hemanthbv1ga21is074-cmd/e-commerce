import React from 'react';
import { Link } from 'react-router-dom';
import { minDiscountTiles } from '../../data/banners';
import { Percent, ArrowRight } from 'lucide-react';

export const MinDiscountTiles: React.FC = () => {
  return (
    <section className="my-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-primary font-display">
            Grand Steal Deals
          </h2>
          <p className="text-xs text-muted mt-0.5">Filter directly by maximum discounts</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {minDiscountTiles.map((tile, i) => (
          <Link
            key={i}
            to={tile.href}
            className="group relative overflow-hidden rounded-2xl p-5 text-white flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
          >
            {/* Real Fashion Background Photograph */}
            <img
              src={tile.image}
              alt={tile.label}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 pointer-events-none"
            />

            {/* Gradient Overlay for high contrast */}
            <div
              className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
              style={{ background: tile.gradient }}
            />

            {/* Scrim Bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Icon Chip */}
            <div className="relative z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-sm">
              <Percent size={18} className="text-white drop-shadow-sm" />
            </div>

            {/* Text details */}
            <div className="relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/90 drop-shadow-sm block">
                {tile.subtitle}
              </span>
              <div className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md font-display">
                {tile.label}
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-white mt-1 group-hover:translate-x-1.5 transition-transform">
                Grab Deal <ArrowRight size={13} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

