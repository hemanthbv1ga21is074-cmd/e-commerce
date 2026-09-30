import React, { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { cn } from '../../utils/helpers';

interface ProductGalleryProps {
  images: string[];
  productTitle: string;
  productId: string;
  category?: string;
  className?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productTitle,
  productId,
  category,
  className,
}) => {
  // If no images provided, use an array with 1 empty string so gradient renders
  const galleryImages = images && images.length > 0 ? images : [''];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const currentImage = galleryImages[selectedIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={cn('flex flex-col-reverse md:flex-row gap-4', className)}>
      {/* Thumbnails (vertical on desktop, horizontal on mobile) */}
      {galleryImages.length > 1 && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[560px] scrollbar-hide py-1">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                'relative w-16 h-20 md:w-20 md:h-24 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all',
                selectedIndex === idx
                  ? 'border-accent shadow-sm'
                  : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <ProductImage
                src={img}
                alt={`${productTitle} thumbnail ${idx + 1}`}
                id={`${productId}-${idx}`}
                category={category}
                aspectRatio="product"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Large Image */}
      <div className="relative flex-1 rounded-lg overflow-hidden group bg-surface">
        <ProductImage
          src={currentImage}
          alt={productTitle}
          id={`${productId}-${selectedIndex}`}
          category={category}
          aspectRatio="product"
          className="w-full h-full cursor-zoom-in"
        />

        {/* Zoom Button */}
        <button
          type="button"
          onClick={() => setIsZoomOpen(true)}
          aria-label="Zoom image"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white"
        >
          <Maximize2 size={16} />
        </button>

        {/* Desktop Prev/Next controls */}
        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Zoom Lightbox Modal */}
      {isZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            aria-label="Close zoom view"
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
          >
            <X size={24} />
          </button>

          <div
            className="max-w-4xl max-h-[90vh] w-full flex items-center justify-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-lg aspect-[3/4] rounded-lg overflow-hidden shadow-2xl">
              <ProductImage
                src={currentImage}
                alt={productTitle}
                id={`${productId}-${selectedIndex}`}
                category={category}
                aspectRatio="product"
              />
            </div>

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute -left-12 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
                >
                  <ChevronLeft size={36} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute -right-12 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
                >
                  <ChevronRight size={36} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
