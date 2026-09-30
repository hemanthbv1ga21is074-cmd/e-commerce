import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Check, Tag } from 'lucide-react';
import { SEO } from '../components/ui/SEO';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { ProductGallery } from '../components/product/ProductGallery';
import { PriceDisplay } from '../components/ui/PriceDisplay';
import { StarRating } from '../components/ui/StarRating';
import { ColorSelector } from '../components/product/ColorSelector';
import { SizeSelector } from '../components/product/SizeSelector';
import { SizeChartModal } from '../components/product/SizeChartModal';
import { PincodeChecker } from '../components/product/PincodeChecker';
import { ProductAccordion } from '../components/product/ProductAccordion';
import { RatingSummary } from '../components/product/RatingSummary';
import { SimilarProducts } from '../components/product/SimilarProducts';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

import { getProductBySlug, getRelatedProducts } from '../services/api/products';
import { getProductReviews } from '../services/api/reviews';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useRecentlyViewedStore } from '../store/useRecentlyViewedStore';
import { useReviewStore } from '../store/useReviewStore';
import { useToastStore } from '../store/useToastStore';
import type { Product, Review, BreadcrumbItem } from '../types';
import { cn } from '../../src/utils/helpers';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Selection state
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [addedToCartFeedback, setAddedToCartFeedback] = useState(false);

  // Zustand stores
  const { addItem, items: cartItems } = useCartStore();
  const { isWishlisted, toggle: toggleWishlist } = useWishlistStore();
  const { add: addToRecentlyViewed } = useRecentlyViewedStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      setSizeError(false);
      setAddedToCartFeedback(false);

      try {
        const prod = await getProductBySlug(slug);
        if (!mounted) return;

        setProduct(prod);

        if (prod) {
          // Record to recently viewed
          addToRecentlyViewed(prod.id);

          // Defaults
          setSelectedColor(prod.colors[0]?.name || null);
          const firstInStockSize = prod.sizes.find((s) => s.stock > 0)?.name || null;
          setSelectedSize(firstInStockSize);

          // Related & reviews
          const [rel, rev] = await Promise.all([
            getRelatedProducts(prod.id, 8),
            getProductReviews(prod.id),
          ]);

          const storeReviews = useReviewStore.getState().getProductReviews(prod.id);
          const mergedReviews = [
            ...storeReviews,
            ...rev.filter((r) => !storeReviews.some((sr) => sr.id === r.id)),
          ];

          if (mounted) {
            setRelated(rel);
            setReviews(mergedReviews);
          }
        }
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      mounted = false;
    };
  }, [slug, addToRecentlyViewed]);

  if (loading) {
    return (
      <div className="container-app py-8 space-y-8">
        <Skeleton variant="text" width="30%" height={16} />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7">
            <Skeleton variant="rect" className="w-full aspect-[3/4] rounded-lg" />
          </div>
          <div className="md:col-span-5 space-y-4">
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="90%" height={32} />
            <Skeleton variant="text" width="60%" height={28} />
            <Skeleton variant="rect" className="w-full h-24 rounded-lg" />
            <Skeleton variant="rect" className="w-full h-12 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-app py-16">
        <EmptyState
          title="Product Not Found"
          description="The garment or fashion style you are looking for is no longer available or the link is incorrect."
          actionLabel="Browse Men's Fashion"
          onAction={() => navigate('/men')}
        />
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const alreadyInCart = cartItems.some(
    (i) => i.productId === product.id && i.size === selectedSize
  );

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: product.gender.toUpperCase(), href: `/${product.gender}` },
    ...product.categoryPath.map((c) => ({
      label: c,
      href: `/${product.gender}/${c.toLowerCase().replace(/\s+/g, '-')}`,
    })),
    { label: product.title },
  ];

  // showToast is declared above alongside other store hooks (rules-of-hooks)

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    setSizeError(false);
    const sizeObj = product.sizes.find((s) => s.name === selectedSize);

    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      brand: product.brand,
      price: product.price,
      mrp: product.mrp,
      size: selectedSize,
      color: selectedColor || 'Standard',
      image: product.images?.[0] || '',
      quantity: 1,
      maxStock: sizeObj?.stock || 10,
    });

    setAddedToCartFeedback(true);
    showToast(`Added ${product.title} (Size: ${selectedSize}) to Bag!`, 'success');
    setTimeout(() => setAddedToCartFeedback(false), 3000);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
    if (!wishlisted) {
      showToast(`Added ${product.title} to your Wishlist`, 'success');
    } else {
      showToast(`Removed from Wishlist`, 'info');
    }
  };

  return (
    <>
      <SEO
        title={`${product.title} by ${product.brand}`}
        description={`${product.title} - ${product.description}. Price: ₹${product.price}. Enjoy 30-day easy returns.`}
        type="product"
      />

      <div className="container-app py-4 space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Main Product Layout: Gallery (left) + Details (right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Gallery */}
          <div className="md:col-span-7">
            <ProductGallery
              images={product.images}
              productTitle={product.title}
              productId={product.id}
              category={product.categoryPath?.[product.categoryPath.length - 1]}
            />
          </div>

          {/* Right Column: Information & Actions */}
          <div className="md:col-span-5 space-y-5">
            {/* Brand & Title */}
            <div>
              <Link
                to={`/search?brand=${encodeURIComponent(product.brand)}`}
                className="font-black text-xl text-primary hover:text-accent uppercase tracking-wider block"
              >
                {product.brand}
              </Link>
              <h1 className="text-base text-muted font-normal mt-0.5 leading-snug">
                {product.title}
              </h1>

              {/* Rating badge */}
              {product.rating > 0 && (
                <div className="mt-2.5">
                  <StarRating
                    rating={product.rating}
                    count={product.ratingCount}
                    size="md"
                    variant="chip"
                  />
                </div>
              )}
            </div>

            <div className="border-t border-border" />

            {/* Price Section */}
            <div className="space-y-1">
              <PriceDisplay
                price={product.price}
                mrp={product.mrp}
                discountPercent={product.discountPercent}
                size="xl"
              />
              <p className="text-[11px] font-semibold text-emerald-700">
                Inclusive of all taxes
              </p>
            </div>

            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <ColorSelector
                colors={product.colors}
                selectedColor={selectedColor}
                onSelectColor={setSelectedColor}
              />
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-1.5">
                <SizeSelector
                  sizes={product.sizes}
                  selectedSize={selectedSize}
                  onSelectSize={(s) => {
                    setSelectedSize(s);
                    setSizeError(false);
                  }}
                  onOpenSizeChart={() => setIsSizeChartOpen(true)}
                />
                {sizeError && (
                  <p className="text-xs font-semibold text-accent animate-pulse">
                    Please select a size to proceed
                  </p>
                )}
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant={addedToCartFeedback ? 'secondary' : 'accent'}
                size="lg"
                onClick={handleAddToCart}
                className="flex-1 shadow-lg font-bold text-xs uppercase tracking-wider h-12"
                icon={
                  addedToCartFeedback ? (
                    <Check size={18} className="text-emerald-600" />
                  ) : (
                    <ShoppingBag size={18} />
                  )
                }
              >
                {addedToCartFeedback
                  ? 'Added to Bag!'
                  : alreadyInCart
                  ? 'Add More to Bag'
                  : 'Add to Bag'}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleToggleWishlist}
                className={cn(
                  'h-12 px-6 font-bold text-xs uppercase tracking-wider',
                  wishlisted && 'border-accent text-accent bg-rose-50'
                )}
                icon={
                  <Heart
                    size={18}
                    className={wishlisted ? 'fill-accent text-accent' : ''}
                  />
                }
              >
                {wishlisted ? 'Wishlisted' : 'Wishlist'}
              </Button>
            </div>

            {/* Best Offers Card */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 uppercase text-[11px] tracking-wider">
                <Tag size={14} className="text-accent" />
                Best Offers For You
              </div>
              <ul className="space-y-1.5 text-gray-700 text-[11px]">
                <li>
                  • Applicable on 1st order: Use coupon <strong>WELCOME100</strong> for flat ₹100 off.
                </li>
                <li>
                  • Bank Offer: 10% Instant Discount on HDFC Bank Cards on min spend of ₹2,000.
                </li>
              </ul>
            </div>

            {/* Pincode Checker */}
            <PincodeChecker />

            {/* Expandable Product Details Accordion */}
            <ProductAccordion product={product} />

            {/* Customer Ratings Breakdown */}
            <RatingSummary
              rating={product.rating}
              ratingCount={product.ratingCount}
              reviews={reviews}
            />
          </div>
        </div>

        {/* Similar Products Recommendation Row */}
        <SimilarProducts products={related} />

        {/* Size Chart Modal */}
        <SizeChartModal
          isOpen={isSizeChartOpen}
          onClose={() => setIsSizeChartOpen(false)}
          category={product.categoryPath?.[1] || 'Apparel'}
        />
      </div>
    </>
  );
};
