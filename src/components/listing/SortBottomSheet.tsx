import React from 'react';
import { SORT_OPTIONS, type SortOption } from '../../types';
import { BottomSheet } from '../ui/BottomSheet';
import { Check } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface SortBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const SortBottomSheet: React.FC<SortBottomSheetProps> = ({
  isOpen,
  onClose,
  currentSort,
  onSortChange,
}) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Sort By">
      <div className="divide-y divide-gray-100 py-1">
        {SORT_OPTIONS.map((option) => {
          const isSelected = option.value === currentSort;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onSortChange(option.value);
                onClose();
              }}
              className={cn(
                'w-full flex items-center justify-between py-3.5 px-1 text-sm text-left transition-colors',
                isSelected ? 'font-bold text-accent' : 'text-gray-700'
              )}
            >
              <span>{option.label}</span>
              {isSelected && <Check size={18} className="text-accent" />}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
};
