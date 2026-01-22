import { Link } from "react-router-dom";
import { Heart, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Product, ProductCondition } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/stores";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useIsInWishlist,
} from "@/hooks";

type CardVariant = "grid" | "list";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: CardVariant;
}

/**
 * Get human-readable condition label
 */
function getConditionLabel(condition?: ProductCondition): string {
  const labels: Record<ProductCondition, string> = {
    new: "Brand New",
    used_like_new: "Like New",
    used_good: "Pre-Owned",
    used_fair: "Used - Fair",
  };
  return condition ? labels[condition] : "Brand New";
}

export function ProductCard({
  product,
  index = 0,
  variant = "grid",
}: ProductCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { data: isInWishlist } = useIsInWishlist(product.id);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const isOutOfStock = product.quantity === 0;
  const hasDiscount =
    product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.comparePrice!) * 100)
    : 0;

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

  if (variant === "list") {
    return <ListCard product={product} index={index} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.03,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full"
    >
      <Link
        to={`/products/${product.slug || product.id}`}
        className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
      >
        <article className="relative h-full bg-white dark:bg-card rounded-lg overflow-hidden transition-all duration-300  border-border hover:border-primary/30 flex flex-col">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-muted">
            <img
              src={
                product.images?.[0] ||
                product.thumbnail ||
                "/placeholder-product.jpg"
              }
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-b-lg"
              loading="lazy"
            />

            {/* Discount Badge */}
            {hasDiscount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {discountPercent}% OFF
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              aria-label={
                isInWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
              className={cn(
                "absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center",
                "bg-white/95 dark:bg-background/95 backdrop-blur-sm shadow-sm border border-border",
                "transition-all duration-200 opacity-0 group-hover:opacity-100",
                "hover:scale-110 hover:shadow-md active:scale-95",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isInWishlist
                  ? "text-red-500 opacity-100"
                  : "text-muted-foreground hover:text-red-500",
              )}
            >
              <Heart
                className={cn(
                  "w-4 h-4 transition-all duration-200",
                  isInWishlist && "fill-current",
                )}
              />
            </button>

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                <div className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Sold Out
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="py-3 flex flex-col flex-1">
            {/* Title */}
            <h3 className="font-normal text-foreground text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Condition */}
            <p className="text-xs text-muted-foreground mb-2">
              {getConditionLabel(product.condition)}
            </p>

            {/* Price */}
            <div className="mt-auto">
              <p className="text-lg font-bold text-foreground leading-none">
                {formatPrice(product.price)}
              </p>
              {hasDiscount && (
                <p className="text-xs text-muted-foreground line-through mt-0.5">
                  {formatPrice(product.comparePrice!)}
                </p>
              )}
            </div>

            {/* Sold Count */}
            {product.soldCount > 0 && !isOutOfStock && (
              <p className="text-xs text-muted-foreground mt-2">
                {product.soldCount} sold
              </p>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

// List view variant
function ListCard({ product, index }: { product: Product; index: number }) {
  const { isAuthenticated } = useAuthStore();
  const { data: isInWishlist } = useIsInWishlist(product.id);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const isOutOfStock = product.quantity === 0;
  const hasDiscount =
    product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.comparePrice!) * 100)
    : 0;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.03,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        to={`/products/${product.slug || product.id}`}
        className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
      >
        <article className="relative bg-white dark:bg-card rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg border border-border hover:border-primary/30 flex gap-4 p-4">
          {/* Image */}
          <div className="relative w-40 h-40 md:w-48 md:h-48 shrink-0 rounded-lg overflow-hidden bg-gray-50 dark:bg-muted">
            <img
              src={
                product.images?.[0] ||
                product.thumbnail ||
                "/placeholder-product.jpg"
              }
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {hasDiscount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                {discountPercent}% OFF
              </div>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Title */}
            <h3 className="font-normal text-foreground text-base leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Condition */}
            <p className="text-sm text-muted-foreground mb-2">
              {getConditionLabel(product.condition)}
            </p>

            {/* Store */}
            {product.store && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>{product.store.name}</span>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Price and Actions */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-bold text-foreground leading-none">
                  {formatPrice(product.price)}
                </p>
                {hasDiscount && (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.comparePrice!)}
                  </p>
                )}
                {product.soldCount > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.soldCount} sold
                  </p>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                aria-label={
                  isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  "bg-muted border border-border",
                  "transition-all duration-200",
                  "hover:scale-110 hover:shadow-md active:scale-95",
                  isInWishlist
                    ? "text-red-500"
                    : "text-muted-foreground hover:text-red-500",
                )}
              >
                <Heart
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isInWishlist && "fill-current",
                  )}
                />
              </button>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
