import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, MapPin, Wallet, Award, LogOut, Heart, Package, Gift, Tag, CreditCard, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../utils/helpers';

export const AccountSidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'My Orders', to: '/account/orders', icon: <Package size={17} /> },
    { label: 'Profile Information', to: '/account/profile', icon: <User size={17} /> },
    { label: 'Saved Addresses', to: '/account/addresses', icon: <MapPin size={17} /> },
    { label: 'Wallet & Credits', to: '/account/wallet', icon: <Wallet size={17} /> },
    { label: 'Insider Loyalty Club', to: '/account/insider', icon: <Award size={17} /> },
    { label: 'Gift Cards', to: '/account/gift-cards', icon: <Gift size={17} /> },
    { label: 'My Coupons & Offers', to: '/account/coupons', icon: <Tag size={17} /> },
    { label: 'Saved Cards & UPI', to: '/account/saved-payment', icon: <CreditCard size={17} /> },
    { label: 'Notification Settings', to: '/account/settings', icon: <Bell size={17} /> },
    { label: 'My Wishlist', to: '/wishlist', icon: <Heart size={17} /> },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border border-border rounded-xl p-4 space-y-6 flex-shrink-0 shadow-xs">
      {/* User Overview Snippet */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-12 h-12 rounded-full bg-accent/10 text-accent font-black text-lg flex items-center justify-center flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-primary truncate">{user?.name || 'Customer'}</h3>
          <p className="text-[11px] text-muted truncate">{user?.phone || user?.email}</p>
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.2 rounded mt-1 border border-amber-200">
            {user?.loyaltyTier || 'Silver'} Insider
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav aria-label="Account Navigation" className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors',
                isActive
                  ? 'bg-rose-50 text-accent font-bold'
                  : 'text-gray-700 hover:bg-surface hover:text-primary'
              )
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};
