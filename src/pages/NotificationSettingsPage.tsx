import React, { useState } from 'react';
import { SEO } from '../components/ui/SEO';
import { AccountSidebar } from '../components/account/AccountSidebar';
import { Bell, MessageSquare, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToastStore } from '../store/useToastStore';

export const NotificationSettingsPage: React.FC = () => {
  const { showToast } = useToastStore();

  const [settings, setSettings] = useState({
    whatsappUpdates: true,
    smsTracking: true,
    emailInvoices: true,
    saleAlerts: true,
    priceDropAlerts: false,
    insiderOffers: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    showToast('Notification preferences saved successfully!', 'success');
  };

  return (
    <div className="container-custom py-8">
      <SEO title="Notification Settings | StyleBazaar" />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AccountSidebar />

        <main className="flex-1 w-full space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-primary font-display">
              Notification & Privacy Settings
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Control where and how StyleBazaar sends order updates, delivery tracking, and sales alerts
            </p>
          </div>

          <div className="bg-white border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
            {/* 1. Transactional Updates */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-gray-100 pb-2">
                Order & Shipping Notifications
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-surface/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-primary">WhatsApp Order Alerts</h3>
                      <p className="text-[11px] text-muted">Receive live dispatch, out-for-delivery, and OTP updates on WhatsApp</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.whatsappUpdates}
                    onChange={() => toggle('whatsappUpdates')}
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-surface/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Phone size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-primary">SMS Shipping Tracking</h3>
                      <p className="text-[11px] text-muted">Real-time carrier SMS notifications from Blue Dart / Delhivery</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.smsTracking}
                    onChange={() => toggle('smsTracking')}
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-surface/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                      <Mail size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-primary">Email Tax Invoices</h3>
                      <p className="text-[11px] text-muted">GST tax receipts and digital invoices sent directly to your inbox</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailInvoices}
                    onChange={() => toggle('emailInvoices')}
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 2. Marketing & Offers */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-gray-100 pb-2">
                Promotions & Insider Perks
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-surface/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-accent flex items-center justify-center flex-shrink-0">
                      <Bell size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-primary">Flash Sale & Clearance Alerts</h3>
                      <p className="text-[11px] text-muted">Early-access notifications before seasonal mega sales go live</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.saleAlerts}
                    onChange={() => toggle('saleAlerts')}
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-surface/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Bell size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-primary">Insider Loyalty Exclusives</h3>
                      <p className="text-[11px] text-muted">Special tier point multiplier days and birthday surprise vouchers</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.insiderOffers}
                    onChange={() => toggle('insiderOffers')}
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>You can unsubscribe or change preferences at any time.</span>
              </div>
              <Button variant="accent" onClick={handleSave} className="text-xs uppercase font-bold tracking-wider">
                Save Preferences
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
