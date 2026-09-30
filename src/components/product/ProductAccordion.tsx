import React from 'react';
import type { Product } from '../../types';
import { Accordion } from '../ui/Accordion';
import { cn } from '../../utils/helpers';

interface ProductAccordionProps {
  product: Product;
  className?: string;
}

export const ProductAccordion: React.FC<ProductAccordionProps> = ({
  product,
  className,
}) => {
  const items = [
    {
      id: 'details',
      title: 'Product Details',
      content: (
        <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
          <p>{product.description}</p>
          {product.highlights && product.highlights.length > 0 && (
            <div className="pt-2">
              <h5 className="font-bold text-primary mb-1.5 uppercase text-[11px] tracking-wider">
                Key Highlights
              </h5>
              <ul className="list-disc list-inside space-y-1 text-muted">
                {product.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'specs',
      title: 'Specifications',
      content: (
        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs py-1">
          <div>
            <span className="text-muted block text-[11px]">Fabric</span>
            <span className="font-semibold text-primary">{product.fabric || '100% Cotton'}</span>
          </div>
          <div>
            <span className="text-muted block text-[11px]">Fit</span>
            <span className="font-semibold text-primary">{product.fit || 'Regular Fit'}</span>
          </div>
          <div>
            <span className="text-muted block text-[11px]">Pattern</span>
            <span className="font-semibold text-primary">{product.pattern || 'Solid'}</span>
          </div>
          <div>
            <span className="text-muted block text-[11px]">Occasion</span>
            <span className="font-semibold text-primary">
              {product.occasion?.join(', ') || 'Casual'}
            </span>
          </div>
          <div>
            <span className="text-muted block text-[11px]">Gender</span>
            <span className="font-semibold text-primary capitalize">{product.gender}</span>
          </div>
          <div>
            <span className="text-muted block text-[11px]">Country of Origin</span>
            <span className="font-semibold text-primary">India</span>
          </div>
        </div>
      ),
    },
    {
      id: 'care',
      title: 'Material & Care',
      content: (
        <div className="text-xs text-gray-700 space-y-2">
          <p>
            <strong>Composition:</strong> {product.fabric || '100% Premium Combed Cotton'}
          </p>
          {product.careInstructions && product.careInstructions.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-muted">
              {product.careInstructions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          ) : (
            <ul className="list-disc list-inside space-y-1 text-muted">
              <li>Machine wash cold with like colors</li>
              <li>Do not bleach</li>
              <li>Tumble dry low or line dry</li>
              <li>Warm iron if needed; do not iron on print</li>
            </ul>
          )}
        </div>
      ),
    },
    {
      id: 'returns',
      title: 'Returns & Exchange Policy',
      content: (
        <div className="text-xs text-muted space-y-1.5 leading-relaxed">
          <p>
            Easy <strong>{product.returnWindowDays || 30} days</strong> return and exchange policy. Return pickup is free of cost.
          </p>
          <p>
            Items must be in their original condition with all tags intact and packaging undamaged. Innerwear, socks, and personal care items cannot be returned due to hygiene reasons.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className={cn('border-t border-border mt-4', className)}>
      <Accordion items={items} defaultOpen={['details', 'specs']} />
    </div>
  );
};
