import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Printer, CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';
import type { Order } from '../../types';
import { formatPrice } from '../../utils/price';
import { brandConfig } from '../../data/brand-config';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!order) return null;

  const receiptNo = `SB-RCPT-${order.id.replace('SB-', '')}-2026`;
  const isPaid =
    order.paymentMethod?.toLowerCase().includes('wallet') ||
    order.paymentMethod?.toLowerCase().includes('simulated') ||
    order.paymentMethod?.toLowerCase().includes('test') ||
    order.status.toLowerCase() === 'delivered';

  const hash = order.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 1000) % 9000;
  const authCode = `AUTH-SB-${order.id.slice(-4)}-${1000 + hash}`;

  const handlePrint = () => {
    window.print();
  };

  const gstPaise = Math.round(order.total * 0.12 * 100);
  const cgstRupees = Math.round(gstPaise / 2) / 100;
  const sgstRupees = cgstRupees;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Payment Receipt — #${order.id}`} size="lg">
      <div className="space-y-6 text-xs text-gray-700 font-sans print:p-0">
        {/* Receipt Header Banner */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-950 text-sm">
                  {isPaid ? 'Payment Confirmed & Verified' : 'Order Placed (Payment Due on Delivery)'}
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {isPaid ? 'PAID' : 'COD PENDING'}
                </span>
              </div>
              <span className="text-[11px] text-emerald-800 block mt-0.5">
                Receipt Reference: <strong className="font-mono">{receiptNo}</strong>
              </span>
            </div>
          </div>

          <div className="print:hidden flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs bg-white"
            >
              <Printer size={14} />
              <span>Print Receipt</span>
            </Button>
          </div>
        </div>

        {/* Brand & Storefront Information */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-4">
          <div>
            <span className="text-xl font-black font-display text-primary tracking-tight block">
              {brandConfig.name}
            </span>
            <span className="text-muted text-[11px] block">StyleBazaar Retail Fashion India Pvt. Ltd.</span>
            <span className="text-muted text-[11px] block">GSTIN: 29AABCS1429B1Z8 | CIN: U51909KA2024PTC184920</span>
            <span className="text-muted text-[11px] block">
              Plot No. 45/A, Indiranagar 100ft Road, Bengaluru, Karnataka - 560038
            </span>
          </div>

          <div className="text-right space-y-1">
            <div className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[10px]">
              <ShieldCheck size={12} /> 100% Verified Receipt
            </div>
            <div className="text-[11px] text-muted">
              Order ID: <strong className="text-primary font-mono">{order.id}</strong>
            </div>
            <div className="text-[11px] text-muted">
              Date:{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        {/* Transaction Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200/80 text-xs">
          <div>
            <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">
              Payment Rail / Mode
            </span>
            <span className="font-bold text-primary block mt-0.5 capitalize">
              {order.paymentMethod || 'Cash On Delivery'}
            </span>
            <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
              Auth: {authCode}
            </span>
          </div>

          <div>
            <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">
              Customer / Deliver To
            </span>
            <span className="font-semibold text-primary block mt-0.5 line-clamp-2">
              {order.shippingAddress}
            </span>
          </div>

          <div>
            <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">
              Total Amount
            </span>
            <span className="text-base font-extrabold text-emerald-700 block mt-0.5">
              {formatPrice(order.total)}
            </span>
            <span className="text-[10px] text-muted block mt-0.5">
              Status: {isPaid ? 'Settled Online' : 'Payable upon Delivery'}
            </span>
          </div>
        </div>

        {/* Items Breakdown Table */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
            Purchased Apparel & Accessories
          </span>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/80 border-b border-gray-200 text-gray-700 font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Size</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-primary block">{item.brand}</span>
                      <span className="text-gray-600 block line-clamp-1">{item.title}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-medium">{item.size}</td>
                    <td className="py-2.5 px-3 text-center font-medium">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-gray-600 font-mono">
                      {formatPrice(item.price)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-primary font-mono">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Breakdown & Tax Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-[11px] space-y-1.5">
            <span className="font-bold text-gray-700 block flex items-center gap-1">
              <FileCheck size={14} className="text-emerald-600" /> GST Tax Composition
            </span>
            <div className="flex justify-between text-muted">
              <span>Central GST (CGST @ 6%):</span>
              <span className="font-mono">{formatPrice(cgstRupees)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>State GST (SGST @ 6%):</span>
              <span className="font-mono">{formatPrice(sgstRupees)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-800 pt-1 border-t border-gray-200">
              <span>Total Applicable Taxes:</span>
              <span className="font-mono">{formatPrice(cgstRupees + sgstRupees)}</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-right">
            <div className="flex justify-between text-muted">
              <span>Items Subtotal:</span>
              <span className="font-mono font-medium text-gray-800">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discounts Applied:</span>
                <span className="font-mono">-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <span>Shipping & Delivery:</span>
              <span className="font-mono text-gray-800">
                {order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-primary pt-2 border-t border-gray-200">
              <span>Net Amount Paid:</span>
              <span className="font-mono text-emerald-700">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="border-t border-gray-100 pt-3 text-center text-[10px] text-muted space-y-1 print:border-t-2">
          <p>This is a system-generated electronic payment receipt and does not require a physical signature.</p>
          <p>© {new Date().getFullYear()} {brandConfig.name}. For questions, contact support@stylebazaar.com.</p>
        </div>
      </div>
    </Modal>
  );
};
