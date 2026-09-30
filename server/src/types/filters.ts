export type SortOption =
  | 'recommended'
  | 'whats_new'
  | 'popularity'
  | 'price_low_high'
  | 'price_high_low'
  | 'better_discount'
  | 'customer_rating';

export interface FilterState {
  brands: string[];
  categories: string[];
  priceRange: [number, number] | null;
  colors: string[];
  sizes: string[];
  discountMin: number | null;
  ratingMin: number | null;
  fits: string[];
  fabrics: string[];
  occasions: string[];
  sort: SortOption;
  page: number;
}

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'whats_new', label: "What's New" },
  { value: 'popularity', label: 'Popularity' },
  { value: 'price_low_high', label: 'Price: Low to High' },
  { value: 'price_high_low', label: 'Price: High to Low' },
  { value: 'better_discount', label: 'Better Discount' },
  { value: 'customer_rating', label: 'Customer Rating' },
];

export const DEFAULT_FILTER_STATE: FilterState = {
  brands: [],
  categories: [],
  priceRange: null,
  colors: [],
  sizes: [],
  discountMin: null,
  ratingMin: null,
  fits: [],
  fabrics: [],
  occasions: [],
  sort: 'recommended',
  page: 1,
};

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterSection {
  key: keyof FilterState;
  label: string;
  type: 'checkbox' | 'color' | 'range' | 'rating';
  options?: FilterOption[];
}
