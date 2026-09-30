export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  name: string;
  sendEmail(options: SendEmailOptions): Promise<{ messageId: string }>;
  sendVerificationEmail(to: string, token: string): Promise<void>;
  sendPasswordResetEmail(to: string, token: string): Promise<void>;
  sendOrderConfirmationEmail(to: string, orderDetails: any): Promise<void>;
}
