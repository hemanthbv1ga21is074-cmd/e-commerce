import React, { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface PaymentCardProps {
  onConfirm: (methodDetails: string) => void;
  loading?: boolean;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ onConfirm, loading }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('123456');
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Format card number with spaces every 4 digits
  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format expiry MM/YY
  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      setExpiry(`${digits.slice(0, 2)}/${digits.slice(2, 4)}`);
    } else {
      setExpiry(digits);
    }
  };

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setFormError('Please enter a valid 16-digit card number');
      return;
    }
    if (!cardName.trim()) {
      setFormError('Please enter name as on card');
      return;
    }
    if (expiry.length < 5) {
      setFormError('Please enter expiry in MM/YY format');
      return;
    }
    if (cvv.length < 3) {
      setFormError('Please enter a valid 3-digit CVV');
      return;
    }

    setFormError(null);
    setIsOtpOpen(true);
  };

  const handleVerifyOtp = () => {
    setOtpVerifying(true);
    setTimeout(() => {
      setOtpVerifying(false);
      setIsOtpOpen(false);
      const masked = `•••• •••• •••• ${cardNumber.replace(/\s/g, '').slice(-4)}`;
      onConfirm(`Card (${masked})`);
    }, 1200);
  };

  return (
    <div className="space-y-5 text-xs">
      <form onSubmit={handleInitiatePayment} className="space-y-4">
        {formError && (
          <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700">
            {formError}
          </div>
        )}

        <div>
          <label className="font-bold text-gray-700 block mb-1">Card Number *</label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-border rounded-md focus:border-accent outline-none font-mono text-sm tracking-wider"
            />
            <CreditCard size={18} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-1">Name on Card *</label>
          <input
            type="text"
            required
            placeholder="e.g. Rahul Sharma"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="w-full px-3 py-2.5 border border-border rounded-md focus:border-accent outline-none uppercase"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Valid Thru (MM/YY) *</label>
            <input
              type="text"
              required
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => handleExpiryChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-md focus:border-accent outline-none font-mono text-center"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">CVV *</label>
            <input
              type="password"
              required
              maxLength={4}
              placeholder="•••"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
              className="w-full px-3 py-2.5 border border-border rounded-md focus:border-accent outline-none font-mono text-center tracking-widest"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="accent"
            size="lg"
            type="submit"
            loading={loading}
            className="w-full font-bold text-xs uppercase tracking-wider h-12 shadow-lg"
          >
            Pay Now With Card
          </Button>
        </div>
      </form>

      {/* Simulated 3D Secure OTP Modal */}
      <Modal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        title="3D Secure Authentication"
        size="sm"
      >
        <div className="space-y-4 text-xs text-center py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Lock size={24} />
          </div>

          <div>
            <h4 className="font-bold text-sm text-primary">Simulated Bank OTP</h4>
            <p className="text-muted text-[11px] mt-1">
              An OTP has been sent to your registered mobile number ending with <strong>3210</strong>.
            </p>
          </div>

          <div className="py-2">
            <input
              type="text"
              maxLength={6}
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              className="w-40 mx-auto px-4 py-2 border-2 border-emerald-500 rounded-lg text-center font-mono text-lg font-bold tracking-widest outline-none bg-emerald-50/30"
            />
            <span className="block text-[10px] text-muted mt-1.5">
              (Use default mock OTP: <strong>123456</strong>)
            </span>
          </div>

          <Button
            variant="accent"
            size="md"
            loading={otpVerifying}
            onClick={handleVerifyOtp}
            className="w-full font-bold uppercase tracking-wider text-xs h-11"
          >
            Submit & Authorize Payment
          </Button>
        </div>
      </Modal>
    </div>
  );
};
