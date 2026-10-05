/**
 * Products API service — supports both mock (VITE_USE_MOCK=true) and real backend.
 *
 * Real backend endpoints:
 *   GET /api/products             — filtered, sorted, paginated listing
 *   GET /api/products/search      — full-text search
 *   GET /api/products/trending    — trending products
 *   GET /api/products/:slug       — product detail
 *   GET /api/products/:id/related — related products
 */
import { apiCall, api } from './client';
import { products as allProducts } from '../../data/products';
import { filterProducts, sortProducts } from '../../utils/filters';
import { searchProducts } from '../../utils/search';
import type { Product, FilterState, PaginatedResponse, Gender } from '../../types';
import { ITEMS_PER_PAGE } from '../../utils/constants';

/* ─── Backend response shapes ─── */
interface ApiProductListResponse {
  success: boolean;
  data: {
    items: Product[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

interface ApiProductResponse {
  success: boolean;
  data: Product;
}

interface ApiProductsResponse {
  success: boolean;
  data: Product[];
}




/* ─── Effective Products Resolver (Base + Admin Custom Products) ─── */
export function getEffectiveProducts(): Product[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('sb_admin_products') : null;
    if (raw) {
      const custom: Product[] = JSON.parse(raw);
      if (Array.isArray(custom) && custom.length > 0) {
        return [...custom, ...allProducts];
      }
    }
  } catch {
    /* fallback to static base */
  }
  return allProducts;
}

/* ─── Category Slug Matcher ─── */
export function matchCategorySlug(product: Product, categorySlug: string): boolean {
  if (!categorySlug) return true;
  const rawSlug = categorySlug.toLowerCase().trim();
  const slugWords = rawSlug.replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);

  if (product.slug.toLowerCase().includes(rawSlug)) return true;

  return product.categoryPath.some((cat) => {
    const rawCat = cat.toLowerCase();
    const catSlugNormalized = rawCat.replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const simpleCat = rawCat.replace(/[^a-z0-9]+/g, '');
    const simpleSlug = rawSlug.replace(/[^a-z0-9]+/g, '');

    if (catSlugNormalized === rawSlug || simpleCat.includes(simpleSlug) || simpleSlug.includes(simpleCat)) {
      return true;
    }

    return slugWords.some((sw) => {
      const stem = sw.endsWith('es') ? sw.slice(0, -2) : sw.endsWith('s') ? sw.slice(0, -1) : sw;
      if (stem.length < 3) return false;
      return rawCat.includes(stem) || product.slug.toLowerCase().includes(stem);
    });
  });
}

/* ─── getProducts ─── */
export async function getProducts(
  filters: FilterState,
  gender?: Gender,
  categorySlug?: string
): Promise<PaginatedResponse<Product>> {
  return apiCall(
    () => {
      const catalog = getEffectiveProducts();
      let filtered = [...catalog];
      if (gender) filtered = filtered.filter((p) => p.gender === gender);
      if (categorySlug) {
        filtered = filtered.filter((p) => matchCategorySlug(p, categorySlug));
      }
      filtered = filterProducts(filtered, filters);
      filtered = sortProducts(filtered, filters.sort);
      const page = filters.page || 1;
      const start = (page - 1) * ITEMS_PER_PAGE;
      const items = filtered.slice(start, start + ITEMS_PER_PAGE);
      return { items, total: filtered.length, page, pageSize: ITEMS_PER_PAGE, totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE) };
    },
    async () => {
      const qs = new URLSearchParams();
      qs.set('page', String(filters.page || 1));
      qs.set('limit', String(ITEMS_PER_PAGE));
      if (gender) qs.set('gender', gender);
      if (categorySlug) qs.set('category', categorySlug);
      if (filters.sort) qs.set('sort', filters.sort);
      if (filters.priceRange) {
        qs.set('priceMin', String(filters.priceRange[0]));
        qs.set('priceMax', String(filters.priceRange[1]));
      }
      if (filters.brands?.length) filters.brands.forEach((b) => qs.append('brands', b));
      if (filters.sizes?.length) filters.sizes.forEach((s) => qs.append('sizes', s));
      if (filters.colors?.length) filters.colors.forEach((c) => qs.append('colors', c));
      if (filters.discountMin != null) qs.set('discountMin', String(filters.discountMin));
      if (filters.ratingMin != null) qs.set('ratingMin', String(filters.ratingMin));

      const res = await api<ApiProductListResponse>(`/products?${qs.toString()}`);
      return res.data;
    }
  );
}

/* ─── getProductBySlug ─── */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return apiCall(
    () => getEffectiveProducts().find((p) => p.slug === slug) || null,
    async () => {
      try {
        const res = await api<ApiProductResponse>(`/products/${slug}`);
        return res.data;
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes('404')) return null;
        throw e;
      }
    }
  );
}

/* ─── getRelatedProducts ─── */
export async function getRelatedProducts(productId: string, limit = 8): Promise<Product[]> {
  return apiCall(
    () => {
      const catalog = getEffectiveProducts();
      const product = catalog.find((p) => p.id === productId);
      if (!product) return [];
      return catalog
        .filter((p) => p.id !== productId && p.gender === product.gender)
        .sort((a, b) => {
          const aScore = a.categoryPath.filter((c) => product.categoryPath.includes(c)).length;
          const bScore = b.categoryPath.filter((c) => product.categoryPath.includes(c)).length;
          return bScore - aScore;
        })
        .slice(0, limit);
    },
    async () => {
      const res = await api<ApiProductsResponse>(`/products/${productId}/related?limit=${limit}`);
      return res.data;
    }
  );
}

/* ─── searchProductsApi ─── */
export async function searchProductsApi(query: string): Promise<Product[]> {
  return apiCall(
    () => searchProducts(getEffectiveProducts(), query),
    async () => {
      const res = await api<ApiProductsResponse>(`/products/search?q=${encodeURIComponent(query)}`);
      return res.data;
    }
  );
}

/* ─── getTrendingProducts ─── */
export async function getTrendingProducts(limit = 8): Promise<Product[]> {
  return apiCall(
    () => [...getEffectiveProducts()].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, limit),
    async () => {
      const res = await api<ApiProductsResponse>(`/products/trending?limit=${limit}`);
      return res.data;
    }
  );
}

/* ─── getProductsByIds (mock-only helper — no backend endpoint needed) ─── */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  return apiCall(
    () => getEffectiveProducts().filter((p) => ids.includes(p.id)),
    async () => {
      // Batch fetch via individual calls if backend doesn't have a batch endpoint
      const results = await Promise.allSettled(
        ids.map((id) => api<ApiProductResponse>(`/products/${id}`).then((r) => r.data))
      );
      return results
        .filter((r): r is PromiseFulfilledResult<Product> => r.status === 'fulfilled')
        .map((r) => r.value);
    }
  );
}

/* ─── getAllProducts (mock-only helper) ─── */
export async function getAllProducts(): Promise<Product[]> {
  return apiCall(
    () => getEffectiveProducts(),
    async () => {
      const res = await api<ApiProductListResponse>('/products?limit=200');
      return res.data.items;
    }
  );
}
