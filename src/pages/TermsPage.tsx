import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Scale, ArrowLeft } from 'lucide-react';
import { SEO } from '../components/ui/SEO';
import { brandConfig } from '../data/brand-config';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface/30 py-10">
      <SEO
        title="Terms of Use & Conditions — StyleBazaar"
        description="Official Terms of Use and service agreement for StyleBazaar shopping platform. Compliant with Consumer Protection (E-Commerce) Rules and IT Act."
      />

      <div className="container-app max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-accent rounded-full text-xs font-bold">
            <Scale size={14} /> Legal Agreement
          </div>
          <h1 className="text-3xl font-black font-display text-primary tracking-tight">
            Terms of Use & Conditions
          </h1>
          <p className="text-xs text-muted">
            Last Updated: January 2026 | Effective Date: Immediately upon access or account registration.
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            Welcome to {brandConfig.name}, operated by <strong>StyleBazaar Retail Fashion India Pvt. Ltd.</strong> ("Company", "we", "us", or "our"). These Terms of Use constitute a legally binding electronic agreement between you ("User", "Customer", or "You") and the Company under the Indian Contract Act, 1872, the Information Technology Act, 2000, and the Consumer Protection (E-Commerce) Rules, 2020.
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-white border border-border rounded-2xl p-8 shadow-xs space-y-8 text-xs text-gray-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-surface text-primary flex items-center justify-center font-mono text-xs">1</span>
              User Eligibility & Account Security
            </h2>
            <p>
              By accessing or using {brandConfig.name}, you represent that you are at least 18 years of age or possess legal parental/guardian consent, and are fully capable and competent to enter into the terms, conditions, obligations, and representations set forth herein.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials, login passwords, and session tokens. Any activity occurring under your account is your sole responsibility. You agree to notify us immediately of any unauthorized use or security breach.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-surface text-primary flex items-center justify-center font-mono text-xs">2</span>
              Catalog Accuracy, Pricing & Integer Currency Computation
            </h2>
            <p>
              All prices displayed on {brandConfig.name} are listed in Indian Rupees (INR) and are inclusive of Goods and Services Tax (GST) unless explicitly stated otherwise. All monetary calculations, coupon deductions, delivery charges, and wallet transactions are processed strictly on server-side systems using exact integer paise arithmetic to eliminate floating-point discrepancies.
            </p>
            <p>
              While we make every effort to display garment colors, fits, and fabrics accurately, variations may occur due to monitor calibration or manufacturing tolerances. In the event of a pricing error caused by technical glitches, we reserve the right to cancel affected orders prior to dispatch with an immediate full refund.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-surface text-primary flex items-center justify-center font-mono text-xs">3</span>
              Orders, Payment & Cash on Delivery (COD)
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Order Placement:</strong> When you place an order, you will receive an automated confirmation email and SMS containing your unique Order ID.
              </li>
              <li>
                <strong>Cash on Delivery (COD):</strong> For COD orders, payment must be handed over in cash or through courier UPI QR to the authorized delivery personnel upon physical delivery.
              </li>
              <li>
                <strong>Free Shipping Threshold:</strong> Orders with a net cart value of ₹999 or above qualify for Free Standard Delivery. Orders below ₹999 incur a nominal delivery charge of ₹99.
              </li>
              <li>
                <strong>Order Cancellation:</strong> You may cancel any order free of charge prior to its status being updated to "Shipped" directly through your Account Orders dashboard.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-surface text-primary flex items-center justify-center font-mono text-xs">4</span>
              30-Day Returns, Exchanges & Refund Policy
            </h2>
            <p>
              We provide a hassle-free <strong>30-Day Return & Exchange Window</strong> for unwashed, unworn merchandise retaining all original brand tags and packaging.
            </p>
            <p>
              Once a reverse pickup is completed and passes quality inspection at our fulfillment facility, refunds are disbursed within 24–48 hours to your StyleBazaar Wallet or original payment method. Certain items such as innerwear, masks, or personalized garments are non-returnable due to hygiene regulations.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-surface text-primary flex items-center justify-center font-mono text-xs">5</span>
              StyleBazaar Wallet & Loyalty Points
            </h2>
            <p>
              StyleBazaar Wallet credits and Insider loyalty points are promotional instruments issued at our discretion. Wallet credits may be redeemed against eligible purchases on {brandConfig.name}. Wallet credits cannot be transferred to third-party bank accounts unless derived from cash returns, and loyalty points hold no independent fiat currency value.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-surface text-primary flex items-center justify-center font-mono text-xs">6</span>
              Intellectual Property Rights
            </h2>
            <p>
              All trademarks, logos, photographs, graphics, product descriptions, website designs, audio clips, and software code on {brandConfig.name} are the exclusive intellectual property of StyleBazaar Retail Fashion India Pvt. Ltd. or its licensed partners. Any unauthorized copying, framing, scraping, or commercial exploitation is strictly prohibited under the Copyright Act, 1957.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-surface text-primary flex items-center justify-center font-mono text-xs">7</span>
              Governing Law & Dispute Resolution
            </h2>
            <p>
              These Terms shall be interpreted and governed in accordance with the laws of the Republic of India. Any dispute, claim, or controversy arising out of or relating to your use of this platform shall be subject to the exclusive jurisdiction of the competent courts situated in <strong>Bengaluru, Karnataka, India</strong>.
            </p>
          </section>

          {/* Section 8: Grievance Officer */}
          <section className="space-y-3 bg-surface/50 p-5 rounded-xl border border-border">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              Statutory Grievance Redressal Officer
            </h2>
            <p>
              In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, the name and contact details of the designated Grievance Officer are provided below:
            </p>
            <div className="space-y-1 font-mono text-[11px] text-gray-800">
              <p><strong>Designation:</strong> Nodal Grievance Officer</p>
              <p><strong>Entity:</strong> StyleBazaar Retail Fashion India Pvt. Ltd.</p>
              <p><strong>Address:</strong> Plot No. 45/A, Indiranagar 100ft Road, Bengaluru, Karnataka - 560038</p>
              <p><strong>Email:</strong> grievance@stylebazaar.com | support@stylebazaar.com</p>
              <p><strong>Toll-Free Phone:</strong> 1800-123-4567 (10:00 AM – 6:00 PM IST, Mon–Fri)</p>
              <p className="text-[10px] text-muted font-sans mt-2">
                * Complaints will be acknowledged within 48 hours and resolved within 30 days of receipt.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
