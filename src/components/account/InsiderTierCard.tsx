import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Check, History } from 'lucide-react';
import type { User } from '../../types';
import { apiGetLoyalty, type LoyaltyData } from '../../services/api/loyalty';
import { useAuthStore } from '../../store/useAuthStore';

interface InsiderTierCardProps {
  user: User | null;
}

export const InsiderTierCard: React.FC<InsiderTierCardProps> = ({ user }) => {
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);

  useEffect(() => {
    if (user?.id) {
      apiGetLoyalty()
        .then((data) => {
          if (data) {
            setLoyalty(data);
            if (data.points !== user.loyaltyPoints || data.tier !== user.loyaltyTier) {
              useAuthStore.setState((state) => ({
                user: state.user
                  ? { ...state.user, loyaltyPoints: data.points, loyaltyTier: data.tier }
                  : null,
              }));
            }
          }
        })
        .catch(() => {});
    }
  }, [user?.id, user?.loyaltyPoints, user?.loyaltyTier]);

  const currentTier = loyalty?.tier || user?.loyaltyTier || 'Silver';
  const points = loyalty?.points ?? user?.loyaltyPoints ?? 0;
  const rupeeValue = loyalty?.worthInRupees ?? Math.floor(points / 10);
  const nextTier = loyalty?.nextTier || (currentTier === 'Platinum' ? 'VIP Elite' : 'Platinum');
  const progressPercent = loyalty?.progressPercent ?? (currentTier === 'Platinum' ? 100 : 70);
  const transactions = loyalty?.transactions || [];

  const perks = [
    { title: 'Early Access to Flash & Festive Sales', silver: true, gold: true, platinum: true },
    { title: 'Zero Convenience / Free Shipping on All Orders', silver: false, gold: true, platinum: true },
    { title: 'Extra 10% Off Insider Coupon every month', silver: false, gold: true, platinum: true },
    { title: 'Exclusive Birthday Surprise Gift Voucher', silver: false, gold: false, platinum: true },
    { title: 'Dedicated Priority Customer Care Concierge', silver: false, gold: false, platinum: true },
  ];

  return (
    <div className="space-y-6">
      {/* Tier Hero Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner">
              <Crown size={26} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-100 block">
                StyleBazaar Insider Program
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
                {currentTier} Member
              </h2>
            </div>
          </div>

          <div className="text-right bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-amber-100 block">Points Balance</span>
            <span className="text-lg font-black text-white">{points.toLocaleString('en-IN')} Pts</span>
            <span className="text-[10px] text-amber-100 block font-medium">Worth ₹{rupeeValue}</span>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="pt-2 relative z-10 space-y-1.5">
          <div className="flex justify-between text-xs text-amber-100 font-semibold">
            <span>Current: {currentTier}</span>
            <span>Next Tier: {nextTier}</span>
          </div>
          <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-amber-100">
            Earn 10 points for every ₹100 spent. Redeem points directly for instant cart discounts (10 pts = ₹1).
          </p>
        </div>
      </div>

      {/* Perks Comparison Table */}
      <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          Insider Privileges & Benefits
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-muted uppercase text-[10px]">
                <th className="py-2.5 font-bold">Privilege</th>
                <th className="py-2.5 text-center font-bold">Silver</th>
                <th className="py-2.5 text-center font-bold text-amber-600">Gold</th>
                <th className="py-2.5 text-center font-bold text-primary">Platinum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {perks.map((perk, i) => (
                <tr key={i} className="hover:bg-surface/50">
                  <td className="py-3 pr-2 text-gray-800 font-medium">{perk.title}</td>
                  <td className="py-3 text-center">
                    {perk.silver ? <Check size={16} className="text-emerald-600 mx-auto" /> : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="py-3 text-center">
                    {perk.gold ? <Check size={16} className="text-emerald-600 mx-auto" /> : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="py-3 text-center">
                    {perk.platinum ? <Check size={16} className="text-emerald-600 mx-auto" /> : <span className="text-gray-300">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Points History Ledger if transactions exist */}
      {transactions.length > 0 && (
        <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <History size={16} className="text-accent" />
            Loyalty Points Ledger
          </h4>

          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-primary block">{tx.description}</span>
                  <span className="text-[10px] text-muted">
                    {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div
                  className={`font-bold font-mono text-sm ${
                    tx.points > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {tx.points > 0 ? `+${tx.points}` : tx.points} Pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
