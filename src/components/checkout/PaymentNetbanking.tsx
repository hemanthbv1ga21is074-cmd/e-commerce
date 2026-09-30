import React, { useState } from 'react';
import { Building2, Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface PaymentNetbankingProps {
  onConfirm: (methodDetails: string) => void;
  loading?: boolean;
}

const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank' },
  { id: 'icici', name: 'ICICI Bank' },
  { id: 'sbi', name: 'State Bank of India' },
  { id: 'axis', name: 'Axis Bank' },
  { id: 'kotak', name: 'Kotak Mahindra Bank' },
  { id: 'pnb', name: 'Punjab National Bank' },
];

export const PaymentNetbanking: React.FC<PaymentNetbankingProps> = ({
  onConfirm,
  loading,
}) => {
  const [selectedBank, setSelectedBank] = useState<string>('hdfc');

  const handlePay = () => {
    const bank = POPULAR_BANKS.find((b) => b.id === selectedBank)?.name || 'Net Banking';
    onConfirm(`Net Banking (${bank})`);
  };

  return (
    <div className="space-y-6 text-xs">
      <div>
        <label className="font-bold text-gray-700 block mb-2.5">
          Choose Your Bank
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {POPULAR_BANKS.map((bank) => {
            const isSelected = selectedBank === bank.id;
            return (
              <button
                key={bank.id}
                type="button"
                onClick={() => setSelectedBank(bank.id)}
                className={`p-3 rounded-lg border text-xs font-bold transition-all text-left flex items-center justify-between ${
                  isSelected
                    ? 'border-accent bg-rose-50/40 text-accent ring-1 ring-accent'
                    : 'border-border text-gray-700 hover:border-gray-400 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2 size={16} className="text-muted flex-shrink-0" />
                  <span className="truncate">{bank.name}</span>
                </div>
                {isSelected && <Check size={14} className="text-accent flex-shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-muted">
        You will be redirected to your bank's secure login page to complete your payment authorization.
      </p>

      <Button
        variant="accent"
        size="lg"
        loading={loading}
        onClick={handlePay}
        className="w-full font-bold text-xs uppercase tracking-wider h-12 shadow-lg"
      >
        Pay Now via Net Banking
      </Button>
    </div>
  );
};
