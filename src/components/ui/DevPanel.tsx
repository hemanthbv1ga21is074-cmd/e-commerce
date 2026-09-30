import React, { useEffect } from 'react';
import { Settings, Trash2, ShoppingBag, RefreshCw, X } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useRecentlyViewedStore } from '../../store/useRecentlyViewedStore';
import { products } from '../../data/products';
import { Button } from './Button';

export const DevPanel: React.FC = () => {
  const { devPanelOpen, toggleDevPanel } = useUIStore();
  const { items: cartItems, addItem, clearCart } = useCartStore();
  const { items: wishlistItems, clear: clearWishlist } = useWishlistStore();
  const { productIds: viewedIds, clear: clearViewed } = useRecentlyViewedStore();

  // Keyboard shortcut Ctrl + Shift + D to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleDevPanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDevPanel]);

  if (!devPanelOpen) {
    return (
      <button
        onClick={toggleDevPanel}
        title="Open Dev Tools (Ctrl+Shift+D)"
        className="fixed bottom-16 right-4 z-40 w-9 h-9 rounded-full bg-primary/80 backdrop-blur text-white flex items-center justify-center shadow-lg hover:bg-primary transition-all hover:scale-105"
        aria-label="Developer Panel"
      >
        <Settings size={18} />
      </button>
    );
  }

  const handleAddSampleItems = () => {
    if (products.length > 0) {
      const p1 = products[0];
      const p2 = products[1] || products[0];
      addItem({
        productId: p1.id,
        slug: p1.slug,
        title: p1.title,
        brand: p1.brand,
        price: p1.price,
        mrp: p1.mrp,
        size: p1.sizes[0]?.name || 'M',
        color: p1.colors[0]?.name || 'Standard',
        image: p1.images[0] || '',
        quantity: 1,
        maxStock: p1.sizes[0]?.stock || 10,
      });
      addItem({
        productId: p2.id,
        slug: p2.slug,
        title: p2.title,
        brand: p2.brand,
        price: p2.price,
        mrp: p2.mrp,
        size: p2.sizes[0]?.name || 'L',
        color: p2.colors[0]?.name || 'Standard',
        image: p2.images[0] || '',
        quantity: 2,
        maxStock: p2.sizes[0]?.stock || 10,
      });
    }
  };

  const handleResetAll = () => {
    clearCart();
    clearWishlist();
    clearViewed();
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="fixed bottom-16 right-4 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-accent" />
          <h4 className="font-bold text-gray-900 text-sm">Developer Tools</h4>
        </div>
        <button
          onClick={toggleDevPanel}
          className="text-gray-400 hover:text-gray-700 p-1"
          aria-label="Close Dev Tools"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3 py-3">
        <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
          <div className="flex justify-between text-gray-600">
            <span>Cart Items:</span>
            <span className="font-bold text-gray-900">{cartItems.length}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Wishlist Items:</span>
            <span className="font-bold text-gray-900">{wishlistItems.length}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Recently Viewed:</span>
            <span className="font-bold text-gray-900">{viewedIds.length}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={handleAddSampleItems}
            icon={<ShoppingBag size={14} />}
          >
            Add Sample Items to Bag
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
            onClick={() => {
              clearCart();
              clearWishlist();
            }}
            icon={<Trash2 size={14} />}
          >
            Clear Bag & Wishlist
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={handleResetAll}
            icon={<RefreshCw size={14} />}
          >
            Reset All LocalStorage & Reload
          </Button>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100 text-[11px] text-muted text-center">
        Press <kbd className="px-1 py-0.5 bg-gray-100 border rounded font-mono">Ctrl+Shift+D</kbd> to toggle
      </div>
    </div>
  );
};
