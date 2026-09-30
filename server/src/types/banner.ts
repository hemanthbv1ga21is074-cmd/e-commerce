export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  cta?: string;
  href: string;
  image?: string;
  gradient?: string;
  textColor?: string;
}

export interface DealOfTheDay {
  id: string;
  title: string;
  subtitle: string;
  endTime: string;  // ISO date string
  productIds: string[];
  bannerGradient: string;
}

export interface BankOffer {
  id: string;
  bank: string;
  logo?: string;
  title: string;
  description: string;
  code?: string;
  minCartValue?: number;
  maxDiscount?: number;
  validTill: string;
}
