import React from 'react';
import { Tag, ShieldCheck, Wallet, Award } from 'lucide-react';
import type { CartItem, Coupon } from '../../types';
import { calcPricingBreakdown, formatPrice } from '../../utils/price';
import { Button } from '../ui/Button';

interface PriceSummaryCardProps {
  items: CartItem[];
  coupon?: Coupon | null;
  isCod?: boolean;
  onRemoveCoupon?: () => void;
  ctaText?: string;
  onCtaClick?: () => void;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  className?: string;
  onOpenCoupons?: () => void;
  walletDeduction?: number;
  loyaltyDeduction?: number;
}

export const PriceSummaryCard: React.FC<PriceSummaryCardProps> = ({
  items,
  coupon,
  isCod = false,
  onRemoveCoupon,
  ctaText = 'Place Order',
  onCtaClick,
  ctaDisabled = false,
  ctaLoading = false,
  className = '',
  onOpenCoupons,
  walletDeduction = 0,
  loyaltyDeduction = 0,
}) => {
  const breakdown = calcPricingBreakdown(items, {
    coupon,
    isCod,
    isFirstOrder: true,
  });

  const payableAmount = Math.max(
    0,
    breakdown.finalTotal - walletDeduction - loyaltyDeduction
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Coupon Strip Trigger (if onOpenCoupons is passed) */}
      {onOpenCoupons && (
        <div className="bg-white border border-border rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-accent" />
            <div>
              <span className="font-bold text-xs text-primary block">Apply Coupons</span>
              <span className="text-[11px] text-muted">Save more with coupons & offers</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenCoupons}
            className="px-3 py-1.5 border border-accent text-accent hover:bg-rose-50 rounded text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      {/* Bill Details Box */}
      <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted border-b border-gray-100 pb-2.5">
          Price Details ({breakdown.itemCount} {breakdown.itemCount === 1 ? 'Item' : 'Items'})
        </h4>

        <div className="space-y-2.5 text-xs text-gray-700">
          <div className="flex justify-between">
            <span>Total MRP</span>
            <span className="font-semibold text-primary">{formatPrice(breakdown.mrpTotal)}</span>
          </div>

          {breakdown.productDiscount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount on MRP</span>
              <span className="font-semibold">-{formatPrice(breakdown.productDiscount)}</span>
            </div>
          )}

          {breakdown.couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-700 items-center">
              <span className="flex items-center gap-1">
                Coupon Discount ({coupon?.code})
                {onRemoveCoupon && (
                  <button
                    type="button"
                    onClick={onRemoveCoupon}
                    className="text-[10px] text-accent font-bold hover:underline ml-1"
                  >
                    [Remove]
                  </button>
                )}
              </span>
              <span className="font-semibold">-{formatPrice(breakdown.couponDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Convenience Fee / Delivery</span>
            <span>
              {breakdown.deliveryFee === 0 ? (
                <span className="text-emerald-700 font-bold uppercase text-[11px]">FREE</span>
              ) : (
                formatPrice(breakdown.deliveryFee)
              )}
            </span>
          </div>

          {isCod && (
            <div className="flex justify-between text-gray-700">
              <span>COD Handling Charge</span>
              <span>{formatPrice(breakdown.codFee)}</span>
            </div>
          )}

          {walletDeduction > 0 && (
            <div className="flex justify-between text-emerald-700 items-center">
              <span className="flex items-center gap-1.5">
                <Wallet size={13} /> StyleBazaar Wallet
              </span>
              <span className="font-semibold">-{formatPrice(walletDeduction)}</span>
            </div>
          )}

          {loyaltyDeduction > 0 && (
            <div className="flex justify-between text-emerald-700 items-center">
              <span className="flex items-center gap-1.5">
                <Award size={13} /> Insider Points Redeemed
              </span>
              <span className="font-semibold">-{formatPrice(loyaltyDeduction)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-3.5 flex justify-between items-baseline font-bold text-sm text-primary">
          <span>Total Amount</span>
          <span className="text-base text-primary font-black">
            {formatPrice(payableAmount)}
          </span>
        </div>

        {breakdown.totalSavings > 0 && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-semibold text-center">
            🎉 You will save {formatPrice(breakdown.totalSavings)} on this order
          </div>
        )}

        {onCtaClick && (
          <Button
            variant="accent"
            size="lg"
            disabled={ctaDisabled}
            loading={ctaLoading}
            onClick={onCtaClick}
            className="w-full font-bold text-xs uppercase tracking-wider h-12 shadow-lg"
          >
            {ctaText}
          </Button>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-muted">
        <ShieldCheck size={15} className="text-gray-400" />
        <span>Safe and secure payments • 100% Authentic products</span>
      </div>
    </div>
  );
};
