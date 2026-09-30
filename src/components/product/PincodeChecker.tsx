import React, { useState } from 'react';
import { Truck, CheckCircle2, XCircle, Banknote, ShieldCheck } from 'lucide-react';
import { checkDelivery, type DeliveryInfo } from '../../services/api/pincodes';
import { cn } from '../../utils/helpers';

interface PincodeCheckerProps {
  className?: string;
  defaultPincode?: string;
}

export const PincodeChecker: React.FC<PincodeCheckerProps> = ({
  className,
  defaultPincode = '',
}) => {
  const [pincode, setPincode] = useState(defaultPincode);
  const [loading, setLoading] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setError('Please enter a valid 6-digit PIN code');
      setDeliveryInfo(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const info = await checkDelivery(pincode);
      setDeliveryInfo(info);
      if (info && !info.deliverable) {
        setError(`Unfortunately, we do not deliver to ${pincode} yet.`);
      }
    } catch {
      setError('Failed to check delivery serviceability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('space-y-3 py-4 border-t border-b border-gray-100', className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold uppercase tracking-wider text-primary">
          Delivery Options
        </span>
        <Truck size={16} className="text-muted" />
      </div>

      <form onSubmit={handleCheck} className="flex gap-2 max-w-sm">
        <input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit PIN code"
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, ''));
            if (error) setError(null);
          }}
          className="flex-1 px-3 py-2 text-xs border border-border rounded-md focus:border-accent focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={loading || pincode.length !== 6}
          className="px-4 py-2 text-xs font-bold text-accent hover:text-rose-700 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider transition-colors"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-md">
          <XCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {deliveryInfo && deliveryInfo.deliverable && (
        <div className="space-y-2 pt-1 text-xs text-gray-700">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-primary">
                Get it by {deliveryInfo.estimatedDate}
              </span>
              <span className="text-muted block text-[11px]">
                Delivering to {deliveryInfo.city}, {deliveryInfo.state}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Banknote size={15} className="text-gray-500 flex-shrink-0" />
            <span>
              {deliveryInfo.codAvailable ? (
                <strong className="text-emerald-700 font-medium">Cash on Delivery available</strong>
              ) : (
                <span className="text-muted">COD not available for this location</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-gray-500 flex-shrink-0" />
            <span>Standard 30-day return policy applies</span>
          </div>
        </div>
      )}

      {!deliveryInfo && !error && (
        <p className="text-[11px] text-muted">
          Please enter PIN code to check delivery time & Pay on Delivery availability
        </p>
      )}
    </div>
  );
};
