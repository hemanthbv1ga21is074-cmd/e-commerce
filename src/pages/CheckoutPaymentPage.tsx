import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Smartphone, CreditCard, Banknote, Building2, MapPin, Wallet, Award, Zap, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { SEO } from '../components/ui/SEO';
import { CheckoutHeader } from '../components/checkout/CheckoutHeader';
import { PriceSummaryCard } from '../components/checkout/PriceSummaryCard';
import { PaymentUpi } from '../components/checkout/PaymentUpi';
import { PaymentCard } from '../components/checkout/PaymentCard';
import { PaymentCod } from '../components/checkout/PaymentCod';
import { PaymentNetbanking } from '../components/checkout/PaymentNetbanking';
import { launchRazorpayCheckout } from '../services/api/payment';
import { Button } from '../components/ui/Button';
import { useConfig } from '../context/ConfigContext';

import { useCartStore } from '../store/useCartStore';
import { useAddressStore } from '../store/useAddressStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { calcPricingBreakdown, formatPrice } from '../utils/price';
import { cn } from '../../src/utils/helpers';
import { apiCreateOrder } from '../services/api/orders';

type PaymentTab = 'razorpay' | 'upi' | 'card' | 'cod' | 'netbanking' | 'test_money';

export const CheckoutPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useConfig();
  const { items, appliedCoupon, removeCoupon, clearCart } = useCartStore();
  const { getSelectedAddress } = useAddressStore();
  const { createOrder } = useOrderStore();

  const { user, deductWalletBalance, deductLoyaltyPoints } = useAuthStore();
  // Default to COD when online payments are disabled
  const [activeTab, setActiveTab] = useState<PaymentTab>(
    config.onlinePaymentsEnabled ? 'upi' : 'cod'
  );
  const [useWallet, setUseWallet] = useState(false);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // If bag is empty, redirect back to /bag
  if (items.length === 0) {
    return <Navigate to="/bag" replace />;
  }

  const selectedAddress = getSelectedAddress();
  if (!selectedAddress) {
    return <Navigate to="/checkout/address" replace />;
  }

  const isCod = activeTab === 'cod';

  const breakdown = calcPricingBreakdown(items, {
    coupon: appliedCoupon,
    isCod,
    isFirstOrder: true,
  });

  const maxWalletDeduction =
    user && useWallet ? Math.min(user.walletBalance, breakdown.finalTotal) : 0;
  const remainingAfterWallet = breakdown.finalTotal - maxWalletDeduction;
  const maxLoyaltyRupees = user?.loyaltyPoints ? Math.floor(user.loyaltyPoints / 10) : 0;
  const maxLoyaltyDeduction =
    user && useLoyalty ? Math.min(maxLoyaltyRupees, remainingAfterWallet) : 0;
  const loyaltyPointsToDeduct = maxLoyaltyDeduction * 10;
  const finalPayableTotal = Math.max(
    0,
    breakdown.finalTotal - maxWalletDeduction - maxLoyaltyDeduction
  );

  const handleOrderConfirmed = async (methodTitle: string) => {
    setSubmitting(true);
    setOrderError(null);

    try {
      const shippingAddressText = `${selectedAddress.name}, ${selectedAddress.addressLine1}, ${
        selectedAddress.addressLine2 ? selectedAddress.addressLine2 + ', ' : ''
      }${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode} (Mobile: ${
        selectedAddress.phone
      })`;

      const mockOrderData = {
        id: `SB-${Math.floor(100000 + Math.random() * 900000)}`,
        userId: user?.id || 'usr-demo-1',
        items: items.map((i) => ({
          productId: i.productId,
          title: i.title,
          brand: i.brand,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          mrp: i.mrp,
          price: i.price,
          image: i.image,
        })),
        shippingAddress: shippingAddressText,
        paymentMethod:
          maxWalletDeduction >= breakdown.finalTotal ? 'StyleBazaar Wallet' : methodTitle,
        subtotal: breakdown.subtotal,
        discount: breakdown.productDiscount + breakdown.couponDiscount,
        deliveryFee: breakdown.deliveryFee + (isCod ? breakdown.codFee : 0),
        walletUsed: maxWalletDeduction > 0 ? maxWalletDeduction : undefined,
        loyaltyPointsUsed: loyaltyPointsToDeduct > 0 ? loyaltyPointsToDeduct : undefined,
        total: finalPayableTotal,
        couponCode: appliedCoupon?.code,
        status: 'placed' as const,
        timeline: [
          {
            status: 'placed' as const,
            timestamp: new Date().toISOString(),
            description: 'Order placed successfully. Thank you for shopping with StyleBazaar!',
          },
        ],
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      };

      const idempotencyKey = `sb-order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const newOrder = await apiCreateOrder(
        {
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
          addressId: selectedAddress.id,
          shippingAddressText,
          couponCode: appliedCoupon?.code,
          paymentMethod:
            maxWalletDeduction >= breakdown.finalTotal
              ? 'WALLET'
              : activeTab === 'test_money'
              ? 'TEST_PAYMENT'
              : 'COD',
          useWallet,
          usePoints: useLoyalty,
        },
        idempotencyKey,
        mockOrderData
      );

      createOrder(newOrder);

      // Deduct wallet & loyalty points if used
      if (maxWalletDeduction > 0) {
        deductWalletBalance(maxWalletDeduction, `Redeemed on Order #${newOrder.id}`);
      }
      if (loyaltyPointsToDeduct > 0) {
        deductLoyaltyPoints(loyaltyPointsToDeduct);
      }

      clearCart();
      setSubmitting(false);
      navigate(`/order-success/${newOrder.id}`);
    } catch (err: any) {
      setSubmitting(false);
      setOrderError(err.message || 'Failed to place order. Please try again.');
    }
  };

  const paymentOptions: { id: PaymentTab; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
    ...(config.onlinePaymentsEnabled ? [
      { id: 'razorpay' as PaymentTab, label: 'Razorpay Gateway', icon: <Zap size={17} /> },
      { id: 'upi' as PaymentTab, label: 'UPI / QR Code', icon: <Smartphone size={17} /> },
      { id: 'card' as PaymentTab, label: 'Credit / Debit Card', icon: <CreditCard size={17} /> },
      { id: 'netbanking' as PaymentTab, label: 'Net Banking', icon: <Building2 size={17} /> },
    ] : [
      { id: 'upi' as PaymentTab, label: 'UPI / QR Code', icon: <Smartphone size={17} />, disabled: true },
      { id: 'card' as PaymentTab, label: 'Credit / Debit Card', icon: <CreditCard size={17} />, disabled: true },
      { id: 'netbanking' as PaymentTab, label: 'Net Banking', icon: <Building2 size={17} />, disabled: true },
    ]),
    { id: 'test_money' as PaymentTab, label: 'Test Pay (Fake Money)', icon: <CheckCircle2 size={17} className="text-emerald-600" /> },
    { id: 'cod', label: 'Cash On Delivery', icon: <Banknote size={17} /> },
  ];

  return (
    <div className="min-h-screen bg-surface/30">
      <SEO title="Payment — StyleBazaar Checkout" />
      <CheckoutHeader currentStep="payment" />

      <div className="container-app py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Payment Options */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5">
            {orderError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between shadow-xs">
                <span>{orderError}</span>
                <button
                  type="button"
                  onClick={() => setOrderError(null)}
                  className="text-red-500 hover:text-red-700 font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Delivery Address Quick Recap */}
            <div className="bg-white border border-border rounded-xl p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <MapPin size={17} className="text-accent flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-primary block">
                    Deliver to: {selectedAddress.name} ({selectedAddress.pincode})
                  </span>
                  <span className="text-muted line-clamp-1">
                    {selectedAddress.addressLine1}, {selectedAddress.city}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout/address')}
                className="text-xs font-bold uppercase tracking-wider text-accent hover:underline flex-shrink-0"
              >
                Change
              </button>
            </div>

            {/* StyleBazaar Wallet & Member Rewards Redemption */}
            {user && (user.walletBalance > 0 || user.loyaltyPoints >= 100) && (
              <div className="bg-white border border-border rounded-xl p-4 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted block">
                  Credits & Member Rewards
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.walletBalance > 0 && (
                    <label
                      className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                        useWallet ? 'border-emerald-500 bg-emerald-50/50' : 'border-border hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={useWallet}
                          onChange={(e) => setUseWallet(e.target.checked)}
                          className="accent-emerald-600 rounded cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-xs text-primary flex items-center gap-1">
                            <Wallet size={13} className="text-emerald-600" /> Use Wallet Balance
                          </span>
                          <span className="text-[11px] text-muted block">
                            Available: {formatPrice(user.walletBalance)}
                          </span>
                        </div>
                      </div>
                      {useWallet && (
                        <span className="text-xs font-bold text-emerald-700">
                          -{formatPrice(maxWalletDeduction)}
                        </span>
                      )}
                    </label>
                  )}

                  {user.loyaltyPoints >= 100 && (
                    <label
                      className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                        useLoyalty ? 'border-amber-500 bg-amber-50/50' : 'border-border hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={useLoyalty}
                          onChange={(e) => setUseLoyalty(e.target.checked)}
                          className="accent-amber-600 rounded cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-xs text-primary flex items-center gap-1">
                            <Award size={13} className="text-amber-600" /> Redeem Insider Points
                          </span>
                          <span className="text-[11px] text-muted block">
                            {user.loyaltyPoints} pts ({formatPrice(maxLoyaltyRupees)})
                          </span>
                        </div>
                      </div>
                      {useLoyalty && (
                        <span className="text-xs font-bold text-amber-700">
                          -{formatPrice(maxLoyaltyDeduction)}
                        </span>
                      )}
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Payment Tabs Layout */}
            <div className="bg-white border border-border rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-border bg-surface/50">
                <h1 className="text-base font-bold uppercase tracking-wider text-primary">
                  Choose Payment Mode
                </h1>
                <p className="text-xs text-muted">100% encrypted & secure payment gateway</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[360px]">
                {/* Vertical Payment Tabs */}
                <div className="md:col-span-4 border-r border-border bg-surface/20 divide-y divide-border">
                  {paymentOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => !opt.disabled && setActiveTab(opt.id)}
                      className={cn(
                        'w-full p-4 flex items-center gap-3 text-xs font-bold text-left transition-colors',
                        opt.disabled
                          ? 'opacity-40 cursor-not-allowed text-gray-400'
                          : activeTab === opt.id
                          ? 'bg-white text-accent border-l-4 border-l-accent'
                          : 'text-gray-700 hover:bg-surface'
                      )}
                    >
                      <span className={opt.disabled ? 'text-gray-300' : activeTab === opt.id ? 'text-accent' : 'text-gray-500'}>
                        {opt.icon}
                      </span>
                      <span className="flex-1">{opt.label}</span>
                      {opt.disabled && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          <Clock size={10} /> Soon
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content Panel */}
                <div className="md:col-span-8 p-6">
                  {activeTab === 'razorpay' && (
                    <div className="space-y-5">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-blue-900 text-sm tracking-wide">
                              Razorpay Standard Gateway
                            </span>
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                              Official Partner
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-blue-700">
                            Trusted by 10M+ businesses
                          </span>
                        </div>
                        <p className="text-xs text-blue-800 leading-relaxed">
                          Pay securely using any credit/debit card, Google Pay, PhonePe, Paytm, CRED, 50+ Netbanking portals, or PayLater.
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 border border-border rounded-xl space-y-3 text-xs">
                        <span className="font-bold text-gray-700 block">Accepted Payment Rails:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] text-gray-600">
                          <div className="p-2 bg-white border border-gray-200 rounded-lg font-medium">UPI / QR Code</div>
                          <div className="p-2 bg-white border border-gray-200 rounded-lg font-medium">Cards (Visa/MC/RuPay)</div>
                          <div className="p-2 bg-white border border-gray-200 rounded-lg font-medium">Netbanking (All Banks)</div>
                          <div className="p-2 bg-white border border-gray-200 rounded-lg font-medium">Wallets & PayLater</div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          variant="accent"
                          size="lg"
                          loading={submitting}
                          onClick={() => {
                            setSubmitting(true);
                            launchRazorpayCheckout({
                              amountRupees: finalPayableTotal,
                              customerName: selectedAddress.name,
                              customerEmail: user?.email || 'customer@example.com',
                              customerPhone: selectedAddress.phone,
                              onSuccess: (res) => {
                                handleOrderConfirmed(`Razorpay (${res.razorpay_payment_id})`);
                              },
                              onDismiss: () => {
                                setSubmitting(false);
                              },
                            });
                          }}
                          className="w-full h-12 text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700"
                        >
                          Pay {formatPrice(finalPayableTotal)} via Razorpay
                        </Button>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-[11px] text-muted">
                        <ShieldCheck size={14} className="text-blue-600" />
                        <span>256-bit SSL encrypted • Instant payment confirmation</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'upi' && (
                    <PaymentUpi onConfirm={handleOrderConfirmed} loading={submitting} />
                  )}
                  {activeTab === 'card' && (
                    <PaymentCard onConfirm={handleOrderConfirmed} loading={submitting} />
                  )}
                  {activeTab === 'cod' && (
                    <PaymentCod onConfirm={handleOrderConfirmed} loading={submitting} />
                  )}
                  {activeTab === 'test_money' && (
                    <div className="space-y-5">
                      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-emerald-950 text-sm tracking-wide">
                              Simulated Test Payment (Fake Money)
                            </span>
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              SANDBOX MODE
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-emerald-800 leading-relaxed">
                          Complete your checkout instantly using simulated test money. No real bank deduction will occur. You can view and print the official payment receipt immediately upon order completion.
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 border border-border rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center text-muted">
                          <span>Payable Total:</span>
                          <span className="font-bold text-base text-primary font-mono">{formatPrice(finalPayableTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-muted">
                          <span>Payment Rail:</span>
                          <span className="font-semibold text-gray-700">Simulated Instant Sandbox</span>
                        </div>
                      </div>

                      <Button
                        variant="accent"
                        size="lg"
                        loading={submitting}
                        onClick={() => handleOrderConfirmed('Simulated Test Pay (Fake Money)')}
                        className="w-full h-12 text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Complete Order with Test Money ({formatPrice(finalPayableTotal)})
                      </Button>
                    </div>
                  )}

                  {activeTab === 'netbanking' && (
                    <PaymentNetbanking onConfirm={handleOrderConfirmed} loading={submitting} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Pricing Summary */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
            <PriceSummaryCard
              items={items}
              coupon={appliedCoupon}
              isCod={isCod}
              onRemoveCoupon={removeCoupon}
              walletDeduction={maxWalletDeduction}
              loyaltyDeduction={maxLoyaltyDeduction}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
