import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  showArrows?: boolean;
  arrowClassName?: string;
  scrollStep?: number;
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  className,
  showArrows = true,
  arrowClassName,
  scrollStep = 300,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, children]);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const offset = direction === 'left' ? -scrollStep : scrollStep;
    containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className={cn('relative group', className)}>
      {showArrows && canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className={cn(
            'absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-border flex items-center justify-center text-primary hover:bg-gray-50 focus-visible:outline-none transition-all opacity-90 hover:opacity-100 hover:scale-105',
            arrowClassName
          )}
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <div
        ref={containerRef}
        className="flex overflow-x-auto scrollbar-hide scroll-smooth gap-4 py-2 px-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {children}
      </div>

      {showArrows && canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className={cn(
            'absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-border flex items-center justify-center text-primary hover:bg-gray-50 focus-visible:outline-none transition-all opacity-90 hover:opacity-100 hover:scale-105',
            arrowClassName
          )}
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};
