import React from 'react';
import type { FilterState, Product } from '../../types';
import { BottomSheet } from '../ui/BottomSheet';
import { FilterSidebar } from './FilterSidebar';
import { Button } from '../ui/Button';

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onClearAll: () => void;
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  isOpen,
  onClose,
  products,
  filters,
  onFilterChange,
  onClearAll,
}) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Filter Products">
      <div className="flex flex-col h-[75vh]">
        <div className="flex-1 overflow-y-auto px-1 py-3">
          <FilterSidebar
            products={products}
            filters={filters}
            onFilterChange={onFilterChange}
            onClearAll={onClearAll}
          />
        </div>

        <div className="p-3 border-t border-border flex items-center gap-3 bg-white">
          <Button
            variant="outline"
            className="flex-1 text-xs"
            onClick={onClearAll}
          >
            Clear All
          </Button>
          <Button
            variant="accent"
            className="flex-1 text-xs"
            onClick={onClose}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
