import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { brandConfig } from '../../data/brand-config';
import { cn } from '../../utils/helpers';

interface CheckoutHeaderProps {
  currentStep: 'bag' | 'address' | 'payment';
}

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({ currentStep }) => {
  const steps: { id: 'bag' | 'address' | 'payment'; label: string; href?: string }[] = [
    { id: 'bag', label: 'BAG', href: '/bag' },
    { id: 'address', label: 'ADDRESS', href: '/checkout/address' },
    { id: 'payment', label: 'PAYMENT' },
  ];

  return (
    <header className="sticky top-0 z-sticky bg-white border-b border-border shadow-xs">
      <div className="container-app flex items-center justify-between h-16">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-1">
          <span className="font-display text-xl font-extrabold tracking-tight text-primary">
            {brandConfig.name.slice(0, 5)}
            <span className="text-accent">{brandConfig.name.slice(5)}</span>
          </span>
        </Link>

        {/* 3-Step Progress Indicator */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold tracking-widest uppercase">
          {steps.map((s, idx) => {
            const isCompleted =
              (currentStep === 'address' && s.id === 'bag') ||
              (currentStep === 'payment' && (s.id === 'bag' || s.id === 'address'));
            const isCurrent = currentStep === s.id;

            return (
              <React.Fragment key={s.id}>
                {idx > 0 && (
                  <span className="w-6 sm:w-10 h-0.5 border-b border-dashed border-gray-300" />
                )}

                {s.href && isCompleted ? (
                  <Link
                    to={s.href}
                    className="text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1"
                  >
                    <span>{s.label}</span>
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'transition-colors',
                      isCurrent
                        ? 'text-accent border-b-2 border-accent pb-0.5'
                        : isCompleted
                        ? 'text-emerald-700'
                        : 'text-gray-400'
                    )}
                  >
                    {s.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 100% Secure Guarantee */}
        <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
          <ShieldCheck size={18} className="text-emerald-600" />
          <span className="hidden sm:inline">100% SECURE</span>
        </div>
      </div>
    </header>
  );
};
