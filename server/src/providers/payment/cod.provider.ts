import { PaymentProvider, CreatePaymentResult, VerifyPaymentResult } from './payment.interface.js';
import { logger } from '../../utils/logger.js';

export class CodProvider implements PaymentProvider {
  public name = 'COD';

  async createPayment(orderId: string, amountInPaise: number): Promise<CreatePaymentResult> {
    const providerRef = `COD_${orderId}_${Date.now()}`;
    logger.info(
      { orderId, amountInPaise, providerRef },
      `[COD PAYMENT CREATED] Payable on delivery: ₹${amountInPaise / 100}`
    );

    return {
      paymentId: `pay_${Date.now()}`,
      providerRef,
      status: 'COD_PENDING',
    };
  }

  async verifyPayment(paymentId: string): Promise<VerifyPaymentResult> {
    // Admin marks COD as collected upon successful delivery
    logger.info({ paymentId }, `[COD PAYMENT VERIFIED / COLLECTED]`);
    return {
      success: true,
      status: 'COD_COLLECTED',
    };
  }

  async refundPayment(paymentId: string, amountInPaise: number, reason: string): Promise<{ refundId: string; success: boolean }> {
    logger.info({ paymentId, amountInPaise, reason }, `[COD REFUND INITIATED -> WALLET CREDIT]`);
    return {
      refundId: `ref_cod_${Date.now()}`,
      success: true,
    };
  }
}

export const codProvider = new CodProvider();
