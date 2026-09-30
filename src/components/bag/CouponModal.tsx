import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Tag, Check, AlertCircle } from 'lucide-react';
import { coupons } from '../../data/coupons';
import type { Coupon, CartItem } from '../../types';
import { applyCoupon } from '../../utils/price';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  items: CartItem[];
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon) => void;
  onRemoveCoupon: () => void;
}

export const CouponModal: React.FC<CouponModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  items,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [customCode, setCustomCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApply = (coupon: Coupon) => {
    const result = applyCoupon(coupon, subtotal, items, true);
    if (!result.valid) {
      setErrorMsg(result.message);
      return;
    }

    setErrorMsg(null);
    onApplyCoupon(coupon);
    onClose();
  };

  const handleCustomApply = (e: React.FormEvent) => {
    e.preventDefault();
    const code = customCode.trim().toUpperCase();
    if (!code) return;

    const matched = coupons.find((c) => c.code.toUpperCase() === code);
    if (!matched) {
      setErrorMsg(`Coupon "${code}" is invalid or expired.`);
      return;
    }

    handleApply(matched);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply Coupon" size="md">
      <div className="space-y-6">
        {/* Custom Input */}
        <form onSubmit={handleCustomApply} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={customCode}
            onChange={(e) => {
              setCustomCode(e.target.value.toUpperCase());
              if (errorMsg) setErrorMsg(null);
            }}
            className="flex-1 px-3 py-2 text-xs uppercase tracking-wider font-mono border border-border rounded-md focus:border-accent outline-none"
          />
          <button
            type="submit"
            disabled={!customCode.trim()}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-accent disabled:opacity-40 hover:text-rose-700 transition-colors"
          >
            Apply
          </button>
        </form>

        {errorMsg && (
          <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 animate-fade-in">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Currently Applied Coupon Bar */}
        {appliedCoupon && (
          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
            <div className="flex items-center gap-2 text-emerald-800">
              <Check size={16} className="text-emerald-600" />
              <span>
                <strong>{appliedCoupon.code}</strong> applied
              </span>
            </div>
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="text-xs font-bold text-accent uppercase hover:underline"
            >
              Remove
            </button>
          </div>
        )}

        {/* Available Coupons List */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Tag size={14} className="text-accent" />
            Available Coupons
          </span>

          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
            {coupons.map((coupon) => {
              const isApplied = appliedCoupon?.id === coupon.id;
              const meetsMin = subtotal >= coupon.minCartValue;

              return (
                <div
                  key={coupon.id}
                  className="py-3 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold px-2 py-0.5 border border-dashed border-accent bg-rose-50 text-accent rounded text-[11px]">
                        {coupon.code}
                      </span>
                      {coupon.type === 'percent' ? (
                        <span className="font-semibold text-primary">
                          Save {coupon.value}% (Up to ₹{coupon.maxDiscount || 'unlimited'})
                        </span>
                      ) : (
                        <span className="font-semibold text-primary">
                          Save ₹{coupon.value}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted">{coupon.description}</p>
                    {!meetsMin && (
                      <p className="text-[10px] text-amber-600 font-medium">
                        Add ₹{(coupon.minCartValue - subtotal).toLocaleString('en-IN')} more to unlock
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!meetsMin || isApplied}
                    onClick={() => handleApply(coupon)}
                    className="font-bold text-xs uppercase tracking-wider text-accent hover:text-rose-700 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 pt-0.5"
                  >
                    {isApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
