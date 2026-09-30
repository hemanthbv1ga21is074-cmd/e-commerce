import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Truck, Package, XCircle, RotateCcw, ExternalLink, Navigation, MapPin, ShieldCheck } from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { LiveTrackingConsentModal } from '../compliance/LiveTrackingConsentModal';
import { Button } from '../ui/Button';

interface OrderTrackerProps {
  order: Order;
}

const STEP_DEFINITIONS: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { key: 'placed', label: 'Order Placed', icon: <Clock size={16} /> },
  { key: 'packed', label: 'Packed & Dispatched', icon: <Package size={16} /> },
  { key: 'shipped', label: 'In Transit', icon: <Truck size={16} /> },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: <Truck size={16} /> },
  { key: 'delivered', label: 'Delivered', icon: <CheckCircle2 size={16} /> },
];

export const OrderTracker: React.FC<OrderTrackerProps> = ({ order }) => {
  const isCancelled = order.status === 'cancelled';
  const isReturned = order.status === 'returned';
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [liveLocationActive, setLiveLocationActive] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sb_location_tracking_consent');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.granted) {
          setLiveLocationActive(true);
        }
      }
    } catch {
      // Inaccessible storage
    }
  }, []);

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return 0;
      case 'confirmed':
      case 'packed':
        return 1;
      case 'shipped':
        return 2;
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="bg-white border border-border rounded-xl p-5 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">Delivery Status</span>
          <h3 className="text-base font-extrabold text-primary capitalize flex items-center gap-2">
            {isCancelled ? (
              <span className="text-rose-600 flex items-center gap-1.5">
                <XCircle size={18} /> Cancelled
              </span>
            ) : isReturned ? (
              <span className="text-amber-600 flex items-center gap-1.5">
                <RotateCcw size={18} /> Return Requested / In Progress
              </span>
            ) : order.status === 'delivered' ? (
              <span className="text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 size={18} /> Delivered on {order.estimatedDelivery}
              </span>
            ) : (
              <span className="text-primary flex items-center gap-1.5">
                <Truck size={18} className="text-accent" /> Estimated Delivery: {order.estimatedDelivery}
              </span>
            )}
          </h3>
        </div>

        {order.carrier && !isCancelled && (
          <div className="text-left sm:text-right text-xs bg-gray-50 border border-gray-200/70 p-2.5 rounded-lg">
            <span className="text-muted block text-[11px]">Courier Partner:</span>
            <span className="font-bold text-primary block">{order.carrier.name}</span>
            <div className="flex items-center gap-1 text-[11px] text-accent font-medium mt-0.5">
              <span>AWB: {order.carrier.trackingNumber}</span>
              {order.carrier.trackingUrl && (
                <a
                  href={order.carrier.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline inline-flex items-center"
                >
                  <ExternalLink size={11} className="ml-0.5" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Progress Line Tracker */}
      {!isCancelled && !isReturned && (
        <div className="relative pt-2 pb-4">
          <div className="hidden sm:flex justify-between items-center relative z-10">
            {STEP_DEFINITIONS.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="flex flex-col items-center text-center flex-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-200 ${
                      isPast || isCurrent
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}
                  >
                    {isPast ? <CheckCircle2 size={18} /> : step.icon}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold max-w-[100px] leading-tight ${
                      isCurrent
                        ? 'text-primary font-bold'
                        : isPast
                        ? 'text-emerald-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar background line */}
          <div className="hidden sm:block absolute top-[26px] left-[10%] right-[10%] h-[3px] bg-gray-200 -z-0">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{
                width: `${Math.min(100, (currentStepIdx / (STEP_DEFINITIONS.length - 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Detailed Timeline Events */}
      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Activity History</h4>
        <div className="relative border-l-2 border-gray-200 pl-4 space-y-4 text-xs ml-2">
          {order.timeline.map((event, idx) => {
            const isLast = idx === order.timeline.length - 1;
            return (
              <div key={idx} className="relative group">
                <div
                  className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border-2 bg-white ${
                    isLast ? 'border-accent bg-accent ring-4 ring-rose-50' : 'border-gray-400'
                  }`}
                />
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-primary capitalize">{event.status.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-muted">
                      {new Date(event.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Location Tracking Box */}
      {!isCancelled && !isReturned && (
        <div className="bg-surface/60 border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                liveLocationActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-accent'
              }`}
            >
              <Navigation size={18} className={liveLocationActive ? 'animate-pulse text-emerald-600' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <span>Live Courier Radar Tracking</span>
                {liveLocationActive && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck size={11} /> Consent Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted">
                {liveLocationActive
                  ? 'Real-time GPS tracking active. Delivery agent is in your local postal sector.'
                  : 'Enable live delivery vehicle tracking with DPDP Act compliant consent.'}
              </p>
            </div>
          </div>

          <Button
            variant={liveLocationActive ? 'outline' : 'accent'}
            size="sm"
            onClick={() => setShowConsentModal(true)}
            className="text-xs flex items-center gap-1.5 flex-shrink-0"
          >
            <MapPin size={13} />
            <span>{liveLocationActive ? 'Manage Tracking Consent' : 'Enable Live Tracking'}</span>
          </Button>
        </div>
      )}

      <LiveTrackingConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onConsentGranted={() => setLiveLocationActive(true)}
        onConsentDenied={() => setLiveLocationActive(false)}
      />
    </div>
  );
};
