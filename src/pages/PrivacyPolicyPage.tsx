import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Eye, ShieldCheck, MapPin, Cookie, ArrowLeft, UserCheck } from 'lucide-react';
import { SEO } from '../components/ui/SEO';
import { brandConfig } from '../data/brand-config';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface/30 py-10">
      <SEO
        title="Privacy Policy & Data Protection — StyleBazaar"
        description="Learn how StyleBazaar protects your personal data under the Digital Personal Data Protection Act (DPDP), IT Act, and global privacy standards."
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold">
            <Lock size={14} /> DPDP Act 2023 & GDPR Compliant
          </div>
          <h1 className="text-3xl font-black font-display text-primary tracking-tight">
            Privacy & Data Protection Policy
          </h1>
          <p className="text-xs text-muted">
            Last Revised: January 2026 | StyleBazaar Retail Fashion India Pvt. Ltd.
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your privacy and digital safety are paramount to us. This Privacy Policy describes how {brandConfig.name} ("StyleBazaar", "we", "us", or "our") collects, processes, secures, and discloses your personal data when you interact with our website, mobile interface, or customer services.
          </p>
        </div>

        {/* Policy Content */}
        <div className="bg-white border border-border rounded-2xl p-8 shadow-xs space-y-8 text-xs text-gray-700 leading-relaxed">
          {/* Section 1: Data We Collect */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Eye size={16} className="text-accent" />
              1. Information We Collect
            </h2>
            <p>We collect only the minimum personal data strictly necessary to provide an optimal shopping experience:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="p-3 bg-surface rounded-lg border border-border space-y-1">
                <span className="font-bold text-primary block">Identity & Contact Data</span>
                <span className="text-gray-600">Full name, email address, mobile phone number, delivery addresses, and login credentials.</span>
              </div>
              <div className="p-3 bg-surface rounded-lg border border-border space-y-1">
                <span className="font-bold text-primary block">Transaction & Financial Data</span>
                <span className="text-gray-600">Order history, items purchased, invoice records, and StyleBazaar Wallet ledger balances.</span>
              </div>
              <div className="p-3 bg-surface rounded-lg border border-border space-y-1">
                <span className="font-bold text-primary block">Technical & Device Data</span>
                <span className="text-gray-600">IP address, browser type, operating system, and encrypted session security cookies.</span>
              </div>
              <div className="p-3 bg-surface rounded-lg border border-border space-y-1">
                <span className="font-bold text-primary block">Geolocation Data (Opt-In Only)</span>
                <span className="text-gray-600">Coarse or precise location only when affirmatively enabled by you for live delivery tracking.</span>
              </div>
            </div>
          </section>

          {/* Section 2: Live Location Tracking Consent */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <MapPin size={16} className="text-rose-600" />
              2. Live Location Tracking & Geolocation Consent
            </h2>
            <p>
              Under the Digital Personal Data Protection Act, 2023, access to your device location requires explicit, informed, and affirmative user consent.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li>
                <strong>Purpose of Location Access:</strong> We use your location solely to (i) show real-time courier delivery progress on live interactive maps, (ii) auto-populate your delivery pin code during checkout, and (iii) route orders to the closest regional distribution hub.
              </li>
              <li>
                <strong>Zero Continuous Background Polling:</strong> We never track your location when the browser is closed or when an active delivery tracking session is not open.
              </li>
              <li>
                <strong>Consent Revocation:</strong> You can withdraw location permission at any time through your browser settings or via your Account Notification Settings.
              </li>
            </ul>
          </section>

          {/* Section 3: Cookies and Tracking */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Cookie size={16} className="text-amber-600" />
              3. Cookies & Tracking Technologies
            </h2>
            <p>
              Cookies are small data files placed on your device to maintain session states and security.
            </p>
            <div className="space-y-2 mt-2">
              <p>
                <strong>Strictly Necessary Cookies:</strong> Required for cart persistence, CSRF protection, and secure JWT authentication. These cannot be disabled.
              </p>
              <p>
                <strong>Analytics & Performance Cookies:</strong> Measure site traffic, page speed, and navigation trends in an anonymized aggregate format to improve interface responsiveness.
              </p>
              <p>
                <strong>Marketing Cookies:</strong> Used to display relevant fashion recommendations and sale announcements. You may opt out anytime via our Cookie Preferences manager.
              </p>
            </div>
          </section>

          {/* Section 4: Lawful Purpose & Data Sharing */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              4. How We Use and Share Your Data
            </h2>
            <p>
              We do not sell, rent, or trade your personal information to third parties. We share data only with verified partners under strict data processing agreements:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li>
                <strong>Logistics & Courier Partners:</strong> Delivering your shipments, dispatch notifications, and doorstep returns (e.g., Blue Dart, Delhivery).
              </li>
              <li>
                <strong>Legal Authorities:</strong> Solely when mandatory under applicable Indian laws, court orders, or law enforcement warrants.
              </li>
              <li>
                <strong>Cloud Hosting Infrastructure:</strong> Secure, encrypted server clusters hosted within Indian data center jurisdictions.
              </li>
            </ul>
          </section>

          {/* Section 5: Your Rights Under the DPDP Act */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <UserCheck size={16} className="text-blue-600" />
              5. Your Rights as a Data Principal
            </h2>
            <p>As a user of {brandConfig.name}, you have comprehensive legal rights regarding your data:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li><strong>Right to Access:</strong> View a summary of all personal data held and processed by us.</li>
              <li><strong>Right to Correction:</strong> Update inaccurate, incomplete, or outdated profile information in real time.</li>
              <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request full deletion of your account and personal history, subject to statutory tax retention periods.</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw your consent for non-essential communications or location tracking with immediate effect.</li>
              <li><strong>Right of Grievance Redressal:</strong> Submit inquiries or grievances directly to our Data Protection Officer.</li>
            </ul>
          </section>

          {/* Section 6: Data Security Safeguards */}
          <section className="space-y-3 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Lock size={16} className="text-primary" />
              6. Security Safeguards & Encryption
            </h2>
            <p>
              We implement industry defense-in-depth protocols:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>All web traffic is encrypted in transit using TLS 1.3 encryption.</li>
              <li>User passwords are protected with salted <strong>bcrypt (work factor 12)</strong> cryptographic hashing.</li>
              <li>JWT session tokens are signed with 256-bit cryptographic keys and stored in httpOnly, SameSite cookies.</li>
              <li>Comprehensive rate-limiting guards against brute-force attacks and automated scrapers.</li>
            </ul>
          </section>

          {/* Section 7: Grievance Officer */}
          <section className="space-y-3 bg-surface/50 p-5 rounded-xl border border-border">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              Data Protection & Grievance Officer
            </h2>
            <p>
              For privacy-related inquiries, data access requests, or to exercise your rights under the Digital Personal Data Protection Act 2023, please reach out to our designated officer:
            </p>
            <div className="space-y-1 font-mono text-[11px] text-gray-800">
              <p><strong>Designation:</strong> Data Protection & Grievance Officer</p>
              <p><strong>Entity:</strong> StyleBazaar Retail Fashion India Pvt. Ltd.</p>
              <p><strong>Registered Office:</strong> Plot No. 45/A, Indiranagar 100ft Road, Bengaluru, Karnataka - 560038</p>
              <p><strong>Direct Privacy Email:</strong> privacy@stylebazaar.com | grievance@stylebazaar.com</p>
              <p><strong>Timeline:</strong> Acknowledgement within 48 business hours; complete resolution within 30 days.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
