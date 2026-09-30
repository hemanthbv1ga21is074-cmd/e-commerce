export type OrderStatus = 
  | 'placed'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface OrderItem {
  productId: string;
  title: string;
  brand: string;
  size: string;
  color: string;
  quantity: number;
  mrp: number;
  price: number;
  image?: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  description: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  timeline: OrderTimeline[];
  shippingAddress: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  walletUsed?: number;
  loyaltyPointsUsed?: number;
  total: number;
  couponCode?: string;
  createdAt: string;
  estimatedDelivery: string;
  carrier?: {
    name: string;
    trackingNumber: string;
    trackingUrl?: string;
  };
  cancellationReason?: string;
  cancellationDate?: string;
  refundAmount?: number;
  returnRequest?: {
    itemId: string;
    reason: string;
    type: 'refund' | 'exchange';
    newSize?: string;
    status: 'requested' | 'pickup_scheduled' | 'completed';
    pickupDate: string;
    refundAmount?: number;
  };
}
