import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Package } from 'lucide-react';
import { SEO } from '../components/ui/SEO';
import { AccountSidebar } from '../components/account/AccountSidebar';
import { OrderCard } from '../components/orders/OrderCard';
import { CancelOrderModal } from '../components/orders/CancelOrderModal';
import { ReturnExchangeModal } from '../components/orders/ReturnExchangeModal';
import { WriteReviewModal } from '../components/reviews/WriteReviewModal';
import { OrderInvoice } from '../components/orders/OrderInvoice';
import { Button } from '../components/ui/Button';

import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import type { Order, OrderItem } from '../types';

type OrderFilterTab = 'all' | 'in_transit' | 'delivered' | 'cancelled';

export const OrdersPage: React.FC = () => {
  const { user } = useAuthStore();
  const { orders, cancelOrder, requestReturn } = useOrderStore();

  const [activeTab, setActiveTab] = useState<OrderFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<Order | null>(null);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [selectedItemForReview, setSelectedItemForReview] = useState<{
    item: OrderItem;
    orderId: string;
  } | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // Filter orders by active user
  const userOrders = orders.filter(
    (o) => !user || o.userId === user.id || o.userId === 'usr-demo-1' || o.userId === 'guest-user'
  );

  // Filter by tab
  const tabFilteredOrders = userOrders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in_transit') {
      return (
        order.status === 'placed' ||
        order.status === 'confirmed' ||
        order.status === 'packed' ||
        order.status === 'shipped' ||
        order.status === 'out_for_delivery'
      );
    }
    if (activeTab === 'delivered') return order.status === 'delivered';
    if (activeTab === 'cancelled') {
      return order.status === 'cancelled' || order.status === 'returned';
    }
    return true;
  });

  // Filter by search query
  const filteredOrders = tabFilteredOrders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const idMatch = order.id.toLowerCase().includes(q);
    const itemMatch = order.items.some(
      (i) => i.title.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q)
    );
    return idMatch || itemMatch;
  });

  const handleConfirmCancel = (orderId: string, reason: string) => {
    cancelOrder(orderId, reason);
  };

  const handleConfirmReturn = (
    orderId: string,
    itemId: string,
    reason: string,
    type: 'refund' | 'exchange',
    newSize?: string,
    refundToWallet?: boolean
  ) => {
    requestReturn(orderId, itemId, reason, type, newSize, refundToWallet);
  };

  return (
    <div className="min-h-screen bg-surface/30">
      <SEO title="My Orders & Purchases — StyleBazaar" />

      <div className="container-app py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Account Navigation */}
          <AccountSidebar />

          {/* Right Column: Orders Content */}
          <div className="flex-1 w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-primary flex items-center gap-2">
                  <Package size={24} className="text-accent" />
                  <span>My Orders</span>
                </h1>
                <p className="text-xs text-muted mt-1">
                  Track orders, schedule returns, manage exchanges and download tax invoices
                </p>
              </div>

              {/* Search Orders */}
              <div className="relative w-full sm:w-72">
                <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Order ID or item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-border rounded-xl text-xs outline-none focus:border-accent shadow-xs"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto no-scrollbar text-xs">
              {[
                { id: 'all', label: `All Orders (${userOrders.length})` },
                {
                  id: 'in_transit',
                  label: `In Transit (${
                    userOrders.filter(
                      (o) =>
                        o.status === 'placed' ||
                        o.status === 'confirmed' ||
                        o.status === 'packed' ||
                        o.status === 'shipped' ||
                        o.status === 'out_for_delivery'
                    ).length
                  })`,
                },
                {
                  id: 'delivered',
                  label: `Delivered (${userOrders.filter((o) => o.status === 'delivered').length})`,
                },
                {
                  id: 'cancelled',
                  label: `Cancelled / Returned (${
                    userOrders.filter((o) => o.status === 'cancelled' || o.status === 'returned')
                      .length
                  })`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as OrderFilterTab)}
                  className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-white border border-border text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Orders Listing */}
            {filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onCancelClick={(ord) => setSelectedOrderForCancel(ord)}
                    onReturnClick={(ord) => setSelectedOrderForReturn(ord)}
                    onReviewClick={(item, ordId) => setSelectedItemForReview({ item, orderId: ordId })}
                    onInvoiceClick={(ord) => setSelectedOrderForInvoice(ord)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-border rounded-2xl p-12 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-accent flex items-center justify-center mx-auto">
                  <ShoppingBag size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-primary">No orders found</h3>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    {searchQuery
                      ? `No orders matching "${searchQuery}". Try searching with a different keyword or order ID.`
                      : 'You have no orders in this category yet. Explore our latest arrivals to start shopping!'}
                  </p>
                </div>
                <div>
                  <Link to="/">
                    <Button variant="accent" size="md">
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={!!selectedOrderForCancel}
        onClose={() => setSelectedOrderForCancel(null)}
        order={selectedOrderForCancel}
        onConfirmCancel={handleConfirmCancel}
      />

      {/* Return/Exchange Modal */}
      <ReturnExchangeModal
        isOpen={!!selectedOrderForReturn}
        onClose={() => setSelectedOrderForReturn(null)}
        order={selectedOrderForReturn}
        onConfirm={handleConfirmReturn}
      />

      {/* Rate & Review Modal */}
      <WriteReviewModal
        isOpen={!!selectedItemForReview}
        onClose={() => setSelectedItemForReview(null)}
        item={selectedItemForReview?.item || null}
        orderId={selectedItemForReview?.orderId}
      />

      {/* GST Invoice Modal */}
      <OrderInvoice
        isOpen={!!selectedOrderForInvoice}
        onClose={() => setSelectedOrderForInvoice(null)}
        order={selectedOrderForInvoice}
      />
    </div>
  );
};
