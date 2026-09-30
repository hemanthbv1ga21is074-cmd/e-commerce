import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, RotateCcw, Truck, Award } from 'lucide-react';
import { brandConfig } from '../../data/brand-config';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-border mt-16 pt-12 pb-24 md:pb-12 text-gray-600">
      <div className="container-app space-y-12">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-accent flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-primary uppercase">100% Original</h5>
              <p className="text-[11px] text-muted">Guarantee for all products</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-accent flex items-center justify-center flex-shrink-0">
              <RotateCcw size={20} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-primary uppercase">Return within 30 days</h5>
              <p className="text-[11px] text-muted">Of receiving your order</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-accent flex items-center justify-center flex-shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-primary uppercase">Free Shipping</h5>
              <p className="text-[11px] text-muted">On orders above ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-accent flex items-center justify-center flex-shrink-0">
              <Award size={20} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-primary uppercase">Top Fashion Brands</h5>
              <p className="text-[11px] text-muted">Curated trendy styles</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          {/* Column 1: Online Shopping */}
          <div className="space-y-3">
            <h4 className="font-bold text-primary uppercase tracking-wider text-[11px]">
              Online Shopping
            </h4>
            <ul className="space-y-2 text-gray-500">
              {brandConfig.footerLinks.online.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Customer Help */}
          <div className="space-y-3">
            <h4 className="font-bold text-primary uppercase tracking-wider text-[11px]">
              Customer Help
            </h4>
            <ul className="space-y-2 text-gray-500">
              {brandConfig.footerLinks.help.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div className="space-y-3">
            <h4 className="font-bold text-primary uppercase tracking-wider text-[11px]">
              Policies
            </h4>
            <ul className="space-y-2 text-gray-500">
              {brandConfig.footerLinks.policy.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith('#') ? (
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}
                      className="hover:text-primary transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link to={link.href} className="hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Experience & App */}
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-primary uppercase tracking-wider text-[11px] mb-2">
                About {brandConfig.name}
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                {brandConfig.name} is India's premier online shopping destination for clothing, footwear, and lifestyle essentials.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-primary uppercase text-[11px] mb-2">
                100% Secure Payments
              </h5>
              <div className="flex flex-wrap gap-2 text-[10px] font-bold text-gray-500">
                <span className="px-2 py-1 bg-white border border-border rounded">UPI</span>
                <span className="px-2 py-1 bg-white border border-border rounded">VISA</span>
                <span className="px-2 py-1 bg-white border border-border rounded">Mastercard</span>
                <span className="px-2 py-1 bg-white border border-border rounded">RuPay</span>
                <span className="px-2 py-1 bg-white border border-border rounded">NetBanking</span>
                <span className="px-2 py-1 bg-white border border-border rounded">COD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div>
            © {new Date().getFullYear()} {brandConfig.name}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Made with ❤️ for Indian Fashion</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
