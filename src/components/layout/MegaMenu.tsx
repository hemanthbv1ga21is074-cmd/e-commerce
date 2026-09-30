import React from 'react';
import { Link } from 'react-router-dom';
import { megaMenuSections } from '../../data/categories';
import { cn } from '../../utils/helpers';

interface MegaMenuProps {
  activeSection: string | null;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ activeSection, onClose }) => {
  if (!activeSection) return null;

  const section = megaMenuSections.find(
    (s) => s.label.toLowerCase() === activeSection.toLowerCase()
  );

  if (!section) return null;

  return (
    <div
      onMouseLeave={onClose}
      className="absolute top-full left-0 right-0 z-dropdown bg-white border-b border-border shadow-xl animate-fade-in"
    >
      <div className="container-app py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {section.columns.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-accent border-b border-gray-100 pb-1.5">
                {col.title}
              </h4>
              <ul className="space-y-2 text-xs">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      to={link.href}
                      onClick={onClose}
                      className={cn(
                        'block transition-colors py-0.5',
                        link.highlight
                          ? 'font-bold text-accent hover:text-rose-700'
                          : 'text-gray-600 hover:text-primary hover:font-medium'
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
