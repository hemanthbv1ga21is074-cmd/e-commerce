import { describe, it, expect, vi } from 'vitest';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  launchRazorpayCheckout,
} from '../../services/api/payment';

describe('Razorpay Payment Service (Phase 5)', () => {
  it('creates a Razorpay order in paise with currency INR', async () => {
    const order = await createRazorpayOrder(1499);

    expect(order.currency).toBe('INR');
    expect(order.amountPaise).toBe(149900);
    expect(order.orderId).toMatch(/^order_/);
    expect(order.keyId).toBeDefined();
  });

  it('verifies valid Razorpay HMAC signatures', async () => {
    const isValid = await verifyRazorpaySignature(
      'pay_mock12345',
      'order_mock98765',
      'sig_mockabcdef'
    );
    expect(isValid).toBe(true);

    const isInvalid = await verifyRazorpaySignature('', '', '');
    expect(isInvalid).toBe(false);
  });

  it('launches mock checkout and calls onSuccess callback with payment details', async () => {
    const onSuccess = vi.fn();

    await launchRazorpayCheckout({
      amountRupees: 999,
      customerName: 'Rahul Sharma',
      customerEmail: 'rahul@example.com',
      customerPhone: '9876543210',
      onSuccess,
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    const callArg = onSuccess.mock.calls[0][0];
    expect(callArg.razorpay_payment_id).toMatch(/^pay_/);
    expect(callArg.razorpay_order_id).toMatch(/^order_/);
    expect(callArg.razorpay_signature).toMatch(/^sig_/);
  });
});
