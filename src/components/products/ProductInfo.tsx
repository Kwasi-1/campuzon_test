import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  TrendingUp,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  Package,
  Truck,
  RotateCcw,
  Shield,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductInfoProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onBuyNow: () => void;
  onAddToCart: () => void;
  onAddToWatchlist: () => void;
  onContactSeller: () => void;
  isInWishlist?: boolean;
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
}: ProductInfoProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string>(
    product.condition || "new",
  );

  // Calculate estimated delivery dates once during component mount
  const [deliveryDates] = useState(() => {
    const now = Date.now();
    return {
      economyStart: new Date(now + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" },
      ),
      economyEnd: new Date(now + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" },
      ),
      standardStart: new Date(now + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" },
      ),
      standardEnd: new Date(now + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" },
      ),
      deliveryStart: new Date(now + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" },
      ),
      deliveryEnd: new Date(now + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" },
      ),
    };
  });

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const maxQuantity = Math.min(product.quantity || 10, 10);
  const quantityOptions = Array.from({ length: maxQuantity }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString(),
  }));

  // Calculate savings if comparePrice exists
  const savings =
    product.comparePrice && product.comparePrice > product.price
      ? product.comparePrice - product.price
      : null;
  const savingsPercent = savings
    ? Math.round((savings / product.comparePrice!) * 100)
    : null;

  return (
    <div className="space-y-6">
      {/* Product Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          {product.name}
        </h1>
      </div>

      {/* Seller Info Card */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/stores/${product.store?.slug}`}>
              <Avatar
                src={product.store?.logo}
                alt={product.store?.name || "Seller"}
                size="lg"
              />
            </Link>
            <div>
              <Link
                to={`/stores/${product.store?.slug}`}
                className="font-semibold text-gray-900 hover:underline block"
              >
                {product.store?.name}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-500">
                  {product.store?.location || "Campus Store"}
                </span>
              </div>
              {product.store?.totalSales && product.store.totalSales > 100 && (
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="success" className="text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    Top Rated Plus
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onContactSeller}
            className="flex items-center gap-1"
          >
            <MessageCircle className="w-4 h-4" />
            Contact
          </Button>
        </div>
      </div>

      {/* Price Section */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-gray-600">US</span>
          <span className="text-3xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
        </div>
        {savings && savingsPercent && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-500 line-through">
              ${product.comparePrice!.toFixed(2)}
            </span>
            <Badge variant="error" className="text-xs">
              Save ${savings.toFixed(2)} ({savingsPercent}% off)
            </Badge>
          </div>
        )}
      </div>

      {/* Condition */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium text-gray-700">
            Condition:
          </label>
          <button
            className="text-gray-400 hover:text-gray-600"
            aria-label="Condition information"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
        <select
          value={selectedCondition}
          onChange={(e) => setSelectedCondition(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-full hover:border-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
          aria-label="Product condition"
        >
          <option value="new">New</option>
          <option value="like-new">Like New</option>
          <option value="used-excellent">Used - Excellent</option>
          <option value="used-good">Used - Good</option>
          <option value="open-box">Open box</option>
        </select>
      </div>

      {/* Quantity */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Quantity:
        </label>
        <select
          value={quantity.toString()}
          onChange={(e) => onQuantityChange(parseInt(e.target.value))}
          className="w-32 px-4 py-2 border border-gray-300 rounded-full hover:border-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
          aria-label="Product quantity"
        >
          {quantityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {product.quantity && product.quantity < 10 && (
          <p className="text-sm text-orange-600 mt-2">
            Only {product.quantity} left in stock
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={onBuyNow}
          className="w-full h-12 rounded-[24px] text-base font-semibold"
          size="lg"
        >
          Buy It Now
        </Button>
        <Button
          onClick={onAddToCart}
          variant="outline"
          className="w-full h-12 rounded-[24px] text-base font-semibold border-2 border-primary text-primary hover:bg-primary/5"
          size="lg"
        >
          Add to cart
        </Button>
        <Button
          onClick={onAddToWatchlist}
          variant="outline"
          className={cn(
            "w-full h-12 rounded-[24px] text-base font-semibold border-2",
            isInWishlist
              ? "border-red-500 text-red-500 hover:bg-red-50"
              : "border-primary text-primary hover:bg-primary/5",
          )}
          size="lg"
        >
          <Eye className="w-5 h-5 mr-2" />
          {isInWishlist ? "Remove from Watchlist" : "Add to Watchlist"}
        </Button>
      </div>

      {/* Activity Indicators */}
      <div className="flex flex-wrap gap-4 py-4 border-y border-gray-200">
        {product.soldCount && product.soldCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-gray-700">
              <span className="font-semibold">{product.soldCount} sold</span> -
              Trending
            </span>
          </div>
        )}
        {product.viewCount && product.viewCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Eye className="w-4 h-4" />
            <span>
              <span className="font-semibold">{product.viewCount} people</span>{" "}
              are watching
            </span>
          </div>
        )}
      </div>

      {/* Shipping & Delivery Info */}
      <div className="space-y-3">
        {/* Shipping */}
        <button
          onClick={() => toggleSection("shipping")}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Shipping</div>
              <div className="text-sm text-gray-600">
                Free standard shipping
              </div>
            </div>
          </div>
          {expandedSection === "shipping" ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSection === "shipping" && (
          <div className="px-4 pb-4 text-sm text-gray-700 space-y-2">
            <p>
              <strong>Economy Shipping:</strong> FREE - Estimated delivery:{" "}
              {deliveryDates.economyStart} - {deliveryDates.economyEnd}
            </p>
            <p>
              <strong>Standard Shipping:</strong> $5.99 - Estimated delivery:{" "}
              {deliveryDates.standardStart} - {deliveryDates.standardEnd}
            </p>
          </div>
        )}

        {/* Delivery */}
        <button
          onClick={() => toggleSection("delivery")}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <Truck className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Delivery</div>
              <div className="text-sm text-gray-600">
                Estimated between {deliveryDates.deliveryStart} and{" "}
                {deliveryDates.deliveryEnd}
              </div>
            </div>
          </div>
          {expandedSection === "delivery" ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSection === "delivery" && (
          <div className="px-4 pb-4 text-sm text-gray-700">
            <p>
              Delivery times may vary based on your location. Campus delivery
              options are available for on-campus addresses.
            </p>
          </div>
        )}

        {/* Returns */}
        <button
          onClick={() => toggleSection("returns")}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Returns</div>
              <div className="text-sm text-gray-600">30-day return policy</div>
            </div>
          </div>
          {expandedSection === "returns" ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSection === "returns" && (
          <div className="px-4 pb-4 text-sm text-gray-700 space-y-2">
            <p>
              <strong>30 days return policy:</strong> You can return this item
              for any reason within 30 days of purchase for a full refund.
            </p>
            <p>
              Item must be returned in original condition. Buyer pays return
              shipping unless item is not as described.
            </p>
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <Award className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <div className="font-semibold text-sm text-gray-900">
              Top Rated Plus
            </div>
            <div className="text-xs text-gray-600">
              Fast shipping and excellent service
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
          <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <div className="font-semibold text-sm text-gray-900">
              Campuzon Money Back Guarantee
            </div>
            <div className="text-xs text-gray-600">
              Get the item you ordered or your money back
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
