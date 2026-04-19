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
          <div className="relative border border-gray-300 bg-white hover:border-gray-900 transition-colors">
            <select
              value={quantity}
              onChange={(e) => onQuantityChange(Number(e.target.value))}
              className="w-full appearance-none bg-transparent px-4 py-3.5 pr-10 text-sm text-gray-900 cursor-pointer focus:outline-none"
            >
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
        <div className="space-y-2 mb-6">
          <button
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className="w-full bg-gray-900 text-white py-4 text-sm font-medium uppercase tracking-widest hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isOutOfStock ? "Out of Stock" : "Add to Bag"}
          </button>
          <button
            onClick={onAddToWatchlist}
            className={cn(
              "w-full border py-4 text-sm font-medium uppercase tracking-widest transition-colors",
              isInWishlist
                ? "border-gray-900 bg-gray-900 text-white hover:bg-gray-700"
                : "border-gray-300 text-gray-900 hover:border-gray-900",
            )}
          >
            {isInWishlist ? "Saved to Wishlist" : "Save to Wishlist"}
          </button>
        </div>
      )}

      {/* Delivery / fulfilment accordions */}
      <div className="border-t border-gray-200">
        <AccordionRow label="Delivery, Returns & Seller">
          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <Users className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 mb-0.5">Peer Delivery</p>
                <p>
                  A fellow student on campus will deliver this item to you —
                  typically same-day or next-day depending on availability.
                  Coordinate handoff after purchase.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 mb-0.5">Campus Pickup</p>
                <p>
                  Meet the seller at a convenient, well-lit campus location.
                  Agree on time and spot after purchase.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 mb-0.5">
                  Campuzon Buyer Protection
                </p>
                <p>
                  Your payment is held in escrow and released to the seller only
                  12 hours after you confirm receipt — giving you time to inspect
                  the item.
                </p>
              </div>
            </div>
          </div>
        </AccordionRow>

        <AccordionRow label="The Details">
          <p className="whitespace-pre-wrap text-gray-700">
            {product.description || "No description provided."}
          </p>
          {product.tags && product.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.tags.map((tag, i) => (
                <span
                  key={i}
                  className="border border-gray-200 px-2 py-0.5 text-xs text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </AccordionRow>

        {/* Seller info */}
        <AccordionRow label="About the Seller">
          <Link
            to={`/stores/${product.store?.slug}`}
            className="flex items-center gap-3 group"
          >
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={product.store?.logo} alt={product.store?.name} />
              <AvatarFallback className="text-xs font-semibold bg-gray-100">
                {storeInitial}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:underline">
                {product.store?.name || "Campus Seller"}
              </p>
              {product.store?.location && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {product.store.location}
                </p>
              )}
              {product.store?.totalSales ? (
                <p className="text-xs text-gray-400 mt-0.5">
                  {product.store.totalSales} sales
                </p>
              ) : null}
            </div>
          </Link>
          <button
            onClick={onContactSeller}
            className="mt-4 w-full border border-gray-300 py-2.5 text-xs font-medium uppercase tracking-widest text-gray-900 hover:border-gray-900 transition-colors"
          >
            Message Seller
          </button>
        </AccordionRow>
      </div>
    </div>
  );
}
