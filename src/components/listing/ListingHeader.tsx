import React from 'react';
import type { BreadcrumbItem, SortOption } from '../../types';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { SortDropdown } from './SortDropdown';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface ListingHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  totalCount: number;
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  activeFilterCount: number;
  onOpenMobileFilters: () => void;
  onOpenMobileSort: () => void;
}

export const ListingHeader: React.FC<ListingHeaderProps> = ({
  breadcrumbs,
  title,
  totalCount,
  currentSort,
  onSortChange,
  activeFilterCount,
  onOpenMobileFilters,
  onOpenMobileSort,
}) => {
  return (
    <div className="space-y-3 pb-4 border-b border-border">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Title & Desktop Sort Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-primary capitalize">
            {title}
          </h1>
          <span className="text-xs text-muted font-medium">
            {totalCount} {totalCount === 1 ? 'item' : 'items'} found
          </span>
        </div>

        {/* Desktop Sort Dropdown */}
        <div className="hidden md:block">
          <SortDropdown currentSort={currentSort} onSortChange={onSortChange} />
        </div>
      </div>

      {/* Mobile Sticky Bar for Sort & Filter */}
      <div className="grid grid-cols-2 divide-x divide-border border-t border-border pt-2 md:hidden">
        <button
          type="button"
          onClick={onOpenMobileSort}
          className="flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-primary"
        >
          <ArrowUpDown size={15} />
          <span>Sort</span>
        </button>

        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-primary relative"
        >
          <SlidersHorizontal size={15} />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
