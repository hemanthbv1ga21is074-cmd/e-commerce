import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { brandConfig } from '../../data/brand-config';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setSubscribed(true);
    }
  };

  return (
    <section className="my-16 bg-primary text-primary-contrast rounded-2xl p-6 sm:p-10 md:p-12 relative overflow-hidden shadow-xl">
      <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto text-center space-y-4 relative z-10">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto text-accent">
          <Mail size={24} />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
          Unlock ₹100 Off Your First Order
        </h2>

        <p className="text-sm text-gray-300 max-w-lg mx-auto">
          Subscribe to the {brandConfig.name} newsletter for exclusive previews, VIP secret sales, and fresh trend drops.
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-lg text-xs font-semibold animate-fade-in">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Success! Use coupon code <strong>WELCOME100</strong> at checkout.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-xs bg-white text-primary placeholder-gray-400 outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-accent hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>Subscribe</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        <div className="text-[10px] text-gray-400">
          No spam ever. Unsubscribe anytime with a single click.
        </div>
      </div>
    </section>
  );
};
