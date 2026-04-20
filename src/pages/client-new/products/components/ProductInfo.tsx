import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Shield,
  Users,
  MessageCircle,
  TrendingUp,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks";
import type { Product } from "@/types-new";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProductInfoProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onBuyNow: () => void;
  onAddToCart: () => void;
  onAddToWatchlist: () => void;
  onContactSeller: () => void;
  isInWishlist?: boolean;
  hideActionButtons?: boolean;
}

function AccordionRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-gray-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left text-xs font-semibold uppercase tracking-widest text-gray-900 hover:text-gray-600 transition-colors"
      >
        {label}
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
        )}
      </button>
      {open && (
        <div className="pb-5 text-sm text-gray-700 leading-relaxed space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductInfo({
  product,
  quantity,
  onQuantityChange,
  onBuyNow,
  onAddToCart,
  onAddToWatchlist,
  onContactSeller,
  isInWishlist,
  hideActionButtons = false,
}: ProductInfoProps) {
  const { formatGHS } = useCurrency();

  const currentPrice = Number.isFinite(product.price) ? product.price : 0;
  const comparePrice = Number.isFinite(product.comparePrice)
    ? product.comparePrice
    : null;
  const savings =
    comparePrice && comparePrice > currentPrice
      ? comparePrice - currentPrice
      : null;
  const savingsPercent = savings
    ? Math.round((savings / comparePrice!) * 100)
    : null;

  const storeInitial = product.store?.name?.charAt(0)?.toUpperCase() || "S";
  const maxQty = Math.min(product.quantity || 10, 10);
  const isOutOfStock = product.quantity === 0;

  // Category label
  const categoryLabel = product.category
    ? product.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <div className="flex flex-col">
      {/* Store / Brand line */}
      <div className="flex items-center justify-between mb-1">
        <Link
          to={`/stores/${product.store?.slug}`}
          className="text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          {product.store?.name || "Campus Store"}
        </Link>
        <button
          onClick={onContactSeller}
          aria-label="Message seller"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Product name */}
      <h1 className="text-base sm:text-lg font-normal text-gray-900 leading-snug mb-4">
        {product.name}
      </h1>

      {/* Price */}
      <div className="mb-5">
        <div className="flex items-baseline gap-3">
          <span className="text-xl font-medium text-gray-900">
            {formatGHS(currentPrice)}
          </span>
          {comparePrice && comparePrice > currentPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatGHS(comparePrice)}
            </span>
          )}
          {savingsPercent && (
            <span className="text-sm font-medium text-red-600">
              -{savingsPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Category / condition tags */}
      {(categoryLabel || product.condition) && (
        <div className="flex flex-wrap gap-2 mb-5">
          {categoryLabel && (
            <span className="text-xs border border-gray-300 px-2.5 py-1 text-gray-600 uppercase tracking-wide">
              {categoryLabel}
            </span>
          )}
          {product.condition && product.condition !== "new" && (
            <span className="text-xs border border-gray-300 px-2.5 py-1 text-gray-600 uppercase tracking-wide">
              {product.condition.replace(/-/g, " ")}
            </span>
          )}
        </div>
      )}

      {/* Stock / demand signals */}
      {(product.soldCount || product.viewCount) ? (
        <div className="flex items-center gap-3 mb-5 text-xs text-gray-500">
          {product.soldCount && product.soldCount > 0 ? (
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {product.soldCount} sold
            </span>
          ) : null}
          {product.viewCount && product.viewCount > 0 ? (
            <span>{product.viewCount} people viewing</span>
          ) : null}
        </div>
      ) : null}

      {/* Out of stock banner */}
      {isOutOfStock && (
        <div className="mb-5 border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          This item is currently out of stock.
        </div>
      )}

      {/* Low-stock warning */}
      {!isOutOfStock && product.quantity && product.quantity < 10 ? (
        <p className="mb-4 text-xs text-orange-600 font-medium">
          Only {product.quantity} left in stock
        </p>
      ) : null}

      {/* Quantity selector (Farfetch-style full-width dropdown) */}
      {!hideActionButtons && !isOutOfStock && (
        <div className="mb-3">
          <div className="relative border border-gray-300 bg-white hover:border-gray-900 transition-colors rounded-[6px]">
            <select
              value={quantity}
              onChange={(e) => onQuantityChange(Number(e.target.value))}
              className="w-full appearance-none bg-transparent px-4 py-3.5 pr-10 text-sm text-gray-900 cursor-pointer focus:outline-none"
            >
              <option value="" disabled className="text-gray-400">Select quantity</option>
              {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Qty: {n}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
          </div>
        </div>
      )}

      {/* CTA buttons */}
      {!hideActionButtons && (
        <div className="flex gap-2 mb-4 h-[48px] md:h-[50px]">
          <button
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className="flex-1 bg-[#222222] text-white text-[14px] font-semibold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-[6px]"
          >
            {isOutOfStock ? "Sold Out" : "Add To Bag"}
          </button>
          <button
            onClick={onAddToWatchlist}
            className={cn(
              "hidden md:flex w-[120px] md:w-[130px] items-center justify-center gap-2 border text-[14px] font-semibold transition-colors bg-white rounded-[6px]",
              isInWishlist
                ? "border-gray-900 text-gray-900"
                : "border-[#dddddd] text-gray-900 hover:border-gray-900",
            )}
          >
            Wishlist{" "}
            <Heart
              className={cn(
                "h-4 w-4",
                isInWishlist ? "fill-gray-900 text-gray-900" : "text-gray-900",
              )}
            />
          </button>
        </div>
      )}

      {/* Delivery Estimate */}
      <div className="mb-6">
        <p className="text-[12px] font-semibold text-gray-900 mb-0.5">Estimated delivery</p>
        <p className="text-[13px] text-gray-700">Same day - Next day</p>
      </div>

      {/* Extra info box */}
      <div className="bg-[#f5f5f5] px-4 py-3.5 text-[15px] text-gray-600 leading-relaxed mb-6 flex flex-col md:flex-row md:items-center rounded-md">
        <span>Free campus returns within 12 hours | Verified Student Seller</span>
      </div>
    </div>
  );
}
