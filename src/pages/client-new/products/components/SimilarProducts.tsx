import { useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useCurrency, useAddToWishlist, useRemoveFromWishlist, useIsInWishlist } from "@/hooks";
import { useAuthStore } from "@/stores";
import { useAuthPromptStore } from "@/stores/authPromptStore";
import { cn } from "@/lib/utils";
import type { Product } from "@/types-new";

interface SimilarProductsProps {
  products: Product[];
  title?: string;
  storeName?: string;
  storeSlug?: string;
}

function SellerProductCard({ product }: { product: Product }) {
  const { formatGHS } = useCurrency();
  const { isAuthenticated } = useAuthStore();
  const { openAuthPrompt } = useAuthPromptStore();
  const { data: isInWishlist } = useIsInWishlist(product.id);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthPrompt(window.location.pathname, "Sign in to save items to your wishlist.");
      return;
    }
    if (isInWishlist) {
      removeFromWishlist.mutate(product.id);
    } else {
      addToWishlist.mutate(product.id);
    }
  };

  const currentPrice = Number.isFinite(product.price) ? product.price : 0;
  const comparePrice =
    Number.isFinite(product.comparePrice) && product.comparePrice
      ? product.comparePrice
      : null;

  const imageUrl =
    product.images?.[0] || product.thumbnail || "/placeholder-product.jpg";

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col w-[160px] sm:w-[190px] md:w-[210px] shrink-0 relative"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f2f2f2]">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label={isInWishlist ? "Remove from wishlist" : "Save to wishlist"}
          className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isInWishlist ? "fill-gray-900 text-gray-900" : "text-gray-600",
            )}
          />
        </button>

        {/* Out of stock overlay */}
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-end justify-center pb-3">
            <span className="text-[10px] uppercase tracking-widest text-gray-600 font-medium">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-2.5 flex flex-col gap-0.5">
        {/* Store name */}
        {product.store?.name && (
          <p className="text-[10px] uppercase tracking-widest text-gray-400 truncate">
            {product.store.name}
          </p>
        )}

        {/* Product name */}
        <p className="text-xs text-gray-800 leading-snug line-clamp-2">
          {product.name}
        </p>

        {/* Price */}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-medium text-gray-900">
            {formatGHS(currentPrice)}
          </span>
          {comparePrice && comparePrice > currentPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatGHS(comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function SimilarProducts({
  products,
  title = "More from this seller",
  storeName,
  storeSlug,
}: SimilarProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 450;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-900">
          {title}
        </h2>
        <div className="flex items-center gap-3">
          {storeSlug && (
            <Link
              to={`/stores/${storeSlug}`}
              className="text-xs underline text-gray-500 hover:text-gray-900 transition-colors hidden sm:block"
            >
              View all from {storeName || "this seller"}
            </Link>
          )}
          {/* Arrow buttons — desktop */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="flex h-8 w-8 items-center justify-center border border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="flex h-8 w-8 items-center justify-center border border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal scroll strip */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
      >
        {products.map((product) => (
          <div key={product.id} className="snap-start shrink-0">
            <SellerProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Mobile: View all link */}
      {storeSlug && (
        <div className="mt-4 sm:hidden">
          <Link
            to={`/stores/${storeSlug}`}
            className="text-xs underline text-gray-500 hover:text-gray-900 transition-colors"
          >
            View all from {storeName || "this seller"}
          </Link>
        </div>
      )}
    </div>
  );
}
