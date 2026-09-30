import React, { useState } from 'react';
import { Banknote, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface PaymentCodProps {
  onConfirm: (methodDetails: string) => void;
  loading?: boolean;
}

export const PaymentCod: React.FC<PaymentCodProps> = ({ onConfirm, loading }) => {
  const [captchaCode, setCaptchaCode] = useState(() =>
    String(Math.floor(1000 + Math.random() * 9000))
  );
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const refreshCaptcha = () => {
    setCaptchaCode(String(Math.floor(1000 + Math.random() * 9000)));
    setUserInput('');
    setError(null);
  };

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() !== captchaCode) {
      setError('Captcha code does not match. Please try again.');
      refreshCaptcha();
      return;
    }

    setError(null);
    onConfirm('Cash On Delivery (COD)');
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-900">
          <Banknote size={18} className="text-accent" />
          <span>Cash On Delivery Information</span>
        </div>
        <ul className="text-gray-700 text-[11px] space-y-1 list-disc list-inside">
          <li>Pay with Cash or UPI upon package delivery at your doorstep.</li>
          <li>A nominal COD handling fee of ₹49 applies to cash orders.</li>
          <li>Please keep exact change ready to facilitate contactless delivery.</li>
        </ul>
      </div>

      <form onSubmit={handleOrder} className="space-y-4">
        <div>
          <label className="font-bold text-gray-700 block mb-1">
            Enter Verification Code To Confirm
          </label>
          <div className="flex items-center gap-3">
            {/* Visual Captcha Box */}
            <div className="px-4 py-2 bg-gray-900 text-white font-mono font-black text-lg tracking-widest rounded select-none shadow-sm flex items-center gap-2">
              <span className="transform -rotate-2 inline-block">{captchaCode}</span>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="text-gray-400 hover:text-white transition-colors"
                title="Refresh Captcha"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            <input
              type="text"
              required
              maxLength={4}
              placeholder="Enter 4-digit code"
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value.replace(/\D/g, ''));
                if (error) setError(null);
              }}
              className="flex-1 px-3 py-2 border border-border rounded-md font-mono text-center tracking-widest focus:border-accent outline-none"
            />
          </div>
          {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
        </div>

        <Button
          variant="accent"
          size="lg"
          type="submit"
          loading={loading}
          disabled={userInput.length !== 4}
          className="w-full font-bold text-xs uppercase tracking-wider h-12 shadow-lg"
        >
          Confirm Order With Cash On Delivery
        </Button>
      </form>
    </div>
  );
};
