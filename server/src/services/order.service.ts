import { prisma, isDbAvailable } from '../db/client.js';
import { pricingService, CartItemQuoteInput } from './pricing.service.js';
import { catalogService } from './catalog.service.js';
import { emailProvider } from '../providers/email/dev-email.provider.js';
import { products } from '../data/products.js';
import { env } from '../config/env.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { memoryUsers } from './auth.service.js';
import { ledgerService } from './ledger.service.js';

export interface CreateOrderInput {
  userId: string;
  idempotencyKey?: string;
  items: CartItemQuoteInput[];
  addressId?: string;
  shippingAddressText?: string;
  couponCode?: string;
  paymentMethod?: 'COD' | 'WALLET' | 'TEST_PAYMENT' | string;
  useWallet?: boolean;
  usePoints?: boolean;
}

export interface InMemOrderItem {
  id: string;
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
}

export interface InMemOrderEvent {
  id: string;
  status: string;
  message: string;
  timestamp: string;
}

export interface InMemOrder {
  id: string;
  idempotencyKey?: string;
  userId: string;
  shippingAddress: string;
  addressId?: string;
  status: string;
  itemsSubtotalInPaise: number;
  productDiscountInPaise: number;
  couponDiscountInPaise: number;
  couponCode?: string;
  deliveryFeeInPaise: number;
  codFeeInPaise: number;
  walletDeductionInPaise: number;
  pointsDeductionInPaise: number;
  totalInPaise: number;
  gstIncludedInPaise: number;

  // Rupee equivalents
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  walletUsed?: number;
  loyaltyPointsUsed?: number;

  paymentMethod: string;
  paymentStatus: string;
  estimatedDelivery: string;
  carrier?: {
    name: string;
    trackingNumber: string;
    trackingUrl?: string;
  };
  cancellationReason?: string;
  cancellationDate?: string;
  createdAt: string;
  updatedAt: string;
  items: InMemOrderItem[];
  timeline: InMemOrderEvent[];
  events: InMemOrderEvent[];
}

// In-memory order storage
export const inMemoryOrders: InMemOrder[] = [];
const inFlightIdempotencyKeys = new Set<string>();

// Order state machine valid transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURN_APPROVED', 'CANCELLED'],
  RETURN_APPROVED: ['RETURN_PICKED_UP'],
  RETURN_PICKED_UP: ['RETURN_RECEIVED'],
  RETURN_RECEIVED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export class OrderService {
  async createOrder(input: CreateOrderInput): Promise<InMemOrder> {
    if (!input.items || input.items.length === 0) {
      throw new BadRequestError('Cannot place an order with an empty cart.');
    }

    // 1. Idempotency Check & In-Flight Concurrency Lock
    if (input.idempotencyKey) {
      if (inFlightIdempotencyKeys.has(input.idempotencyKey)) {
        throw new BadRequestError('An order with this idempotency key is currently processing. Please wait.');
      }
      const existing = inMemoryOrders.find(
        (o) => o.idempotencyKey === input.idempotencyKey && o.userId === input.userId
      );
      if (existing) {
        return existing;
      }
      inFlightIdempotencyKeys.add(input.idempotencyKey);
    }

    try {

    const dbUp = await isDbAvailable();

    // 2. Fetch User & Address Details
    let userEmail = 'customer@stylebazaar.com';
    let isCodBlocked = false;
    let walletBalanceInPaise = 0;
    let loyaltyPoints = 0;
    let shippingAddressString = input.shippingAddressText || '';
    let pincode = '560001';

    if (dbUp) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: input.userId },
          include: {
            addresses: true,
            orders: { select: { id: true, status: true } },
          },
        });

        if (dbUser) {
          userEmail = dbUser.email;
          isCodBlocked = dbUser.isCodBlocked;
          walletBalanceInPaise = dbUser.walletBalanceInPaise;
          loyaltyPoints = dbUser.loyaltyPoints;

          // Check active unconfirmed COD order count
          const unconfirmedCodOrders = (dbUser as any).orders?.filter(
            (o: any) =>
              o.status !== 'DELIVERED' &&
              o.status !== 'CANCELLED' &&
              o.status !== 'REFUNDED'
          ) || [];

          if (unconfirmedCodOrders.length >= env.MAX_UNCONFIRMED_COD_PER_USER) {
            throw new BadRequestError(
              `You have reached the maximum limit of ${env.MAX_UNCONFIRMED_COD_PER_USER} active orders. Please wait for previous orders to complete before placing a new COD order.`
            );
          }

          if (input.addressId) {
            const addr = (dbUser as any).addresses?.find((a: any) => a.id === input.addressId);
            if (addr) {
              pincode = addr.pincode;
              shippingAddressString = `${addr.name}, ${addr.addressLine1}, ${
                addr.addressLine2 ? addr.addressLine2 + ', ' : ''
              }${addr.city}, ${addr.state} - ${addr.pincode} (Mobile: ${addr.phone})`;
            }
          }
        }
      } catch (err: any) {
        if (err instanceof BadRequestError) throw err;
      }
    }

    if (!shippingAddressString) {
      for (const u of memoryUsers.values()) {
        if (u.id === input.userId) {
          userEmail = u.email;
          walletBalanceInPaise = u.walletBalanceInPaise;
          loyaltyPoints = u.loyaltyPoints;
          break;
        }
      }
      shippingAddressString =
        input.shippingAddressText ||
        'Rahul Sharma, 402, Lotus Grandeur, 12th Main, Indiranagar, Bengaluru, Karnataka - 560038 (Ph: 9876543210)';
    }

    // Extract pincode from address string if not already set
    const pinMatch = shippingAddressString.match(/\b\d{6}\b/);
    if (pinMatch) {
      pincode = pinMatch[0];
    }

    // 3. Pincode & COD Serviceability Check
    const isTestPayment = input.paymentMethod === 'TEST_PAYMENT';
    const isWallet = input.paymentMethod === 'WALLET';
    const isCod = !isTestPayment && !isWallet;

    if (isCod) {
      if (isCodBlocked) {
        throw new BadRequestError('Cash on delivery is disabled for your account.');
      }
      const pinService = await catalogService.checkPincode(pincode);
      if (pinService && !pinService.codAvailable) {
        throw new BadRequestError(`Cash on Delivery is not available for delivery pincode ${pincode}.`);
      }
    }

    // 4. Server-Side Authoritative Pricing Recomputation
    const quote = await pricingService.calculateQuote({
      items: input.items,
      couponCode: input.couponCode,
      isCod,
      walletBalanceInPaise,
      useWallet: input.useWallet,
      loyaltyPoints,
      usePoints: input.usePoints,
      pincode,
      userId: input.userId,
    });

    // Check COD max limit
    if (isCod && quote.finalTotalInPaise > env.COD_MAX_ORDER_VALUE_PAISE) {
      const maxRs = Math.round(env.COD_MAX_ORDER_VALUE_PAISE / 100);
      throw new BadRequestError(
        `Order total (₹${quote.finalTotal.toLocaleString('en-IN')}) exceeds the ₹${maxRs.toLocaleString(
          'en-IN'
        )} limit for Cash on Delivery orders.`
      );
    }

    // 5. Concurrency Safe Inventory Check & Stock Decrement
    for (const item of quote.verifiedItems) {
      if (!item.isAvailable || item.stockAvailable < item.quantity) {
        throw new BadRequestError(
          `Item '${item.title}' (Size ${item.size}) has insufficient stock. Available: ${item.stockAvailable}, Requested: ${item.quantity}.`
        );
      }
    }

    // Deduct stock in catalog/memory
    for (const item of quote.verifiedItems) {
      const prod = products.find((p) => p.id === item.productId || p.slug === item.productId);
      if (prod) {
        const sizeObj = prod.sizes.find((s) => s.name.toLowerCase() === item.size.toLowerCase());
        if (sizeObj) {
          sizeObj.stock = Math.max(0, sizeObj.stock - item.quantity);
        }
      }
    }

    // 6. Generate Order ID
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const orderId = `SB-${randomDigits}`;

    const now = new Date();
    const estDeliveryDate = new Date();
    estDeliveryDate.setDate(now.getDate() + 4);
    const estDeliveryStr = estDeliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const orderItems: InMemOrderItem[] = quote.verifiedItems.map((vi, idx) => ({
      id: `oi-${orderId}-${idx + 1}`,
      productId: vi.productId,
      variantId: vi.variantId,
      title: vi.title,
      brand: vi.brand,
      size: vi.size,
      color: vi.color,
      quantity: vi.quantity,
      mrpInPaise: vi.mrpInPaise,
      priceInPaise: vi.priceInPaise,
      mrp: vi.mrp,
      price: vi.price,
      image: vi.image,
    }));

    const initialEvent: InMemOrderEvent = {
      id: `ev-${Date.now()}-1`,
      status: 'placed',
      message: 'Order placed successfully. Thank you for shopping with StyleBazaar!',
      timestamp: now.toISOString(),
    };

    const newOrder: InMemOrder = {
      id: orderId,
      idempotencyKey: input.idempotencyKey,
      userId: input.userId,
      shippingAddress: shippingAddressString,
      addressId: input.addressId,
      status: 'placed',
      itemsSubtotalInPaise: quote.subtotalInPaise,
      productDiscountInPaise: quote.productDiscountInPaise,
      couponDiscountInPaise: quote.couponDiscountInPaise,
      couponCode: quote.couponValid ? input.couponCode : undefined,
      deliveryFeeInPaise: quote.deliveryFeeInPaise,
      codFeeInPaise: quote.codFeeInPaise,
      walletDeductionInPaise: quote.walletDeductionInPaise,
      pointsDeductionInPaise: quote.pointsDeductionInPaise,
      totalInPaise: quote.finalTotalInPaise,
      gstIncludedInPaise: quote.gstIncludedInPaise,

      subtotal: quote.subtotal,
      discount: quote.productDiscount + quote.couponDiscount,
      deliveryFee: quote.deliveryFee + (isCod ? quote.codFee : 0),
      total: quote.finalTotal,
      walletUsed: quote.walletDeduction > 0 ? quote.walletDeduction : undefined,
      loyaltyPointsUsed: quote.pointsDeduction > 0 ? Math.round(quote.pointsDeduction * 10) : undefined,

      paymentMethod: isTestPayment
        ? 'Simulated Test Pay (Fake Money)'
        : isCod
        ? 'Cash On Delivery'
        : 'StyleBazaar Wallet',
      paymentStatus: isCod ? 'COD_PENDING' : 'PAID',
      estimatedDelivery: estDeliveryStr,
      carrier: {
        name: 'Delhivery Express',
        trackingNumber: `DEL${Math.floor(100000000 + Math.random() * 900000000)}IN`,
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      items: orderItems,
      timeline: [initialEvent],
      events: [initialEvent],
    };

    // Store in-memory
    inMemoryOrders.unshift(newOrder);

    // If PostgreSQL is available, also insert into database
    if (dbUp) {
      try {
        await prisma.order.create({
          data: {
            id: newOrder.id,
            idempotencyKey: newOrder.idempotencyKey,
            userId: newOrder.userId,
            addressId: input.addressId || (await prisma.address.findFirst({ where: { userId: input.userId } }))?.id || '',
            status: 'PLACED',
            itemsSubtotalInPaise: newOrder.itemsSubtotalInPaise,
            productDiscountInPaise: newOrder.productDiscountInPaise,
            couponDiscountInPaise: newOrder.couponDiscountInPaise,
            deliveryFeeInPaise: newOrder.deliveryFeeInPaise,
            codFeeInPaise: newOrder.codFeeInPaise,
            walletDeductionInPaise: newOrder.walletDeductionInPaise,
            pointsDeductionInPaise: newOrder.pointsDeductionInPaise,
            totalInPaise: newOrder.totalInPaise,
            gstIncludedInPaise: newOrder.gstIncludedInPaise,
            carrierName: newOrder.carrier?.name,
            trackingNumber: newOrder.carrier?.trackingNumber,
            estimatedDeliveryDate: estDeliveryDate,
            items: {
              create: orderItems.map((oi) => ({
                productId: oi.productId,
                variantId: oi.variantId || '',
                title: oi.title,
                brand: oi.brand,
                size: oi.size,
                color: oi.color,
                quantity: oi.quantity,
                mrpInPaise: oi.mrpInPaise,
                priceInPaise: oi.priceInPaise,
                discountInPaise: oi.mrpInPaise - oi.priceInPaise,
                imageUrl: oi.image,
              })),
            },
            events: {
              create: {
                status: 'PLACED',
                message: initialEvent.message,
              },
            },
          },
        });
      } catch {
        // Fallback gracefully to memory
      }
    }

    // 7. Update Ledgers (Wallet & Loyalty)
    if (newOrder.walletDeductionInPaise > 0) {
      try {
        await ledgerService.debitWallet(
          input.userId,
          newOrder.walletDeductionInPaise,
          'ORDER_PAYMENT',
          `Redeemed on Order #${newOrder.id}`,
          newOrder.id
        );
      } catch { /* ignore if already handled */ }
    }

    if (newOrder.pointsDeductionInPaise > 0) {
      try {
        const pts = Math.round(newOrder.pointsDeductionInPaise / 10);
        await ledgerService.deductLoyaltyPoints(
          input.userId,
          pts,
          'ORDER_DISCOUNT',
          newOrder.id
        );
      } catch { /* ignore if already handled */ }
    }

    // Award loyalty points for purchase (10 points per ₹100 spent)
    const earnedPoints = Math.floor(newOrder.totalInPaise / 1000);
    if (earnedPoints > 0) {
      try {
        await ledgerService.addLoyaltyPoints(
          input.userId,
          earnedPoints,
          'ORDER_PURCHASE',
          newOrder.id
        );
      } catch { /* ignore */ }
    }

    // 8. Dispatch Order Confirmation Email
    await emailProvider.sendOrderConfirmationEmail(userEmail, {
      id: newOrder.id,
      totalInPaise: newOrder.totalInPaise,
      paymentMethod: newOrder.paymentMethod,
    });

    return newOrder;
    } finally {
      if (input.idempotencyKey) {
        inFlightIdempotencyKeys.delete(input.idempotencyKey);
      }
    }
  }

  async getOrders(userId: string): Promise<InMemOrder[]> {
    return inMemoryOrders.filter((o) => o.userId === userId);
  }

  async getOrderById(userId: string, orderId: string, isAdmin = false): Promise<InMemOrder> {
    const order = inMemoryOrders.find((o) => o.id === orderId);
    if (!order) {
      throw new NotFoundError(`Order #${orderId} not found.`);
    }
    if (order.userId !== userId && !isAdmin) {
      throw new ForbiddenError('You do not have permission to view this order.');
    }
    return order;
  }

  async cancelOrder(userId: string, orderId: string, reason?: string): Promise<InMemOrder> {
    const order = await this.getOrderById(userId, orderId);

    const upperStatus = order.status.toUpperCase();
    if (upperStatus !== 'PLACED' && upperStatus !== 'CONFIRMED' && upperStatus !== 'PACKED') {
      throw new BadRequestError(
        `Order #${orderId} cannot be cancelled as it is already ${order.status.toLowerCase()}.`
      );
    }

    const now = new Date().toISOString();
    order.status = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by customer';
    order.cancellationDate = now;

    const cancelEvent: InMemOrderEvent = {
      id: `ev-${Date.now()}`,
      status: 'cancelled',
      message: `Order cancelled by user: "${order.cancellationReason}".`,
      timestamp: now,
    };

    order.timeline.push(cancelEvent);
    order.events.push(cancelEvent);

    // Restore inventory stock
    for (const item of order.items) {
      const prod = products.find((p) => p.id === item.productId || p.slug === item.productId);
      if (prod) {
        const sizeObj = prod.sizes.find((s) => s.name.toLowerCase() === item.size.toLowerCase());
        if (sizeObj) {
          sizeObj.stock += item.quantity;
        }
      }
    }

    // Restore wallet balance via append-only ledger if wallet was used
    if (order.walletDeductionInPaise > 0) {
      try {
        await ledgerService.creditWallet(
          order.userId,
          order.walletDeductionInPaise,
          'ORDER_REFUND',
          `Refund for Cancelled Order #${order.id}`,
          order.id
        );
      } catch { /* ignore */ }
    }

    // Restore loyalty points if points were redeemed
    if (order.loyaltyPointsUsed && order.loyaltyPointsUsed > 0) {
      try {
        await ledgerService.addLoyaltyPoints(
          order.userId,
          order.loyaltyPointsUsed,
          'ORDER_CANCELLED',
          order.id
        );
      } catch { /* ignore */ }
    }

    return order;
  }

  async updateOrderStatus(orderId: string, targetStatus: string, message?: string): Promise<InMemOrder> {
    const order = inMemoryOrders.find((o) => o.id === orderId);
    if (!order) {
      throw new NotFoundError(`Order #${orderId} not found.`);
    }

    const currentUpper = order.status.toUpperCase();
    const targetUpper = targetStatus.toUpperCase();

    const allowed = VALID_TRANSITIONS[currentUpper] || [];
    if (!allowed.includes(targetUpper)) {
      throw new BadRequestError(
        `Invalid status transition from ${currentUpper} to ${targetUpper}. Allowed: ${allowed.join(', ') || 'None'}`
      );
    }

    order.status = targetStatus.toLowerCase();
    const now = new Date().toISOString();
    const event: InMemOrderEvent = {
      id: `ev-${Date.now()}`,
      status: order.status,
      message: message || `Order status updated to ${order.status}.`,
      timestamp: now,
    };

    if (targetUpper === 'DELIVERED') {
      if (order.paymentStatus === 'COD_PENDING') {
        order.paymentStatus = 'PAID';
      }
    } else if (targetUpper === 'CANCELLED') {
      // Restore inventory
      for (const item of order.items) {
        const prod = products.find((p) => p.id === item.productId || p.slug === item.productId);
        if (prod) {
          const sizeObj = prod.sizes.find((s) => s.name.toLowerCase() === item.size.toLowerCase());
          if (sizeObj) {
            sizeObj.stock += item.quantity;
          }
        }
      }
      // Refund wallet if used
      if (order.walletDeductionInPaise > 0) {
        try {
          await ledgerService.creditWallet(
            order.userId,
            order.walletDeductionInPaise,
            'ORDER_REFUND',
            `Admin Cancellation Refund for Order #${order.id}`,
            order.id
          );
        } catch { /* ignore */ }
      }
      // Refund loyalty points if used
      if (order.loyaltyPointsUsed && order.loyaltyPointsUsed > 0) {
        try {
          await ledgerService.addLoyaltyPoints(
            order.userId,
            order.loyaltyPointsUsed,
            'ORDER_CANCELLED',
            order.id
          );
        } catch { /* ignore */ }
      }
    }

    order.timeline.push(event);
    order.events.push(event);
    order.updatedAt = now;

    return order;
  }

  async getAllOrders(options?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    orders: InMemOrder[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let list = [...inMemoryOrders];

    if (options?.status) {
      const st = options.status.toLowerCase();
      list = list.filter((o) => o.status.toLowerCase() === st);
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.userId.toLowerCase().includes(q) ||
          o.shippingAddress.toLowerCase().includes(q) ||
          o.items.some((i) => i.title.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const page = options?.page && options.page > 0 ? options.page : 1;
    const limit = options?.limit && options.limit > 0 ? options.limit : 20;
    const start = (page - 1) * limit;
    const orders = list.slice(start, start + limit);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export const orderService = new OrderService();
