import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronDown, RotateCcw, Heart, Trash2 } from 'lucide-react';
import type { CartItem } from '../../types';
import { PriceDisplay } from '../ui/PriceDisplay';
import { ChangeSizeModal } from './ChangeSizeModal';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface BagItemCardProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onUpdateSize: (newSize: string, newStock: number) => void;
  onRemove: () => void;
  onMoveToWishlist: () => void;
}

export const BagItemCard: React.FC<BagItemCardProps> = ({
  item,
  onUpdateQuantity,
  onUpdateSize,
  onRemove,
  onMoveToWishlist,
}) => {
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  return (
    <div className="bg-white border border-border rounded-xl p-4 relative flex flex-col sm:flex-row gap-4 transition-all">
      {/* Remove Button (top-right) */}
      <button
        type="button"
        onClick={() => setIsRemoveModalOpen(true)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 p-1"
        aria-label="Remove item"
      >
        <X size={18} />
      </button>

      {/* Item Image */}
      <div className="w-24 h-32 rounded-lg bg-surface overflow-hidden flex-shrink-0">
        <Link to={`/product/${item.slug}`}>
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full bg-surface" />
          )}
        </Link>
      </div>

      {/* Item Details */}
      <div className="flex-1 flex flex-col justify-between pr-6">
        <div>
          <Link
            to={`/product/${item.slug}`}
            className="font-bold text-xs uppercase tracking-wider text-primary hover:text-accent block"
          >
            {item.brand}
          </Link>
          <h3 className="text-xs text-muted line-clamp-1 mt-0.5" title={item.title}>
            {item.title}
          </h3>

          {/* Size & Quantity Buttons */}
          <div className="flex items-center gap-3 my-2.5">
            {/* Size Button */}
            <button
              type="button"
              onClick={() => setIsSizeModalOpen(true)}
              className="px-2.5 py-1 bg-surface border border-border hover:border-gray-400 rounded text-xs font-bold text-primary flex items-center gap-1.5 transition-colors"
            >
              <span>Size: <strong>{item.size}</strong></span>
              <ChevronDown size={13} className="text-muted" />
            </button>

            {/* Quantity Selector */}
            <div className="flex items-center bg-surface border border-border rounded px-2.5 py-1 text-xs font-bold text-primary">
              <span className="mr-1 text-muted font-normal">Qty:</span>
              <select
                value={item.quantity}
                onChange={(e) => onUpdateQuantity(Number(e.target.value))}
                className="bg-transparent font-bold outline-none cursor-pointer text-xs"
              >
                {Array.from({ length: Math.min(10, item.maxStock || 10) }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <PriceDisplay
            price={item.price * item.quantity}
            mrp={item.mrp * item.quantity}
            size="sm"
          />
        </div>

        {/* Return Guarantee and Actions Row */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
          <div className="flex items-center gap-1 text-gray-600">
            <RotateCcw size={13} className="text-muted" />
            <span>14 days return available</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onMoveToWishlist}
              className="text-xs font-bold uppercase tracking-wider text-accent hover:underline flex items-center gap-1"
            >
              <Heart size={13} />
              <span>Move to Wishlist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Change Size Modal */}
      <ChangeSizeModal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        item={item}
        onConfirm={onUpdateSize}
      />

      {/* Remove Confirmation Modal */}
      <Modal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        title="Remove Item"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted leading-relaxed">
            Are you sure you want to remove <strong>{item.title}</strong> from your bag?
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1 text-xs"
              onClick={() => setIsRemoveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              size="md"
              className="flex-1 text-xs"
              onClick={() => {
                onRemove();
                setIsRemoveModalOpen(false);
              }}
              icon={<Trash2 size={15} />}
            >
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
