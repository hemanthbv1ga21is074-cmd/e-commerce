import React, { useState } from 'react';
import type { Product } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { cn } from '../../utils/helpers';
import { ShoppingBag } from 'lucide-react';

interface MoveToBagModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (size: string) => void;
}

export const MoveToBagModal: React.FC<MoveToBagModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm,
}) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  if (!product) return null;

  const handleDone = () => {
    if (selectedSize) {
      onConfirm(selectedSize);
      onClose();
      setSelectedSize(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Size" size="sm">
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-14 h-16 rounded bg-surface overflow-hidden flex-shrink-0">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-surface" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              {product.brand}
            </h4>
            <p className="text-xs text-muted line-clamp-1">{product.title}</p>
            <div className="text-xs font-bold text-primary mt-1">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-3">
            Available Sizes
          </span>
          <div className="flex flex-wrap gap-2.5">
            {product.sizes.map((s) => {
              const isSelected = selectedSize === s.name;
              const isOut = s.stock <= 0;

              return (
                <button
                  key={s.name}
                  type="button"
                  disabled={isOut}
                  onClick={() => setSelectedSize(s.name)}
                  className={cn(
                    'w-12 h-11 rounded-full text-xs font-bold border transition-all flex items-center justify-center relative',
                    isSelected
                      ? 'border-accent bg-accent text-white shadow-sm'
                      : isOut
                      ? 'border-dashed border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                      : 'border-border text-primary hover:border-accent hover:text-accent bg-white'
                  )}
                >
                  {s.name}
                  {isOut && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-full h-px bg-gray-300 transform -rotate-45" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          variant="accent"
          size="md"
          disabled={!selectedSize}
          onClick={handleDone}
          className="w-full font-bold text-xs uppercase tracking-wider h-11"
          icon={<ShoppingBag size={16} />}
        >
          Done & Add to Bag
        </Button>
      </div>
    </Modal>
  );
};
