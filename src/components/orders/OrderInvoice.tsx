import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Printer, Download, CheckCircle2 } from 'lucide-react';
import type { Order } from '../../types';
import { formatPrice } from '../../utils/price';
import { brandConfig } from '../../data/brand-config';

import { apiDownloadInvoice } from '../../services/api/orders';

interface OrderInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderInvoice: React.FC<OrderInvoiceProps> = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const invoiceNo = `INV-${order.id.replace('SB-', '')}-2026`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await apiDownloadInvoice(order.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.print();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tax Invoice — #${order.id}`} size="lg">
      <div className="space-y-6 text-xs text-gray-700 font-sans print:p-0">
        {/* Invoice Top Actions */}
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 print:hidden">
          <span className="text-[11px] text-muted">Original for Recipient (Customer Copy)</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1.5">
              <Printer size={14} />
              <span>Print Invoice</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </Button>
          </div>
        </div>

        {/* Invoice Body Printable Document */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-5">
            <div>
              <h2 className="text-xl font-black text-primary uppercase tracking-tight font-display">
                {brandConfig.name}
              </h2>
              <p className="text-[11px] text-muted mt-0.5">StyleBazaar Retail Fashion India Pvt. Ltd.</p>
              <p className="text-[10px] text-gray-500">
                Plot No. 45/A, Indiranagar 100ft Road, Bengaluru, Karnataka - 560038
              </p>
              <p className="text-[10px] text-gray-500">GSTIN: 29AABCS1429B1Z8 | CIN: U51909KA2024PTC184920</p>
            </div>

            <div className="text-right space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-widest text-accent bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Tax Invoice
              </span>
              <p className="text-xs font-bold text-primary mt-2">Invoice No: {invoiceNo}</p>
              <p className="text-[11px] text-gray-500">Order ID: #{order.id}</p>
              <p className="text-[11px] text-gray-500">Date: {invoiceDate}</p>
            </div>
          </div>

          {/* Billing & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-gray-800 uppercase text-[10px] tracking-wider block">
                Sold By (Seller Details)
              </span>
              <p className="font-semibold text-primary">StyleBazaar Authorized Fulfillment Center</p>
              <p className="text-gray-500 text-[11px]">Warehouse Hub #12, Hosur Road, Bengaluru - 560068</p>
              <p className="text-gray-500 text-[11px]">PAN: AABCS1429B</p>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="font-bold text-gray-800 uppercase text-[10px] tracking-wider block">
                Billing & Shipping Address
              </span>
              <p className="text-gray-600 text-[11px] leading-relaxed">{order.shippingAddress}</p>
              <p className="text-[11px] text-gray-500 mt-1">Payment Method: {order.paymentMethod}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-gray-50 text-[11px] font-bold uppercase text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">HSN</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Gross Price</th>
                  <th className="p-3 text-right">Discount</th>
                  <th className="p-3 text-right">Taxable Value</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, idx) => {
                  const taxableValue = Math.round(item.price * item.quantity * 0.95);
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="p-3 text-gray-400">{idx + 1}</td>
                      <td className="p-3">
                        <span className="font-bold text-primary block">{item.title}</span>
                        <span className="text-[10px] text-muted">
                          Brand: {item.brand} | Size: {item.size} | Color: {item.color}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">6205</td>
                      <td className="p-3 text-center font-semibold">{item.quantity}</td>
                      <td className="p-3 text-right text-gray-500">{formatPrice(item.mrp)}</td>
                      <td className="p-3 text-right text-emerald-600 font-medium">
                        -{formatPrice((item.mrp - item.price) * item.quantity)}
                      </td>
                      <td className="p-3 text-right">{formatPrice(taxableValue)}</td>
                      <td className="p-3 text-right font-bold text-primary">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="space-y-1 text-[11px] text-gray-500 max-w-sm">
              <p className="font-bold text-gray-700">Tax Breakdown:</p>
              <p>GST applicable @ 5% on apparel under ₹1000 and 12% above ₹1000.</p>
              <p className="italic">This is a computer-generated invoice and requires no physical signature.</p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200/80">
              <div className="flex justify-between">
                <span>Subtotal (Items)</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Total Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              {order.couponCode && (
                <div className="flex justify-between text-emerald-700 text-[11px]">
                  <span>Coupon Applied</span>
                  <span>{order.couponCode}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping & Convenience</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-extrabold text-sm text-primary">
                <span>Grand Total</span>
                <span className="text-base text-accent">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-[11px] text-muted">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 size={14} />
              <span>Digitally Verified & Authorized</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-gray-700 block">For StyleBazaar Retail Fashion India Pvt Ltd</span>
              <span className="text-[10px] text-gray-400">Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
