import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { Banner } from '../../types';
import { Button } from '../ui/Button';

interface HeroCarouselProps {
  banners: Banner[];
  autoSlideInterval?: number;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  banners,
  autoSlideInterval = 5000,
}) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  }, [banners.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const timer = setInterval(nextSlide, autoSlideInterval);
    return () => clearInterval(timer);
  }, [isPaused, banners.length, autoSlideInterval, nextSlide]);

  if (!banners || banners.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl shadow-lg my-4 group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="w-full flex-shrink-0 relative min-h-[260px] sm:min-h-[340px] md:min-h-[420px] flex items-center p-6 sm:p-12 md:p-16"
            style={{
              background: banner.gradient || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              color: banner.textColor || '#ffffff',
            }}
          >
            {/* Background Image if exists */}
            {banner.image && (
              <img
                src={banner.image}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
              />
            )}

            {/* Content Box */}
            <div className="relative z-10 max-w-xl space-y-3 sm:space-y-4">
              <span className="inline-block text-xs md:text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
                Featured Deal
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm font-display leading-tight">
                {banner.title}
              </h1>
              <p className="text-sm sm:text-lg opacity-90 font-medium max-w-md">
                {banner.subtitle}
              </p>
              <div className="pt-2">
                <Link to={banner.href}>
                  <Button
                    variant="accent"
                    size="lg"
                    className="shadow-xl hover:scale-105 transition-transform"
                    icon={<ArrowRight size={18} />}
                  >
                    {banner.cta || 'Shop Now'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next Controls */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight size={24} />
      </button>

      {/* Slide Dots Indicator */}
      <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === i ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
