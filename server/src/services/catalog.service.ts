import { products } from '../data/products.js';
import { categoryTree, megaMenuSections } from '../data/categories.js';
import { brands } from '../data/brands.js';
import { heroBanners, dealOfTheDay, bankOffers, minDiscountTiles } from '../data/banners.js';
import { pincodeMap } from '../data/pincodes.js';
import { reviewService } from './review.service.js';
import { NotFoundError } from '../utils/errors.js';

export interface CatalogFilterParams {
  gender?: string;
  category?: string;
  brands?: string[];
  priceMin?: number;
  priceMax?: number;
  sizes?: string[];
  colors?: string[];
  discountMin?: number;
  ratingMin?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export class CatalogService {
  async getProducts(params: CatalogFilterParams) {
    let result = [...products];

    // Gender filter
    if (params.gender) {
      const g = params.gender.toLowerCase();
      result = result.filter((p) => p.gender.toLowerCase() === g);
    }

    // Category filter
    if (params.category) {
      const catSlug = params.category.toLowerCase();
      result = result.filter(
        (p) =>
          p.categoryPath.some((c) => c.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '') === catSlug) ||
          p.slug.includes(catSlug)
      );
    }

    // Brand filter
    if (params.brands && params.brands.length > 0) {
      result = result.filter((p) => params.brands!.includes(p.brand));
    }

    // Price range
    if (params.priceMin !== undefined) {
      result = result.filter((p) => p.price >= params.priceMin!);
    }
    if (params.priceMax !== undefined) {
      result = result.filter((p) => p.price <= params.priceMax!);
    }

    // Sizes
    if (params.sizes && params.sizes.length > 0) {
      result = result.filter((p) => p.sizes.some((s) => params.sizes!.includes(s.name) && s.stock > 0));
    }

    // Colors
    if (params.colors && params.colors.length > 0) {
      result = result.filter((p) => p.colors.some((c) => params.colors!.includes(c.name)));
    }

    // Minimum discount
    if (params.discountMin !== undefined && params.discountMin > 0) {
      result = result.filter((p) => p.discountPercent >= params.discountMin!);
    }

    // Minimum rating
    if (params.ratingMin !== undefined && params.ratingMin > 0) {
      result = result.filter((p) => p.rating >= params.ratingMin!);
    }

    // Sort
    const sort = params.sort || 'recommended';
    switch (sort) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        result.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'whats_new':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popularity':
        result.sort((a, b) => b.ratingCount - a.ratingCount);
        break;
      default:
        // recommended
        break;
    }

    // Pagination
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 24));
    const start = (page - 1) * limit;
    const items = result.slice(start, start + limit);

    return {
      items,
      total: result.length,
      page,
      pageSize: limit,
      totalPages: Math.ceil(result.length / limit),
    };
  }

  async getProductBySlug(slug: string) {
    const product = products.find((p) => p.slug === slug);
    if (!product) throw new NotFoundError(`Product not found with slug: ${slug}`);
    return product;
  }

  async getRelatedProducts(productId: string, limit = 8) {
    const target = products.find((p) => p.id === productId);
    if (!target) return [];

    return products
      .filter((p) => p.id !== productId && p.gender === target.gender)
      .sort((a, b) => {
        const aScore = a.categoryPath.filter((c) => target.categoryPath.includes(c)).length;
        const bScore = b.categoryPath.filter((c) => target.categoryPath.includes(c)).length;
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  async search(query: string, limit = 20) {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categoryPath.some((c) => c.toLowerCase().includes(q))
      )
      .slice(0, limit);
  }

  async getTrending(limit = 8) {
    return [...products].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, limit);
  }

  async getCategoryTree() {
    return categoryTree;
  }

  async getMegaMenu() {
    return megaMenuSections;
  }

  async getBrands() {
    return brands;
  }

  async getBanners() {
    return {
      hero: heroBanners,
      dealOfTheDay: {
        ...dealOfTheDay,
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      },
      minDiscountTiles,
      bankOffers,
    };
  }

  async checkPincode(pincode: string) {
    const data = pincodeMap[pincode];
    if (data) {
      const est = new Date();
      est.setDate(est.getDate() + data.estimatedDays);
      return {
        ...data,
        estimatedDate: est.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
      };
    }

    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      const est = new Date();
      est.setDate(est.getDate() + 5);
      return {
        deliverable: true,
        city: 'Your City',
        state: 'Your State',
        estimatedDays: 5,
        codAvailable: true,
        estimatedDate: est.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
      };
    }

    return null;
  }

  async getProductReviews(productId: string) {
    return reviewService.getReviewsByProductId(productId);
  }
}

export const catalogService = new CatalogService();
