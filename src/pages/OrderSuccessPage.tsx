import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, Home, FileText, Receipt } from 'lucide-react';
import { SEO } from '../components/ui/SEO';
import { Button } from '../components/ui/Button';
import { useOrderStore } from '../store/useOrderStore';
import { formatPrice } from '../utils/price';
import { PaymentReceiptModal } from '../components/orders/PaymentReceiptModal';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById } = useOrderStore();
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const order = orderId ? getOrderById(orderId) : undefined;

  return (
    <div className="min-h-screen bg-surface/30 py-10">
      <SEO title="Order Confirmed! — StyleBazaar" />

      <div className="container-app max-w-3xl mx-auto space-y-6">
        {/* Success Banner */}
        <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Order Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-primary tracking-tight mt-2">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Order ID: <strong className="text-primary font-mono">{order?.id || orderId}</strong>
            </p>
          </div>

          <div className="p-4 bg-surface rounded-xl flex flex-col sm:flex-row items-center justify-around gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-accent" />
              <div className="text-left">
                <span className="text-muted block text-[11px]">Estimated Delivery</span>
                <span className="font-bold text-primary">
                  {order?.estimatedDelivery || 'Within 3-4 business days'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Package size={18} className="text-accent" />
              <div className="text-left">
                <span className="text-muted block text-[11px]">Payment Mode</span>
                <span className="font-bold text-primary capitalize">
                  {order?.paymentMethod || 'Paid Online'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FileText size={18} className="text-accent" />
              <div className="text-left">
                <span className="text-muted block text-[11px]">Total Paid</span>
                <span className="font-bold text-primary">
                  {order ? formatPrice(order.total) : 'Confirmed'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details & Items Card */}
        {order && (
          <div className="bg-white border border-border rounded-2xl p-6 space-y-6 shadow-sm">
            {/* Delivery Address Summary */}
            <div className="border-b border-border pb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                Shipping Address
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                {order.shippingAddress}
              </p>
            </div>

            {/* Items Ordered List */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                Items In This Order ({order.items.length})
              </h3>

              <div className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-16 rounded bg-surface overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-surface" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold uppercase tracking-wider text-primary text-[11px] block">
                          {item.brand}
                        </span>
                        <h4 className="font-medium text-gray-700 line-clamp-1">{item.title}</h4>
                        <div className="text-[11px] text-muted mt-0.5">
                          Size: <strong>{item.size}</strong> • Qty: <strong>{item.quantity}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 font-bold text-primary">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Status Timeline */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                Order Status
              </h3>
              <div className="space-y-3">
                {order.timeline.map((step, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-3 text-xs">
                    <div className="w-3 h-3 rounded-full bg-emerald-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-primary capitalize">{step.status}</span>
                      <p className="text-[11px] text-muted">{step.description}</p>
                      <span className="text-[10px] text-gray-400">
                        {new Date(step.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to={`/account/orders/${order?.id || orderId}`} className="w-full sm:w-auto">
            <Button variant="accent" size="lg" icon={<Truck size={18} />} className="w-full font-bold">
              Track Order
            </Button>
          </Link>

          {order && (
            <Button
              variant="secondary"
              size="lg"
              icon={<Receipt size={18} />}
              onClick={() => setShowReceiptModal(true)}
              className="w-full sm:w-auto font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
            >
              Payment Receipt
            </Button>
          )}

          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" icon={<Home size={18} />} className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Payment Receipt Modal */}
        <PaymentReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          order={order || null}
        />
      </div>
    </div>
  );
};
