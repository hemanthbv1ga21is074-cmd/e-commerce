import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertCircle, Wallet } from 'lucide-react';
import type { Order } from '../../types';
import { formatPrice } from '../../utils/price';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirmCancel: (orderId: string, reason: string) => void;
}

const CANCEL_REASONS = [
  'Expected delivery date is too late',
  'Ordered by mistake / Duplicate order',
  'Found a better price / alternative elsewhere',
  'Need to change delivery address or contact number',
  'Need to change size or color of item',
  'Other reasons',
];

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmCancel,
}) => {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customComment, setCustomComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const finalReason =
      selectedReason === 'Other reasons' && customComment.trim()
        ? `Other: ${customComment.trim()}`
        : selectedReason;

    setTimeout(() => {
      onConfirmCancel(order.id, finalReason);
      setLoading(false);
      onClose();
    }, 600);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Cancel Order #${order.id}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-900">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Are you sure you want to cancel this order?</span>
            <span className="text-[11px] leading-relaxed block text-amber-800">
              Once cancelled, this request cannot be reversed. Any promotional coupons applied to this order will be released back to your account.
            </span>
          </div>
        </div>

        {/* Instant Wallet Refund Highlight */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <Wallet size={16} />
            </div>
            <div>
              <span className="font-bold text-xs text-emerald-950 block">Instant Refund Guarantee</span>
              <span className="text-[11px] text-emerald-800">Credited directly to your StyleBazaar Wallet</span>
            </div>
          </div>
          <span className="text-sm font-black text-emerald-700">{formatPrice(order.total)}</span>
        </div>

        {/* Reason Selector */}
        <div className="space-y-2">
          <label className="font-bold text-gray-700 block">Please select a reason for cancellation *</label>
          <div className="space-y-2">
            {CANCEL_REASONS.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-2.5 p-2.5 border rounded-lg cursor-pointer transition-colors ${
                  selectedReason === reason
                    ? 'border-accent bg-rose-50/40 text-primary font-semibold'
                    : 'border-border hover:bg-gray-50 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="cancel_reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="accent-accent"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedReason === 'Other reasons' && (
          <div>
            <label className="font-bold text-gray-700 block mb-1">Additional details (Optional)</label>
            <textarea
              rows={2}
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              placeholder="Tell us what went wrong..."
              className="w-full px-3 py-2 border border-border rounded-md focus:border-accent outline-none text-xs"
            />
          </div>
        )}

        <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Don't Cancel
          </Button>
          <Button type="submit" variant="accent" size="sm" loading={loading} className="bg-rose-600 hover:bg-rose-700">
            Confirm Cancellation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
