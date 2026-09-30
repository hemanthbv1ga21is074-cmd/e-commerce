import React from 'react';
import { cn } from '../../utils/helpers';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold font-body transition-all duration-200 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2';

  const variants = {
    primary: 'bg-[var(--color-accent)] text-white hover:brightness-110 active:brightness-95 focus-visible:ring-[var(--color-accent)]',
    secondary: 'bg-[var(--color-primary)] text-[var(--color-primary-contrast)] hover:brightness-110 focus-visible:ring-[var(--color-primary)]',
    ghost: 'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)] focus-visible:ring-[var(--color-border)]',
    outline: 'border-2 border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text)] hover:bg-[var(--color-surface)] focus-visible:ring-[var(--color-border)]',
    danger: 'bg-[var(--color-danger)] text-white hover:brightness-110 focus-visible:ring-[var(--color-danger)]',
    accent: 'bg-[var(--color-accent)] text-white hover:brightness-110 focus-visible:ring-[var(--color-accent)]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && icon}
      {children}
    </button>
  );
};
