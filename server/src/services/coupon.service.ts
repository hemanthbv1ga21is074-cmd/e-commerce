import { prisma, isDbAvailable } from '../db/client.js';
import { coupons as inMemoryCoupons } from '../data/coupons.js';
import { products } from '../data/products.js';
import { inMemoryOrders } from './order.service.js';

export interface CouponValidationItem {
  productId: string;
  variantId?: string;
  size?: string;
  color?: string;
  quantity: number;
  priceInPaise?: number;
  categoryPath?: string[];
  brand?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: {
    code: string;
    type: 'flat' | 'percent';
    value: number;
    description: string;
    minCartValueInPaise: number;
    maxDiscountInPaise?: number;
  };
  discountInPaise: number;
  discount: number;
  message: string;
}

export class CouponService {
  async getActiveCoupons() {
    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        const dbCoupons = await prisma.coupon.findMany({
          where: {
            isActive: true,
            expiresAt: { gt: new Date() },
          },
        });
        if (dbCoupons.length > 0) {
          return dbCoupons.map((c) => ({
            id: c.id,
            code: c.code,
            type: c.type as 'flat' | 'percent',
            value: c.type === 'flat' ? Math.round(c.valueInPaise / 100) : c.valueInPaise,
            valueInPaise: c.valueInPaise,
            minCartValue: Math.round(c.minCartValueInPaise / 100),
            minCartValueInPaise: c.minCartValueInPaise,
            maxDiscount: c.maxDiscountInPaise ? Math.round(c.maxDiscountInPaise / 100) : undefined,
            maxDiscountInPaise: c.maxDiscountInPaise || undefined,
            description: c.description,
            firstOrderOnly: c.firstOrderOnly,
            expiresAt: c.expiresAt.toISOString(),
            brandRestriction: c.brandRestriction,
            categoryRestriction: c.categoryRestriction,
          }));
        }
      } catch {
        // Fallback to in-memory
      }
    }

    return inMemoryCoupons.map((c) => ({
      ...c,
      valueInPaise: c.type === 'flat' ? c.value * 100 : c.value,
      minCartValueInPaise: c.minCartValue * 100,
      maxDiscountInPaise: c.maxDiscount ? c.maxDiscount * 100 : undefined,
    }));
  }

  async findCoupon(code: string) {
    const cleanCode = code.trim().toUpperCase();
    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        const dbCoupon = await prisma.coupon.findUnique({
          where: { code: cleanCode },
        });
        if (dbCoupon) {
          return {
            id: dbCoupon.id,
            code: dbCoupon.code,
            type: dbCoupon.type as 'flat' | 'percent',
            valueInPaise: dbCoupon.valueInPaise,
            minCartValueInPaise: dbCoupon.minCartValueInPaise,
            maxDiscountInPaise: dbCoupon.maxDiscountInPaise || undefined,
            description: dbCoupon.description,
            firstOrderOnly: dbCoupon.firstOrderOnly,
            expiresAt: dbCoupon.expiresAt,
            isActive: dbCoupon.isActive,
            brandRestriction: dbCoupon.brandRestriction,
            categoryRestriction: dbCoupon.categoryRestriction,
          };
        }
      } catch {
        // Fallback to in-memory
      }
    }

    const memCoupon = inMemoryCoupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (!memCoupon) return null;

    return {
      id: memCoupon.id,
      code: memCoupon.code,
      type: memCoupon.type as 'flat' | 'percent',
      valueInPaise: memCoupon.type === 'flat' ? memCoupon.value * 100 : memCoupon.value,
      minCartValueInPaise: memCoupon.minCartValue * 100,
      maxDiscountInPaise: memCoupon.maxDiscount ? memCoupon.maxDiscount * 100 : undefined,
      description: memCoupon.description,
      firstOrderOnly: memCoupon.firstOrderOnly,
      expiresAt: new Date(memCoupon.expiresAt),
      isActive: true,
      brandRestriction: memCoupon.brandRestriction || [],
      categoryRestriction: memCoupon.categoryRestriction || [],
    };
  }

  async validateCoupon(params: {
    code: string;
    subtotalInPaise: number;
    items?: CouponValidationItem[];
    userId?: string;
    userOrderCount?: number;
  }): Promise<CouponValidationResult> {
    const coupon = await this.findCoupon(params.code);

    if (!coupon) {
      return {
        valid: false,
        discountInPaise: 0,
        discount: 0,
        message: `Coupon '${params.code}' is invalid or does not exist.`,
      };
    }

    if (!coupon.isActive || new Date(coupon.expiresAt) < new Date()) {
      return {
        valid: false,
        discountInPaise: 0,
        discount: 0,
        message: `Coupon '${coupon.code}' has expired.`,
      };
    }

    // First order restriction check
    if (coupon.firstOrderOnly) {
      let isFirstOrder = true;
      if (params.userOrderCount !== undefined) {
        isFirstOrder = params.userOrderCount === 0;
      } else if (params.userId) {
        const dbUp = await isDbAvailable();
        if (dbUp) {
          try {
            const count = await prisma.order.count({
              where: {
                userId: params.userId,
                status: { not: 'CANCELLED' },
              },
            });
            isFirstOrder = count === 0;
          } catch {
            isFirstOrder = true;
          }
        } else {
          const count = inMemoryOrders.filter(
            (o) => o.userId === params.userId && o.status.toLowerCase() !== 'cancelled'
          ).length;
          isFirstOrder = count === 0;
        }
      }

      if (!isFirstOrder) {
        return {
          valid: false,
          discountInPaise: 0,
          discount: 0,
          message: `Coupon '${coupon.code}' is valid only for your first order.`,
        };
      }
    }

    // Minimum cart subtotal check
    if (params.subtotalInPaise < coupon.minCartValueInPaise) {
      const minRs = Math.round(coupon.minCartValueInPaise / 100);
      return {
        valid: false,
        discountInPaise: 0,
        discount: 0,
        message: `Minimum cart value of ₹${minRs.toLocaleString('en-IN')} required for coupon ${coupon.code}.`,
      };
    }

    // Category / Brand restrictions
    let eligibleSubtotalInPaise = params.subtotalInPaise;
    if (params.items && params.items.length > 0) {
      // Enrich items with catalog details if brand or category is missing
      const enrichedItems = params.items.map((item) => {
        if (item.brand && item.categoryPath) return item;
        const catalogProd = products.find((p) => p.id === item.productId);
        return {
          ...item,
          brand: item.brand || catalogProd?.brand || '',
          categoryPath: item.categoryPath || catalogProd?.categoryPath || [],
          priceInPaise: item.priceInPaise || (catalogProd ? catalogProd.price * 100 : 0),
        };
      });

      if (coupon.brandRestriction && coupon.brandRestriction.length > 0) {
        const matchingItems = enrichedItems.filter((i) =>
          coupon.brandRestriction.some(
            (b) => b.toLowerCase() === i.brand?.toLowerCase()
          )
        );
        if (matchingItems.length === 0) {
          return {
            valid: false,
            discountInPaise: 0,
            discount: 0,
            message: `Coupon '${coupon.code}' is only applicable on brands: ${coupon.brandRestriction.join(', ')}.`,
          };
        }
        eligibleSubtotalInPaise = matchingItems.reduce(
          (sum, i) => sum + (i.priceInPaise || 0) * i.quantity,
          0
        );
      }

      if (coupon.categoryRestriction && coupon.categoryRestriction.length > 0) {
        const matchingItems = enrichedItems.filter((i) =>
          coupon.categoryRestriction.some((cat) =>
            i.categoryPath?.some(
              (cp) => cp.toLowerCase() === cat.toLowerCase()
            )
          )
        );
        if (matchingItems.length === 0) {
          return {
            valid: false,
            discountInPaise: 0,
            discount: 0,
            message: `Coupon '${coupon.code}' is only applicable on categories: ${coupon.categoryRestriction.join(', ')}.`,
          };
        }
        eligibleSubtotalInPaise = matchingItems.reduce(
          (sum, i) => sum + (i.priceInPaise || 0) * i.quantity,
          0
        );
      }
    }

    // Calculate discount amount in paise
    let discountInPaise = 0;
    if (coupon.type === 'percent') {
      discountInPaise = Math.round((eligibleSubtotalInPaise * coupon.valueInPaise) / 100);
      if (coupon.maxDiscountInPaise && discountInPaise > coupon.maxDiscountInPaise) {
        discountInPaise = coupon.maxDiscountInPaise;
      }
    } else {
      discountInPaise = coupon.valueInPaise;
    }

    // Clamp to subtotal
    discountInPaise = Math.min(discountInPaise, params.subtotalInPaise);

    const discountInRs = Math.round(discountInPaise / 100);
    return {
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.type === 'flat' ? Math.round(coupon.valueInPaise / 100) : coupon.valueInPaise,
        description: coupon.description,
        minCartValueInPaise: coupon.minCartValueInPaise,
        maxDiscountInPaise: coupon.maxDiscountInPaise,
      },
      discountInPaise,
      discount: discountInRs,
      message: `Coupon '${coupon.code}' applied! You save ₹${discountInRs.toLocaleString('en-IN')}.`,
    };
  }
}

export const couponService = new CouponService();
