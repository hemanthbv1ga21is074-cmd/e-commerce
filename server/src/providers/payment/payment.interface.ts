export interface CreatePaymentResult {
  paymentId: string;
  providerRef?: string;
  status: 'COD_PENDING' | 'PENDING' | 'SUCCESS';
}

export interface VerifyPaymentResult {
  success: boolean;
  status: 'COD_COLLECTED' | 'SUCCESS' | 'FAILED';
  error?: string;
}

export interface PaymentProvider {
  name: string;
  createPayment(orderId: string, amountInPaise: number, metadata?: Record<string, any>): Promise<CreatePaymentResult>;
  verifyPayment(paymentId: string, payload?: any): Promise<VerifyPaymentResult>;
  refundPayment(paymentId: string, amountInPaise: number, reason: string): Promise<{ refundId: string; success: boolean }>;
}
