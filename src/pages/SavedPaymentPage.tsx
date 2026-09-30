import React, { useState } from 'react';
import { SEO } from '../components/ui/SEO';
import { AccountSidebar } from '../components/account/AccountSidebar';
import { CreditCard, Trash2, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToastStore } from '../store/useToastStore';

interface SavedCard {
  id: string;
  bank: string;
  network: 'Visa' | 'MasterCard' | 'RuPay';
  last4: string;
  holder: string;
  expiry: string;
}

interface SavedUPI {
  id: string;
  vpa: string;
}

export const SavedPaymentPage: React.FC = () => {
  const { showToast } = useToastStore();

  const [cards, setCards] = useState<SavedCard[]>([
    {
      id: 'sc-1',
      bank: 'HDFC Bank',
      network: 'Visa',
      last4: '4242',
      holder: 'Rahul Sharma',
      expiry: '09/28',
    },
    {
      id: 'sc-2',
      bank: 'ICICI Bank',
      network: 'MasterCard',
      last4: '8819',
      holder: 'Rahul Sharma',
      expiry: '11/27',
    },
  ]);

  const [upis, setUpis] = useState<SavedUPI[]>([
    { id: 'upi-1', vpa: 'rahul.sharma@okhdfcbank' },
  ]);

  // Add Card Modal
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');

  // Add UPI Modal
  const [addUpiOpen, setAddUpiOpen] = useState(false);
  const [newVpa, setNewVpa] = useState('');

  const handleDeleteCard = (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
    showToast('Card removed from saved payment methods', 'info');
  };

  const handleDeleteUpi = (id: string) => {
    setUpis(upis.filter((u) => u.id !== id));
    showToast('UPI ID removed', 'info');
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardNumber.length < 16) return;

    setCards([
      ...cards,
      {
        id: `sc-${Date.now()}`,
        bank: 'State Bank of India',
        network: 'Visa',
        last4: newCardNumber.slice(-4),
        holder: newCardHolder || 'Cardholder',
        expiry: newCardExpiry || '12/29',
      },
    ]);
    setAddCardOpen(false);
    setNewCardNumber('');
    setNewCardHolder('');
    setNewCardExpiry('');
    showToast('New card saved securely!', 'success');
  };

  const handleAddUpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVpa.includes('@')) return;

    setUpis([...upis, { id: `upi-${Date.now()}`, vpa: newVpa }]);
    setAddUpiOpen(false);
    setNewVpa('');
    showToast('UPI ID added successfully!', 'success');
  };

  return (
    <div className="container-custom py-8">
      <SEO title="Saved Cards & UPI | StyleBazaar" />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AccountSidebar />

        <main className="flex-1 w-full space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-primary font-display">
              Saved Payment Methods
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Securely stored cards and UPI handles for lightning-fast 1-click checkout
            </p>
          </div>

          {/* Cards Section */}
          <div className="bg-white border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-accent" />
                <h2 className="font-bold text-sm text-primary">Saved Credit & Debit Cards</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddCardOpen(true)}
                icon={<Plus size={14} />}
                className="text-xs"
              >
                Add New Card
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white flex flex-col justify-between h-40 shadow-xs relative group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-xs text-primary">{c.bank}</span>
                      <span className="text-[10px] text-muted block">{c.network}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(c.id)}
                      className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                      aria-label="Delete card"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="font-mono text-sm font-bold tracking-widest text-primary">
                    •••• •••• •••• {c.last4}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted pt-2 border-t border-gray-100">
                    <span className="uppercase font-semibold">{c.holder}</span>
                    <span>Expires {c.expiry}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UPI Section */}
          <div className="bg-white border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-sm text-primary">Saved UPI Handles</h2>
                <p className="text-xs text-muted">Pay instantly via any UPI application</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddUpiOpen(true)}
                icon={<Plus size={14} />}
                className="text-xs"
              >
                Add UPI ID
              </Button>
            </div>

            <div className="space-y-3">
              {upis.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface/50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      UPI
                    </div>
                    <span className="font-mono text-xs font-semibold text-primary">{u.vpa}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Verified
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteUpi(u.id)}
                    className="text-gray-400 hover:text-rose-600 p-1"
                    aria-label="Delete UPI"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted justify-center pt-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>PCI-DSS compliant 256-bit SSL encryption. We never store CVV numbers.</span>
          </div>
        </main>
      </div>

      {/* Add Card Modal */}
      <Modal isOpen={addCardOpen} onClose={() => setAddCardOpen(false)} title="Add New Card">
        <form onSubmit={handleAddCard} className="space-y-4 py-2">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Card Number</label>
            <input
              type="text"
              maxLength={16}
              required
              placeholder="16-digit card number"
              value={newCardNumber}
              onChange={(e) => setNewCardNumber(e.target.value.replace(/\D/g, ''))}
              className="w-full border border-border rounded-lg px-3 py-2 text-xs font-mono text-primary outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Name on Card</label>
            <input
              type="text"
              required
              placeholder="Rahul Sharma"
              value={newCardHolder}
              onChange={(e) => setNewCardHolder(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-xs text-primary outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Expiry Date (MM/YY)</label>
            <input
              type="text"
              maxLength={5}
              required
              placeholder="12/28"
              value={newCardExpiry}
              onChange={(e) => setNewCardExpiry(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-xs font-mono text-primary outline-none focus:border-accent"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setAddCardOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" type="submit" disabled={newCardNumber.length < 16}>
              Save Card
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add UPI Modal */}
      <Modal isOpen={addUpiOpen} onClose={() => setAddUpiOpen(false)} title="Add UPI Handle">
        <form onSubmit={handleAddUpi} className="space-y-4 py-2">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Virtual Payment Address (VPA)</label>
            <input
              type="text"
              required
              placeholder="e.g. mobile@okhdfcbank"
              value={newVpa}
              onChange={(e) => setNewVpa(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-xs font-mono text-primary outline-none focus:border-accent"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setAddUpiOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" type="submit" disabled={!newVpa.includes('@')}>
              Save UPI
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
