import React from 'react';
import type { ProductSize } from '../../types';
import { Ruler } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface SizeSelectorProps {
  sizes: ProductSize[];
  selectedSize: string | null;
  onSelectSize: (sizeName: string) => void;
  onOpenSizeChart?: () => void;
  className?: string;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSelectSize,
  onOpenSizeChart,
  className,
}) => {
  const activeSizeObj = sizes.find((s) => s.name === selectedSize);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold uppercase tracking-wider text-primary">
            Select Size
          </span>
          {activeSizeObj && activeSizeObj.stock > 0 && activeSizeObj.stock <= 3 && (
            <span className="text-xs font-semibold text-accent animate-pulse">
              Only {activeSizeObj.stock} left!
            </span>
          )}
        </div>

        {onOpenSizeChart && (
          <button
            type="button"
            onClick={onOpenSizeChart}
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline focus-visible:outline-none"
          >
            <Ruler size={13} />
            Size Chart
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5">
        {sizes.map((size) => {
          const isSelected = selectedSize === size.name;
          const isOutOfStock = size.stock <= 0;

          return (
            <button
              key={size.name}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectSize(size.name)}
              className={cn(
                'min-w-12 h-11 px-3 rounded-full text-xs font-bold border transition-all flex items-center justify-center relative',
                isSelected
                  ? 'border-accent bg-accent text-white shadow-sm'
                  : isOutOfStock
                  ? 'border-dashed border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'border-border text-primary hover:border-accent hover:text-accent bg-white'
              )}
            >
              {size.name}
              {isOutOfStock && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-full h-px bg-gray-300 transform -rotate-45" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
