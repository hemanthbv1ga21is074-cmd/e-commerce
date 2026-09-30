import React from 'react';
import type { ProductColor } from '../../types';
import { cn } from '../../utils/helpers';
import { Check } from 'lucide-react';

interface ColorSelectorProps {
  colors: ProductColor[];
  selectedColor: string | null;
  onSelectColor: (colorName: string) => void;
  className?: string;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColor,
  onSelectColor,
  className,
}) => {
  if (!colors || colors.length === 0) return null;

  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold uppercase tracking-wider text-primary">
          Color:
        </span>
        <span className="text-sm font-medium text-gray-700">
          {selectedColor || colors[0]?.name}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {colors.map((color) => {
          const isSelected = (selectedColor || colors[0]?.name) === color.name;
          return (
            <button
              key={color.name}
              type="button"
              onClick={() => onSelectColor(color.name)}
              title={color.name}
              aria-label={`Select color ${color.name}`}
              className={cn(
                'w-8 h-8 rounded-full border transition-all flex items-center justify-center relative focus-visible:outline-none',
                isSelected
                  ? 'ring-2 ring-accent ring-offset-2 scale-110 shadow-sm'
                  : 'hover:scale-105 border-gray-300'
              )}
              style={{ backgroundColor: color.hex }}
            >
              {isSelected && (
                <Check
                  size={14}
                  className={cn(
                    // White tick for dark colors, dark tick for light colors
                    color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#fff'
                      ? 'text-gray-900'
                      : 'text-white drop-shadow-sm'
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
