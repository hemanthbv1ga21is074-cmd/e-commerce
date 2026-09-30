import React from 'react';
import type { Address } from '../../types';
import { cn } from '../../utils/helpers';
import { Home, Briefcase, Edit2, Trash2 } from 'lucide-react';

interface AddressCardProps {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  className,
}) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'p-4 rounded-xl border-2 transition-all cursor-pointer relative bg-white',
        isSelected
          ? 'border-accent shadow-sm ring-1 ring-accent/20'
          : 'border-border hover:border-gray-400',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Radio Circle & Name/Badges */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors',
              isSelected ? 'border-accent bg-accent' : 'border-gray-400 bg-white'
            )}
          >
            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-primary">{address.name}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface text-gray-700">
                {address.type === 'Home' ? <Home size={11} /> : <Briefcase size={11} />}
                {address.type}
              </span>
              {address.isDefault && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Default
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 leading-relaxed pt-1">
              {address.addressLine1}
              {address.addressLine2 && `, ${address.addressLine2}`}
              <br />
              {address.locality && `${address.locality}, `}
              {address.city}, {address.state} - <strong>{address.pincode}</strong>
            </p>

            <div className="text-xs text-gray-700 pt-1">
              <span className="text-muted">Mobile:</span> <strong>{address.phone}</strong>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onEdit}
            title="Edit Address"
            className="p-1.5 rounded hover:bg-surface text-gray-500 hover:text-primary transition-colors"
          >
            <Edit2 size={15} />
          </button>
          {!address.isDefault && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete Address"
              className="p-1.5 rounded hover:bg-rose-50 text-gray-500 hover:text-accent transition-colors"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
