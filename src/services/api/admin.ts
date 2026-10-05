/**
 * Admin API service — supports interactive mock data with localStorage persistence
 * and real backend integration.
 */
import { apiCall, api } from './client';
import { products as baseProducts } from '../../data/products';
import type { Order, OrderStatus, OrderTimeline, Product } from '../../types';

export interface AdminOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InventoryVariant {
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
  gender: string;
  category: string;
}

export interface AdminInventoryResponse {
  variants: InventoryVariant[];
  summary: {
    totalVariants: number;
    lowStockVariants: number;
    outOfStockVariants: number;
    threshold: number;
  };
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminAnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingOrdersCount: number;
  totalProductsCount: number;
  lowStockCount: number;
  revenueByDemographic: { name: string; value: number; color: string }[];
  salesByStatus: { status: string; count: number; color: string }[];
  recentDailyRevenue: { date: string; revenue: number; orders: number }[];
  topSellingProducts: { id: string; title: string; brand: string; unitsSold: number; revenue: number; image: string }[];
}

export interface AdminCoupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  isActive: boolean;
  usageCount: number;
  expiryDate: string;
}

const STORAGE_KEYS = {
  ORDERS: 'sb_admin_orders',
  STOCK: 'sb_admin_stock_overrides',
  CUSTOM_PRODUCTS: 'sb_admin_products',
  COUPONS: 'sb_admin_coupons',
};

/* ─── Mock Seed Orders ─── */
function getInitialSeedOrders(): Order[] {
  return [
    {
      id: 'SB-892419',
      userId: 'usr-demo-1',
      items: [
        {
          productId: 'm1',
          title: 'Classic Crew Neck T-Shirt',
          brand: 'Zephyr',
          size: 'M',
          color: 'Navy',
          quantity: 2,
          price: 599,
          mrp: 999,
          image: baseProducts[0]?.images?.[0] || '',
        },
        {
          productId: 'm10',
          title: 'Checkered Casual Shirt',
          brand: 'UrbanThread',
          size: 'L',
          color: 'Red-Navy',
          quantity: 1,
          price: 1199,
          mrp: 1999,
          image: baseProducts[9]?.images?.[0] || '',
        },
      ],
      subtotal: 3997,
      discount: 1599,
      deliveryFee: 0,
      total: 2398,
      shippingAddress: 'Rahul Sharma, #42, 4th Cross, Indiranagar, Bengaluru - 560001 (Phone: 9876543210)',
      paymentMethod: 'Razorpay Online',
      status: 'shipped',
      timeline: [
        { status: 'placed', timestamp: '2026-09-28T09:30:00Z', description: 'Order placed successfully' },
        { status: 'confirmed', timestamp: '2026-09-28T10:15:00Z', description: 'Seller accepted and confirmed' },
        { status: 'shipped', timestamp: '2026-09-29T14:00:00Z', description: 'Handed over to BlueDart Courier' },
      ],
      createdAt: '2026-09-28T09:30:00Z',
      estimatedDelivery: '2026-10-03T18:00:00Z',
    },
    {
      id: 'SB-892420',
      userId: 'usr-ananya',
      items: [
        {
          productId: 'w1',
          title: 'Embroidered Anarkali Kurta Set',
          brand: 'Kalyani',
          size: 'M',
          color: 'Maroon',
          quantity: 1,
          price: 2499,
          mrp: 4999,
          image: baseProducts.find((p) => p.gender === 'women')?.images?.[0] || '',
        },
      ],
      subtotal: 4999,
      discount: 2700,
      deliveryFee: 0,
      total: 2299,
      couponCode: 'BAZAAR200',
      shippingAddress: 'Ananya Roy, Flat 4B, South City Residency, Ballygunge, Kolkata - 700019 (Phone: 9812345678)',
      paymentMethod: 'Razorpay Online',
      status: 'confirmed',
      timeline: [
        { status: 'placed', timestamp: '2026-09-29T11:00:00Z', description: 'Order placed' },
        { status: 'confirmed', timestamp: '2026-09-29T11:45:00Z', description: 'Payment verified' },
      ],
      createdAt: '2026-09-29T11:00:00Z',
      estimatedDelivery: '2026-10-04T18:00:00Z',
    },
    {
      id: 'SB-892421',
      userId: 'usr-vikram',
      items: [
        {
          productId: 'm15',
          title: 'Slim Fit Stretchable Jeans',
          brand: 'IronForge',
          size: '32',
          color: 'Dark Indigo',
          quantity: 2,
          price: 1499,
          mrp: 2499,
          image: baseProducts[14]?.images?.[0] || '',
        },
      ],
      subtotal: 4998,
      discount: 2000,
      deliveryFee: 0,
      total: 2998,
      shippingAddress: 'Vikram Seth, D-12, Connaught Place, New Delhi - 110001 (Phone: 9822334455)',
      paymentMethod: 'Cash on Delivery',
      status: 'delivered',
      timeline: [
        { status: 'placed', timestamp: '2026-09-25T10:00:00Z', description: 'Order placed' },
        { status: 'confirmed', timestamp: '2026-09-25T11:30:00Z', description: 'Confirmed' },
        { status: 'shipped', timestamp: '2026-09-26T16:00:00Z', description: 'Shipped' },
        { status: 'delivered', timestamp: '2026-09-28T15:20:00Z', description: 'Delivered to customer' },
      ],
      createdAt: '2026-09-25T10:00:00Z',
      estimatedDelivery: '2026-09-28T18:00:00Z',
    },
    {
      id: 'SB-892422',
      userId: 'usr-priya',
      items: [
        {
          productId: 'm2',
          title: 'Urban Graphic Print T-Shirt',
          brand: 'UrbanThread',
          size: 'S',
          color: 'Black',
          quantity: 1,
          price: 779,
          mrp: 1299,
          image: baseProducts[1]?.images?.[0] || '',
        },
      ],
      subtotal: 1299,
      discount: 520,
      deliveryFee: 49,
      total: 828,
      shippingAddress: 'Priya Patel, B-202, Shivalik Heights, Satellite, Ahmedabad - 380015 (Phone: 9877001122)',
      paymentMethod: 'Razorpay Online',
      status: 'placed',
      timeline: [
        { status: 'placed', timestamp: '2026-09-30T08:15:00Z', description: 'Order placed, awaiting confirmation' },
      ],
      createdAt: '2026-09-30T08:15:00Z',
      estimatedDelivery: '2026-10-05T18:00:00Z',
    },
    {
      id: 'SB-892423',
      userId: 'usr-sneha',
      items: [
        {
          productId: 'm14',
          title: 'Premium White Formal Shirt',
          brand: 'Zenith',
          size: '40',
          color: 'White',
          quantity: 2,
          price: 1799,
          mrp: 2999,
          image: baseProducts[13]?.images?.[0] || '',
        },
      ],
      subtotal: 5998,
      discount: 2900,
      deliveryFee: 0,
      total: 3098,
      couponCode: 'FLAT500',
      shippingAddress: 'Sneha Reddy, Plot 104, Jubilee Hills Road No 36, Hyderabad - 500081 (Phone: 9848012345)',
      paymentMethod: 'Razorpay Online',
      status: 'confirmed',
      timeline: [
        { status: 'placed', timestamp: '2026-09-30T10:00:00Z', description: 'Order placed' },
        { status: 'confirmed', timestamp: '2026-09-30T11:00:00Z', description: 'Confirmed' },
      ],
      createdAt: '2026-09-30T10:00:00Z',
      estimatedDelivery: '2026-10-05T18:00:00Z',
    },
    {
      id: 'SB-892424',
      userId: 'usr-rohit',
      items: [
        {
          productId: 'm20',
          title: 'Slim Fit Cotton Chinos',
          brand: 'Zenith',
          size: '32',
          color: 'Khaki',
          quantity: 1,
          price: 1319,
          mrp: 2199,
          image: baseProducts[19]?.images?.[0] || '',
        },
      ],
      subtotal: 2199,
      discount: 880,
      deliveryFee: 0,
      total: 1319,
      shippingAddress: 'Rohit Verma, Flat 12, Ocean View, Bandra West, Mumbai - 400050 (Phone: 9899112233)',
      paymentMethod: 'Razorpay Online',
      status: 'cancelled',
      cancellationReason: 'Customer requested cancellation prior to packing.',
      timeline: [
        { status: 'placed', timestamp: '2026-09-24T12:00:00Z', description: 'Order placed' },
        { status: 'cancelled', timestamp: '2026-09-24T13:30:00Z', description: 'Cancelled by customer' },
      ],
      createdAt: '2026-09-24T12:00:00Z',
      estimatedDelivery: '2026-09-29T18:00:00Z',
    },
  ];
}

/* ─── LocalStorage Helpers ─── */
function getStoredOrders(): Order[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ORDERS) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const seed = getInitialSeedOrders();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(seed));
    }
    return seed;
  } catch {
    return getInitialSeedOrders();
  }
}

function saveStoredOrders(orders: Order[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  } catch (e) {
    console.error('Failed to save orders to localStorage', e);
  }
}

function getStoredStockOverrides(): Record<string, number> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.STOCK) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredStockOverrides(overrides: Record<string, number>): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(overrides));
    }
  } catch (e) {
    console.error('Failed to save stock overrides', e);
  }
}

export function getCustomProducts(): Product[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.CUSTOM_PRODUCTS) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomProducts(prods: Product[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PRODUCTS, JSON.stringify(prods));
    }
  } catch (e) {
    console.error('Failed to save custom products', e);
  }
}

function getInitialCoupons(): AdminCoupon[] {
  return [
    { code: 'FIRST100', description: 'Flat ₹100 off on first order', discountType: 'flat', discountValue: 100, minOrderValue: 999, isActive: true, usageCount: 342, expiryDate: '2026-12-31' },
    { code: 'BAZAAR200', description: 'Flat ₹200 off on fashion orders', discountType: 'flat', discountValue: 200, minOrderValue: 1499, isActive: true, usageCount: 681, expiryDate: '2026-12-31' },
    { code: 'FESTIVE15', description: '15% instant discount for festive season', discountType: 'percentage', discountValue: 15, minOrderValue: 1999, maxDiscount: 600, isActive: true, usageCount: 914, expiryDate: '2026-11-30' },
    { code: 'VIPSTYLE', description: 'Flat 20% off for StyleBazaar Insiders', discountType: 'percentage', discountValue: 20, minOrderValue: 2499, maxDiscount: 800, isActive: true, usageCount: 420, expiryDate: '2026-12-31' },
  ];
}

export function getStoredCoupons(): AdminCoupon[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.COUPONS) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const seed = getInitialCoupons();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(seed));
    }
    return seed;
  } catch {
    return getInitialCoupons();
  }
}

export function saveStoredCoupons(coupons: AdminCoupon[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
    }
  } catch (e) {
    console.error('Failed to save coupons', e);
  }
}

/* ─── API: Orders ─── */
export async function getAdminOrders(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<AdminOrdersResponse> {
  return apiCall(
    () => {
      let orders = getStoredOrders();
      if (params?.status && params.status !== 'all') {
        const s = params.status.toLowerCase();
        orders = orders.filter((o) => o.status.toLowerCase() === s);
      }
      if (params?.search && params.search.trim()) {
        const q = params.search.toLowerCase().trim();
        orders = orders.filter(
          (o) =>
            o.id.toLowerCase().includes(q) ||
            o.shippingAddress.toLowerCase().includes(q) ||
            o.paymentMethod.toLowerCase().includes(q) ||
            o.items.some((i) => i.title.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q))
        );
      }

      // Sort newest first
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const total = orders.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const paginated = orders.slice((page - 1) * limit, page * limit);

      return {
        orders: paginated,
        total,
        page,
        limit,
        totalPages,
      };
    },
    async () => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.search) q.set('search', params.search);
      if (params?.page) q.set('page', params.page.toString());
      if (params?.limit) q.set('limit', params.limit.toString());

      const res = await api<{ success: boolean; data: AdminOrdersResponse }>(
        `/admin/orders?${q.toString()}`
      );
      return res.data;
    }
  );
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: OrderStatus,
  message?: string
): Promise<Order> {
  return apiCall(
    () => {
      const orders = getStoredOrders();
      const idx = orders.findIndex((o) => o.id === orderId);
      if (idx === -1) {
        throw new Error(`Order ${orderId} not found.`);
      }

      const order = orders[idx];
      const newTimeline: OrderTimeline[] = [
        ...(order.timeline || []),
        {
          status,
          timestamp: new Date().toISOString(),
          description: message || `Status updated to ${status} by Admin`,
        },
      ];

      const updated: Order = {
        ...order,
        status,
        timeline: newTimeline,
      };

      orders[idx] = updated;
      saveStoredOrders(orders);
      return updated;
    },
    async () => {
      const res = await api<{ success: boolean; data: Order }>(
        `/admin/orders/${orderId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, message }),
        }
      );
      return res.data;
    }
  );
}

/* ─── API: Inventory ─── */
export async function getAdminInventory(params?: {
  lowStockOnly?: boolean;
  threshold?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<AdminInventoryResponse> {
  return apiCall(
    () => {
      const threshold = params?.threshold ?? 5;
      const stockOverrides = getStoredStockOverrides();
      const customProducts = getCustomProducts();
      const allProds = [...customProducts, ...baseProducts];

      const variants: InventoryVariant[] = [];

      for (const p of allProds) {
        for (const s of p.sizes) {
          const variantId = `${p.id}-${s.name}`;
          const currentStock = stockOverrides[variantId] !== undefined ? stockOverrides[variantId] : s.stock;

          variants.push({
            variantId,
            productId: p.id,
            productSlug: p.slug,
            productTitle: p.title,
            brand: p.brand,
            size: s.name,
            stock: currentStock,
            isLowStock: currentStock > 0 && currentStock <= threshold,
            isOutOfStock: currentStock === 0,
            mrp: p.mrp,
            price: p.price,
            image: p.images?.[0] || '',
            gender: p.gender,
            category: p.categoryPath[p.categoryPath.length - 1] || 'Fashion',
          });
        }
      }

      let filtered = variants;
      if (params?.lowStockOnly) {
        filtered = filtered.filter((v) => v.stock <= threshold);
      }
      if (params?.search && params.search.trim()) {
        const q = params.search.toLowerCase().trim();
        filtered = filtered.filter(
          (v) =>
            v.productTitle.toLowerCase().includes(q) ||
            v.brand.toLowerCase().includes(q) ||
            v.size.toLowerCase().includes(q) ||
            v.variantId.toLowerCase().includes(q)
        );
      }

      const totalVariants = variants.length;
      const lowStockVariants = variants.filter((v) => v.stock > 0 && v.stock <= threshold).length;
      const outOfStockVariants = variants.filter((v) => v.stock === 0).length;

      const page = params?.page || 1;
      const limit = params?.limit || 50;
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const paginated = filtered.slice((page - 1) * limit, page * limit);

      return {
        variants: paginated,
        summary: {
          totalVariants,
          lowStockVariants,
          outOfStockVariants,
          threshold,
        },
        total,
        page,
        limit,
        totalPages,
      };
    },
    async () => {
      const q = new URLSearchParams();
      if (params?.lowStockOnly) q.set('lowStockOnly', 'true');
      if (params?.threshold) q.set('threshold', params.threshold.toString());
      if (params?.search) q.set('search', params.search);
      if (params?.page) q.set('page', params.page.toString());
      if (params?.limit) q.set('limit', params.limit.toString());

      const res = await api<{ success: boolean; data: AdminInventoryResponse }>(
        `/admin/inventory?${q.toString()}`
      );
      return res.data;
    }
  );
}

export async function updateVariantStock(
  productId: string,
  size: string,
  stock: number
): Promise<{ productId: string; size: string; stock: number; updated: boolean }> {
  return apiCall(
    () => {
      const variantId = `${productId}-${size}`;
      const overrides = getStoredStockOverrides();
      overrides[variantId] = Math.max(0, stock);
      saveStoredStockOverrides(overrides);
      return { productId, size, stock: Math.max(0, stock), updated: true };
    },
    async () => {
      const res = await api<{
        success: boolean;
        data: { productId: string; size: string; stock: number; updated: boolean };
      }>(`/admin/inventory/${productId}/${size}`, {
        method: 'PATCH',
        body: JSON.stringify({ stock }),
      });
      return res.data;
    }
  );
}

/* ─── API: Product Management ─── */
export async function getAdminProductsList(): Promise<Product[]> {
  return apiCall(() => {
    const custom = getCustomProducts();
    return [...custom, ...baseProducts];
  });
}

export type NewProductInput = Omit<
  Product,
  'id' | 'slug' | 'rating' | 'ratingCount' | 'createdAt' | 'discountPercent' | 'tags'
> & {
  discountPercent?: number;
  tags?: string[];
};

export async function createAdminProduct(
  productData: NewProductInput
): Promise<Product> {
  return apiCall(
    () => {
      const custom = getCustomProducts();
      const id = `custom-${Date.now()}`;
      const slug = `${productData.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

      const newProduct: Product = {
        ...productData,
        id,
        slug,
        rating: 4.5,
        ratingCount: 1,
        createdAt: new Date().toISOString(),
        discountPercent:
          productData.mrp > productData.price
            ? Math.round(((productData.mrp - productData.price) / productData.mrp) * 100)
            : 0,
        tags: productData.tags || ['new'],
      };

      saveCustomProducts([newProduct, ...custom]);
      return newProduct;
    },
    async () => {
      const res = await api<{ success: boolean; data: Product }>('/admin/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
      return res.data;
    }
  );
}

export async function updateAdminProduct(
  productId: string,
  productData: Partial<Product>
): Promise<Product> {
  return apiCall(
    () => {
      const custom = getCustomProducts();
      const idx = custom.findIndex((p) => p.id === productId);
      if (idx !== -1) {
        custom[idx] = { ...custom[idx], ...productData };
        saveCustomProducts(custom);
        return custom[idx];
      }
      const base = baseProducts.find((p) => p.id === productId);
      const updated = { ...(base || {}), ...productData, id: productId } as Product;
      saveCustomProducts([updated, ...custom.filter((p) => p.id !== productId)]);
      return updated;
    },
    async () => {
      const res = await api<{ success: boolean; data: Product }>(`/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
      return res.data;
    }
  );
}

export async function deleteAdminProduct(productId: string): Promise<boolean> {
  return apiCall(
    () => {
      const custom = getCustomProducts();
      const filtered = custom.filter((p) => p.id !== productId);
      saveCustomProducts(filtered);
      return true;
    },
    async () => {
      await api(`/admin/products/${productId}`, { method: 'DELETE' });
      return true;
    }
  );
}


/* ─── API: Analytics ─── */
export async function getAdminAnalytics(): Promise<AdminAnalyticsData> {
  return apiCall(() => {
    const orders = getStoredOrders();
    const custom = getCustomProducts();
    const allProds = [...custom, ...baseProducts];

    const completedOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalRevenue = completedOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;
    const pendingOrdersCount = orders.filter((o) => o.status === 'placed' || o.status === 'confirmed').length;

    // Low stock count
    const stockOverrides = getStoredStockOverrides();
    let lowStockCount = 0;
    for (const p of allProds) {
      for (const s of p.sizes) {
        const vId = `${p.id}-${s.name}`;
        const cur = stockOverrides[vId] !== undefined ? stockOverrides[vId] : s.stock;
        if (cur <= 5) lowStockCount++;
      }
    }

    // Revenue by Demographic
    let menRev = 0;
    let womenRev = 0;
    let kidsRev = 0;

    for (const o of completedOrders) {
      for (const item of o.items) {
        const prod = allProds.find((p) => p.id === item.productId);
        const itemVal = item.price * item.quantity;
        if (prod?.gender === 'women') womenRev += itemVal;
        else if (prod?.gender === 'kids') kidsRev += itemVal;
        else menRev += itemVal;
      }
    }

    const totalDemoRev = Math.max(1, menRev + womenRev + kidsRev);
    const revenueByDemographic = [
      { name: "Men's Apparel", value: Math.round((menRev / totalDemoRev) * 100), color: '#3b82f6' },
      { name: "Women's Collection", value: Math.round((womenRev / totalDemoRev) * 100), color: '#ec4899' },
      { name: "Kids' Fashion", value: Math.round((kidsRev / totalDemoRev) * 100), color: '#10b981' },
    ];

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    for (const o of orders) {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }
    const salesByStatus = [
      { status: 'Delivered', count: statusCounts['delivered'] || 0, color: '#10b981' },
      { status: 'Shipped', count: statusCounts['shipped'] || 0, color: '#3b82f6' },
      { status: 'Confirmed', count: statusCounts['confirmed'] || 0, color: '#f59e0b' },
      { status: 'Placed', count: statusCounts['placed'] || 0, color: '#8b5cf6' },
      { status: 'Cancelled', count: statusCounts['cancelled'] || 0, color: '#ef4444' },
    ];

    // Recent 7 days revenue
    const recentDailyRevenue = [
      { date: 'Sep 25', revenue: 14250, orders: 6 },
      { date: 'Sep 26', revenue: 18900, orders: 8 },
      { date: 'Sep 27', revenue: 16400, orders: 7 },
      { date: 'Sep 28', revenue: 24500, orders: 11 },
      { date: 'Sep 29', revenue: 21300, orders: 9 },
      { date: 'Sep 30', revenue: 29800, orders: 14 },
      { date: 'Oct 01', revenue: 32400, orders: 15 },
    ];

    // Top selling
    const topSellingProducts = allProds.slice(0, 5).map((p, idx) => ({
      id: p.id,
      title: p.title,
      brand: p.brand,
      unitsSold: 48 - idx * 7,
      revenue: (48 - idx * 7) * p.price,
      image: p.images?.[0] || '',
    }));

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      pendingOrdersCount,
      totalProductsCount: allProds.length,
      lowStockCount,
      revenueByDemographic,
      salesByStatus,
      recentDailyRevenue,
      topSellingProducts,
    };
  });
}

/* ─── API: Admin Team & Email Access Management ─── */
export interface AdminTeamMember {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'SUPPORT';
  isEmailVerified?: boolean;
  createdAt: string;
}

const STORAGE_ADMIN_TEAM = 'sb_admin_authorized_emails';

export function getStoredAdminTeam(): AdminTeamMember[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_ADMIN_TEAM) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    { id: 'usr-admin-1', email: 'admin@stylebazaar.com', name: 'Store Administrator', role: 'ADMIN', createdAt: '2026-01-01T00:00:00Z' },
  ];
}

export function saveStoredAdminTeam(team: AdminTeamMember[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ADMIN_TEAM, JSON.stringify(team));
    }
  } catch {}
}

export async function getAdminTeam(): Promise<AdminTeamMember[]> {
  return apiCall(
    () => getStoredAdminTeam(),
    async () => {
      const res = await api<{ success: boolean; data: AdminTeamMember[] }>('/admin/team');
      return res.data;
    }
  );
}

export async function grantAdminRole(email: string, role: 'ADMIN' | 'SUPPORT' = 'ADMIN'): Promise<boolean> {
  return apiCall(
    () => {
      const team = getStoredAdminTeam();
      const norm = email.toLowerCase().trim();
      const exists = team.find((m) => m.email.toLowerCase() === norm);
      if (exists) {
        exists.role = role;
      } else {
        team.push({
          id: `usr-${Date.now()}`,
          email: norm,
          name: norm.split('@')[0],
          role,
          createdAt: new Date().toISOString(),
        });
      }
      saveStoredAdminTeam(team);
      return true;
    },
    async () => {
      await api('/admin/team/grant', {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      });
      return true;
    }
  );
}

export async function revokeAdminRole(email: string): Promise<boolean> {
  return apiCall(
    () => {
      const team = getStoredAdminTeam();
      const filtered = team.filter((m) => m.email.toLowerCase() !== email.toLowerCase().trim());
      saveStoredAdminTeam(filtered);
      return true;
    },
    async () => {
      await api('/admin/team/revoke', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return true;
    }
  );
}

