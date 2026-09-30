import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus } from '../types';
import { useAuthStore } from './useAuthStore';

interface OrderStore {
  orders: Order[];
  createOrder: (
    data: Omit<Order, 'id' | 'createdAt' | 'status' | 'timeline' | 'estimatedDelivery'>
  ) => Order;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByUser: (userId: string) => Order[];
  cancelOrder: (orderId: string, reason: string) => boolean;
  requestReturn: (
    orderId: string,
    itemId: string,
    reason: string,
    type: 'refund' | 'exchange',
    newSize?: string,
    refundToWallet?: boolean
  ) => boolean;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  clearOrders: () => void;
}

const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'SB-912048',
    userId: 'usr-demo-1',
    status: 'placed',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    shippingAddress: 'Rahul Sharma, 402, Lotus Grandeur, 12th Main, Indiranagar, Bengaluru, Karnataka - 560038, Ph: 9876543210',
    paymentMethod: 'UPI (rahul@okhdfcbank)',
    subtotal: 1299,
    discount: 200,
    deliveryFee: 0,
    total: 1099,
    couponCode: 'FIRST500',
    items: [
      {
        productId: 'prod-4',
        title: 'Fabindia Women Floral Hand-Block Printed Straight Kurti',
        brand: 'Fabindia',
        size: 'S',
        color: 'Indigo',
        quantity: 1,
        mrp: 1899,
        price: 1299,
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
      },
    ],
    timeline: [
      {
        status: 'placed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        description: 'Order placed successfully. Thank you for shopping with StyleBazaar!',
      },
      {
        status: 'confirmed',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        description: 'Seller has confirmed your order. Packaging will begin shortly.',
      },
    ],
  },
  {
    id: 'SB-839210',
    userId: 'usr-demo-1',
    status: 'shipped',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    shippingAddress: 'Rahul Sharma, 402, Lotus Grandeur, 12th Main, Indiranagar, Bengaluru, Karnataka - 560038, Ph: 9876543210',
    paymentMethod: 'Credit Card (HDFC **** 4012)',
    subtotal: 2499,
    discount: 600,
    deliveryFee: 0,
    total: 1899,
    carrier: {
      name: 'Delhivery Express',
      trackingNumber: 'DEL99281726IN',
      trackingUrl: 'https://www.delhivery.com/track/package/DEL99281726IN',
    },
    items: [
      {
        productId: 'prod-1',
        title: 'Rare Rabbit Men Textured Pure Cotton Slim Fit Casual Shirt',
        brand: 'Rare Rabbit',
        size: '40',
        color: 'Olive Green',
        quantity: 1,
        mrp: 3299,
        price: 1899,
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
      },
    ],
    timeline: [
      {
        status: 'placed',
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        description: 'Order placed and payment authorized.',
      },
      {
        status: 'confirmed',
        timestamp: new Date(Date.now() - 34 * 60 * 60 * 1000).toISOString(),
        description: 'Seller confirmed order item dispatch readiness.',
      },
      {
        status: 'packed',
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        description: 'Item safely packaged with tamper-proof security seal.',
      },
      {
        status: 'shipped',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        description: 'Dispatched via Delhivery Express (AWB: DEL99281726IN). In transit to Bangalore Hub.',
      },
    ],
  },
  {
    id: 'SB-782419',
    userId: 'usr-demo-1',
    status: 'delivered',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    shippingAddress: 'Rahul Sharma, 402, Lotus Grandeur, 12th Main, Indiranagar, Bengaluru, Karnataka - 560038, Ph: 9876543210',
    paymentMethod: 'UPI (rahul@okhdfcbank)',
    subtotal: 2998,
    discount: 700,
    deliveryFee: 0,
    total: 2298,
    carrier: {
      name: 'Blue Dart Surface',
      trackingNumber: 'BD948172635IN',
      trackingUrl: 'https://www.bluedart.com/tracking?trackNumber=BD948172635IN',
    },
    items: [
      {
        productId: 'prod-2',
        title: 'The Souled Store Men Black Solid Regular Fit Cotton T-Shirt',
        brand: 'The Souled Store',
        size: 'L',
        color: 'Pitch Black',
        quantity: 1,
        mrp: 1199,
        price: 799,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
      },
      {
        productId: 'prod-3',
        title: 'WROGN Men Slim Fit Washed Denim Stretch Jeans',
        brand: 'WROGN',
        size: '32',
        color: 'Dark Indigo',
        quantity: 1,
        mrp: 2999,
        price: 1499,
        image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80',
      },
    ],
    timeline: [
      {
        status: 'placed',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Order placed successfully.',
      },
      {
        status: 'confirmed',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        description: 'Order confirmed by merchant.',
      },
      {
        status: 'packed',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Item packed and assigned to courier partner.',
      },
      {
        status: 'shipped',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Handed over to Blue Dart Surface (AWB: BD948172635IN).',
      },
      {
        status: 'out_for_delivery',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        description: 'Delivery associate Manoj K (Ph: +91 99001 23456) is out for delivery with OTP.',
      },
      {
        status: 'delivered',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000).toISOString(),
        description: 'Delivered to customer with contact-less signature verification.',
      },
    ],
  },
];

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: INITIAL_DEMO_ORDERS,

      createOrder: (data) => {
        const orderId = `SB-${Math.floor(100000 + Math.random() * 900000)}`;
        const now = new Date();
        const estDelivery = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

        const newOrder: Order = {
          ...data,
          id: orderId,
          status: 'placed',
          createdAt: now.toISOString(),
          estimatedDelivery: estDelivery.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          carrier: {
            name: 'Delhivery Express',
            trackingNumber: `DEL${Math.floor(10000000 + Math.random() * 90000000)}IN`,
            trackingUrl: 'https://www.delhivery.com',
          },
          timeline: [
            {
              status: 'placed',
              timestamp: now.toISOString(),
              description: 'Order placed successfully. Thank you for shopping with StyleBazaar!',
            },
            {
              status: 'confirmed',
              timestamp: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
              description: 'Order confirmed by seller.',
            },
          ],
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return newOrder;
      },

      getOrderById: (id) => {
        return get().orders.find((o) => o.id === id);
      },

      getOrdersByUser: (userId) => {
        return get().orders.filter((o) => o.userId === userId || userId === 'usr-demo-1');
      },

      cancelOrder: (orderId, reason) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order || (order.status !== 'placed' && order.status !== 'confirmed' && order.status !== 'packed')) {
          return false;
        }

        const now = new Date().toISOString();
        const updatedTimeline = [
          ...order.timeline,
          {
            status: 'cancelled' as OrderStatus,
            timestamp: now,
            description: `Order cancelled by user: "${reason}". Full refund of ₹${order.total} credited to StyleBazaar Wallet.`,
          },
        ];

        // Automatic instant refund to wallet
        useAuthStore.getState().addWalletBalance(
          order.total,
          `Instant Refund for Cancelled Order #${order.id}`
        );

        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'cancelled',
                  cancellationReason: reason,
                  cancellationDate: now,
                  refundAmount: order.total,
                  timeline: updatedTimeline,
                }
              : o
          ),
        }));

        return true;
      },

      requestReturn: (orderId, itemId, reason, type, newSize, refundToWallet = true) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order || order.status !== 'delivered') {
          return false;
        }

        const targetItem = order.items.find((i) => i.productId === itemId);
        const itemRefund = targetItem ? targetItem.price * targetItem.quantity : order.total;
        const now = new Date().toISOString();
        const pickupDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        });

        const updatedTimeline = [
          ...order.timeline,
          {
            status: 'returned' as OrderStatus,
            timestamp: now,
            description: `${type === 'exchange' ? `Exchange request for size ${newSize}` : 'Return request'} approved. Doorstep pickup scheduled for ${pickupDate}. Reason: ${reason}.`,
          },
        ];

        if (type === 'refund' && refundToWallet) {
          useAuthStore.getState().addWalletBalance(
            itemRefund,
            `Instant Wallet Refund for Returned Item in #${order.id}`
          );
        }

        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'returned',
                  returnRequest: {
                    itemId,
                    reason,
                    type,
                    newSize,
                    status: 'pickup_scheduled',
                    pickupDate,
                    refundAmount: itemRefund,
                  },
                  timeline: updatedTimeline,
                }
              : o
          ),
        }));

        return true;
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
        }));
      },

      clearOrders: () => set({ orders: [] }),
    }),
    { name: 'stylebazaar-orders' }
  )
);
