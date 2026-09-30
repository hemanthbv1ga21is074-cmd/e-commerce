import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: string[];
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpen = [],
  className,
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggle = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={cn('divide-y divide-[var(--color-border)]', className)}>
      {items.map((item) => (
        <div key={item.id}>
          <button
            onClick={() => toggle(item.id)}
            className="flex items-center justify-between w-full py-3 px-1 text-left font-semibold text-sm hover:text-[var(--color-accent)] transition-colors"
            aria-expanded={openItems.has(item.id)}
          >
            {item.title}
            <ChevronDown
              size={18}
              className={cn(
                'transition-transform duration-200',
                openItems.has(item.id) && 'rotate-180'
              )}
            />
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              openItems.has(item.id) ? 'max-h-[1000px] pb-3' : 'max-h-0'
            )}
          >
            <div className="px-1 text-sm text-[var(--color-muted)]">
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
