import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { RotateCcw, ArrowRightLeft, Wallet, CreditCard, MapPin, CheckCircle2 } from 'lucide-react';
import type { Order, OrderItem } from '../../types';
import { formatPrice } from '../../utils/price';

interface ReturnExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirm: (
    orderId: string,
    itemId: string,
    reason: string,
    type: 'refund' | 'exchange',
    newSize?: string,
    refundToWallet?: boolean
  ) => void;
}

const REASONS = [
  'Size does not fit (too small / too large)',
  'Fabric quality not as expected',
  'Defective or damaged product received',
  'Received wrong product or wrong color',
  'Look and feel differs from catalog images',
  'Other reason',
];

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '38', '40'];

export const ReturnExchangeModal: React.FC<ReturnExchangeModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirm,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(
    order?.items[0]?.productId || ''
  );
  const [actionType, setActionType] = useState<'refund' | 'exchange'>('refund');
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [newSize, setNewSize] = useState('L');
  const [refundToWallet, setRefundToWallet] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successState, setSuccessState] = useState(false);

  if (!order) return null;

  const currentItem: OrderItem | undefined =
    order.items.find((i) => i.productId === selectedItemId) || order.items[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;

    setLoading(true);
    setTimeout(() => {
      onConfirm(
        order.id,
        currentItem.productId,
        selectedReason,
        actionType,
        actionType === 'exchange' ? newSize : undefined,
        refundToWallet
      );
      setLoading(false);
      setSuccessState(true);
      setTimeout(() => {
        setSuccessState(false);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={actionType === 'exchange' ? 'Exchange Product Size' : 'Return Product'}
      size="md"
    >
      {successState ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-base font-extrabold text-primary">
            {actionType === 'exchange' ? 'Exchange Request Placed!' : 'Return Request Scheduled!'}
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Our courier associate will arrive at your address for doorstep verification and pickup within 48 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Item Selector if multi-item */}
          {order.items.length > 1 && (
            <div className="space-y-1.5">
              <label className="font-bold text-gray-700 block">Select item to return or exchange</label>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <label
                    key={item.productId}
                    className={`flex items-center gap-3 p-2.5 border rounded-lg cursor-pointer ${
                      selectedItemId === item.productId
                        ? 'border-accent bg-rose-50/40'
                        : 'border-border hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="item_select"
                      value={item.productId}
                      checked={selectedItemId === item.productId}
                      onChange={() => setSelectedItemId(item.productId)}
                      className="accent-accent"
                    />
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-10 h-12 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 truncate">
                      <span className="font-bold text-primary block truncate">{item.title}</span>
                      <span className="text-muted text-[11px]">
                        Size: {item.size} • Qty: {item.quantity} • {formatPrice(item.price)}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Action Choice: Return or Exchange */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActionType('refund')}
              className={`p-3 border rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                actionType === 'refund'
                  ? 'border-accent bg-rose-50/60 text-accent ring-2 ring-rose-200'
                  : 'border-border text-gray-600 hover:bg-gray-50'
              }`}
            >
              <RotateCcw size={16} />
              <span>Return for Refund</span>
            </button>

            <button
              type="button"
              onClick={() => setActionType('exchange')}
              className={`p-3 border rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                actionType === 'exchange'
                  ? 'border-accent bg-rose-50/60 text-accent ring-2 ring-rose-200'
                  : 'border-border text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ArrowRightLeft size={16} />
              <span>Exchange Size</span>
            </button>
          </div>

          {/* If Exchange: Select New Size */}
          {actionType === 'exchange' && (
            <div className="p-3 bg-gray-50 border border-border rounded-xl space-y-2">
              <label className="font-bold text-gray-700 block">
                Select replacement size (Current: {currentItem?.size})
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SIZES.filter((s) => s !== currentItem?.size).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setNewSize(size)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                      newSize === size
                        ? 'border-accent bg-accent text-white shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reason Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-700 block">Reason for request *</label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-accent text-xs bg-white"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* If Return: Refund Mode Picker */}
          {actionType === 'refund' && (
            <div className="space-y-2">
              <label className="font-bold text-gray-700 block">Where should we send your refund? *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label
                  className={`p-3 border rounded-xl flex items-start gap-2.5 cursor-pointer ${
                    refundToWallet
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-border hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="refund_mode"
                    checked={refundToWallet}
                    onChange={() => setRefundToWallet(true)}
                    className="accent-emerald-600 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-emerald-950 flex items-center gap-1">
                      <Wallet size={13} className="text-emerald-700" /> StyleBazaar Wallet
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">
                      Instant credit after doorstep pickup
                    </span>
                  </div>
                </label>

                <label
                  className={`p-3 border rounded-xl flex items-start gap-2.5 cursor-pointer ${
                    !refundToWallet
                      ? 'border-accent bg-rose-50/40'
                      : 'border-border hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="refund_mode"
                    checked={!refundToWallet}
                    onChange={() => setRefundToWallet(false)}
                    className="accent-accent mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-primary flex items-center gap-1">
                      <CreditCard size={13} className="text-gray-500" /> Original Payment Mode
                    </span>
                    <span className="text-[10px] text-muted block mt-0.5">
                      Bank takes 3-5 business days
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Pickup Address Recap */}
          <div className="p-3 bg-gray-50 border border-gray-200/70 rounded-xl space-y-1">
            <span className="font-bold text-gray-700 flex items-center gap-1.5">
              <MapPin size={13} className="text-accent" /> Doorstep Pickup Address
            </span>
            <p className="text-[11px] text-gray-600 line-clamp-2">{order.shippingAddress}</p>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="sm" loading={loading}>
              Confirm {actionType === 'exchange' ? 'Exchange' : 'Return'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
