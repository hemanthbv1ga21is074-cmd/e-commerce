import React, { useState, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, User, Award, MapPin, Wallet, LogOut, Package } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MegaMenu } from './MegaMenu';
import { brandConfig } from '../../data/brand-config';
import { cn } from '../../utils/helpers';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const {
    megaMenuOpen,
    setMegaMenu,
    toggleMobileDrawer,
    openSearch,
  } = useUIStore();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const handleProfileMouseEnter = () => {
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    setProfileDropdownOpen(true);
  };

  const handleProfileMouseLeave = () => {
    profileTimeoutRef.current = setTimeout(() => {
      setProfileDropdownOpen(false);
    }, 200);
  };

  const navLinks = [
    { label: 'MEN', to: '/men' },
    { label: 'WOMEN', to: '/women' },
    { label: 'KIDS', to: '/kids' },
    { label: 'BRANDS', to: '/search?brands=all' },
    { label: 'SALE', to: '/search?discount=40', isSale: true },
  ];

  return (
    <header className="sticky top-0 z-sticky bg-white/95 backdrop-blur-md border-b border-border transition-all">
      <div className="container-app flex items-center justify-between h-[var(--header-height)] gap-4">
        {/* Mobile Hamburger + Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMobileDrawer}
            className="p-1.5 -ml-1.5 text-gray-700 hover:text-primary lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          <Link to="/" className="flex items-center gap-1.5 focus-visible:outline-none">
            <span className="font-display text-xl md:text-2xl font-extrabold tracking-tight text-primary">
              {brandConfig.name.slice(0, 5)}
              <span className="text-accent">{brandConfig.name.slice(5)}</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center space-x-6 xl:space-x-8 h-full"
        >
          {navLinks.map((link) => (
            <div
              key={link.label}
              className="relative h-full flex items-center"
              onMouseEnter={() => setMegaMenu(link.label)}
            >
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'h-full flex items-center text-xs font-bold tracking-widest uppercase transition-colors border-b-2',
                    link.isSale ? 'text-accent' : 'text-primary',
                    isActive || megaMenuOpen === link.label
                      ? 'border-accent text-accent'
                      : 'border-transparent hover:text-accent hover:border-accent/40'
                  )
                }
              >
                {link.label}
                {link.isSale && (
                  <span className="ml-1 text-[9px] bg-accent text-white px-1.5 py-0.2 rounded-full font-normal">
                    UP TO 70%
                  </span>
                )}
              </NavLink>
            </div>
          ))}
        </nav>

        {/* Search Bar Input Trigger */}
        <div className="flex-1 max-w-md mx-2">
          <button
            type="button"
            onClick={openSearch}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md bg-surface text-gray-400 hover:text-gray-600 border border-transparent hover:border-border transition-all text-xs"
          >
            <Search size={15} className="text-muted" />
            <span className="truncate text-left">Search for products, brands and more...</span>
          </button>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="relative p-2 text-gray-700 hover:text-accent transition-colors flex flex-col items-center"
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart size={20} />
            <span className="text-[10px] font-bold hidden sm:inline">Wishlist</span>
            {wishlistCount > 0 && (
              <Badge
                count={wishlistCount}
                className="absolute top-1 right-1 text-[9px] min-w-[15px] h-[15px] px-0.5"
              />
            )}
          </Link>

          {/* Bag Link */}
          <Link
            to="/bag"
            className="relative p-2 text-gray-700 hover:text-accent transition-colors flex flex-col items-center"
            title="Bag"
            aria-label="Shopping Bag"
          >
            <ShoppingBag size={20} />
            <span className="text-[10px] font-bold hidden sm:inline">Bag</span>
            {totalCartCount > 0 && (
              <Badge
                count={totalCartCount}
                className="absolute top-1 right-1 text-[9px] min-w-[15px] h-[15px] px-0.5"
              />
            )}
          </Link>

          {/* User Profile Hover Menu */}
          <div
            className="relative"
            onMouseEnter={handleProfileMouseEnter}
            onMouseLeave={handleProfileMouseLeave}
          >
            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) navigate('/account/profile');
                else navigate('/login');
              }}
              className="p-2 text-gray-700 hover:text-accent transition-colors flex flex-col items-center focus-visible:outline-none"
            >
              <User size={20} />
              <span className="text-[10px] font-bold hidden sm:inline">
                {isAuthenticated ? user?.name?.split(' ')[0] || 'Profile' : 'Profile'}
              </span>
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl shadow-2xl border border-border py-3 z-dropdown animate-fade-in text-xs">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="px-4 pb-3 border-b border-gray-100">
                      <div className="font-bold text-sm text-primary">{user.name}</div>
                      <div className="text-[11px] text-muted truncate">{user.email || user.phone}</div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1.5 border border-amber-200">
                        {user.loyaltyTier} Insider
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/account/orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-surface text-gray-700 hover:text-primary transition-colors font-medium"
                      >
                        <Package size={15} />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        to="/account/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-surface text-gray-700 hover:text-primary transition-colors font-medium"
                      >
                        <User size={15} />
                        <span>Profile Details</span>
                      </Link>

                      <Link
                        to="/account/addresses"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-surface text-gray-700 hover:text-primary transition-colors font-medium"
                      >
                        <MapPin size={15} />
                        <span>Saved Addresses</span>
                      </Link>

                      <Link
                        to="/account/wallet"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-surface text-gray-700 hover:text-primary transition-colors font-medium"
                      >
                        <Wallet size={15} />
                        <span>StyleBazaar Wallet</span>
                      </Link>

                      <Link
                        to="/account/insider"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-surface text-gray-700 hover:text-primary transition-colors font-medium"
                      >
                        <Award size={15} />
                        <span>Insider Rewards</span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-gray-100 px-4">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left font-bold text-rose-600 hover:underline flex items-center gap-2"
                      >
                        <LogOut size={14} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-2 space-y-3">
                    <div>
                      <h4 className="font-bold text-sm text-primary">Welcome</h4>
                      <p className="text-[11px] text-muted">To access wishlist & bag</p>
                    </div>

                    <Link to="/login" onClick={() => setProfileDropdownOpen(false)}>
                      <Button variant="accent" size="sm" className="w-full font-bold uppercase text-[11px]">
                        Login / Signup
                      </Button>
                    </Link>

                    <div className="pt-2 border-t border-gray-100 space-y-1.5 text-gray-600">
                      <Link
                        to="/wishlist"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block py-1 hover:text-accent font-medium"
                      >
                        Wishlist
                      </Link>
                      <Link
                        to="/search?brands=all"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block py-1 hover:text-accent font-medium"
                      >
                        Gift Cards
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MegaMenu Dropdown */}
      <MegaMenu activeSection={megaMenuOpen} onClose={() => setMegaMenu(null)} />
    </header>
  );
};
