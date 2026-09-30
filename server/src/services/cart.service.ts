import { prisma, isDbAvailable } from '../db/client.js';
import { products } from '../data/products.js';

export interface CartItemModel {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  brand: string;
  size: string;
  color: string;
  quantity: number;
  mrp: number;
  price: number;
  mrpInPaise: number;
  priceInPaise: number;
  image?: string;
  slug: string;
  maxStock: number;
}

// In-memory cart store for fallback
const inMemoryCartStore = new Map<string, CartItemModel[]>();

export class CartService {
  async getCart(userId: string): Promise<CartItemModel[]> {
    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        const cart = await prisma.cart.findUnique({
          where: { userId },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    brand: true,
                    images: { take: 1, orderBy: { sortOrder: 'asc' } },
                  },
                },
                variant: true,
              },
            },
          },
        });

        if (cart) {
          return cart.items.map((ci) => ({
            id: ci.id,
            productId: ci.productId,
            variantId: ci.variantId,
            title: ci.product.title,
            brand: ci.product.brand.name,
            size: ci.variant.size,
            color: ci.variant.colorName,
            quantity: ci.quantity,
            mrp: Math.round(ci.product.mrpInPaise / 100),
            price: Math.round(ci.product.priceInPaise / 100),
            mrpInPaise: ci.product.mrpInPaise,
            priceInPaise: ci.product.priceInPaise,
            image: ci.product.images[0]?.url,
            slug: ci.product.slug,
            maxStock: Math.max(0, ci.variant.stock - ci.variant.reservedStock),
          }));
        }
      } catch {
        // Fallback to memory
      }
    }

    return inMemoryCartStore.get(userId) || [];
  }

  async addItem(
    userId: string,
    item: {
      productId: string;
      variantId?: string;
      size: string;
      color?: string;
      quantity: number;
    }
  ): Promise<CartItemModel[]> {
    const quantity = Math.max(1, item.quantity || 1);
    const dbUp = await isDbAvailable();

    if (dbUp) {
      try {
        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
          cart = await prisma.cart.create({ data: { userId } });
        }

        // Find or fallback variant
        let variantId = item.variantId;
        if (!variantId) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            include: { variants: true },
          });
          const matchingVariant =
            product?.variants.find((v) => v.size.toLowerCase() === item.size.toLowerCase()) ||
            product?.variants[0];
          variantId = matchingVariant?.id;
        }

        if (variantId) {
          const existingItem = await prisma.cartItem.findUnique({
            where: {
              cartId_variantId: {
                cartId: cart.id,
                variantId,
              },
            },
          });

          if (existingItem) {
            await prisma.cartItem.update({
              where: { id: existingItem.id },
              data: { quantity: existingItem.quantity + quantity },
            });
          } else {
            await prisma.cartItem.create({
              data: {
                cartId: cart.id,
                productId: item.productId,
                variantId,
                quantity,
              },
            });
          }

          return this.getCart(userId);
        }
      } catch {
        // Fallback to memory
      }
    }

    // In-Memory Fallback
    const userCart = inMemoryCartStore.get(userId) || [];
    const prod = products.find((p) => p.id === item.productId || p.slug === item.productId);

    const title = prod?.title || 'Apparel Item';
    const brand = prod?.brand || 'StyleBazaar';
    const mrp = prod ? prod.mrp : 999;
    const price = prod ? prod.price : 999;
    const slug = prod ? prod.slug : item.productId;
    const image = prod ? prod.images[0] : undefined;
    const color = item.color || prod?.colors[0]?.name || 'Default';
    const sizeObj = prod?.sizes.find((s) => s.name.toLowerCase() === item.size.toLowerCase());
    const maxStock = sizeObj ? sizeObj.stock : 10;

    const existingIndex = userCart.findIndex(
      (ci) =>
        (ci.productId === item.productId || ci.productId === prod?.id) &&
        ci.size.toLowerCase() === item.size.toLowerCase()
    );

    if (existingIndex >= 0) {
      const existing = userCart[existingIndex];
      const newQty = Math.min(existing.quantity + quantity, existing.maxStock);
      userCart[existingIndex] = { ...existing, quantity: newQty };
    } else {
      userCart.push({
        id: `ci-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: prod?.id || item.productId,
        variantId: item.variantId || `var-${item.productId}-${item.size}`,
        title,
        brand,
        size: item.size,
        color,
        quantity: Math.min(quantity, maxStock),
        mrp,
        price,
        mrpInPaise: mrp * 100,
        priceInPaise: price * 100,
        image,
        slug,
        maxStock,
      });
    }

    inMemoryCartStore.set(userId, userCart);
    return userCart;
  }

  async updateItem(
    userId: string,
    itemId: string,
    updates: { quantity?: number; size?: string }
  ): Promise<CartItemModel[]> {
    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        const item = await prisma.cartItem.findUnique({
          where: { id: itemId },
          include: { cart: true },
        });

        if (item && item.cart.userId === userId) {
          if (updates.quantity !== undefined) {
            await prisma.cartItem.update({
              where: { id: itemId },
              data: { quantity: Math.max(1, updates.quantity) },
            });
          }
          return this.getCart(userId);
        }
      } catch {
        // Fallback to memory
      }
    }

    const userCart = inMemoryCartStore.get(userId) || [];
    const index = userCart.findIndex((ci) => ci.id === itemId || ci.productId === itemId);
    if (index >= 0) {
      const item = userCart[index];
      if (updates.quantity !== undefined) {
        item.quantity = Math.max(1, Math.min(updates.quantity, item.maxStock));
      }
      if (updates.size !== undefined) {
        item.size = updates.size;
      }
      userCart[index] = item;
      inMemoryCartStore.set(userId, userCart);
    }

    return userCart;
  }

  async removeItem(userId: string, itemId: string): Promise<CartItemModel[]> {
    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        const item = await prisma.cartItem.findUnique({
          where: { id: itemId },
          include: { cart: true },
        });

        if (item && item.cart.userId === userId) {
          await prisma.cartItem.delete({ where: { id: itemId } });
          return this.getCart(userId);
        }
      } catch {
        // Fallback to memory
      }
    }

    let userCart = inMemoryCartStore.get(userId) || [];
    userCart = userCart.filter((ci) => ci.id !== itemId && ci.productId !== itemId);
    inMemoryCartStore.set(userId, userCart);
    return userCart;
  }

  async clearCart(userId: string): Promise<void> {
    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (cart) {
          await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
      } catch {
        // Fallback to memory
      }
    }

    inMemoryCartStore.set(userId, []);
  }

  async mergeCart(
    userId: string,
    guestItems: Array<{
      productId: string;
      variantId?: string;
      size: string;
      color?: string;
      quantity: number;
    }>
  ): Promise<CartItemModel[]> {
    for (const item of guestItems) {
      await this.addItem(userId, item);
    }
    return this.getCart(userId);
  }
}

export const cartService = new CartService();
