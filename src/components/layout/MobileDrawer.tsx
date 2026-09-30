import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight, ChevronDown, Heart, ShoppingBag, User as UserIcon, Package } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { categoryTree } from '../../data/categories';
import { brandConfig } from '../../data/brand-config';

export const MobileDrawer: React.FC = () => {
  const { mobileDrawerOpen, closeMobileDrawer } = useUIStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('men');

  if (!mobileDrawerOpen) return null;

  const toggleSection = (id: string) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-modal bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
      onClick={closeMobileDrawer}
    >
      <div
        className="w-4/5 max-w-sm h-full bg-white flex flex-col shadow-2xl animate-slide-right overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
          <Link
            to="/"
            onClick={closeMobileDrawer}
            className="text-lg font-extrabold tracking-tight text-primary font-display"
          >
            {brandConfig.name}
          </Link>
          <button
            type="button"
            onClick={closeMobileDrawer}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Authentication Status Banner */}
        <div className="p-4 bg-gray-50 border-b border-border">
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted block">Signed in as</span>
                <span className="font-bold text-sm text-primary block truncate">{user.name}</span>
                <span className="text-[10px] text-amber-700 font-bold uppercase">{user.loyaltyTier} Insider</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  closeMobileDrawer();
                }}
                className="text-xs text-rose-600 font-bold hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-primary block">Welcome</span>
                <span className="text-[11px] text-muted block">To access orders & wishlist</span>
              </div>
              <Link
                to="/login"
                onClick={closeMobileDrawer}
                className="px-3 py-1.5 rounded bg-accent text-white font-bold text-xs uppercase tracking-wider"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Quick User Actions */}
        <div className="grid grid-cols-4 divide-x divide-border border-b border-border py-3 bg-white text-center text-xs">
          <Link
            to={isAuthenticated ? '/account/orders' : '/login'}
            onClick={closeMobileDrawer}
            className="flex flex-col items-center gap-1 text-gray-700 hover:text-accent"
          >
            <Package size={18} />
            <span>Orders</span>
          </Link>
          <Link
            to="/wishlist"
            onClick={closeMobileDrawer}
            className="flex flex-col items-center gap-1 text-gray-700 hover:text-accent"
          >
            <Heart size={18} />
            <span>Wishlist</span>
          </Link>
          <Link
            to="/bag"
            onClick={closeMobileDrawer}
            className="flex flex-col items-center gap-1 text-gray-700 hover:text-accent"
          >
            <ShoppingBag size={18} />
            <span>Bag</span>
          </Link>
          <Link
            to={isAuthenticated ? '/account/profile' : '/login'}
            onClick={closeMobileDrawer}
            className="flex flex-col items-center gap-1 text-gray-700 hover:text-accent"
          >
            <UserIcon size={18} />
            <span>Account</span>
          </Link>
        </div>

        {/* Category Navigation Accordion */}
        <div className="flex-1 divide-y divide-gray-100 py-2">
          {categoryTree.map((cat) => {
            const isExpanded = expandedSection === cat.id;

            return (
              <div key={cat.id}>
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface"
                  onClick={() => toggleSection(cat.id)}
                >
                  <Link
                    to={`/${cat.slug}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeMobileDrawer();
                    }}
                    className="font-bold text-sm text-primary uppercase tracking-wide hover:text-accent"
                  >
                    {cat.label}
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection(cat.id);
                    }}
                    className="p-1 text-muted"
                    aria-label={`Toggle ${cat.label}`}
                  >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                </div>

                {isExpanded && cat.children && (
                  <div className="bg-surface/50 px-4 py-2 space-y-3">
                    {cat.children.map((sub) => (
                      <div key={sub.id} className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                          {sub.label}
                        </span>
                        <ul className="pl-2 space-y-1.5 text-xs text-gray-600">
                          {sub.children?.map((leaf) => (
                            <li key={leaf.id}>
                              <Link
                                to={`/${cat.slug}/${leaf.slug}`}
                                onClick={closeMobileDrawer}
                                className="block py-0.5 hover:text-accent"
                              >
                                {leaf.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick Sale Link */}
          <div className="px-4 py-3">
            <Link
              to="/search?discount=40"
              onClick={closeMobileDrawer}
              className="flex items-center justify-between text-sm font-bold text-accent uppercase tracking-wide"
            >
              <span>Sale & Offers</span>
              <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full">UP TO 70%</span>
            </Link>
          </div>
        </div>

        {/* Footer info in Drawer */}
        <div className="p-4 border-t border-border bg-surface text-xs text-muted space-y-1">
          <p className="font-semibold text-primary">{brandConfig.tagline}</p>
          <p className="text-[11px]">Free Shipping above ₹999 | 30-day easy returns</p>
        </div>
      </div>
    </div>
  );
};
