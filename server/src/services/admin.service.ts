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

  async createProduct(data: any) {
    const { isDbAvailable, prisma } = await import('../db/client.js');
    const dbActive = await isDbAvailable();

    const title = data.title?.trim();
    const brandName = data.brand?.trim() || 'StyleBazaar';
    const slug = `${brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const gender = (data.gender || 'men').toUpperCase();
    const priceInPaise = Math.round((Number(data.price) || 0) * 100);
    const mrpInPaise = Math.round((Number(data.mrp) || Number(data.price) || 0) * 100);
    const discountPercent = mrpInPaise > priceInPaise ? Math.round(((mrpInPaise - priceInPaise) / mrpInPaise) * 100) : 0;

    if (dbActive) {
      let brand = await prisma.brand.findFirst({
        where: { name: { equals: brandName, mode: 'insensitive' } },
      });
      if (!brand) {
        brand = await prisma.brand.create({
          data: {
            name: brandName,
            slug: brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            tagline: `${brandName} Fashion`,
          },
        });
      }

      const created = await prisma.product.create({
        data: {
          slug,
          title,
          description: data.description || `Premium quality ${title} by ${brandName}.`,
          gender: gender === 'WOMEN' ? 'WOMEN' : gender === 'KIDS' ? 'KIDS' : 'MEN',
          categoryPath: data.categoryPath || [data.gender === 'women' ? 'Women' : data.gender === 'kids' ? 'Kids' : 'Men', 'Topwear', data.category || 'Apparel'],
          brandId: brand.id,
          mrpInPaise,
          priceInPaise,
          discountPercent,
          fabric: data.fabric || 'Cotton',
          fit: data.fit || 'Regular',
          pattern: data.pattern || 'Solid',
          occasion: data.occasion || ['Casual'],
          highlights: data.highlights || ['Premium quality'],
          careInstructions: data.careInstructions || ['Machine wash'],
          tags: data.tags || ['new'],
          rating: 4.5,
          ratingCount: 1,
          isArchived: false,
        },
      });

      // Images
      if (Array.isArray(data.images) && data.images.length > 0) {
        await prisma.productImage.createMany({
          data: data.images.map((url: string, idx: number) => ({
            productId: created.id,
            url,
            altText: `${title} image ${idx + 1}`,
            sortOrder: idx,
          })),
        });
      }

      // Sizes / Variants
      const sizes = Array.isArray(data.sizes) && data.sizes.length > 0
        ? data.sizes
        : [{ name: 'M', stock: 15 }];

      await prisma.productVariant.createMany({
        data: sizes.map((s: { name: string; stock: number }) => ({
          productId: created.id,
          skuCode: `${created.id}-${s.name.toLowerCase()}`,
          size: s.name,
          colorName: 'Standard',
          colorHex: '#1a1a2e',
          stock: Math.max(0, Number(s.stock) || 0),
        })),
      });

      return {
        id: created.id,
        slug: created.slug,
        title: created.title,
        brand: brandName,
        price: Number(data.price),
        mrp: Number(data.mrp),
        discountPercent,
        images: data.images || [],
        sizes,
      };
    }

    // In-memory fallback
    const newProd = {
      id: `custom-${Date.now()}`,
      slug,
      title,
      brand: brandName,
      gender: data.gender || 'men',
      categoryPath: data.categoryPath || ['Men', 'Topwear', 'Apparel'],
      price: Number(data.price),
      mrp: Number(data.mrp),
      discountPercent,
      fabric: data.fabric || 'Cotton',
      fit: data.fit || 'Regular',
      pattern: 'Solid',
      occasion: ['Casual'],
      description: data.description || '',
      highlights: ['Premium quality'],
      careInstructions: ['Machine wash'],
      deliveryEstimateDays: 4,
      returnWindowDays: 30,
      images: data.images || [],
      colors: [{ name: 'Standard', hex: '#1a1a2e', images: data.images || [] }],
      sizes: data.sizes || [{ name: 'M', stock: 15 }],
      rating: 4.5,
      ratingCount: 1,
      tags: ['new'],
      createdAt: new Date().toISOString(),
    };
    products.unshift(newProd as any);
    return newProd;
  }

  async updateProduct(id: string, data: any) {
    const { isDbAvailable, prisma } = await import('../db/client.js');
    const dbActive = await isDbAvailable();

    if (dbActive) {
      const priceInPaise = data.price !== undefined ? Math.round(Number(data.price) * 100) : undefined;
      const mrpInPaise = data.mrp !== undefined ? Math.round(Number(data.mrp) * 100) : undefined;

      const updateData: any = {};
      if (data.title) updateData.title = data.title.trim();
      if (priceInPaise !== undefined) updateData.priceInPaise = priceInPaise;
      if (mrpInPaise !== undefined) updateData.mrpInPaise = mrpInPaise;
      if (data.fabric) updateData.fabric = data.fabric;
      if (data.fit) updateData.fit = data.fit;
      if (data.description) updateData.description = data.description;

      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
      });

      if (Array.isArray(data.images) && data.images.length > 0) {
        await prisma.productImage.deleteMany({ where: { productId: id } });
        await prisma.productImage.createMany({
          data: data.images.map((url: string, idx: number) => ({
            productId: id,
            url,
            altText: `${updated.title} image ${idx + 1}`,
            sortOrder: idx,
          })),
        });
      }

      return updated;
    }

    const prod = products.find((p) => p.id === id);
    if (!prod) throw new NotFoundError(`Product not found: ${id}`);
    Object.assign(prod, data);
    return prod;
  }

  async deleteProduct(id: string) {
    const { isDbAvailable, prisma } = await import('../db/client.js');
    const dbActive = await isDbAvailable();

    if (dbActive) {
      await prisma.product.delete({ where: { id } }).catch(async () => {
        await prisma.product.update({
          where: { id },
          data: { isArchived: true },
        });
      });
      return true;
    }

    const idx = products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      products.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export const adminService = new AdminService();
