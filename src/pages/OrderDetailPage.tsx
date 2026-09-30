import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, FileText, PhoneCall, HelpCircle, Star, Receipt } from 'lucide-react';
import { SEO } from '../components/ui/SEO';
import { OrderTracker } from '../components/orders/OrderTracker';
import { CancelOrderModal } from '../components/orders/CancelOrderModal';
import { ReturnExchangeModal } from '../components/orders/ReturnExchangeModal';
import { WriteReviewModal } from '../components/reviews/WriteReviewModal';
import { OrderInvoice } from '../components/orders/OrderInvoice';
import { PaymentReceiptModal } from '../components/orders/PaymentReceiptModal';
import { Button } from '../components/ui/Button';

import { useOrderStore } from '../store/useOrderStore';
import { useToastStore } from '../store/useToastStore';
import { formatPrice } from '../utils/price';
import type { OrderItem } from '../types';

export const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById, cancelOrder, requestReturn } = useOrderStore();
  const { showToast } = useToastStore();

  const order = orderId ? getOrderById(orderId) : undefined;

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<OrderItem | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  if (!order) {
    return (
      <div className="min-h-screen bg-surface/30 flex items-center justify-center p-4">
        <SEO title="Order Not Found — StyleBazaar" />
        <div className="bg-white border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <h2 className="text-xl font-bold text-primary">Order Not Found</h2>
          <p className="text-xs text-muted">
            We couldn't locate an order with ID <span className="font-mono font-bold text-primary">{orderId}</span>.
          </p>
          <Button variant="accent" size="sm" onClick={() => navigate('/account/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const isCancellable =
    order.status === 'placed' || order.status === 'confirmed' || order.status === 'packed';
  const isDelivered = order.status === 'delivered';

  const handleConfirmCancel = (id: string, reason: string) => {
    cancelOrder(id, reason);
    showToast(`Order #${id} cancelled. Refund credited to Wallet.`, 'info');
  };

  const handleConfirmReturn = (
    id: string,
    itemId: string,
    reason: string,
    type: 'refund' | 'exchange',
    newSize?: string,
    refundToWallet?: boolean
  ) => {
    requestReturn(id, itemId, reason, type, newSize, refundToWallet);
    showToast(
      type === 'exchange'
        ? `Exchange requested for Size ${newSize}. Pickup scheduled.`
        : `Return request submitted. Pickup scheduled within 48h.`,
      'success'
    );
  };

  return (
    <div className="min-h-screen bg-surface/30">
      <SEO title={`Order #${order.id} Tracking — StyleBazaar`} />

      <div className="container-app py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-accent"
          >
            <ArrowLeft size={16} />
            <span>Back to All Orders</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReceiptModal(true)}
              className="flex items-center gap-1.5 text-xs text-primary border-gray-300 hover:bg-surface"
            >
              <Receipt size={14} className="text-accent" />
              <span>Payment Receipt</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center gap-1.5 text-xs"
            >
              <FileText size={14} />
              <span>Download Invoice</span>
            </Button>
          </div>
        </div>

        {/* Top Header Card */}
        <div className="bg-white border border-border rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Order Details</span>
              <span className="font-mono text-sm font-extrabold text-primary">#{order.id}</span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isCancellable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(true)}
                className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Cancel Order
              </Button>
            )}

            {isDelivered && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReturnModal(true)}
                className="text-xs text-gray-700 hover:bg-gray-100"
              >
                Return / Exchange
              </Button>
            )}
          </div>
        </div>

        {/* Live Order Tracker */}
        <OrderTracker order={order} />

        {/* Two-Column Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Items in Order */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-border rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted border-b border-gray-100 pb-3">
                Items in this Order ({order.items.length})
              </h3>

              <div className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Link to={`/product/${item.productId}`}>
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-18 h-24 object-cover rounded-lg border border-border flex-shrink-0"
                        />
                      </Link>

                      <div className="space-y-1 text-xs">
                        <span className="text-[11px] font-bold text-accent uppercase tracking-wider block">
                          {item.brand}
                        </span>
                        <Link
                          to={`/product/${item.productId}`}
                          className="font-bold text-primary hover:text-accent line-clamp-1 block text-sm"
                        >
                          {item.title}
                        </Link>
                        <div className="text-muted text-[11px] flex items-center gap-3">
                          <span>Size: <strong className="text-gray-700">{item.size}</strong></span>
                          <span>Color: <strong className="text-gray-700">{item.color}</strong></span>
                          <span>Quantity: <strong className="text-gray-700">{item.quantity}</strong></span>
                        </div>
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="font-black text-primary text-sm">
                            {formatPrice(item.price)}
                          </span>
                          {item.mrp > item.price && (
                            <span className="text-[11px] text-gray-400 line-through">
                              {formatPrice(item.mrp)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isDelivered && (
                      <div className="flex flex-col gap-2 self-start sm:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReviewItem(item)}
                          className="flex items-center gap-1.5 text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                        >
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          <span>Rate Product</span>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Need Help Box */}
            <div className="bg-white border border-border rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-accent flex items-center justify-center flex-shrink-0">
                  <HelpCircle size={20} />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-primary block">Need assistance with your order?</span>
                  <span className="text-muted text-[11px]">
                    24x7 customer support available for delivery status, returns, and billing queries.
                  </span>
                </div>
              </div>

              <a
                href="tel:18001234567"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-xs font-bold text-primary hover:bg-gray-50 flex-shrink-0"
              >
                <PhoneCall size={14} className="text-accent" />
                <span>Call Concierge (Toll-Free)</span>
              </a>
            </div>
          </div>

          {/* Right Column: Address & Bill Summary */}
          <div className="lg:col-span-4 space-y-4">
            {/* Delivery Address Card */}
            <div className="bg-white border border-border rounded-xl p-5 space-y-3 shadow-xs text-xs">
              <h4 className="font-bold uppercase tracking-wider text-muted text-[11px] flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
                <MapPin size={14} className="text-accent" /> Delivery Address
              </h4>
              <p className="text-gray-700 leading-relaxed font-medium">{order.shippingAddress}</p>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white border border-border rounded-xl p-5 space-y-2 shadow-xs text-xs">
              <h4 className="font-bold uppercase tracking-wider text-muted text-[11px] flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
                <CreditCard size={14} className="text-accent" /> Payment Method
              </h4>
              <p className="text-gray-700 font-bold">{order.paymentMethod}</p>
              <span className="text-[10px] text-emerald-700 font-semibold block">
                Payment Authorized & Verified
              </span>
            </div>

            {/* Bill Summary Card */}
            <div className="bg-white border border-border rounded-xl p-5 space-y-3 shadow-xs text-xs">
              <h4 className="font-bold uppercase tracking-wider text-muted text-[11px] border-b border-gray-100 pb-2.5">
                Price Breakdown
              </h4>

              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(order.subtotal)}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatPrice(order.discount)}</span>
                  </div>
                )}

                {order.couponCode && (
                  <div className="flex justify-between text-emerald-700 text-[11px]">
                    <span>Coupon ({order.couponCode})</span>
                    <span className="font-semibold">Applied</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery / Shipping</span>
                  <span>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
                </div>

                <div className="border-t border-border pt-3 flex justify-between font-extrabold text-sm text-primary">
                  <span>Total Paid</span>
                  <span className="text-base font-black text-accent">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        order={order}
        onConfirmCancel={handleConfirmCancel}
      />

      {/* Return/Exchange Modal */}
      <ReturnExchangeModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        order={order}
        onConfirm={handleConfirmReturn}
      />

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={!!selectedReviewItem}
        onClose={() => setSelectedReviewItem(null)}
        item={selectedReviewItem}
        orderId={order.id}
      />

      {/* Invoice Modal */}
      <OrderInvoice
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        order={order}
      />

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        order={order}
      />
    </div>
  );
};
