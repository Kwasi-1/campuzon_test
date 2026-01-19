import { Link } from 'react-router-dom';
import { Heart, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product, ProductCondition } from '@/types';
import { cn, formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/stores';
import { useAddToWishlist, useRemoveFromWishlist, useIsInWishlist } from '@/hooks';

interface ProductCardProps {
  product: Product;
  index?: number;
  /** Delivery fee to display, optional */
  deliveryFee?: number;
  /** Location text, optional */
  location?: string;
  /** Show "or Best Offer" option */
  allowOffers?: boolean;
  /** Optional badge text to display (e.g., "Authorized Seller") */
  badge?: string;
  /** Optional specs to display (e.g., ["2025", "13.6 in", "256 GB"]) */
  specs?: string[];
}

/**
 * Get human-readable condition label
 */
function getConditionLabel(condition?: ProductCondition): string {
  const labels: Record<ProductCondition, string> = {
    new: 'Brand New',
    used_like_new: 'Like New',
    used_good: 'Pre-Owned',
    used_fair: 'Used - Fair',
  };
  return condition ? labels[condition] : 'Brand New';
}

export function ProductCard({
  product,
  index = 0,
  deliveryFee,
  location,
  allowOffers = false,
  badge,
  specs,
}: ProductCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { data: isInWishlist } = useIsInWishlist(product.id);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const isOutOfStock = product.quantity === 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;

    if (isInWishlist) {
      removeFromWishlist.mutate(product.id);
    } else {
      addToWishlist.mutate(product.id);
    }
  };

  // Build default specs if not provided
  const displaySpecs = specs || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        to={`/products/${product.id}`}
        className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg"
      >
        <article className="relative h-full bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-200 flex flex-col">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <img
              src={product.images?.[0] || '/placeholder-product.jpg'}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* Wishlist Button - Top Right */}
            <button
              onClick={handleWishlistToggle}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              className={cn(
                'absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center',
                'bg-white/95 backdrop-blur-sm shadow-sm border border-gray-200',
                'transition-all duration-200',
                'hover:scale-110 hover:shadow-md active:scale-95',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                isInWishlist ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              )}
            >
              <Heart
                className={cn(
                  'w-5 h-5 transition-all duration-200',
                  isInWishlist && 'fill-current'
                )}
              />
            </button>

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                <div className="bg-white text-gray-900 px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg">
                  Sold Out
                </div>
              </div>
            )}
          </div>

          {/* Content - Flex grow to push content to edges */}
          <div className="p-4 flex flex-col flex-1">
            {/* Title - eBay style, more lines allowed */}
            <h3 className="font-normal text-gray-900 text-[15px] leading-[1.4] line-clamp-3 mb-2 group-hover:text-blue-700 transition-colors">
              {product.name}
            </h3>

            {/* Condition + Specs Row */}
            {(product.condition || displaySpecs.length > 0) && (
              <div className="flex flex-wrap items-center gap-1 text-[13px] text-gray-600 mb-3">
                <span className="font-normal">{getConditionLabel(product.condition)}</span>
                {displaySpecs.length > 0 && (
                  <>
                    {displaySpecs.map((spec, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="text-gray-400">•</span>
                        <span className="font-normal">{spec}</span>
                      </span>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Price - Bold and prominent */}
            <div className="mb-2">
              <p className="text-[24px] font-bold text-gray-900 leading-none">
                {formatPrice(product.price)}
              </p>
              
              {/* Compare Price - Strikethrough */}
              {product.comparePrice && product.comparePrice > product.price && (
                <p className="text-[14px] text-gray-600 line-through mt-1">
                  {formatPrice(product.comparePrice)}
                </p>
              )}
            </div>

            {/* Buy It Now / Best Offer */}
            <div className="text-[14px] text-gray-700 mb-1">
              {allowOffers ? 'or Best Offer' : 'Buy It Now'}
            </div>

            {/* Delivery Info */}
            {deliveryFee !== undefined && (
              <p className="text-[14px] text-gray-600 mb-1">
                {deliveryFee === 0 ? (
                  <span className="text-green-700 font-medium">Free delivery</span>
                ) : (
                  <span>+{formatPrice(deliveryFee)} delivery</span>
                )}
              </p>
            )}

            {/* Location */}
            {location && (
              <p className="text-[14px] text-gray-600 mb-2">
                Located in {location}
              </p>
            )}

            {/* Spacer to push sold count to bottom */}
            <div className="flex-1" />

            {/* Bottom section */}
            <div className="flex items-center justify-between pt-2">
              {/* Sold Count */}
              {product.soldCount > 0 && !isOutOfStock && (
                <span className="text-[14px] text-gray-700 font-medium">
                  {product.soldCount} sold
                </span>
              )}
              
              {/* Badge (e.g., Authorized Seller) */}
              {badge && (
                <div className="flex items-center gap-1.5 text-[13px] text-blue-700 font-medium ml-auto">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{badge}</span>
                </div>
              )}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
