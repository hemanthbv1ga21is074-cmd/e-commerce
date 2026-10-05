export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender?: 'Male' | 'Female' | 'Other';
  birthday?: string;
  alternatePhone?: string;
  avatar?: string;
  addresses: Address[];
  walletBalance: number;
  walletTransactions?: WalletTransaction[];
  loyaltyPoints: number;
  loyaltyTier: 'Silver' | 'Gold' | 'Platinum';
  role?: 'admin' | 'customer';
  createdAt: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  city: string;
  state: string;
  addressLine1: string;
  addressLine2?: string;
  locality: string;
  type: 'Home' | 'Work';
  isDefault: boolean;
}
