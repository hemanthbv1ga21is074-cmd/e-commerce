import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Navigation, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface LiveTrackingConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsentGranted: (coords?: { latitude: number; longitude: number }) => void;
  onConsentDenied?: () => void;
}

const LOCATION_CONSENT_KEY = 'sb_location_tracking_consent';

export const LiveTrackingConsentModal: React.FC<LiveTrackingConsentModalProps> = ({
  isOpen,
  onClose,
  onConsentGranted,
  onConsentDenied,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGrantConsent = () => {
    setIsLocating(true);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser. Please enter your location manually.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        try {
          localStorage.setItem(
            LOCATION_CONSENT_KEY,
            JSON.stringify({
              granted: true,
              timestamp: Date.now(),
              mode: 'affirmative',
            })
          );
        } catch {
          // Fallback if localStorage is inaccessible
        }
        onConsentGranted({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        onClose();
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setErrorMsg('Location permission was denied in your browser settings. You can track orders using standard tracking updates.');
        } else {
          setErrorMsg('Unable to retrieve precise coordinates. Using regional courier estimates instead.');
        }
        try {
          localStorage.setItem(
            LOCATION_CONSENT_KEY,
            JSON.stringify({
              granted: false,
              timestamp: Date.now(),
              reason: err.message,
            })
          );
        } catch {
          // Fallback
        }
        onConsentDenied?.();
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleDenyConsent = () => {
    try {
      localStorage.setItem(
        LOCATION_CONSENT_KEY,
        JSON.stringify({
          granted: false,
          timestamp: Date.now(),
          mode: 'denied_by_user',
        })
      );
    } catch {
      // Fallback
    }
    onConsentDenied?.();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Live Location & Delivery Tracking" size="md">
      <div className="space-y-4 text-xs text-gray-700">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-accent flex items-center justify-center mx-auto">
          <Navigation size={24} className="animate-pulse" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold text-primary">Enable Live Courier Tracking?</h3>
          <p className="text-[11px] text-muted">
            Track your delivery agent’s real-time vehicle route and receive exact 30-minute doorstep arrival estimates.
          </p>
        </div>

        <div className="bg-surface rounded-xl p-4 border border-border space-y-2 text-[11px]">
          <div className="flex items-start gap-2">
            <ShieldCheck size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Data Minimization:</strong> We only access your device location while this tracking tab is active. We never record background location or share GPS data with advertisers.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>DPDP Act 2023 Compliant:</strong> You can revoke this permission anytime in your browser settings or Account Notifications.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-800 text-[11px]">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDenyConsent}
            className="text-xs"
            disabled={isLocating}
          >
            Don't Allow
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={handleGrantConsent}
            className="text-xs font-bold"
            disabled={isLocating}
          >
            {isLocating ? 'Requesting Permission...' : 'Allow Live Tracking'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
