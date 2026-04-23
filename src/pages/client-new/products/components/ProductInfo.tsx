import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Heart, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks";
import type { Product } from "@/types-new";

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

export function AccordionRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true); // Open by default makes it look more editorial sometimes, but let's keep false if we want. Actually Farfetch keeps them open or closed? "THE DETAILS" is usually open. Let's make it open by default for the first one? Let's just use open = false initially but `THE DETAILS` can override.
  // Actually, we'll just allow passing defaultOpen
  return null; // Implemented differently so we can pass defaultOpen
}

export function DetailedAccordionRow({
  label,
  children,
  defaultOpen = false,
  isborder = true,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isborder?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`${isborder ? "border-t" : ""} border-gray-200`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-5 text-left text-[15px] font-semibold text-gray-900 hover:text-gray-600 transition-colors uppercase tracking-wide"
      >
        {label}
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
        )}
      </button>
      {open && (
        <div className="pb-6 text-sm text-gray-700 leading-relaxed">
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

  const maxQty = Math.min(product.quantity || 10, 10);
  const isOutOfStock = product.quantity === 0;

  const categoryLabel = product.category
    ? product.category
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <div className="flex flex-col pr-1 md:pr-0 md:pt-4">
      {/* Brand line (Store Name equivalent) */}
      <h1 className="text-xl md:text-[22px] font-medium text-gray-900 mb-2 leading-tight overflow-x-auto scrollbar-hide whitespace-nowrap overflow-y-hidden tracking-normal">
        {product.name}
      </h1>

      {/* Product Name */}
      <Link
        to={`/stores/${product.store?.slug}`}
        className="text-[14px] text-gray-600 mb-4 lg:mb-5"
      >
        {product.store?.name || "Campus Store"}
      </Link>

      {/* Price */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-baseline gap-3">
          <span className="text-base font-medium text-gray-900">
            {formatGHS(currentPrice)}
          </span>
          {comparePrice && comparePrice > currentPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatGHS(comparePrice)}
            </span>
          )}
          {savingsPercent && (
            <span className="text-[13px] font-medium text-red-600">
              {savingsPercent}% Off
            </span>
          )}
        </div>
      </div>

      {/* Category / condition tags */}
      {(categoryLabel || product.condition) && (
        <div className="flex flex-wrap gap-2 mb-5">
          {categoryLabel && (
            <span className="text-xs border rounded border-gray-300 px-2.5 py-1 text-gray-600 uppercase tracking-wide">
              {categoryLabel}
            </span>
          )}
          {product.condition && product.condition !== "new" && (
            <span className="text-xs border rounded border-gray-300 px-2.5 py-1 text-gray-600 uppercase tracking-wide">
              {product.condition.replace(/-/g, " ")}
            </span>
          )}
        </div>
      )}

      {/* Stock / demand signals */}
      {product.soldCount || product.viewCount ? (
        <div className="flex items-center md:justify-end gap-3 mb-5 md:mb-7 text-xs text-gray-500 md:-mt-10">
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
        <p className="md:hidden mb-4 text-xs text-orange-600 font-medium">
          Only {product.quantity} left in stock
        </p>
      ) : null}

      {/* Size / Quantity selector */}
      {!hideActionButtons && !isOutOfStock && (
        <div className="mb-4">
          <div
            className={cn(
              "md:flex justify-between",
              !isOutOfStock && product.quantity && product.quantity < 10
                ? "justify-between"
                : "justify-end",
            )}
          >
            {/* Low-stock warning */}
            {!isOutOfStock && product.quantity && product.quantity < 10 ? (
              <p className="hidden md:block mb-1 text-xs text-orange-600 font-medium">
                Only {product.quantity} left in stock
              </p>
            ) : null}
            <div className="flex justify-end mb-1">
              <span className="text-xs text-gray-500 hover:text-gray-900 underline cursor-pointer transition-colors">
                Quantity guide
              </span>
            </div>
          </div>
          <div className="relative border border-[#dddddd] bg-white hover:border-gray-900 transition-colors rounded-full">
            <select
              value={quantity}
              onChange={(e) => onQuantityChange(Number(e.target.value))}
              className="w-full appearance-none bg-transparent px-4 py-3.5 pr-10 text-[14px] text-gray-900 cursor-pointer focus:outline-none"
            >
              <option value="" disabled className="text-gray-400">
                Select quantity
              </option>
              {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
          </div>
        </div>
      )}

      {/* Buttons block */}
      {!hideActionButtons && (
        <div
          id="main-product-actions"
          className="flex flex-col lg:flex-row gap-3 mb-4"
        >
          <button
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className="w-full lg:flex-1 bg-[#222222] text-white text-[14px] font-semibold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-full h-[48px] lg:h-[50px] shrink-0"
          >
            {isOutOfStock ? "Sold Out" : "Add To Bag"}
          </button>
          <button
            onClick={onAddToWatchlist}
            className={cn(
              "hidden w-full lg:w-[130px] md:flex items-center justify-center gap-2 border text-[14px] font-semibold transition-colors bg-white rounded-full h-[48px] lg:h-[50px] shrink-0",
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

      {/* Availability Warning */}
      {/* {isOutOfStock ? null : product.quantity && product.quantity <= 3 ? (
        <p className="text-[13px] font-semibold mb-6 text-xs text-orange-600 fontmedium">
          Last {product.quantity} left — make it yours!
        </p>
      ) : (
        <div className="mb-6"></div>
      )} */}

      {/* Delivery Estimate */}
      <div className="mb-6">
        <p className="text-[13px] font-semibold text-gray-900 mb-0.5">
          Estimated delivery
        </p>
        <p className="text-[14px] text-gray-700">Same day - Next day</p>
      </div>

      {/* Extra info box */}
      <div className="p-4 bg-gray-50 font-medium text-gray-900 text-[13px] md:text-sm lg:text-[14px] leading-relaxed mb-6 flex flex-col md:flex-row md:items-center rounded-md md:rounded-lg">
        <span>
          Free campus returns within 12 hours | Verified Student Seller
        </span>
      </div>
    </div>
  );
}
