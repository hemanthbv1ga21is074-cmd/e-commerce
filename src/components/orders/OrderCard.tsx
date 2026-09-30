import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, CheckCircle2, XCircle, RotateCcw, FileText, Star, ArrowRight } from 'lucide-react';
import type { Order, OrderItem } from '../../types';
import { formatPrice } from '../../utils/price';
import { Button } from '../ui/Button';

interface OrderCardProps {
  order: Order;
  onCancelClick?: (order: Order) => void;
  onReturnClick?: (order: Order) => void;
  onReviewClick?: (item: OrderItem, orderId: string) => void;
  onInvoiceClick?: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onCancelClick,
  onReturnClick,
  onReviewClick,
  onInvoiceClick,
}) => {
  const isCancellable =
    order.status === 'placed' || order.status === 'confirmed' || order.status === 'packed';
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';
  const isReturned = order.status === 'returned';

  const getStatusBadge = () => {
    switch (order.status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck size={13} /> In Transit
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Truck size={13} /> Out for Delivery
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={13} /> Cancelled
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw size={13} /> Return / Exchange
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Truck size={13} /> Placed
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl shadow-xs overflow-hidden hover:shadow-md transition-shadow">
      {/* Order Header */}
      <div className="bg-gray-50/80 p-4 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div>
            <span className="text-muted block text-[11px]">Order Placed</span>
            <span className="font-bold text-primary">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <div>
            <span className="text-muted block text-[11px]">Total Amount</span>
            <span className="font-extrabold text-primary">{formatPrice(order.total)}</span>
          </div>

          <div>
            <span className="text-muted block text-[11px]">Order #</span>
            <span className="font-mono font-bold text-primary">{order.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <Link
            to={`/account/orders/${order.id}`}
            className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-0.5 ml-2"
          >
            <span>View Details</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Order Item List */}
      <div className="p-4 sm:p-5 space-y-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b last:border-b-0 border-gray-100">
            <div className="flex items-start gap-4">
              <Link to={`/product/${item.productId}`}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-lg border border-border flex-shrink-0"
                />
              </Link>
              <div className="space-y-1 text-xs">
                <span className="text-[11px] font-bold text-accent uppercase tracking-wider">{item.brand}</span>
                <Link
                  to={`/product/${item.productId}`}
                  className="font-bold text-primary block hover:text-accent line-clamp-1"
                >
                  {item.title}
                </Link>
                <div className="text-muted text-[11px] flex items-center gap-3">
                  <span>Size: <strong className="text-gray-700">{item.size}</strong></span>
                  <span>Color: <strong className="text-gray-700">{item.color}</strong></span>
                  <span>Qty: <strong className="text-gray-700">{item.quantity}</strong></span>
                </div>
                <div className="font-extrabold text-primary text-sm pt-0.5">
                  {formatPrice(item.price)}
                </div>
              </div>
            </div>

            {/* Item Level Actions for Delivered */}
            {isDelivered && onReviewClick && (
              <div className="flex items-center gap-2 self-start sm:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReviewClick(item, order.id)}
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

      {/* Order Footer Actions */}
      <div className="bg-gray-50/50 p-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-muted text-[11px]">
          {isCancelled ? (
            <span className="text-rose-600 font-medium">
              Order cancelled. {order.cancellationReason && `Reason: ${order.cancellationReason}`}
            </span>
          ) : isReturned ? (
            <span className="text-purple-700 font-medium">
              Return request scheduled for {order.returnRequest?.pickupDate || 'doorstep pickup'}.
            </span>
          ) : isDelivered ? (
            <span className="text-emerald-700 font-medium">
              Delivered on {order.estimatedDelivery}. Return/Exchange available for 14 days.
            </span>
          ) : (
            <span className="text-primary font-medium">
              Expected by: <strong className="text-accent">{order.estimatedDelivery}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {onInvoiceClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onInvoiceClick(order)}
              className="flex items-center gap-1.5 text-xs"
            >
              <FileText size={13} />
              <span>Invoice</span>
            </Button>
          )}

          {isCancellable && onCancelClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancelClick(order)}
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              Cancel Order
            </Button>
          )}

          {isDelivered && onReturnClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReturnClick(order)}
              className="text-xs text-gray-700 hover:bg-gray-100"
            >
              Return / Exchange
            </Button>
          )}

          <Link to={`/account/orders/${order.id}`}>
            <Button variant="accent" size="sm" className="text-xs font-bold">
              Track Order
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
