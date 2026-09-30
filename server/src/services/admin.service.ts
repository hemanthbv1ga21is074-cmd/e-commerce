import { products } from '../data/products.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export interface InventoryVariantItem {
  variantId: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  brand: string;
  size: string;
  stock: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  mrp: number;
  price: number;
  image: string;
}

export interface InventoryQueryOptions {
  lowStockOnly?: boolean;
  threshold?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export class AdminService {
  async getInventory(options?: InventoryQueryOptions) {
    const threshold = options?.threshold ?? 5;

    const allVariants: InventoryVariantItem[] = [];

    for (const p of products) {
      for (const s of p.sizes) {
        allVariants.push({
          variantId: `${p.id}-${s.name.toLowerCase()}`,
          productId: p.id,
          productSlug: p.slug,
          productTitle: p.title,
          brand: p.brand,
          size: s.name,
          stock: s.stock,
          isLowStock: s.stock > 0 && s.stock <= threshold,
          isOutOfStock: s.stock === 0,
          mrp: p.mrp,
          price: p.price,
          image: p.images[0] || '',
        });
      }
    }

    const summary = {
      totalVariants: allVariants.length,
      lowStockVariants: allVariants.filter((v) => v.stock > 0 && v.stock <= threshold).length,
      outOfStockVariants: allVariants.filter((v) => v.stock === 0).length,
      threshold,
    };

    let filtered = allVariants;

    if (options?.lowStockOnly) {
      filtered = filtered.filter((v) => v.stock <= threshold);
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      filtered = filtered.filter(
        (v) =>
          v.productId.toLowerCase().includes(q) ||
          v.productTitle.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.size.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const page = options?.page && options.page > 0 ? options.page : 1;
    const limit = options?.limit && options.limit > 0 ? options.limit : 50;
    const start = (page - 1) * limit;
    const variants = filtered.slice(start, start + limit);

    return {
      variants,
      summary,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updateVariantStock(productId: string, sizeName: string, newStock: number) {
    if (typeof newStock !== 'number' || isNaN(newStock) || newStock < 0) {
      throw new BadRequestError('Stock must be a non-negative number.');
    }

    const prod = products.find((p) => p.id === productId || p.slug === productId);
    if (!prod) {
      throw new NotFoundError(`Product not found with ID: ${productId}`);
    }

    const sizeObj = prod.sizes.find(
      (s) => s.name.toLowerCase() === sizeName.toLowerCase()
    );
    if (!sizeObj) {
      throw new NotFoundError(`Size "${sizeName}" not found for product "${prod.title}".`);
    }

    sizeObj.stock = Math.floor(newStock);

    return {
      productId: prod.id,
      productTitle: prod.title,
      size: sizeObj.name,
      stock: sizeObj.stock,
      updated: true,
    };
  }
}

export const adminService = new AdminService();
