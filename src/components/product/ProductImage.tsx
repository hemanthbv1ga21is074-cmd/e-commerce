import React, { useState, useRef, useEffect } from 'react';
import { generateGradient, cn } from '../../utils/helpers';
import { Shirt } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt: string;
  id: string;
  category?: string;
  className?: string;
  aspectRatio?: 'product' | 'square' | 'wide';
  lazy?: boolean;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  id,
  category,
  className,
  aspectRatio = 'product',
  lazy = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const aspectClass =
    aspectRatio === 'product'
      ? 'aspect-[3/4]'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : 'aspect-[16/9]';

  // Check if image is already cached or completed on mount or when src changes
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const hasRealImage = Boolean(src && !imageError);

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-surface flex items-center justify-center select-none',
        aspectClass,
        className
      )}
    >
      {hasRealImage ? (
        <>
          {!loaded && (
            <div className="absolute inset-0 skeleton z-0" />
          )}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            loading={lazy ? 'lazy' : 'eager'}
            onLoad={() => setLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-200 relative z-10',
              loaded ? 'opacity-100' : 'opacity-85'
            )}
          />
        </>
      ) : (
        // Deterministic gradient fashion mockup placeholder
        <div
          className="w-full h-full flex flex-col items-center justify-center p-4 transition-transform duration-300 group-hover:scale-105"
          style={{ background: generateGradient(id) }}
        >
          <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center mb-2 shadow-inner text-white">
            <Shirt size={28} className="drop-shadow-sm opacity-90" />
          </div>
          {category && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/90 drop-shadow-sm">
              {category}
            </span>
          )}
          <span className="text-[10px] text-white/70 line-clamp-1 max-w-[80%] text-center mt-0.5">
            {alt}
          </span>
        </div>
      )}
    </div>
  );
};
