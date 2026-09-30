import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

interface CategoryTile {
  title: string;
  category: string;
  href: string;
  offer: string;
  image: string;
  tag: string;
}

const CATEGORY_TILES: CategoryTile[] = [
  {
    title: "Men's T-Shirts",
    category: 'Casual Staples',
    href: '/men/t-shirts',
    offer: '40-70% OFF',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    tag: 'Trending',
  },
  {
    title: "Men's Shirts",
    category: 'Casual & Formal',
    href: '/men/casual-shirts',
    offer: 'MIN 50% OFF',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    tag: 'Bestseller',
  },
  {
    title: "Men's Jeans",
    category: 'Denim Collection',
    href: '/men/jeans',
    offer: '30-60% OFF',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
    tag: 'Must Have',
  },
  {
    title: "Women's Dresses",
    category: 'Western Wear',
    href: '/women/dresses',
    offer: 'UP TO 70% OFF',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80',
    tag: 'Party & Casual',
  },
  {
    title: "Women's Kurtas",
    category: 'Ethnic Sets',
    href: '/women/kurtas-sets',
    offer: 'MIN 40% OFF',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
    tag: 'Festive Ready',
  },
  {
    title: "Women's Sarees",
    category: 'Silk & Chanderi',
    href: '/women/sarees',
    offer: 'UP TO 60% OFF',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
    tag: 'Handcrafted',
  },
  {
    title: "Kids' Collection",
    category: 'Boys & Girls',
    href: '/kids',
    offer: 'FLAT 50% OFF',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop&q=80',
    tag: 'Cute & Comfy',
  },
  {
    title: "Active & Gym",
    category: 'Performance Wear',
    href: '/search?occasion=Sports',
    offer: '30-50% OFF',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
    tag: 'High Energy',
  },
];

export const ShopByCategory: React.FC = () => {
  return (
    <section className="my-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-primary font-display">
              Shop by Category
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-accent px-2.5 py-0.5 rounded-full border border-rose-200">
              <Sparkles size={12} /> Curated Fits
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">Explore our most popular fashion wardrobe staples</p>
        </div>

        <Link
          to="/search"
          className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1 uppercase tracking-wider"
        >
          <span>View All</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
        {CATEGORY_TILES.map((cat, i) => (
          <Link
            key={i}
            to={cat.href}
            className="group relative overflow-hidden rounded-2xl h-64 sm:h-72 md:h-80 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between p-4 sm:p-5 select-none"
          >
            {/* Real Full-Bleed Photograph with Zoom effect on hover */}
            <img
              src={cat.image}
              alt={cat.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110 pointer-events-none"
            />

            {/* Gradient Scrim for maximum contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/35" />

            {/* Top Badges */}
            <div className="relative z-10 flex items-start justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/90 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/30">
                {cat.tag}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-accent text-white px-2.5 py-0.5 rounded-md shadow-md">
                {cat.offer}
              </span>
            </div>

            {/* Bottom Content Info */}
            <div className="relative z-10 space-y-1">
              <span className="text-[11px] font-semibold text-rose-200 uppercase tracking-wider block">
                {cat.category}
              </span>
              <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight drop-shadow-md">
                {cat.title}
              </h3>
              <div className="pt-1 flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-accent transition-colors">
                <span>Explore Collection</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
