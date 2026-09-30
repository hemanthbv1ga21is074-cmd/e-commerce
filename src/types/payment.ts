export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  orderId?: string;
  error?: string;
}

export interface PaymentProvider {
  name: string;
  createOrder(amount: number, currency: string): Promise<{ orderId: string }>;
  pay(orderId: string, method: PaymentMethod): Promise<PaymentResult>;
  verify(transactionId: string): Promise<boolean>;
}

export type PaymentMethod =
  | { type: 'upi'; vpa: string }
  | { type: 'card'; number: string; expiry: string; cvv: string; name: string }
  | { type: 'netbanking'; bankCode: string }
  | { type: 'wallet'; walletName?: string }
  | { type: 'cod' };

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}
