import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  TrendingUp,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  MapPin,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks";
import type { Product } from "@/types-new";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomSelectField } from "@/components/shared/text-field";

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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string>(
    product.condition || "new",
  );
  const currentPrice = Number.isFinite(product.price) ? product.price : 0;
  const comparePrice = Number.isFinite(product.comparePrice)
    ? product.comparePrice
    : null;
  const storeInitial = product.store?.name?.charAt(0) || "S";

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
    comparePrice && comparePrice > currentPrice
      ? comparePrice - currentPrice
      : null;
  const savingsPercent = savings
    ? Math.round((savings / comparePrice!) * 100)
    : null;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Product Title */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900 leading-tight tracking-normal">
          {product.name}
        </h1>
      </div>

      {/* Seller Info Card */}
      <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/stores/${product.store?.slug}`}>
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={product.store?.logo}
                  alt={product.store?.name}
                />
                <AvatarFallback>{storeInitial}</AvatarFallback>
              </Avatar>
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
              {/* {product.store?.totalSales && product.store.totalSales > 100 && (
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="success" className="text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    Top Rated Plus
                  </Badge>
                </div>
              )} */}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onContactSeller}
            className="flex items-center gap-1"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Price Section */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-900">
            {formatGHS(currentPrice)}
          </span>
        </div>
        {savings && savingsPercent && (
          <div className="mt-2 sm:mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-500 line-through">
              {formatGHS(comparePrice!)}
            </span>
            <Badge variant="destructive" className="text-xs">
              Save {formatGHS(savings)} ({savingsPercent}% off)
            </Badge>
          </div>
        )}
      </div>

      {/* Condition */}
      <div className="py-1">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700">
            Condition:
          </label>
          <button
            className="text-gray-400 hover:text-gray-600"
            aria-label="Condition information"
          >
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
        <CustomSelectField
          value={selectedCondition}
          inputProps={{
            onChange: (e) => setSelectedCondition(e.target.value),
          }}
          className="w-full"
          options={[
            { label: "New", value: "new" },
            { label: "Like New", value: "like-new" },
            { label: "Used - Excellent", value: "used-excellent" },
            { label: "Used - Good", value: "used-good" },
            { label: "Open box", value: "open-box" },
          ]}
        />
      </div>

      {/* Quantity */}
      <div className="py-1">
        <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-2">
          Quantity:
        </label>
        <CustomSelectField
          value={quantity.toString()}
          inputProps={{
            onChange: (e) => onQuantityChange(parseInt(e.target.value)),
          }}
          className="w-28 sm:w-32"
          options={quantityOptions}
        />
        {product.quantity && product.quantity < 10 && (
          <p className="text-xs sm:text-sm text-orange-600 mt-2">
            Only {product.quantity} left in stock
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {!hideActionButtons && (
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
            className="w-full h-12 rounded-[24px] text-base font-semibold  text-primary hover:bg-primary/5"
            size="lg"
          >
            Add to cart
          </Button>
          <Button
            onClick={onAddToWatchlist}
            variant="outline"
            className={cn(
              "w-full h-12 rounded-[24px] text-base font-semibold",
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
      )}

      {/* Activity Indicators */}
      <div className="flex flex-wrap gap-3 sm:gap-4 py-3 sm:py-4 border-y border-gray-200">
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

      {/* Delivery & Pickup Info */}
      <div className="space-y-3">
        {/* Peer Delivery */}
        <button
          onClick={() => toggleSection("peerDelivery")}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Peer Delivery</div>
              <div className="text-sm text-gray-600">
                Delivered by a fellow student on campus
              </div>
            </div>
          </div>
          {expandedSection === "peerDelivery" ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSection === "peerDelivery" && (
          <div className="px-4 pb-4 text-sm text-gray-700 space-y-2">
            <p>
              A student on campus will deliver this item directly to you.
              Delivery is typically completed within the same day or the next
              day, depending on availability.
            </p>
            <p>
              Coordinate a handoff time and location with the seller after
              purchase.
            </p>
          </div>
        )}

        {/* Campus Pickup */}
        <button
          onClick={() => toggleSection("pickup")}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Campus Pickup</div>
              <div className="text-sm text-gray-600">
                Pick up from the seller on campus
              </div>
            </div>
          </div>
          {expandedSection === "pickup" ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSection === "pickup" && (
          <div className="px-4 pb-4 text-sm text-gray-700 space-y-2">
            <p>
              Arrange to meet the seller at a convenient campus location to pick
              up your item. You'll agree on a time and spot after purchase.
            </p>
            <p>
              We recommend meeting in a public, well-lit area on campus for
              safety.
            </p>
          </div>
        )}

        {/* Buyer Protection */}
        <button
          onClick={() => toggleSection("protection")}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Buyer Protection</div>
              <div className="text-sm text-gray-600">
                12-Hour Escrow Protection
              </div>
            </div>
          </div>
          {expandedSection === "protection" ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSection === "protection" && (
          <div className="px-4 pb-4 text-sm text-gray-700 space-y-2">
            <p>
              <strong>Campuzon Escrow:</strong> Your payment is held securely in
              escrow and only released to the seller 12 hours after you confirm
              delivery.
            </p>
            <p>
              This gives you plenty of time to inspect your item and ensure it
              matches the description before the seller receives payment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
