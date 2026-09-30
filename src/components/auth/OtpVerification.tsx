import React, { useState, useEffect } from 'react';
import { Edit2, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface OtpVerificationProps {
  phone: string;
  onVerify: (otp: string) => void;
  onEditPhone: () => void;
  loading?: boolean;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({
  phone,
  onVerify,
  onEditPhone,
  loading = false,
}) => {
  const [otp, setOtp] = useState('1234');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleResend = () => {
    setTimer(30);
    setCanResend(false);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4) {
      setError('Please enter a 4-digit OTP');
      return;
    }
    setError(null);
    onVerify(otp);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="text-center space-y-1">
        <p className="text-muted">Verification code has been sent to</p>
        <div className="flex items-center justify-center gap-2">
          <span className="font-bold text-sm text-primary font-mono">+91 {phone}</span>
          <button
            type="button"
            onClick={onEditPhone}
            className="text-accent hover:underline inline-flex items-center gap-0.5 text-[11px] font-semibold"
          >
            <Edit2 size={12} />
            Edit
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-2 text-center uppercase tracking-wider">
            Enter 4-Digit OTP
          </label>
          <input
            type="text"
            required
            maxLength={4}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ''));
              if (error) setError(null);
            }}
            placeholder="••••"
            className="w-48 mx-auto block px-4 py-3 border-2 border-accent rounded-xl font-mono text-2xl font-bold tracking-[1em] text-center outline-none bg-rose-50/20"
            autoFocus
          />
          {error && <p className="text-xs text-rose-600 text-center mt-1.5">{error}</p>}
          <span className="block text-[11px] text-muted text-center mt-2">
            (Use default test OTP: <strong>1234</strong>)
          </span>
        </div>

        <Button
          variant="accent"
          size="lg"
          type="submit"
          loading={loading}
          disabled={otp.length !== 4}
          className="w-full font-bold text-xs uppercase tracking-wider h-12 shadow-lg"
        >
          Verify & Continue
        </Button>
      </form>

      <div className="text-center pt-2">
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            className="text-accent font-bold uppercase tracking-wider hover:underline inline-flex items-center gap-1"
          >
            <RotateCcw size={13} />
            Resend OTP
          </button>
        ) : (
          <span className="text-muted">
            Resend OTP in <strong className="font-mono text-primary">{timer}s</strong>
          </span>
        )}
      </div>
    </div>
  );
};
