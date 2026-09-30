import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Product, ProductCardData } from '../../types';
import { ProductImage } from './ProductImage';
import { PriceDisplay } from '../ui/PriceDisplay';
import { StarRating } from '../ui/StarRating';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useToastStore } from '../../store/useToastStore';
import { cn } from '../../utils/helpers';

interface ProductCardProps {
  product: Product | ProductCardData;
  className?: string;
  showWishlist?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className,
  showWishlist = true,
}) => {
  const { isWishlisted, toggle: toggleWishlist } = useWishlistStore();
  const { showToast } = useToastStore();
  const wishlisted = isWishlisted(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    if (!wishlisted) {
      showToast(`Added ${product.title} to your Wishlist`, 'success');
    } else {
      showToast(`Removed from Wishlist`, 'info');
    }
  };

  // If full product with sizes is available
  const sizes = 'sizes' in product ? (product as Product).sizes : [];

  return (
    <div
      className={cn(
        'group relative flex flex-col bg-white rounded-md overflow-hidden transition-all duration-200 hover:shadow-lg',
        className
      )}
    >
      {/* Clickable Image Area */}
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden">
        <ProductImage
          src={product.images?.[0]}
          alt={product.title}
          id={product.id}
          category={product.categoryPath?.[product.categoryPath.length - 1]}
          aspectRatio="product"
        />

        {/* Wishlist Button */}
        {showWishlist && (
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={cn(
              'absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white/80 backdrop-blur-sm shadow-sm hover:scale-110 focus-visible:outline-none',
              wishlisted ? 'text-accent' : 'text-gray-600 hover:text-accent'
            )}
          >
            <Heart
              size={17}
              className={cn(
                'transition-colors',
                wishlisted ? 'fill-accent stroke-accent' : 'stroke-current'
              )}
            />
          </button>
        )}

        {/* Rating Chip */}
        {product.rating > 0 && (
          <div className="absolute bottom-2 left-2 z-10">
            <StarRating
              rating={product.rating}
              count={product.ratingCount}
              size="sm"
              variant="chip"
            />
          </div>
        )}

        {/* Hover Sizes Drawer (Desktop) */}
        {sizes.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm py-2 px-3 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 hidden md:flex items-center justify-center gap-1.5 border-t border-gray-100">
            <span className="text-[11px] text-muted mr-1 font-medium">Sizes:</span>
            {sizes.map((s) => (
              <span
                key={s.name}
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded border font-medium',
                  s.stock > 0
                    ? 'border-gray-200 text-gray-800'
                    : 'border-dashed border-gray-200 text-gray-400 line-through'
                )}
              >
                {s.name}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* Info Area */}
      <div className="p-3 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`} className="block focus-visible:outline-none">
          <div className="font-bold text-xs uppercase tracking-wider text-primary truncate mb-0.5">
            {product.brand}
          </div>
          <div className="text-xs text-muted truncate mb-2" title={product.title}>
            {product.title}
          </div>
          <PriceDisplay
            price={product.price}
            mrp={product.mrp}
            discountPercent={product.discountPercent}
            size="sm"
          />
        </Link>
      </div>
    </div>
  );
};
