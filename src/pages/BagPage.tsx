import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Gift } from 'lucide-react';
import { SEO } from '../components/ui/SEO';
import { EmptyState } from '../components/ui/EmptyState';
import { BagItemCard } from '../components/bag/BagItemCard';
import { BagDeliveryBar } from '../components/bag/BagDeliveryBar';
import { CouponModal } from '../components/bag/CouponModal';
import { PriceSummaryCard } from '../components/checkout/PriceSummaryCard';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useToastStore } from '../store/useToastStore';

export const BagPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    updateSize,
    removeItem,
    moveToWishlist,
  } = useCartStore();

  const { items: wishlistIds } = useWishlistStore();
  const { showToast } = useToastStore();

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleApplyCoupon = (coupon: any) => {
    applyCoupon(coupon);
    showToast(`Coupon ${coupon.code} applied! You saved on this order.`, 'success');
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    showToast('Coupon removed', 'info');
  };

  const handleMoveToWishlist = (productId: string, size: string) => {
    moveToWishlist(productId, size);
    showToast('Item moved to Wishlist', 'success');
  };

  const handleRemoveItem = (productId: string, size: string) => {
    removeItem(productId, size);
    showToast('Item removed from Bag', 'info');
  };

  const handlePlaceOrder = () => {
    navigate('/checkout/address');
  };

  if (items.length === 0) {
    return (
      <>
        <SEO title="Shopping Bag — StyleBazaar" description="Your StyleBazaar shopping bag" />
        <div className="container-app py-16">
          <EmptyState
            icon={<ShoppingBag size={40} className="text-muted" />}
            title="Hey, it feels so light!"
            description="There is nothing in your bag. Let's add some items."
            actionLabel={wishlistIds.length > 0 ? 'Add Items From Wishlist' : 'Continue Shopping'}
            onAction={() => navigate(wishlistIds.length > 0 ? '/wishlist' : '/men')}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title={`Shopping Bag (${items.length} items) — StyleBazaar`} />

      <div className="container-app py-6 space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-primary font-display">
            Shopping Bag ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
          <Link
            to="/wishlist"
            className="text-xs font-bold text-accent hover:underline uppercase tracking-wider"
          >
            My Wishlist ({wishlistIds.length})
          </Link>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Delivery Bar & Items List */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <BagDeliveryBar />

            <div className="space-y-3">
              {items.map((item) => (
                <BagItemCard
                  key={`${item.productId}-${item.size}`}
                  item={item}
                  onUpdateQuantity={(qty) => updateQuantity(item.productId, item.size, qty)}
                  onUpdateSize={(newSize, newStock) =>
                    updateSize(item.productId, item.size, newSize, newStock)
                  }
                  onRemove={() => handleRemoveItem(item.productId, item.size)}
                  onMoveToWishlist={() => handleMoveToWishlist(item.productId, item.size)}
                />
              ))}
            </div>

            {/* Gift Wrap Addon */}
            <div className="bg-white border border-border rounded-xl p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-50 text-accent flex items-center justify-center flex-shrink-0">
                  <Gift size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary">Buying for a loved one?</h4>
                  <p className="text-[11px] text-muted">Gift wrap and personalized card for only ₹25</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-accent">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded"
                />
                <span>{giftWrap ? 'Added' : 'Add'}</span>
              </label>
            </div>
          </div>

          {/* Right Column: Coupons, Price Details & Checkout Button */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-20">
            <PriceSummaryCard
              items={items}
              coupon={appliedCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              onOpenCoupons={() => setIsCouponModalOpen(true)}
              ctaText="Place Order"
              onCtaClick={handlePlaceOrder}
            />
          </div>
        </div>

        {/* Coupons Modal */}
        <CouponModal
          isOpen={isCouponModalOpen}
          onClose={() => setIsCouponModalOpen(false)}
          subtotal={subtotal}
          items={items}
          appliedCoupon={appliedCoupon}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
        />
      </div>
    </>
  );
};
