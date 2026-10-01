import type { Product, FilterState, SortOption } from '../types';

/**
 * Build URL search params from filter state
 */
export function buildQueryString(filters: FilterState): string {
  const params = new URLSearchParams();

  if (filters.brands.length) params.set('brand', filters.brands.join(','));
  if (filters.categories.length) params.set('category', filters.categories.join(','));
  if (filters.priceRange) params.set('price', `${filters.priceRange[0]}-${filters.priceRange[1]}`);
  if (filters.colors.length) params.set('color', filters.colors.join(','));
  if (filters.sizes.length) params.set('size', filters.sizes.join(','));
  if (filters.discountMin) params.set('discount', String(filters.discountMin));
  if (filters.ratingMin) params.set('rating', String(filters.ratingMin));
  if (filters.fits.length) params.set('fit', filters.fits.join(','));
  if (filters.fabrics.length) params.set('fabric', filters.fabrics.join(','));
  if (filters.occasions.length) params.set('occasion', filters.occasions.join(','));
  if (filters.sort !== 'recommended') params.set('sort', filters.sort);
  if (filters.page > 1) params.set('page', String(filters.page));

  const str = params.toString();
  return str ? `?${str}` : '';
}

/**
 * Parse URL search params into filter state
 */
export function parseQueryString(search: string): Partial<FilterState> {
  const params = new URLSearchParams(search);
  const state: Partial<FilterState> = {};

  const brands = params.get('brand') || params.get('brands');
  if (brands && brands.toLowerCase() !== 'all') {
    state.brands = brands.split(',').filter((b) => b && b.toLowerCase() !== 'all');
  }

  const categories = params.get('category') || params.get('categories');
  if (categories && categories.toLowerCase() !== 'all') {
    state.categories = categories.split(',').filter((c) => c && c.toLowerCase() !== 'all');
  }

  const price = params.get('price');
  if (price) {
    const [min, max] = price.split('-').map(Number);
    if (!isNaN(min) && !isNaN(max)) state.priceRange = [min, max];
  }

  const colors = params.get('color') || params.get('colors');
  if (colors) state.colors = colors.split(',');

  const sizes = params.get('size') || params.get('sizes');
  if (sizes) state.sizes = sizes.split(',');

  const discount = params.get('discount') || params.get('discountMin');
  if (discount) state.discountMin = Number(discount);

  const rating = params.get('rating') || params.get('ratingMin');
  if (rating) state.ratingMin = Number(rating);

  const fits = params.get('fit') || params.get('fits');
  if (fits) state.fits = fits.split(',');

  const fabrics = params.get('fabric') || params.get('fabrics');
  if (fabrics) state.fabrics = fabrics.split(',');

  const occasions = params.get('occasion') || params.get('occasions');
  if (occasions) state.occasions = occasions.split(',');

  const sort = params.get('sort') as SortOption | null;
  if (sort) state.sort = sort;

  const page = params.get('page');
  if (page) state.page = Number(page);

  return state;
}

/**
 * Filter products by filter state
 */
export function filterProducts(products: Product[], filters: FilterState): Product[] {
  return products.filter((p) => {
    if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
    if (filters.categories.length) {
      const productCats = p.categoryPath.map((c) => c.toLowerCase());
      const match = filters.categories.some((fc) =>
        productCats.includes(fc.toLowerCase())
      );
      if (!match) return false;
    }
    if (filters.priceRange) {
      if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;
    }
    if (filters.colors.length) {
      const productColors = p.colors.map((c) => c.name.toLowerCase());
      if (!filters.colors.some((fc) => productColors.includes(fc.toLowerCase()))) return false;
    }
    if (filters.sizes.length) {
      const productSizes = p.sizes.filter((s) => s.stock > 0).map((s) => s.name);
      if (!filters.sizes.some((fs) => productSizes.includes(fs))) return false;
    }
    if (filters.discountMin && p.discountPercent < filters.discountMin) return false;
    if (filters.ratingMin && p.rating < filters.ratingMin) return false;
    if (filters.fits.length && !filters.fits.includes(p.fit)) return false;
    if (filters.fabrics.length && !filters.fabrics.includes(p.fabric)) return false;
    if (filters.occasions.length) {
      if (!filters.occasions.some((o) => p.occasion.includes(o))) return false;
    }
    return true;
  });
}

/**
 * Sort products
 */
export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'price_low_high':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_high_low':
      return sorted.sort((a, b) => b.price - a.price);
    case 'better_discount':
      return sorted.sort((a, b) => b.discountPercent - a.discountPercent);
    case 'customer_rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'whats_new':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'popularity':
      return sorted.sort((a, b) => b.ratingCount - a.ratingCount);
    case 'recommended':
    default:
      return sorted;
  }
}

/**
 * Extract unique filter options from a product list
 */
export function extractFilterOptions(products: Product[]) {
  const brands = new Map<string, number>();
  const colors = new Map<string, number>();
  const sizes = new Set<string>();
  const fits = new Map<string, number>();
  const fabrics = new Map<string, number>();
  const occasions = new Map<string, number>();

  let minPrice = Infinity;
  let maxPrice = 0;

  for (const p of products) {
    brands.set(p.brand, (brands.get(p.brand) || 0) + 1);
    for (const c of p.colors) {
      colors.set(c.name, (colors.get(c.name) || 0) + 1);
    }
    for (const s of p.sizes) {
      if (s.stock > 0) sizes.add(s.name);
    }
    fits.set(p.fit, (fits.get(p.fit) || 0) + 1);
    fabrics.set(p.fabric, (fabrics.get(p.fabric) || 0) + 1);
    for (const o of p.occasion) {
      occasions.set(o, (occasions.get(o) || 0) + 1);
    }
    if (p.price < minPrice) minPrice = p.price;
    if (p.price > maxPrice) maxPrice = p.price;
  }

  return {
    brands: Array.from(brands.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count),
    colors: Array.from(colors.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count),
    sizes: Array.from(sizes).sort(),
    fits: Array.from(fits.entries())
      .map(([value, count]) => ({ value, label: value, count })),
    fabrics: Array.from(fabrics.entries())
      .map(([value, count]) => ({ value, label: value, count })),
    occasions: Array.from(occasions.entries())
      .map(([value, count]) => ({ value, label: value, count })),
    priceRange: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice },
  };
}

/**
 * Count active filters
 */
export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.brands.length) count += filters.brands.length;
  if (filters.categories.length) count += filters.categories.length;
  if (filters.priceRange) count += 1;
  if (filters.colors.length) count += filters.colors.length;
  if (filters.sizes.length) count += filters.sizes.length;
  if (filters.discountMin) count += 1;
  if (filters.ratingMin) count += 1;
  if (filters.fits.length) count += filters.fits.length;
  if (filters.fabrics.length) count += filters.fabrics.length;
  if (filters.occasions.length) count += filters.occasions.length;
  return count;
}
