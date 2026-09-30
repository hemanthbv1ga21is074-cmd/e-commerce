import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, Gift, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { formatPrice } from '../../utils/price';
import { apiGetWallet, apiTopUpWallet, apiRedeemGiftCard } from '../../services/api/wallet';

export const WalletCard: React.FC = () => {
  const { user, addWalletBalance } = useAuthStore();
  const [addingAmount, setAddingAmount] = useState<number | null>(null);

  // Gift card state
  const [gcCode, setGcCode] = useState('');
  const [gcPin, setGcPin] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [gcSuccess, setGcSuccess] = useState<string | null>(null);
  const [gcError, setGcError] = useState<string | null>(null);

  // Sync with API on mount if user is logged in
  useEffect(() => {
    if (user?.id) {
      apiGetWallet()
        .then((data) => {
          if (data && data.balance !== undefined && data.balance !== user.walletBalance) {
            // Update auth store with server balance
            useAuthStore.setState((state) => ({
              user: state.user ? { ...state.user, walletBalance: data.balance } : null,
            }));
          }
        })
        .catch(() => {});
    }
  }, [user?.id, user?.walletBalance]);

  const handleTopUp = async (amount: number) => {
    setAddingAmount(amount);
    try {
      const res = await apiTopUpWallet(amount);
      addWalletBalance(amount, `Quick Recharge (+${formatPrice(amount)})`);
      if (res && res.balance !== undefined) {
        useAuthStore.setState((state) => ({
          user: state.user ? { ...state.user, walletBalance: res.balance } : null,
        }));
      }
    } catch {
      // Local fallback
      addWalletBalance(amount, `Quick Recharge (+${formatPrice(amount)})`);
    } finally {
      setAddingAmount(null);
    }
  };

  const handleRedeemGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gcCode.trim() || !gcPin.trim()) {
      setGcError('Please enter both gift card code and PIN.');
      return;
    }

    setRedeeming(true);
    setGcError(null);
    setGcSuccess(null);

    try {
      const res = await apiRedeemGiftCard(gcCode, gcPin);
      addWalletBalance(
        res.redeemedAmount,
        `Gift Card Redeemed (${gcCode.toUpperCase().trim()})`
      );
      if (res.newWalletBalance !== undefined) {
        useAuthStore.setState((state) => ({
          user: state.user ? { ...state.user, walletBalance: res.newWalletBalance } : null,
        }));
      }
      setGcSuccess(res.message);
      setGcCode('');
      setGcPin('');
    } catch (err: any) {
      setGcError(err.message || 'Failed to redeem gift card.');
    } finally {
      setRedeeming(false);
    }
  };

  const transactions = user?.walletTransactions || [];

  return (
    <div className="space-y-6">
      {/* Wallet Balance Hero Card */}
      <div className="bg-gradient-to-br from-primary via-gray-900 to-primary text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-accent">
              <Wallet size={20} />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-widest text-gray-300 font-bold block">
                StyleBazaar Wallet & Credits
              </span>
              <span className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">
                {formatPrice(user?.walletBalance || 0)}
              </span>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Status</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={14} /> Active & 100% Usable
            </span>
          </div>
        </div>

        {/* Quick Top-up Simulation */}
        <div className="pt-4 border-t border-white/10 relative z-10 flex flex-wrap items-center gap-2.5">
          <span className="text-xs text-gray-300 font-medium mr-1">Simulate Top-up:</span>
          {[200, 500, 1000].map((amt) => (
            <button
              key={amt}
              type="button"
              disabled={addingAmount !== null}
              onClick={() => handleTopUp(amt)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all hover:scale-105 disabled:opacity-50"
            >
              {addingAmount === amt ? 'Adding...' : `+${formatPrice(amt)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Gift Card Redemption Section */}
      <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Gift size={18} className="text-accent" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Redeem a Gift Card
          </h4>
        </div>
        <p className="text-xs text-muted">
          Have a StyleBazaar Gift Card voucher? Enter your 16-digit card code and 4-digit PIN below to instantly credit your wallet balance.
        </p>

        {gcSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
            <Check size={16} className="text-emerald-600 flex-shrink-0" />
            <span>{gcSuccess}</span>
          </div>
        )}

        {gcError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <span>{gcError}</span>
          </div>
        )}

        <form onSubmit={handleRedeemGiftCard} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6 space-y-1">
            <label className="text-[11px] font-bold text-gray-600 uppercase">Card Code</label>
            <input
              type="text"
              placeholder="e.g. SBGIFT500"
              value={gcCode}
              onChange={(e) => setGcCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-xs border border-border rounded-lg uppercase tracking-wider font-mono focus:outline-none focus:border-accent"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-[11px] font-bold text-gray-600 uppercase">PIN</label>
            <input
              type="password"
              placeholder="4-digit PIN"
              maxLength={4}
              value={gcPin}
              onChange={(e) => setGcPin(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-border rounded-lg tracking-widest font-mono focus:outline-none focus:border-accent text-center"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={redeeming || !gcCode || !gcPin}
              className="w-full py-2 px-4 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 h-[34px]"
            >
              {redeeming ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>{redeeming ? 'Redeeming...' : 'Apply to Wallet'}</span>
            </button>
          </div>
        </form>

        <div className="text-[11px] text-gray-400 bg-surface/50 p-2.5 rounded-lg border border-border/50">
          <span className="font-semibold text-gray-600">Demo Gift Cards for Testing: </span>
          <code className="text-accent font-mono font-bold">SBGIFT500</code> (PIN: <code className="font-mono">1234</code>, ₹500), <code className="text-accent font-mono font-bold">SBGIFT1000</code> (PIN: <code className="font-mono">5678</code>, ₹1,000).
        </div>
      </div>

      {/* Transactions History Ledger */}
      <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
          Transaction History
        </h4>

        {transactions.length === 0 ? (
          <p className="text-xs text-muted py-6 text-center">No wallet transactions yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'credit'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {tx.type === 'credit' ? (
                      <ArrowDownLeft size={16} />
                    ) : (
                      <ArrowUpRight size={16} />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-primary block">{tx.description}</span>
                    <span className="text-[10px] text-muted">
                      {new Date(tx.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div
                  className={`font-bold font-mono text-sm ${
                    tx.type === 'credit' ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {tx.type === 'credit' ? '+' : '-'}
                  {formatPrice(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
