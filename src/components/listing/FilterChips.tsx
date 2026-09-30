import React from 'react';
import { X } from 'lucide-react';
import type { FilterState } from '../../types';
import { formatPrice } from '../../utils/price';

interface FilterChipsProps {
  filters: FilterState;
  onRemoveFilter: (key: keyof FilterState, value?: string | number | null) => void;
  onClearAll: () => void;
  className?: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
  className,
}) => {
  const chips: { label: string; onRemove: () => void }[] = [];

  // Brands
  filters.brands.forEach((b) => {
    chips.push({
      label: `Brand: ${b}`,
      onRemove: () => onRemoveFilter('brands', b),
    });
  });

  // Categories
  filters.categories.forEach((c) => {
    chips.push({
      label: `Category: ${c}`,
      onRemove: () => onRemoveFilter('categories', c),
    });
  });

  // Price range
  if (filters.priceRange) {
    chips.push({
      label: `Price: ${formatPrice(filters.priceRange[0])} - ${formatPrice(filters.priceRange[1])}`,
      onRemove: () => onRemoveFilter('priceRange', null),
    });
  }

  // Colors
  filters.colors.forEach((c) => {
    chips.push({
      label: `Color: ${c}`,
      onRemove: () => onRemoveFilter('colors', c),
    });
  });

  // Sizes
  filters.sizes.forEach((s) => {
    chips.push({
      label: `Size: ${s}`,
      onRemove: () => onRemoveFilter('sizes', s),
    });
  });

  // Discount
  if (filters.discountMin) {
    chips.push({
      label: `Min ${filters.discountMin}% Off`,
      onRemove: () => onRemoveFilter('discountMin', null),
    });
  }

  // Rating
  if (filters.ratingMin) {
    chips.push({
      label: `${filters.ratingMin}★ & Above`,
      onRemove: () => onRemoveFilter('ratingMin', null),
    });
  }

  // Fits
  filters.fits.forEach((f) => {
    chips.push({
      label: `Fit: ${f}`,
      onRemove: () => onRemoveFilter('fits', f),
    });
  });

  // Fabrics
  filters.fabrics.forEach((f) => {
    chips.push({
      label: `Fabric: ${f}`,
      onRemove: () => onRemoveFilter('fabrics', f),
    });
  });

  // Occasions
  filters.occasions.forEach((o) => {
    chips.push({
      label: `Occasion: ${o}`,
      onRemove: () => onRemoveFilter('occasions', o),
    });
  });

  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 py-3 ${className || ''}`}>
      <span className="text-xs font-semibold text-muted mr-1">Active Filters:</span>
      {chips.map((chip, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border text-xs text-primary font-medium hover:border-gray-400 transition-colors"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="text-gray-400 hover:text-accent focus-visible:outline-none p-0.5"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-bold text-accent hover:underline uppercase tracking-wider ml-1"
      >
        Clear All
      </button>
    </div>
  );
};
