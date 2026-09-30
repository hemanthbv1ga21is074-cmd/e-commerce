import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/helpers';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-4',
        className
      )}
    >
      <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-4 text-muted">
        {icon || <PackageOpen className="w-10 h-10 text-muted" />}
      </div>
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-md mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
