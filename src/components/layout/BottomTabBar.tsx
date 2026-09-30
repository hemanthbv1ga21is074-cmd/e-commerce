import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useUIStore } from '../../store/useUIStore';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/helpers';

export const BottomTabBar: React.FC = () => {
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { toggleMobileDrawer } = useUIStore();

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-sticky bg-white/95 backdrop-blur border-t border-border flex items-center justify-around h-[var(--bottom-bar-height)] md:hidden shadow-lg"
    >
      <NavLink
        to="/"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center justify-center flex-1 h-full text-[10px] font-medium transition-colors',
            isActive ? 'text-accent font-bold' : 'text-gray-600 hover:text-primary'
          )
        }
      >
        <Home size={19} />
        <span className="mt-0.5">Home</span>
      </NavLink>

      <button
        type="button"
        onClick={toggleMobileDrawer}
        className="flex flex-col items-center justify-center flex-1 h-full text-[10px] font-medium text-gray-600 hover:text-primary transition-colors"
      >
        <Grid size={19} />
        <span className="mt-0.5">Categories</span>
      </button>

      <NavLink
        to="/wishlist"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center justify-center flex-1 h-full text-[10px] font-medium transition-colors relative',
            isActive ? 'text-accent font-bold' : 'text-gray-600 hover:text-primary'
          )
        }
      >
        <div className="relative">
          <Heart size={19} />
          {wishlistCount > 0 && (
            <Badge
              count={wishlistCount}
              className="absolute -top-1.5 -right-2 text-[9px] min-w-[14px] h-[14px] px-0.5"
            />
          )}
        </div>
        <span className="mt-0.5">Wishlist</span>
      </NavLink>

      <NavLink
        to="/bag"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center justify-center flex-1 h-full text-[10px] font-medium transition-colors relative',
            isActive ? 'text-accent font-bold' : 'text-gray-600 hover:text-primary'
          )
        }
      >
        <div className="relative">
          <ShoppingBag size={19} />
          {totalCartCount > 0 && (
            <Badge
              count={totalCartCount}
              className="absolute -top-1.5 -right-2 text-[9px] min-w-[14px] h-[14px] px-0.5"
            />
          )}
        </div>
        <span className="mt-0.5">Bag</span>
      </NavLink>

      <div className="flex flex-col items-center justify-center flex-1 h-full text-[10px] font-medium text-gray-600">
        <User size={19} />
        <span className="mt-0.5">Profile</span>
      </div>
    </nav>
  );
};
