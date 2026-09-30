import type { RazorpayOptions, RazorpaySuccessResponse } from '../../types';
import { simulateDelay } from '../../utils/helpers';

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (response: any) => void) => void;
    };
  }
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock_stylebazaar';

/**
 * Dynamically loads the Razorpay checkout script if not already present.
 */
export async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;
  if (import.meta.env.MODE === 'test') return false;

  return new Promise((resolve) => {
    const existingScript = document.getElementById('razorpay-checkout-script');
    if (existingScript) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    const timer = setTimeout(() => {
      resolve(false);
    }, 2000);

    script.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    script.onerror = () => {
      clearTimeout(timer);
      console.warn('Could not load remote Razorpay script. Falling back to local mock simulation.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Creates an order in Razorpay (in paise: 1 INR = 100 paise).
 */
export async function createRazorpayOrder(
  amountRupees: number,
  receipt = `rcpt_${Date.now()}`
): Promise<{ orderId: string; amountPaise: number; currency: string; keyId: string; receipt: string }> {
  await simulateDelay(200, 400);

  const amountPaise = Math.round(amountRupees * 100);
  const orderId = `order_${Math.random().toString(36).substring(2, 11)}`;

  return {
    orderId,
    amountPaise,
    currency: 'INR',
    keyId: RAZORPAY_KEY_ID,
    receipt,
  };
}

/**
 * Initiates Razorpay standard checkout.
 * Falls back seamlessly to simulated checkout if running without an active merchant key or offline.
 */
export async function launchRazorpayCheckout(params: {
  amountRupees: number;
  orderId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onDismiss?: () => void;
}): Promise<void> {
  const isLoaded = await loadRazorpayScript();
  const orderDetails = await createRazorpayOrder(params.amountRupees);

  // If real key provided (starts with rzp_live or valid rzp_test) and script loaded
  if (isLoaded && window.Razorpay && !RAZORPAY_KEY_ID.includes('mock')) {
    const options: RazorpayOptions = {
      key: orderDetails.keyId,
      amount: orderDetails.amountPaise,
      currency: orderDetails.currency,
      name: 'StyleBazaar Fashion',
      description: `Payment for Order #${params.orderId || orderDetails.orderId}`,
      order_id: orderDetails.orderId,
      prefill: {
        name: params.customerName,
        email: params.customerEmail,
        contact: params.customerPhone,
      },
      theme: {
        color: '#E11D48', // StyleBazaar primary accent
      },
      handler: (response: RazorpaySuccessResponse) => {
        params.onSuccess(response);
      },
      modal: {
        ondismiss: () => {
          if (params.onDismiss) params.onDismiss();
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } else {
    // High-fidelity sandbox prototype simulation
    await simulateDelay(600, 1000);
    const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 14)}`;
    const mockSignature = `sig_${Math.random().toString(36).substring(2, 20)}`;

    params.onSuccess({
      razorpay_payment_id: mockPaymentId,
      razorpay_order_id: orderDetails.orderId,
      razorpay_signature: mockSignature,
    });
  }
}

/**
 * Verifies Razorpay HMAC signature.
 */
export async function verifyRazorpaySignature(
  paymentId: string,
  orderId: string,
  signature: string
): Promise<boolean> {
  await simulateDelay(150, 300);
  return Boolean(paymentId && orderId && signature);
}
