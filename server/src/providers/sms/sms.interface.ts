export interface SendSmsOptions {
  phone: string;
  message: string;
  templateId?: string;
}

export interface SmsProvider {
  name: string;
  sendSms(options: SendSmsOptions): Promise<{ messageId: string }>;
  sendOtp(phone: string, otp: string): Promise<void>;
}
