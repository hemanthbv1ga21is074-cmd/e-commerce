import { describe, it, expect } from 'vitest';
import {
  filterProducts,
  sortProducts,
  buildQueryString,
  parseQueryString,
  countActiveFilters,
} from '../../utils/filters';
import { DEFAULT_FILTER_STATE, type Product, type FilterState } from '../../types';

describe('Filter & Sorting Logic', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      slug: 'blue-tshirt',
      title: 'Blue Crew Neck T-Shirt',
      brand: 'Zephyr',
      gender: 'men',
      categoryPath: ['Men', 'Topwear', 'T-Shirts'],
      mrp: 1000,
      price: 600,
      discountPercent: 40,
      sizes: [{ name: 'M', stock: 5 }, { name: 'L', stock: 0 }],
      colors: [{ name: 'Blue', hex: '#0000ff', images: [] }],
      fabric: 'Cotton',
      fit: 'Slim Fit',
      pattern: 'Solid',
      occasion: ['Casual'],
      rating: 4.5,
      ratingCount: 150,
      images: [],
      description: 'A blue tee',
      highlights: [],
      careInstructions: [],
      deliveryEstimateDays: 3,
      returnWindowDays: 30,
      tags: ['casual', 'blue'],
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: '2',
      slug: 'black-jeans',
      title: 'Black Slim Fit Jeans',
      brand: 'IronForge',
      gender: 'men',
      categoryPath: ['Men', 'Bottomwear', 'Jeans'],
      mrp: 2000,
      price: 1500,
      discountPercent: 25,
      sizes: [{ name: '32', stock: 10 }],
      colors: [{ name: 'Black', hex: '#000000', images: [] }],
      fabric: 'Denim',
      fit: 'Slim Fit',
      pattern: 'Solid',
      occasion: ['Casual'],
      rating: 4.1,
      ratingCount: 80,
      images: [],
      description: 'Black denim jeans',
      highlights: [],
      careInstructions: [],
      deliveryEstimateDays: 4,
      returnWindowDays: 30,
      tags: ['denim', 'black'],
      createdAt: '2026-02-01T00:00:00Z',
    },
    {
      id: '3',
      slug: 'red-dress',
      title: 'Red Floral Maxi Dress',
      brand: 'Saheli',
      gender: 'women',
      categoryPath: ['Women', 'Western', 'Dresses'],
      mrp: 3000,
      price: 1200,
      discountPercent: 60,
      sizes: [{ name: 'S', stock: 2 }],
      colors: [{ name: 'Red', hex: '#ff0000', images: [] }],
      fabric: 'Georgette',
      fit: 'Flared',
      pattern: 'Floral',
      occasion: ['Party', 'Festive'],
      rating: 4.8,
      ratingCount: 300,
      images: [],
      description: 'Beautiful red dress',
      highlights: [],
      careInstructions: [],
      deliveryEstimateDays: 2,
      returnWindowDays: 30,
      tags: ['dress', 'floral'],
      createdAt: '2026-03-01T00:00:00Z',
    },
  ];

  it('filters by brand correctly', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, brands: ['Zephyr'] };
    const filtered = filterProducts(mockProducts, filters);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].brand).toBe('Zephyr');
  });

  it('filters by price range correctly', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, priceRange: [1000, 2000] };
    const filtered = filterProducts(mockProducts, filters);
    expect(filtered).toHaveLength(2); // Jeans (1500) and Dress (1200)
  });

  it('filters by discount minimum correctly', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, discountMin: 50 };
    const filtered = filterProducts(mockProducts, filters);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('3');
  });

  it('sorts by price low to high and high to low', () => {
    const lowToHigh = sortProducts(mockProducts, 'price_low_high');
    expect(lowToHigh[0].price).toBe(600);
    expect(lowToHigh[2].price).toBe(1500);

    const highToLow = sortProducts(mockProducts, 'price_high_low');
    expect(highToLow[0].price).toBe(1500);
    expect(highToLow[2].price).toBe(600);
  });

  it('sorts by customer rating', () => {
    const byRating = sortProducts(mockProducts, 'customer_rating');
    expect(byRating[0].rating).toBe(4.8);
    expect(byRating[2].rating).toBe(4.1);
  });

  it('builds and parses query strings accurately', () => {
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      brands: ['Zephyr', 'IronForge'],
      priceRange: [500, 1500],
      discountMin: 30,
      sort: 'price_low_high',
    };

    const qs = buildQueryString(filters);
    expect(qs).toContain('brand=Zephyr%2CIronForge');
    expect(qs).toContain('price=500-1500');
    expect(qs).toContain('discount=30');
    expect(qs).toContain('sort=price_low_high');

    const parsed = parseQueryString(qs.replace(/^\?/, ''));
    expect(parsed.brands).toEqual(['Zephyr', 'IronForge']);
    expect(parsed.priceRange).toEqual([500, 1500]);
    expect(parsed.discountMin).toBe(30);
    expect(parsed.sort).toBe('price_low_high');
  });

  it('counts active filters correctly', () => {
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      brands: ['Zephyr'],
      colors: ['Blue', 'Black'],
      discountMin: 20,
    };
    // 1 brand + 2 colors + 1 discount = 4
    expect(countActiveFilters(filters)).toBe(4);
  });
});
