import React, { useState } from 'react';
import { SEO } from '../components/ui/SEO';
import { AccountSidebar } from '../components/account/AccountSidebar';
import { Gift, CheckCircle2, Copy, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { useConfig } from '../context/ConfigContext';

export const GiftCardsPage: React.FC = () => {
  const { user, addWalletBalance } = useAuthStore();
  const { showToast } = useToastStore();
  const { config } = useConfig();

  // Buy Gift Card State
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [buySuccess, setBuySuccess] = useState(false);

  // Redeem Gift Card State
  const [cardCode, setCardCode] = useState('');
  const [cardPin, setCardPin] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const amounts = [500, 1000, 2000, 5000];

  const handleBuyGiftCard = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = customAmount ? parseInt(customAmount, 10) : selectedAmount;
    if (!amount || amount < 100) return;

    setBuySuccess(true);
    showToast(`Gift card of ₹${amount} sent to ${recipientEmail}!`, 'success');
  };

  const handleRedeemGiftCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardCode.trim() || cardPin.length !== 4) {
      setRedeemError('Please enter a valid gift card code and 4-digit PIN');
      return;
    }

    // Mock redeem: gives ₹1000 to user wallet
    addWalletBalance(1000, `Redeemed Gift Card (${cardCode.slice(-4)})`);
    setRedeemSuccess(true);
    setRedeemError(null);
    showToast('₹1,000 gift card successfully credited to your Wallet!', 'success');
  };

  return (
    <div className="container-custom py-8">
      <SEO title="Gift Cards — Buy & Redeem | StyleBazaar" />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Persistent Account Navigation Sidebar */}
        <AccountSidebar />

        {/* Main Content Area */}
        <main className="flex-1 w-full space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-primary font-display">
                StyleBazaar Gift Cards
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-accent px-2.5 py-0.5 rounded-full border border-rose-200">
                <Sparkles size={12} /> Instant Delivery
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Gift the joy of fashion or redeem your StyleBazaar card code into wallet credits
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Redeem Gift Card Card */}
            <div className="bg-white border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-primary">Redeem Gift Card</h2>
                  <p className="text-xs text-muted">Add gift balance directly to your Wallet</p>
                </div>
              </div>

              {redeemSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                  <CheckCircle2 size={28} className="text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-sm text-emerald-900">Card Redeemed Successfully!</h3>
                  <p className="text-xs text-emerald-700">
                    ₹1,000 has been added to your StyleBazaar Wallet. Current Balance: ₹{user?.walletBalance.toLocaleString('en-IN')}.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRedeemSuccess(false);
                      setCardCode('');
                      setCardPin('');
                    }}
                    className="mt-2 text-xs"
                  >
                    Redeem Another Card
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRedeemGiftCard} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      16-Digit Card Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SBZR-4921-8830-1092"
                      value={cardCode}
                      onChange={(e) => setCardCode(e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2 text-xs font-mono tracking-wider text-primary outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      4-Digit Card PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      placeholder="••••"
                      value={cardPin}
                      onChange={(e) => setCardPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-border rounded-lg px-3 py-2 text-xs font-mono tracking-widest text-primary outline-none focus:border-accent"
                    />
                  </div>

                  {redeemError && <p className="text-xs text-rose-600">{redeemError}</p>}

                  <div className="bg-surface p-3 rounded-lg flex items-center justify-between text-[11px] text-muted">
                    <span>Demo Voucher:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCardCode('SBZR-2026-FASH-ION1');
                        setCardPin('9921');
                      }}
                      className="text-accent font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Copy size={12} /> Auto-fill Demo Card
                    </button>
                  </div>

                  <Button variant="accent" type="submit" className="w-full font-bold text-xs uppercase tracking-wider">
                    Apply to Wallet
                  </Button>
                </form>
              )}
            </div>

            {/* 2. Buy Gift Card Card — only shown when online payments are enabled */}
            {config.onlinePaymentsEnabled ? (
              <div className="bg-white border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-accent flex items-center justify-center flex-shrink-0">
                    <Gift size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-primary">Buy e-Gift Card</h2>
                    <p className="text-xs text-muted">Instant delivery via email with custom message</p>
                  </div>
                </div>

                {buySuccess ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center space-y-2">
                    <CheckCircle2 size={28} className="text-accent mx-auto" />
                    <h3 className="font-bold text-sm text-primary">Gift Card Sent!</h3>
                    <p className="text-xs text-muted">
                      We have emailed the e-Gift card voucher code to <span className="font-bold text-primary">{recipientEmail}</span>.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => { setBuySuccess(false); setRecipientEmail(''); setRecipientName(''); setGiftMessage(''); }} className="mt-2 text-xs">
                      Buy Another Card
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleBuyGiftCard} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-2">Select Denomination (₹)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {amounts.map((amt) => (
                          <button key={amt} type="button" onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }} className={`py-2 text-xs font-bold rounded-lg border transition-all ${ selectedAmount === amt && !customAmount ? 'border-accent bg-rose-50 text-accent' : 'border-border text-gray-700 hover:border-gray-400' }`}>₹{amt}</button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs font-bold text-gray-700 block mb-1">Recipient Name</label><input type="text" required placeholder="e.g. Priya" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-xs text-primary outline-none focus:border-accent" /></div>
                      <div><label className="text-xs font-bold text-gray-700 block mb-1">Recipient Email</label><input type="email" required placeholder="priya@example.com" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-xs text-primary outline-none focus:border-accent" /></div>
                    </div>
                    <div><label className="text-xs font-bold text-gray-700 block mb-1">Personal Message (Optional)</label><textarea rows={2} placeholder="Wishing you a fabulous shopping spree! 🎉" value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-xs text-primary outline-none focus:border-accent resize-none" /></div>
                    <Button variant="primary" type="submit" className="w-full font-bold text-xs uppercase tracking-wider">Purchase e-Gift Card</Button>
                  </form>
                )}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Gift size={22} className="text-gray-400" />
                </div>
                <h2 className="font-bold text-sm text-primary">Buy e-Gift Card</h2>
                <p className="text-xs text-muted max-w-[220px] leading-relaxed">
                  Gift card purchase will be available once online payments are enabled.
                </p>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  Coming Soon
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted pt-2 justify-center">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Valid for 1 year from issuance across all products on StyleBazaar.</span>
          </div>
        </main>
      </div>
    </div>
  );
};
