import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { SORT_OPTIONS, type SortOption } from '../../types';
import { cn } from '../../utils/helpers';

interface SortDropdownProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  className?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  currentSort,
  onSortChange,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = SORT_OPTIONS.find((s) => s.value === currentSort) || SORT_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-between gap-2 px-3 py-2 border border-border rounded-md bg-white text-xs font-semibold text-primary hover:border-gray-400 transition-colors focus-visible:outline-none min-w-[200px]"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="text-muted font-normal">Sort by:</span>
        <span className="truncate flex-1 text-left">{activeOption.label}</span>
        <ChevronDown
          size={15}
          className={cn('text-muted transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-dropdown py-1 focus:outline-none animate-fade-in border border-border">
          {SORT_OPTIONS.map((option) => {
            const isSelected = option.value === currentSort;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSortChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors',
                  isSelected
                    ? 'font-bold text-accent bg-rose-50/50'
                    : 'text-gray-700 hover:bg-surface hover:text-primary'
                )}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={14} className="text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
