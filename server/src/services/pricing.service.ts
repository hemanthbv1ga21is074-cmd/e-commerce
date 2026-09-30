import { env } from '../config/env.js';
import { products } from '../data/products.js';
import { catalogService } from './catalog.service.js';
import { couponService, CouponValidationResult } from './coupon.service.js';
import { prisma, isDbAvailable } from '../db/client.js';
import { NotFoundError } from '../utils/errors.js';

export interface CartItemQuoteInput {
  productId: string;
  variantId?: string;
  size: string;
  color?: string;
  quantity: number;
}

export interface QuotePricingOptions {
  items: CartItemQuoteInput[];
  couponCode?: string;
  isCod?: boolean;
  walletBalanceInPaise?: number;
  useWallet?: boolean;
  loyaltyPoints?: number;
  usePoints?: boolean;
  pincode?: string;
  userId?: string;
  userOrderCount?: number;
}

export interface PricingBreakdown {
  // Authoritative integer paise
  mrpTotalInPaise: number;
  subtotalInPaise: number;
  productDiscountInPaise: number;
  couponDiscountInPaise: number;
  deliveryFeeInPaise: number;
  codFeeInPaise: number;
  walletDeductionInPaise: number;
  pointsDeductionInPaise: number;
  finalTotalInPaise: number;
  totalSavingsInPaise: number;
  gstIncludedInPaise: number;

  // Rupee values for direct frontend consumption
  mrpTotal: number;
  subtotal: number;
  productDiscount: number;
  couponDiscount: number;
  deliveryFee: number;
  codFee: number;
  walletDeduction: number;
  pointsDeduction: number;
  finalTotal: number;
  totalSavings: number;
  itemCount: number;

  // Additional metadata
  couponMessage?: string;
  couponValid?: boolean;
  couponDetails?: CouponValidationResult['coupon'];
  isCodEligible: boolean;
  codIneligibleReason?: string;

  // Enriched items with verified prices
  verifiedItems: Array<{
    productId: string;
    variantId?: string;
    title: string;
    brand: string;
    size: string;
    color: string;
    quantity: number;
    mrpInPaise: number;
    priceInPaise: number;
    mrp: number;
    price: number;
    image?: string;
    stockAvailable: number;
    isAvailable: boolean;
  }>;
}

export class PricingService {
  async calculateQuote(options: QuotePricingOptions): Promise<PricingBreakdown> {
    const verifiedItems: PricingBreakdown['verifiedItems'] = [];
    let mrpTotalInPaise = 0;
    let subtotalInPaise = 0;
    let totalItemCount = 0;

    const dbUp = await isDbAvailable();

    for (const itemInput of options.items) {
      const qty = Math.max(1, itemInput.quantity || 1);
      totalItemCount += qty;

      let found = false;

      // Try database lookup if PostgreSQL is available
      if (dbUp) {
        try {
          const dbProduct = await prisma.product.findUnique({
            where: { id: itemInput.productId },
            include: {
              variants: true,
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
              brand: true,
            },
          });

          if (dbProduct) {
            const variant =
              (itemInput.variantId
                ? dbProduct.variants.find((v) => v.id === itemInput.variantId)
                : dbProduct.variants.find((v) => v.size.toLowerCase() === itemInput.size.toLowerCase())) ||
              dbProduct.variants[0];

            const availableStock = variant ? variant.stock - variant.reservedStock : 10;
            const itemMrp = dbProduct.mrpInPaise;
            const itemPrice = dbProduct.priceInPaise;

            mrpTotalInPaise += itemMrp * qty;
            subtotalInPaise += itemPrice * qty;

            verifiedItems.push({
              productId: dbProduct.id,
              variantId: variant?.id,
              title: dbProduct.title,
              brand: dbProduct.brand.name,
              size: itemInput.size || variant?.size || 'Free',
              color: itemInput.color || variant?.colorName || 'Default',
              quantity: qty,
              mrpInPaise: itemMrp,
              priceInPaise: itemPrice,
              mrp: Math.round(itemMrp / 100),
              price: Math.round(itemPrice / 100),
              image: dbProduct.images[0]?.url,
              stockAvailable: Math.max(0, availableStock),
              isAvailable: availableStock >= qty,
            });
            found = true;
          }
        } catch {
          // Fall through to in-memory catalog
        }
      }

      if (!found) {
        // Fallback to in-memory catalog
        const catalogProd = products.find(
          (p) => p.id === itemInput.productId || p.slug === itemInput.productId
        );

        if (catalogProd) {
          const sizeObj = catalogProd.sizes.find(
            (s) => s.name.toLowerCase() === itemInput.size.toLowerCase()
          );
          const stock = sizeObj ? sizeObj.stock : 10;
          const itemMrp = catalogProd.mrp * 100;
          const itemPrice = catalogProd.price * 100;

          mrpTotalInPaise += itemMrp * qty;
          subtotalInPaise += itemPrice * qty;

          verifiedItems.push({
            productId: catalogProd.id,
            variantId: `var-${catalogProd.id}-${itemInput.size}`,
            title: catalogProd.title,
            brand: catalogProd.brand,
            size: itemInput.size,
            color: itemInput.color || catalogProd.colors[0]?.name || 'Default',
            quantity: qty,
            mrpInPaise: itemMrp,
            priceInPaise: itemPrice,
            mrp: catalogProd.mrp,
            price: catalogProd.price,
            image: catalogProd.images[0],
            stockAvailable: stock,
            isAvailable: stock >= qty,
          });
        } else {
          throw new NotFoundError(`Product '${itemInput.productId}' not found in catalog.`);
        }
      }
    }

    const productDiscountInPaise = Math.max(0, mrpTotalInPaise - subtotalInPaise);

    // Delivery fee calculation
    const deliveryFeeInPaise =
      subtotalInPaise >= env.FREE_DELIVERY_THRESHOLD_PAISE ? 0 : env.STANDARD_DELIVERY_FEE_PAISE;

    // Coupon validation
    let couponDiscountInPaise = 0;
    let couponMessage = '';
    let couponValid = false;
    let couponDetails: CouponValidationResult['coupon'] = undefined;

    if (options.couponCode) {
      const couponItems = verifiedItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        priceInPaise: item.priceInPaise,
        brand: item.brand,
      }));

      const couponRes = await couponService.validateCoupon({
        code: options.couponCode,
        subtotalInPaise,
        items: couponItems,
        userId: options.userId,
        userOrderCount: options.userOrderCount,
      });

      couponValid = couponRes.valid;
      couponMessage = couponRes.message;
      if (couponRes.valid) {
        couponDiscountInPaise = couponRes.discountInPaise;
        couponDetails = couponRes.coupon;
      }
    }

    // COD Fee
    const isCod = Boolean(options.isCod);
    const codFeeInPaise = isCod ? env.COD_FEE_PAISE : 0;

    // Remaining payable calculation
    let payableBeforeCredits = Math.max(
      0,
      subtotalInPaise - couponDiscountInPaise + deliveryFeeInPaise + codFeeInPaise
    );

    // Wallet deduction
    let walletDeductionInPaise = 0;
    if (options.useWallet && options.walletBalanceInPaise && options.walletBalanceInPaise > 0) {
      walletDeductionInPaise = Math.min(options.walletBalanceInPaise, payableBeforeCredits);
      payableBeforeCredits -= walletDeductionInPaise;
    }

    // Loyalty points deduction (10 points = ₹1 = 100 paise)
    let pointsDeductionInPaise = 0;
    if (options.usePoints && options.loyaltyPoints && options.loyaltyPoints > 0) {
      const pointsPaise = Math.floor(options.loyaltyPoints / 10) * 100;
      pointsDeductionInPaise = Math.min(pointsPaise, payableBeforeCredits);
      payableBeforeCredits -= pointsDeductionInPaise;
    }

    const finalTotalInPaise = payableBeforeCredits;
    const totalSavingsInPaise = productDiscountInPaise + couponDiscountInPaise;

    // GST included in price (approx 12% on garment selling price)
    const gstIncludedInPaise = Math.round((subtotalInPaise * 12) / 112);

    // COD Eligibility verification
    let isCodEligible = env.COD_ENABLED;
    let codIneligibleReason: string | undefined = undefined;

    if (!env.COD_ENABLED) {
      isCodEligible = false;
      codIneligibleReason = 'Cash on Delivery is currently disabled.';
    } else if (finalTotalInPaise > env.COD_MAX_ORDER_VALUE_PAISE) {
      isCodEligible = false;
      codIneligibleReason = `COD is only available for orders up to ₹${Math.round(
        env.COD_MAX_ORDER_VALUE_PAISE / 100
      ).toLocaleString('en-IN')}.`;
    } else if (options.pincode) {
      const pinResult = await catalogService.checkPincode(options.pincode);
      if (!pinResult || !pinResult.codAvailable) {
        isCodEligible = false;
        codIneligibleReason = `COD is not available for delivery pincode ${options.pincode}.`;
      }
    }

    return {
      mrpTotalInPaise,
      subtotalInPaise,
      productDiscountInPaise,
      couponDiscountInPaise,
      deliveryFeeInPaise,
      codFeeInPaise,
      walletDeductionInPaise,
      pointsDeductionInPaise,
      finalTotalInPaise,
      totalSavingsInPaise,
      gstIncludedInPaise,

      mrpTotal: Math.round(mrpTotalInPaise / 100),
      subtotal: Math.round(subtotalInPaise / 100),
      productDiscount: Math.round(productDiscountInPaise / 100),
      couponDiscount: Math.round(couponDiscountInPaise / 100),
      deliveryFee: Math.round(deliveryFeeInPaise / 100),
      codFee: Math.round(codFeeInPaise / 100),
      walletDeduction: Math.round(walletDeductionInPaise / 100),
      pointsDeduction: Math.round(pointsDeductionInPaise / 100),
      finalTotal: Math.round(finalTotalInPaise / 100),
      totalSavings: Math.round(totalSavingsInPaise / 100),
      itemCount: totalItemCount,

      couponMessage,
      couponValid,
      couponDetails,
      isCodEligible,
      codIneligibleReason,
      verifiedItems,
    };
  }
}

export const pricingService = new PricingService();
