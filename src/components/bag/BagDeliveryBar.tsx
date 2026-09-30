import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { checkDelivery, type DeliveryInfo } from '../../services/api/pincodes';
import { useCartStore } from '../../store/useCartStore';

export const BagDeliveryBar: React.FC = () => {
  const { deliveryPincode, setDeliveryPincode } = useCartStore();
  const [isEditing, setIsEditing] = useState(false);
  const [pincodeInput, setPincodeInput] = useState(deliveryPincode);
  const [info, setInfo] = useState<DeliveryInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchInfo() {
      if (/^\d{6}$/.test(deliveryPincode)) {
        try {
          const res = await checkDelivery(deliveryPincode);
          if (mounted) setInfo(res);
        } catch {
          // ignore
        }
      }
    }
    fetchInfo();
    return () => {
      mounted = false;
    };
  }, [deliveryPincode]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincodeInput)) {
      setError('Enter valid 6-digit PIN');
      return;
    }

    try {
      const res = await checkDelivery(pincodeInput);
      if (res && res.deliverable) {
        setInfo(res);
        setDeliveryPincode(pincodeInput);
        setError(null);
        setIsEditing(false);
      } else {
        setError(`Delivery not available for ${pincodeInput}`);
      }
    } catch {
      setError('Failed to verify PIN code');
    }
  };

  return (
    <div className="bg-white border border-border rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-start sm:items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-primary flex-shrink-0">
          <MapPin size={16} />
        </div>
        <div>
          <div className="flex items-center gap-1.5 font-bold text-primary">
            <span>Deliver to:</span>
            <span className="font-mono text-gray-900">{deliveryPincode}</span>
            {info?.city && <span className="font-normal text-muted">({info.city})</span>}
          </div>
          <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
            {info?.deliverable ? (
              <span className="text-emerald-700 font-medium">
                Express Delivery by {info.estimatedDate}
              </span>
            ) : (
              <span>Check delivery date & serviceability</span>
            )}
          </div>
        </div>
      </div>

      <div>
        {isEditing ? (
          <form onSubmit={handleUpdate} className="flex items-center gap-2">
            <input
              type="text"
              maxLength={6}
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
              placeholder="6-digit PIN"
              className="w-24 px-2 py-1 text-xs border border-border rounded outline-none focus:border-accent"
              autoFocus
            />
            <button
              type="submit"
              className="font-bold text-accent uppercase text-[11px] hover:text-rose-700"
            >
              Verify
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
              className="text-muted hover:text-primary text-[11px]"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 border border-border rounded text-accent hover:border-accent font-bold uppercase text-[11px] tracking-wider transition-colors"
          >
            Change
          </button>
        )}
        {error && <span className="block text-[10px] text-rose-600 mt-1">{error}</span>}
      </div>
    </div>
  );
};
