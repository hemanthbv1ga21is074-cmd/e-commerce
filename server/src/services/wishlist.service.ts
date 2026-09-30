import { prisma, isDbAvailable } from '../db/client.js';
import { products } from '../data/products.js';

// In-memory wishlist store for fallback
const inMemoryWishlistStore = new Map<string, Set<string>>();

export class WishlistService {
  async getWishlist(userId: string): Promise<string[]> {
    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        const wishlist = await prisma.wishlist.findUnique({
          where: { userId },
          include: { items: true },
        });
        if (wishlist) {
          return wishlist.items.map((i) => i.productId);
        }
      } catch {
        // Fallback to memory
      }
    }

    const set = inMemoryWishlistStore.get(userId) || new Set<string>();
    return Array.from(set);
  }

  async getWishlistWithProducts(userId: string) {
    const productIds = await this.getWishlist(userId);
    const enrichedProducts = productIds
      .map((id) => products.find((p) => p.id === id || p.slug === id))
      .filter(Boolean);

    return {
      productIds,
      products: enrichedProducts,
    };
  }

  async addItem(userId: string, productId: string): Promise<string[]> {
    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
        if (!wishlist) {
          wishlist = await prisma.wishlist.create({ data: { userId } });
        }

        await prisma.wishlistItem.upsert({
          where: {
            wishlistId_productId: {
              wishlistId: wishlist.id,
              productId,
            },
          },
          update: {},
          create: {
            wishlistId: wishlist.id,
            productId,
          },
        });

        return this.getWishlist(userId);
      } catch {
        // Fallback to memory
      }
    }

    let set = inMemoryWishlistStore.get(userId);
    if (!set) {
      set = new Set<string>();
      inMemoryWishlistStore.set(userId, set);
    }
    set.add(productId);
    return Array.from(set);
  }

  async removeItem(userId: string, productId: string): Promise<string[]> {
    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
        if (wishlist) {
          await prisma.wishlistItem.deleteMany({
            where: {
              wishlistId: wishlist.id,
              productId,
            },
          });
          return this.getWishlist(userId);
        }
      } catch {
        // Fallback to memory
      }
    }

    const set = inMemoryWishlistStore.get(userId);
    if (set) {
      set.delete(productId);
    }
    return Array.from(set || []);
  }

  async toggleItem(userId: string, productId: string): Promise<{ items: string[]; added: boolean }> {
    const current = await this.getWishlist(userId);
    if (current.includes(productId)) {
      const items = await this.removeItem(userId, productId);
      return { items, added: false };
    } else {
      const items = await this.addItem(userId, productId);
      return { items, added: true };
    }
  }

  async clearWishlist(userId: string): Promise<void> {
    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
        if (wishlist) {
          await prisma.wishlistItem.deleteMany({
            where: { wishlistId: wishlist.id },
          });
        }
      } catch {
        // Fallback to memory
      }
    }

    inMemoryWishlistStore.set(userId, new Set<string>());
  }

  async mergeWishlist(userId: string, productIds: string[]): Promise<string[]> {
    for (const id of productIds) {
      await this.addItem(userId, id);
    }
    return this.getWishlist(userId);
  }
}

export const wishlistService = new WishlistService();
