import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: 'var(--z-overlay)' }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/50 animate-[fadeIn_0.2s_ease]"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl',
          'max-h-[85vh] overflow-hidden',
          'animate-[slideUp_0.3s_ease]',
          className
        )}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-[var(--color-border)] rounded-full" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)]">
            <h3 className="font-display font-semibold text-base">{title}</h3>
            <button onClick={onClose} className="p-1" aria-label="Close">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto max-h-[70vh] pb-safe">{children}</div>
      </div>
    </div>
  );
};
