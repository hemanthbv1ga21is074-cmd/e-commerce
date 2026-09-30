import React, { useState } from 'react';
import { CreditCard, Copy, Check } from 'lucide-react';
import type { BankOffer } from '../../types';

interface BankOffersStripProps {
  offers: BankOffer[];
}

export const BankOffersStrip: React.FC<BankOffersStripProps> = ({ offers }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!offers || offers.length === 0) return null;

  const handleCopy = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className="my-10">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard size={18} className="text-accent" />
        <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-primary">
          Bank & Payment Offers
        </h3>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="flex-shrink-0 w-72 sm:w-80 bg-surface/80 border border-border/80 rounded-xl p-4 flex flex-col justify-between hover:border-accent/40 transition-colors shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                  {offer.bank}
                </span>
                {offer.code && (
                  <button
                    type="button"
                    onClick={() => handleCopy(offer.code)}
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-white border border-border px-2 py-0.5 rounded text-gray-700 hover:text-accent hover:border-accent transition-colors"
                  >
                    {copiedCode === offer.code ? (
                      <>
                        <Check size={11} className="text-emerald-600" />
                        <span className="text-emerald-600">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>{offer.code}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <h4 className="text-xs font-bold text-primary mb-1">{offer.title}</h4>
              <p className="text-[11px] text-muted leading-relaxed">{offer.description}</p>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-200/50 flex items-center justify-between text-[10px] text-muted">
              <span>
                {offer.minCartValue ? `Min Spend: ₹${offer.minCartValue.toLocaleString('en-IN')}` : 'No Min Spend'}
              </span>
              <span>Terms Apply</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
