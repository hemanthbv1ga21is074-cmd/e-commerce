import { EmailProvider, SendEmailOptions } from './email.interface.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';

export class DevEmailProvider implements EmailProvider {
  public name = 'dev-console-email';

  async sendEmail(options: SendEmailOptions): Promise<{ messageId: string }> {
    const messageId = `dev_msg_${Date.now()}`;
    logger.info(
      { to: options.to, subject: options.subject, messageId },
      `[DEV EMAIL DISPATCHED] -> To: ${options.to} | Subject: "${options.subject}"`
    );
    return { messageId };
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verifyUrl = `${env.API_URL}/api/auth/verify-email?token=${token}`;
    logger.info(
      `\n=======================================================\n[DEV EMAIL: VERIFY ACCOUNT]\nTo: ${to}\nLink: ${verifyUrl}\n=======================================================\n`
    );
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${env.APP_URL}/login?resetToken=${token}`;
    logger.info(
      `\n=======================================================\n[DEV EMAIL: PASSWORD RESET]\nTo: ${to}\nLink: ${resetUrl}\n=======================================================\n`
    );
  }

  async sendOrderConfirmationEmail(to: string, orderDetails: any): Promise<void> {
    logger.info(
      `\n=======================================================\n[DEV EMAIL: ORDER CONFIRMED]\nTo: ${to}\nOrder ID: ${orderDetails.id}\nTotal: ₹${(orderDetails.totalInPaise / 100).toLocaleString('en-IN')}\nPayment: ${orderDetails.paymentMethod}\n=======================================================\n`
    );
  }
}

export const emailProvider = new DevEmailProvider();
