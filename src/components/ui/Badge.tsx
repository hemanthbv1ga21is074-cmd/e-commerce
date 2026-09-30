import React from 'react';
import { cn } from '../../utils/helpers';

interface BadgeProps {
  count: number;
  className?: string;
  max?: number;
}

export const Badge: React.FC<BadgeProps> = ({ count, className, max = 99 }) => {
  if (count <= 0) return null;

  const display = count > max ? `${max}+` : String(count);

  return (
    <span
      className={cn(
        'absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1',
        'text-[10px] font-bold text-white rounded-full',
        'bg-[var(--color-accent)]',
        className
      )}
      aria-label={`${count} items`}
    >
      {display}
    </span>
  );
};
