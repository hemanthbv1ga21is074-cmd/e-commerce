import type { Banner, DealOfTheDay, BankOffer } from '../types';

export const heroBanners: Banner[] = [
  {
    id: 'hb1',
    title: 'End of Season Sale',
    subtitle: 'Up to 70% off on everything',
    cta: 'Shop Now',
    href: '/search?discount=40',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(233, 69, 96, 0.88) 0%, rgba(26, 26, 46, 0.94) 100%)',
    textColor: '#ffffff',
  },
  {
    id: 'hb2',
    title: 'New Arrivals',
    subtitle: 'Fresh styles just dropped',
    cta: 'Explore',
    href: '/search?sort=whats_new',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(102, 126, 234, 0.88) 0%, rgba(118, 75, 162, 0.94) 100%)',
    textColor: '#ffffff',
  },
  {
    id: 'hb3',
    title: 'Ethnic Edit',
    subtitle: 'Festive collection now live',
    cta: 'Shop Ethnic',
    href: '/search?occasion=Festive',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(246, 211, 101, 0.90) 0%, rgba(253, 160, 133, 0.94) 100%)',
    textColor: '#1a1a1a',
  },
  {
    id: 'hb4',
    title: 'Activewear Drop',
    subtitle: 'Performance meets style',
    cta: 'Get Moving',
    href: '/search?occasion=Sports',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1600&auto=format&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(161, 140, 209, 0.88) 0%, rgba(251, 194, 235, 0.94) 100%)',
    textColor: '#1a1a1a',
  },
];

export const dealOfTheDay: DealOfTheDay = {
  id: 'dotd1',
  title: 'Deal of the Day',
  subtitle: 'Grab before it\'s gone!',
  endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  productIds: ['m1', 'm15', 'w1', 'w7', 'k12', 'm24'],
  bannerGradient: 'linear-gradient(135deg, #ff6b35 0%, #f7c948 100%)',
};

export const bankOffers: BankOffer[] = [
  { id: 'bo1', bank: 'HDFC Bank', title: '10% Instant Discount', description: 'On HDFC Credit & Debit Cards. Min order ₹2,000. Max discount ₹500.', code: 'HDFC10', minCartValue: 2000, maxDiscount: 500, validTill: '2026-12-31T23:59:59Z' },
  { id: 'bo2', bank: 'ICICI Bank', title: '₹200 Off', description: 'On ICICI Credit Cards. Min order ₹1,500.', code: 'ICICI200', minCartValue: 1500, maxDiscount: 200, validTill: '2026-12-31T23:59:59Z' },
  { id: 'bo3', bank: 'SBI', title: '15% Cashback', description: 'On SBI Credit Cards. Min order ₹2,500. Max cashback ₹750.', code: 'SBI15', minCartValue: 2500, maxDiscount: 750, validTill: '2026-12-31T23:59:59Z' },
  { id: 'bo4', bank: 'Axis Bank', title: 'EMI from ₹167/mo', description: 'No-cost EMI on Axis Bank Cards. Min order ₹3,000.', minCartValue: 3000, validTill: '2026-12-31T23:59:59Z' },
  { id: 'bo5', bank: 'Paytm', title: 'Flat ₹150 Cashback', description: 'Pay via Paytm UPI. Min order ₹999.', code: 'PAYTM150', minCartValue: 999, maxDiscount: 150, validTill: '2026-12-31T23:59:59Z' },
];

export const minDiscountTiles = [
  {
    label: 'Min 30% Off',
    subtitle: 'Casual Essentials',
    discount: 30,
    gradient: 'linear-gradient(135deg, rgba(79, 172, 254, 0.85), rgba(0, 242, 254, 0.85))',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    href: '/search?discount=30',
  },
  {
    label: 'Min 40% Off',
    subtitle: 'Denim & Bottoms',
    discount: 40,
    gradient: 'linear-gradient(135deg, rgba(67, 233, 123, 0.85), rgba(56, 249, 215, 0.85))',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
    href: '/search?discount=40',
  },
  {
    label: 'Min 50% Off',
    subtitle: 'Festive & Ethnic',
    discount: 50,
    gradient: 'linear-gradient(135deg, rgba(250, 112, 154, 0.85), rgba(254, 225, 64, 0.85))',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
    href: '/search?discount=50',
  },
  {
    label: 'Min 60% Off',
    subtitle: 'Jackets & Outerwear',
    discount: 60,
    gradient: 'linear-gradient(135deg, rgba(161, 140, 209, 0.85), rgba(251, 194, 235, 0.85))',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
    href: '/search?discount=60',
  },
];
