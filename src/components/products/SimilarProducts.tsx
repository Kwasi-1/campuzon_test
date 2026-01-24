import { Link } from "react-router-dom";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { useRef, useState } from "react";

interface SimilarProductsProps {
  products: Product[];
  onWishlistToggle?: (productId: string) => void;
  wishlistProductIds?: Set<string>;
}

export function SimilarProducts({
  products,
  onWishlistToggle,
  wishlistProductIds,
}: SimilarProductsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 400;
    const newScrollLeft =
      scrollContainerRef.current.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Similar Items</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!showLeftArrow}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 transition-all",
              showLeftArrow
                ? "bg-white hover:bg-gray-50 text-gray-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed",
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!showRightArrow}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 transition-all",
              showRightArrow
                ? "bg-white hover:bg-gray-50 text-gray-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed",
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scroll-smooth hide-scrollbar pb-4"
      >
        {products.map((product) => (
          <SimilarProductCard
            key={product.id}
            product={product}
            isInWishlist={wishlistProductIds?.has(product.id)}
            onWishlistToggle={onWishlistToggle}
          />
        ))}
      </div>
    </div>
  );
}

interface SimilarProductCardProps {
  product: Product;
  isInWishlist?: boolean;
  onWishlistToggle?: (productId: string) => void;
}

function SimilarProductCard({
  product,
  isInWishlist,
  onWishlistToggle,
}: SimilarProductCardProps) {
  return (
    <div className="flex-shrink-0 w-[200px] group">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 mb-3">
          <img
            src={product.images?.[0] || "/placeholder.png"}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Wishlist Button */}
          {onWishlistToggle && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onWishlistToggle(product.id);
              }}
              className="absolute top-2 right-2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
              aria-label={
                isInWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <Heart
                className={cn(
                  "w-4 h-4",
                  isInWishlist ? "text-red-500 fill-current" : "text-gray-600",
                )}
              />
            </button>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.store?.totalSales && product.store.totalSales > 100 && (
              <Badge
                variant="success"
                className="text-xs font-semibold bg-green-600 text-white"
              >
                Top Rated Seller
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-1">
          {/* Product Name */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-gray-500 line-through">
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Condition */}
          {product.condition && (
            <div className="text-xs text-gray-600 capitalize">
              {product.condition.replace(/-/g, " ")}
            </div>
          )}

          {/* Seller Info */}
          {product.store && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600">
                {product.store.name}
              </span>
            </div>
          )}

          {/* Shipping */}
          <div className="text-xs text-green-600 font-medium">
            Free shipping
          </div>
        </div>
      </Link>
    </div>
  );
}
