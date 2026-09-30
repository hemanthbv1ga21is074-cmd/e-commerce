import React, { useState } from 'react';
import { SEO } from '../components/ui/SEO';
import { AccountSidebar } from '../components/account/AccountSidebar';
import { Tag, Copy, Check, Sparkles, Percent, Calendar } from 'lucide-react';
import { coupons } from '../data/coupons';
import { bankOffers } from '../data/banners';
import { useToastStore } from '../store/useToastStore';
import { Link } from 'react-router-dom';

export const CouponsPage: React.FC = () => {
  const { showToast } = useToastStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon code ${code} copied!`, 'info');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="container-custom py-8">
      <SEO title="My Coupons & Offers | StyleBazaar" />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AccountSidebar />

        <main className="flex-1 w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-primary font-display">
                  My Coupons & Bank Offers
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-accent px-2.5 py-0.5 rounded-full border border-rose-200">
                  <Sparkles size={12} /> {coupons.length + bankOffers.length} Active
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Apply these coupon codes at checkout or bag to unlock instant savings
              </p>
            </div>

            <Link
              to="/bag"
              className="text-xs font-bold text-accent uppercase tracking-wider hover:underline"
            >
              Go to Bag & Apply →
            </Link>
          </div>

          {/* Platform Coupons Section */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Tag size={14} className="text-accent" />
              <span>StyleBazaar Store Coupons</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map((c) => (
                <div
                  key={c.code}
                  className="bg-white border border-dashed border-rose-200 rounded-xl p-4 sm:p-5 shadow-xs relative flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-rose-50 text-accent font-black text-xs rounded border border-rose-200 font-mono tracking-wider">
                        {c.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(c.code)}
                        className="text-xs font-bold text-gray-600 hover:text-accent flex items-center gap-1 transition-colors"
                      >
                        {copiedCode === c.code ? (
                          <>
                            <Check size={14} className="text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h3 className="font-extrabold text-sm text-primary pt-1">{c.code} Discount</h3>
                    <p className="text-xs text-muted leading-relaxed">{c.description}</p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-muted">
                    <span>Min order: ₹{c.minCartValue}</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      Expires: {new Date(c.expiresAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Partner Bank Offers Section */}
          <div className="space-y-4 pt-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Percent size={14} className="text-emerald-600" />
              <span>Instant Bank & Payment Offers</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bankOffers.map((bo) => (
                <div
                  key={bo.id}
                  className="bg-white border border-border rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-[11px] rounded border border-blue-200">
                        {bo.bank}
                      </span>
                      {bo.code && (
                        <button
                          type="button"
                          onClick={() => handleCopy(bo.code!)}
                          className="text-xs font-bold text-gray-600 hover:text-accent flex items-center gap-1"
                        >
                          <Copy size={13} /> {bo.code}
                        </button>
                      )}
                    </div>

                    <h3 className="font-extrabold text-sm text-primary pt-1">{bo.title}</h3>
                    <p className="text-xs text-muted leading-relaxed">{bo.description}</p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-gray-100 text-[11px] text-muted">
                    Min Cart Value: ₹{bo.minCartValue}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
