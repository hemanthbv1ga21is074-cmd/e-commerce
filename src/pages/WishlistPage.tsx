import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { SEO } from '../components/ui/SEO';
import { EmptyState } from '../components/ui/EmptyState';
import { WishlistItemCard } from '../components/wishlist/WishlistItemCard';
import { MoveToBagModal } from '../components/wishlist/MoveToBagModal';
import { Skeleton } from '../components/ui/Skeleton';

import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { getAllProducts } from '../services/api/products';
import type { Product } from '../types';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { items: wishlistIds, remove: removeFromWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const prods = await getAllProducts();
        if (mounted) setAllProducts(prods);
      } catch (err) {
        console.error('Failed to load wishlist products', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const wishlistedProducts = wishlistIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const handleMoveToBag = (product: Product) => {
    setActiveModalProduct(product);
  };

  const handleConfirmMoveToBag = (size: string) => {
    if (!activeModalProduct) return;

    const sizeObj = activeModalProduct.sizes.find((s) => s.name === size);

    addItem({
      productId: activeModalProduct.id,
      slug: activeModalProduct.slug,
      title: activeModalProduct.title,
      brand: activeModalProduct.brand,
      price: activeModalProduct.price,
      mrp: activeModalProduct.mrp,
      size,
      color: activeModalProduct.colors[0]?.name || 'Standard',
      image: activeModalProduct.images?.[0] || '',
      quantity: 1,
      maxStock: sizeObj?.stock || 10,
    });

    removeFromWishlist(activeModalProduct.id);

    setToastMessage(`Moved "${activeModalProduct.title}" to your Bag!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <>
      <SEO
        title="My Wishlist — StyleBazaar"
        description="View and manage saved clothing and lifestyle items in your StyleBazaar wishlist."
      />

      <div className="container-app py-8 space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2 animate-bounce">
            <ShoppingBag size={15} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-primary font-display">
              My Wishlist
            </h1>
            <span className="text-xs font-bold text-muted">
              ({wishlistIds.length} {wishlistIds.length === 1 ? 'item' : 'items'})
            </span>
          </div>

          <Link
            to="/bag"
            className="text-xs font-bold text-accent hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Go to Bag</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton variant="rect" className="w-full aspect-[3/4] rounded-lg" />
                <Skeleton variant="text" width="60%" height={14} />
                <Skeleton variant="text" width="40%" height={14} />
              </div>
            ))}
          </div>
        ) : wishlistedProducts.length === 0 ? (
          /* Empty State */
          <div className="py-12">
            <EmptyState
              icon={<Heart size={36} className="text-rose-400" />}
              title="YOUR WISHLIST IS EMPTY"
              description="Add items that you like to your wishlist. Review them anytime and easily move them to the bag."
              actionLabel="Continue Shopping"
              onAction={() => navigate('/men')}
            />
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {wishlistedProducts.map((p) => (
              <WishlistItemCard
                key={p.id}
                product={p}
                onRemove={removeFromWishlist}
                onMoveToBag={handleMoveToBag}
              />
            ))}
          </div>
        )}

        {/* Size Selection Modal when moving to bag */}
        <MoveToBagModal
          isOpen={Boolean(activeModalProduct)}
          onClose={() => setActiveModalProduct(null)}
          product={activeModalProduct}
          onConfirm={handleConfirmMoveToBag}
        />
      </div>
    </>
  );
};
