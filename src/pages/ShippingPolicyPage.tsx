import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, ArrowLeft, Clock } from 'lucide-react';
import { SEO } from '../components/ui/SEO';
import { brandConfig } from '../data/brand-config';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface/30 py-10">
      <SEO
        title="Shipping, Delivery & Returns Policy — StyleBazaar"
        description="Delivery timelines, free shipping terms, Cash on Delivery details, and easy 30-day doorstep returns policy."
      />

      <div className="container-app max-w-4xl mx-auto space-y-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-accent transition-colors"
          >
            <ArrowLeft size={14} /> Back to Store
          </Link>
        </div>

        {/* Header Hero */}
        <div className="bg-white border border-border rounded-2xl p-8 shadow-xs space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-900 rounded-full text-xs font-bold">
            <Truck size={14} /> Pan-India Logistics
          </div>
          <h1 className="text-3xl font-black font-display text-primary tracking-tight">
            Shipping, Delivery & Returns Policy
          </h1>
          <p className="text-xs text-muted">
            Reliable doorstep delivery and seamless 30-day returns across 19,000+ pincodes in India.
          </p>
        </div>

        {/* Policy Body */}
        <div className="bg-white border border-border rounded-2xl p-8 shadow-xs space-y-8 text-xs text-gray-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Truck size={16} className="text-accent" />
              1. Delivery Timelines & Coverage
            </h2>
            <p>
              {brandConfig.name} delivers across all major Indian states and Union Territories through tier-1 courier partners including Blue Dart, Delhivery, and Xpressbees.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              <div className="p-4 bg-surface rounded-xl border border-border text-center space-y-1">
                <span className="font-bold text-primary block text-sm">Tier 1 Metros</span>
                <span className="text-muted text-[11px] block">Delhi NCR, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata</span>
                <span className="font-mono font-bold text-accent text-xs block mt-1">2 – 3 Business Days</span>
              </div>
              <div className="p-4 bg-surface rounded-xl border border-border text-center space-y-1">
                <span className="font-bold text-primary block text-sm">Tier 2 & 3 Cities</span>
                <span className="text-muted text-[11px] block">State capitals, industrial clusters, and major urban districts</span>
                <span className="font-mono font-bold text-accent text-xs block mt-1">3 – 5 Business Days</span>
              </div>
              <div className="p-4 bg-surface rounded-xl border border-border text-center space-y-1">
                <span className="font-bold text-primary block text-sm">Rest of India</span>
                <span className="text-muted text-[11px] block">Remote districts, North East, and island territories</span>
                <span className="font-mono font-bold text-accent text-xs block mt-1">5 – 7 Business Days</span>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              2. Shipping Charges & Free Delivery
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li>
                <strong>Free Shipping:</strong> All orders with a final cart value of <strong>₹999 and above</strong> qualify for 100% Free Shipping.
              </li>
              <li>
                <strong>Standard Shipping Fee:</strong> For orders below ₹999, a nominal delivery charge of <strong>₹99</strong> is added to cover logistics handling.
              </li>
              <li>
                <strong>No Hidden Surcharges:</strong> All taxes, handling fees, and fuel surcharges are included in the checkout price breakdown.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Clock size={16} className="text-blue-600" />
              3. Cash on Delivery (COD) Guidelines
            </h2>
            <p>
              To ensure customer peace of mind, Cash on Delivery is available across serviceable pin codes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li>Please keep the exact invoice cash amount ready upon arrival of the delivery agent.</li>
              <li>Most delivery executives also support instant UPI QR scan-and-pay at your doorstep.</li>
              <li>Pre-dispatch address confirmation may be performed for high-value orders to prevent delivery rejections.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <RotateCcw size={16} className="text-rose-600" />
              4. 30-Day Doorstep Returns & Exchanges
            </h2>
            <p>
              We want you to love what you wear. If the size doesn't fit or you change your mind:
            </p>
            <div className="space-y-2 text-gray-600">
              <p>
                <strong>Initiate Online:</strong> Go to <Link to="/account/orders" className="text-accent underline font-bold">My Orders</Link>, select the item, and choose "Return" or "Exchange Size".
              </p>
              <p>
                <strong>Free Doorstep Pickup:</strong> Our courier will schedule a free doorstep pickup within 48 hours. Please ensure original brand tags, barcodes, and packaging are intact.
              </p>
              <p>
                <strong>Instant Refund:</strong> Upon successful pickup verification, refunds are credited instantly to your StyleBazaar Wallet, or disbursed to your bank account within 3–5 working days.
              </p>
            </div>
          </section>

          {/* Section 5: Help & Inquiries */}
          <section className="space-y-2 bg-surface/50 p-5 rounded-xl border border-border">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Need Logistics Assistance?</h2>
            <p className="text-gray-600">
              Track your package live on the <Link to="/account/orders" className="text-accent underline font-bold">Orders Tracking Portal</Link> or contact our customer support team:
            </p>
            <p className="font-mono text-[11px] text-gray-800">
              Email: <strong>shipping@stylebazaar.com</strong> | Toll-Free: <strong>1800-123-4567</strong> (Open 24x7)
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
