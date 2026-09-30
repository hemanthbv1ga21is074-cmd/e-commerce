import React, { useState } from 'react';
import type { CartItem } from '../../types';
import { products } from '../../data/products';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { cn } from '../../utils/helpers';

interface ChangeSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CartItem | null;
  onConfirm: (newSize: string, newStock: number) => void;
}

export const ChangeSizeModal: React.FC<ChangeSizeModalProps> = ({
  isOpen,
  onClose,
  item,
  onConfirm,
}) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  if (!item) return null;

  const product = products.find((p) => p.id === item.productId);
  const availableSizes = product?.sizes || [
    { name: 'S', stock: 5 },
    { name: 'M', stock: 5 },
    { name: 'L', stock: 5 },
    { name: 'XL', stock: 5 },
  ];

  const currentSize = selectedSize || item.size;

  const handleDone = () => {
    const sizeObj = availableSizes.find((s) => s.name === currentSize);
    onConfirm(currentSize, sizeObj?.stock || 10);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Size" size="sm">
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-14 h-16 rounded bg-surface overflow-hidden flex-shrink-0">
            {item.image ? (
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-surface" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              {item.brand}
            </h4>
            <p className="text-xs text-muted line-clamp-1">{item.title}</p>
            <div className="text-xs font-bold text-primary mt-1">
              ₹{item.price.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-3">
            Choose Size
          </span>
          <div className="flex flex-wrap gap-2.5">
            {availableSizes.map((s) => {
              const isSelected = currentSize === s.name;
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
          onClick={handleDone}
          className="w-full font-bold text-xs uppercase tracking-wider h-11"
        >
          Update Size
        </Button>
      </div>
    </Modal>
  );
};
