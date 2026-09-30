import { describe, it, expect, beforeEach } from 'vitest';
import { useOrderStore } from '../../store/useOrderStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useReviewStore } from '../../store/useReviewStore';

describe('useOrderStore & useReviewStore (Phase 4)', () => {
  beforeEach(() => {
    useAuthStore.getState().loginAsDemoUser();
  });

  it('creates an order with valid timeline and returns created order', () => {
    const order = useOrderStore.getState().createOrder({
      userId: 'usr-demo-1',
      items: [
        {
          productId: 'prod-10',
          title: 'Allen Solly Formal Cotton Shirt',
          brand: 'Allen Solly',
          size: '42',
          color: 'White',
          quantity: 1,
          mrp: 2299,
          price: 1399,
        },
      ],
      shippingAddress: 'Rahul Sharma, 12th Main, Bangalore - 560038',
      paymentMethod: 'UPI (rahul@okaxis)',
      subtotal: 1399,
      discount: 0,
      deliveryFee: 0,
      total: 1399,
    });

    expect(order.id).toMatch(/^SB-\d+/);
    expect(order.status).toBe('placed');
    expect(order.timeline.length).toBeGreaterThanOrEqual(2);
    expect(order.items[0].productId).toBe('prod-10');

    const found = useOrderStore.getState().getOrderById(order.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(order.id);
  });

  it('cancels an eligible order and credits refund to wallet', () => {
    const initialWallet = useAuthStore.getState().user?.walletBalance || 0;

    const order = useOrderStore.getState().createOrder({
      userId: 'usr-demo-1',
      items: [
        {
          productId: 'prod-11',
          title: 'Levi\'s Men 511 Slim Jeans',
          brand: 'Levi\'s',
          size: '34',
          color: 'Blue',
          quantity: 1,
          mrp: 3599,
          price: 2199,
        },
      ],
      shippingAddress: 'Rahul Sharma, Bangalore',
      paymentMethod: 'Credit Card',
      subtotal: 2199,
      discount: 0,
      deliveryFee: 0,
      total: 2199,
    });

    const success = useOrderStore
      .getState()
      .cancelOrder(order.id, 'Expected delivery date is too late');

    expect(success).toBe(true);

    const cancelledOrder = useOrderStore.getState().getOrderById(order.id);
    expect(cancelledOrder?.status).toBe('cancelled');
    expect(cancelledOrder?.cancellationReason).toBe('Expected delivery date is too late');
    expect(cancelledOrder?.refundAmount).toBe(2199);

    const newWallet = useAuthStore.getState().user?.walletBalance || 0;
    expect(newWallet).toBe(initialWallet + 2199);
  });

  it('submits a return request for delivered orders', () => {
    // SB-782419 is delivered in demo orders
    const deliveredOrder = useOrderStore.getState().getOrderById('SB-782419');
    expect(deliveredOrder).toBeDefined();
    expect(deliveredOrder?.status).toBe('delivered');

    const success = useOrderStore
      .getState()
      .requestReturn(
        'SB-782419',
        'prod-2',
        'Size does not fit (too small / too large)',
        'exchange',
        'XL',
        false
      );

    expect(success).toBe(true);

    const updated = useOrderStore.getState().getOrderById('SB-782419');
    expect(updated?.status).toBe('returned');
    expect(updated?.returnRequest?.type).toBe('exchange');
    expect(updated?.returnRequest?.newSize).toBe('XL');
    expect(updated?.returnRequest?.status).toBe('pickup_scheduled');
  });

  it('allows adding and voting on customer reviews', () => {
    const newRev = useReviewStore.getState().addReview({
      productId: 'prod-test-99',
      orderId: 'SB-782419',
      userId: 'usr-demo-1',
      userName: 'Rahul Sharma',
      rating: 5,
      title: 'Flawless fit and finish',
      text: 'Loved the stitching and collar style!',
      fit: 'True to Size',
      verifiedBuyer: true,
    });

    expect(newRev.id).toMatch(/^rev-/);
    expect(newRev.helpfulCount).toBe(0);

    const prodReviews = useReviewStore.getState().getProductReviews('prod-test-99');
    expect(prodReviews.length).toBe(1);
    expect(prodReviews[0].title).toBe('Flawless fit and finish');

    useReviewStore.getState().voteHelpful(newRev.id);
    const updatedReviews = useReviewStore.getState().getProductReviews('prod-test-99');
    expect(updatedReviews[0].helpfulCount).toBe(1);
  });
});
