import type { Gender } from './common';

export interface ProductSize {
  name: string;
  stock: number;
}

export interface ProductColor {
  name: string;
  hex: string;
  images: string[];
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  gender: Gender;
  categoryPath: string[];
  mrp: number;
  price: number;
  discountPercent: number;
  sizes: ProductSize[];
  colors: ProductColor[];
  fabric: string;
  fit: string;
  pattern: string;
  occasion: string[];
  rating: number;
  ratingCount: number;
  images: string[];
  description: string;
  highlights: string[];
  careInstructions: string[];
  deliveryEstimateDays: number;
  returnWindowDays: number;
  tags: string[];
  createdAt: string;
}

export interface ProductCardData {
  id: string;
  slug: string;
  title: string;
  brand: string;
  mrp: number;
  price: number;
  discountPercent: number;
  rating: number;
  ratingCount: number;
  images: string[];
  gender: Gender;
  categoryPath: string[];
}
