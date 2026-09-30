import { SmsProvider, SendSmsOptions } from './sms.interface.js';
import { logger } from '../../utils/logger.js';

export class DevSmsProvider implements SmsProvider {
  public name = 'dev-console-sms-stub';

  async sendSms(options: SendSmsOptions): Promise<{ messageId: string }> {
    const messageId = `sms_${Date.now()}`;
    logger.info(
      { phone: options.phone, message: options.message, messageId },
      `[DEV SMS LOG] To: ${options.phone} -> "${options.message}"`
    );
    return { messageId };
  }

  async sendOtp(phone: string, otp: string): Promise<void> {
    logger.info(
      `\n[DEV SMS OTP STUB] Mobile: +91-${phone} | OTP: ${otp} (Not used in live flow; phone OTP disabled by default)\n`
    );
  }
}

export const smsProvider = new DevSmsProvider();
