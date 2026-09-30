import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, X, Settings2 } from 'lucide-react';
import { Button } from '../ui/Button';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'sb_cookie_consent';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Delay slightly for smooth entrance
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      } else {
        const parsed: CookiePreferences = JSON.parse(stored);
        setAnalyticsEnabled(parsed.analytics);
        setMarketingEnabled(parsed.marketing);
      }
    } catch {
      setIsVisible(true);
    }

    // Listen for custom trigger to reopen cookie settings
    const handleReopen = () => {
      setShowPreferencesModal(true);
    };
    window.addEventListener('open-cookie-settings', handleReopen);
    return () => window.removeEventListener('open-cookie-settings', handleReopen);
  }, []);

  const saveConsent = (preferences: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Storage unavailable fallback
    }
    setIsVisible(false);
    setShowPreferencesModal(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    });
  };

  const handleSaveCustom = () => {
    saveConsent({
      necessary: true,
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
      timestamp: Date.now(),
    });
  };

  if (!isVisible && !showPreferencesModal) return null;

  return (
    <>
      {/* Floating Bottom Banner */}
      {isVisible && !showPreferencesModal && (
        <aside
          role="region"
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-50 animate-slide-up"
        >
          <div className="bg-primary/95 text-white backdrop-blur-md border border-gray-700/60 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                <Cookie size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-1.5">
                  Cookie & Privacy Consent
                </h3>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  We use cookies and secure local storage to remember your bag, authenticate your session, and improve site performance. Compliant with India's DPDP Act 2023. Read our{' '}
                  <Link to="/privacy" className="text-accent underline font-semibold hover:text-white">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowPreferencesModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-white transition-colors"
              >
                <Settings2 size={13} /> Manage Choices
              </button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectNonEssential}
                  className="text-xs text-gray-300 border-gray-600 hover:bg-white/10 hover:text-white"
                >
                  Essential Only
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={handleAcceptAll}
                  className="text-xs font-bold shadow-md"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Preferences Modal */}
      {showPreferencesModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-xs text-gray-700">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Cookie size={18} className="text-accent" />
                <h3 id="cookie-modal-title" className="text-sm font-bold text-primary">Customize Cookie Preferences</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferencesModal(false)}
                className="text-gray-400 hover:text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-[11px] text-muted">
              Choose which category of cookies you allow us to store on your device. You may change these settings at any time.
            </p>

            <div className="space-y-4">
              {/* Category 1: Strictly Necessary */}
              <div className="p-3.5 bg-surface rounded-xl border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" /> Strictly Necessary Cookies
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Always Active
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Required for user authentication, session security, shopping bag persistence, and checkout.
                </p>
              </div>

              {/* Category 2: Analytics Cookies */}
              <div className="p-3.5 bg-white rounded-xl border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">Performance & Analytics</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
                <p className="text-[11px] text-gray-500">
                  Allows us to count visits and traffic sources so we can measure and improve website responsiveness.
                </p>
              </div>

              {/* Category 3: Marketing Cookies */}
              <div className="p-3.5 bg-white rounded-xl border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">Marketing & Personalization</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marketingEnabled}
                      onChange={(e) => setMarketingEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
                <p className="text-[11px] text-gray-500">
                  Used to deliver relevant fashion collections and discounts tailored to your browsing preferences.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectNonEssential}
                className="text-xs"
              >
                Reject All Non-Essential
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleSaveCustom}
                className="text-xs font-bold"
              >
                Save My Choices
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
