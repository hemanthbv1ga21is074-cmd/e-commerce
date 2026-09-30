import PDFDocument from 'pdfkit';

export interface InvoiceOrderData {
  id: string;
  createdAt: string | Date;
  status: string;
  shippingAddress: string | {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    title: string;
    brand?: string;
    size?: string;
    color?: string;
    quantity: number;
    priceInPaise?: number;
    price?: number;
    mrpInPaise?: number;
  }>;
  subtotalInPaise?: number;
  subtotal?: number;
  discountInPaise?: number;
  couponDiscountInPaise?: number;
  deliveryFeeInPaise?: number;
  codFeeInPaise?: number;
  totalInPaise?: number;
  total?: number;
  gstIncludedInPaise?: number;
  paymentMethod?: string;
}

export function generateOrderInvoice(order: InvoiceOrderData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', reject);

    const formatInr = (paise?: number, rupees?: number) => {
      const rs = paise !== undefined ? Math.round(paise / 100) : rupees || 0;
      return `Rs. ${rs.toLocaleString('en-IN')}`;
    };

    // Header / Brand
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#0f172a').text('STYLEBAZAAR', 40, 40);
    doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('Fashion for Every You | StyleBazaar Retail Ltd.', 40, 68);
    doc.text('GSTIN: 29AABCU9603R1ZM | CIN: U51909KA2024PTC189201', 40, 80);
    doc.text('Registered Office: 402, Lotus Grandeur, Indiranagar, Bengaluru - 560038', 40, 92);

    // Invoice Title & Info
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text('TAX INVOICE', 400, 40, { align: 'right' });
    doc.fontSize(9).font('Helvetica').fillColor('#334155');
    doc.text(`Invoice No: INV-${order.id}`, 400, 60, { align: 'right' });
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    doc.text(`Order Date: ${orderDate}`, 400, 74, { align: 'right' });
    doc.text(`Payment: ${order.paymentMethod || 'Cash on Delivery (COD)'}`, 400, 88, { align: 'right' });

    // Divider
    doc.moveTo(40, 115).lineTo(555, 115).strokeColor('#e2e8f0').stroke();

    // Bill To & Ship To
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a').text('BILL TO / SHIP TO:', 40, 125);
    doc.fontSize(9).font('Helvetica').fillColor('#334155');

    let addressStr = '';
    if (typeof order.shippingAddress === 'string') {
      addressStr = order.shippingAddress;
    } else if (order.shippingAddress) {
      const a = order.shippingAddress;
      addressStr = `${a.name}\n${a.addressLine1}, ${a.addressLine2 ? a.addressLine2 + ', ' : ''}${a.city}, ${a.state} - ${a.pincode}\nMobile: ${a.phone}`;
    } else {
      addressStr = 'Customer Address';
    }
    doc.text(addressStr, 40, 140, { width: 300 });

    // Table Header
    const tableTop = 205;
    doc.rect(40, tableTop, 515, 22).fill('#f8fafc');
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9);
    doc.text('Item Description', 45, tableTop + 6);
    doc.text('Size / Color', 270, tableTop + 6);
    doc.text('Qty', 370, tableTop + 6);
    doc.text('Unit Price', 420, tableTop + 6, { align: 'right', width: 50 });
    doc.text('Total', 485, tableTop + 6, { align: 'right', width: 65 });

    let currentY = tableTop + 26;
    doc.font('Helvetica').fontSize(9).fillColor('#1e293b');

    order.items.forEach((item) => {
      const itemTitle = `${item.brand ? item.brand + ' - ' : ''}${item.title}`;
      const itemAttr = `${item.size || 'Free'} / ${item.color || 'Standard'}`;
      const unitPaise = item.priceInPaise || (item.price ? item.price * 100 : 0);
      const rowTotalPaise = unitPaise * item.quantity;

      doc.text(itemTitle, 45, currentY, { width: 220, ellipsis: true });
      doc.text(itemAttr, 270, currentY, { width: 90 });
      doc.text(item.quantity.toString(), 370, currentY);
      doc.text(formatInr(unitPaise), 420, currentY, { align: 'right', width: 50 });
      doc.text(formatInr(rowTotalPaise), 485, currentY, { align: 'right', width: 65 });

      currentY += 20;
    });

    // Divider
    doc.moveTo(40, currentY + 5).lineTo(555, currentY + 5).strokeColor('#e2e8f0').stroke();
    currentY += 15;

    // Pricing Summary Table
    const summaryX = 350;
    const valueX = 475;
    const valueWidth = 75;

    const subtotal = order.subtotalInPaise || (order.subtotal ? order.subtotal * 100 : 0);
    const couponDisc = order.couponDiscountInPaise || order.discountInPaise || 0;
    const deliveryFee = order.deliveryFeeInPaise || 0;
    const codFee = order.codFeeInPaise || 0;
    const total = order.totalInPaise || (order.total ? order.total * 100 : 0);
    const gstIncluded = order.gstIncludedInPaise || Math.round((subtotal * 12) / 112);

    doc.fontSize(9).fillColor('#64748b');
    doc.text('Items Subtotal:', summaryX, currentY);
    doc.fillColor('#0f172a').text(formatInr(subtotal), valueX, currentY, { align: 'right', width: valueWidth });
    currentY += 16;

    if (couponDisc > 0) {
      doc.fillColor('#16a34a').text('Coupon Discount:', summaryX, currentY);
      doc.text(`- ${formatInr(couponDisc)}`, valueX, currentY, { align: 'right', width: valueWidth });
      currentY += 16;
    }

    doc.fillColor('#64748b').text('Delivery Charges:', summaryX, currentY);
    doc.fillColor('#0f172a').text(deliveryFee === 0 ? 'FREE' : formatInr(deliveryFee), valueX, currentY, { align: 'right', width: valueWidth });
    currentY += 16;

    if (codFee > 0) {
      doc.fillColor('#64748b').text('COD Convenience Fee:', summaryX, currentY);
      doc.fillColor('#0f172a').text(formatInr(codFee), valueX, currentY, { align: 'right', width: valueWidth });
      currentY += 16;
    }

    doc.moveTo(summaryX, currentY + 4).lineTo(555, currentY + 4).strokeColor('#cbd5e1').stroke();
    currentY += 10;

    doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a');
    doc.text('Grand Total:', summaryX, currentY);
    doc.text(formatInr(total), valueX, currentY, { align: 'right', width: valueWidth });
    currentY += 18;

    doc.font('Helvetica').fontSize(8).fillColor('#64748b');
    doc.text(`(Includes approx. ${formatInr(gstIncluded)} GST @ 12%)`, summaryX, currentY, { width: 200 });

    // Terms & Footer
    currentY = Math.max(currentY + 50, 680);
    doc.rect(40, currentY, 515, 65).fill('#f8fafc');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569').text('TERMS & CONDITIONS:', 50, currentY + 8);
    doc.font('Helvetica').fillColor('#64748b').fontSize(7.5);
    doc.text('1. All items eligible for 30-day hassle-free return/exchange as per StyleBazaar return policy.', 50, currentY + 20);
    doc.text('2. This is a computer-generated tax invoice and does not require a physical signature.', 50, currentY + 30);
    doc.text('3. For customer support, visit stylebazaar.com/support or call 1800-STYLE-BZ.', 50, currentY + 40);

    doc.end();
  });
}
