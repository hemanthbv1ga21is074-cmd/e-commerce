import React from 'react';
import { formatPrice } from '../../utils/price';
import { cn } from '../../utils/helpers';

interface PriceDisplayProps {
  price: number;
  mrp?: number;
  discountPercent?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showDiscountText?: boolean;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  mrp,
  discountPercent,
  size = 'md',
  showDiscountText = true,
  className,
}) => {
  const hasDiscount = mrp && mrp > price;
  const discount =
    discountPercent ?? (hasDiscount ? Math.round(((mrp! - price) / mrp!) * 100) : 0);

  const sizeConfigs = {
    xs: {
      price: 'text-xs font-bold',
      mrp: 'text-[10px]',
      discount: 'text-[10px]',
    },
    sm: {
      price: 'text-sm font-bold',
      mrp: 'text-xs',
      discount: 'text-xs',
    },
    md: {
      price: 'text-base font-bold',
      mrp: 'text-xs',
      discount: 'text-xs',
    },
    lg: {
      price: 'text-xl font-bold',
      mrp: 'text-sm',
      discount: 'text-sm',
    },
    xl: {
      price: 'text-2xl lg:text-3xl font-bold',
      mrp: 'text-base lg:text-lg',
      discount: 'text-sm lg:text-base',
    },
  };

  const config = sizeConfigs[size];

  return (
    <div className={cn('inline-flex items-baseline flex-wrap gap-1.5', className)}>
      <span className={cn('text-primary tracking-tight', config.price)}>
        {formatPrice(price)}
      </span>

      {hasDiscount && (
        <>
          <span className={cn('line-through text-muted', config.mrp)}>
            {formatPrice(mrp)}
          </span>
          {showDiscountText && discount > 0 && (
            <span className={cn('text-sale font-semibold', config.discount)}>
              ({discount}% OFF)
            </span>
          )}
        </>
      )}
    </div>
  );
};
