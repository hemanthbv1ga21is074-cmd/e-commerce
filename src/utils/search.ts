import type { Product } from '../types';

const GENERIC_FASHION_TERMS = new Set([
  'cloth', 'clothes', 'clothing', 'clothings', 'apparel', 'garment', 'garments', 'fashion', 'wear', 'outfit', 'outfits', 'all'
]);

function stemTerm(t: string): string {
  if (t.endsWith('es') && t.length > 4) return t.slice(0, -2);
  if (t.endsWith('s') && t.length > 3) return t.slice(0, -1);
  return t;
}

/**
 * Simple fuzzy search scoring — matches on title, brand, category path, tags
 */
export function searchProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return [];

  const rawTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const activeTerms = rawTerms.filter((t) => !GENERIC_FASHION_TERMS.has(t));
  if (activeTerms.length === 0) {
    return products;
  }

  const scored = products
    .map((product) => {
      const searchableText = [
        product.title,
        product.brand,
        product.gender,
        ...product.categoryPath,
        ...product.tags,
        product.fabric,
        product.pattern,
        ...product.occasion,
      ]
        .join(' ')
        .toLowerCase();

      let score = 0;
      for (const term of activeTerms) {
        const stem = stemTerm(term);
        if (searchableText.includes(term) || (stem.length >= 3 && searchableText.includes(stem))) {
          score += 1;
          // Boost for title/brand/gender match
          if (product.title.toLowerCase().includes(term) || product.title.toLowerCase().includes(stem)) score += 3;
          if (product.brand.toLowerCase().includes(term)) score += 2;
          if (product.gender.toLowerCase() === term) score += 2;
        }
      }

      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((item) => item.product);
}

/**
 * Generate search suggestions from products
 */
export function getSearchSuggestions(
  products: Product[],
  query: string,
  maxResults: number = 8
): string[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const suggestions = new Set<string>();

  // Brand matches
  for (const p of products) {
    if (p.brand.toLowerCase().includes(q)) {
      suggestions.add(p.brand);
    }
    if (suggestions.size >= maxResults) break;
  }

  // Category matches
  for (const p of products) {
    for (const cat of p.categoryPath) {
      if (cat.toLowerCase().includes(q)) {
        suggestions.add(cat);
      }
    }
    if (suggestions.size >= maxResults) break;
  }

  // Title matches
  for (const p of products) {
    if (p.title.toLowerCase().includes(q)) {
      suggestions.add(p.title);
    }
    if (suggestions.size >= maxResults) break;
  }

  return Array.from(suggestions).slice(0, maxResults);
}
