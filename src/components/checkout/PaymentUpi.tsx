import React, { useState } from 'react';
import { QrCode } from 'lucide-react';
import { Button } from '../ui/Button';

interface PaymentUpiProps {
  onConfirm: (methodDetails: string) => void;
  loading?: boolean;
}

export const PaymentUpi: React.FC<PaymentUpiProps> = ({ onConfirm, loading }) => {
  const [selectedApp, setSelectedApp] = useState<'qr' | 'gpay' | 'phonepe' | 'paytm' | 'vpa'>('qr');
  const [vpaInput, setVpaInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handlePay = () => {
    if (selectedApp === 'vpa') {
      if (!vpaInput.includes('@')) {
        setError('Please enter a valid UPI ID (e.g. name@okhdfcbank)');
        return;
      }
      onConfirm(`UPI (${vpaInput.trim()})`);
    } else if (selectedApp === 'qr') {
      onConfirm('UPI (Scanned QR Code)');
    } else {
      onConfirm(`UPI (${selectedApp.toUpperCase()})`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { id: 'qr', label: 'Scan QR Code' },
          { id: 'gpay', label: 'Google Pay' },
          { id: 'phonepe', label: 'PhonePe' },
          { id: 'paytm', label: 'Paytm UPI' },
        ].map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => {
              setSelectedApp(app.id as any);
              setError(null);
            }}
            className={`p-3 rounded-lg border text-xs font-bold transition-all text-center ${
              selectedApp === app.id
                ? 'border-accent bg-rose-50/40 text-accent ring-1 ring-accent'
                : 'border-border text-gray-700 hover:border-gray-400 bg-white'
            }`}
          >
            {app.label}
          </button>
        ))}
      </div>

      {/* QR Code view */}
      {selectedApp === 'qr' && (
        <div className="flex flex-col items-center justify-center p-6 bg-surface rounded-xl border border-dashed border-gray-300 text-center space-y-3">
          <div className="w-40 h-40 bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center">
            {/* Mock QR SVG representation */}
            <QrCode size={110} className="text-gray-800" />
            <span className="text-[10px] font-mono text-gray-500 mt-1">Scan to Pay</span>
          </div>
          <p className="text-xs text-muted max-w-xs">
            Scan this QR code using any UPI app (Google Pay, PhonePe, Paytm, BHIM) on your mobile phone to complete payment.
          </p>
        </div>
      )}

      {/* Direct UPI ID input option */}
      <div className="pt-2">
        <label className="text-xs font-bold text-gray-700 block mb-1">
          Or Enter Any UPI ID / VPA
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="mobileNumber@upi / username@okhdfcbank"
            value={vpaInput}
            onFocus={() => setSelectedApp('vpa')}
            onChange={(e) => {
              setVpaInput(e.target.value);
              setSelectedApp('vpa');
              if (error) setError(null);
            }}
            className="flex-1 px-3 py-2 text-xs border border-border rounded-md focus:border-accent outline-none font-mono"
          />
        </div>
        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
      </div>

      <Button
        variant="accent"
        size="lg"
        loading={loading}
        onClick={handlePay}
        className="w-full font-bold text-xs uppercase tracking-wider h-12 shadow-lg"
      >
        Verify & Pay With UPI
      </Button>
    </div>
  );
};
