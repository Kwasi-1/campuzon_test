import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { useCartStore, useAuthStore } from "@/stores";
import { formatPrice } from "@/lib/utils";

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    items,
    storeID,
    storeName,
    storeSlug,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  const storeIdentifier = storeSlug || storeID || "";

  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
  const serviceFee = subtotal * 0.05; // 5% service fee
  const total = subtotal + serviceFee;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/checkout");
    } else {
      navigate("/checkout");
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#f7f7f7] min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <EmptyState
            icon={<ShoppingBag className="h-16 w-16" />}
            title="Your cart is empty"
            description="Looks like you haven't added any products yet. Start shopping to fill your cart!"
            action={
              <Link to="/products">
                <Button className="rounded-full px-8">Start Shopping</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Shopping Cart ({items.length} item{items.length > 1 ? "s" : ""})
          </h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Cart Items */}
          <div className="space-y-0">
            {/* Seller Group Header */}
            <div className="bg-white rounded-t-lg border border-gray-200 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  Seller:{" "}
                  <Link
                    to={
                      storeIdentifier ? `/stores/${storeIdentifier}` : "/stores"
                    }
                    className="text-primary hover:underline"
                  >
                    {storeName}
                  </Link>
                </span>
              </div>
              <button
                onClick={clearCart}
                className="text-sm text-primary hover:underline font-medium"
              >
                Remove all
              </button>
            </div>

            {/* Individual Items */}
            {items.map((item, index) => (
              <div
                key={item.product.id}
                className={`bg-white border-x border-gray-200 px-5 py-4 ${
                  index === items.length - 1
                    ? "border-b rounded-b-lg"
                    : "border-b border-gray-100"
                }`}
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <Link to={`/product/${item.product.id}`} className="shrink-0">
                    <img
                      src={
                        item.product.images?.[0] || "/placeholder-product.jpg"
                      }
                      alt={item.product.name}
                      className="w-[120px] h-[120px] object-cover rounded-lg border border-gray-200"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link
                        to={`/product/${item.product.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary hover:underline transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge
                          variant="outline"
                          className="text-xs font-normal text-gray-500 border-gray-200"
                        >
                          {item.product.category.replace("_", " ")}
                        </Badge>
                        {item.product.quantity < 5 &&
                          item.product.quantity > 0 && (
                            <span className="text-xs text-red-600 font-medium">
                              Only {item.product.quantity} left
                            </span>
                          )}
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">Qty</span>
                        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.product.quantity}
                            aria-label="Increase quantity"
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </button>
                      </div>

                      {/* Price */}
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary - Sticky Sidebar */}
          <div className="lg:self-start">
            <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({items.length})</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service fee (5%)</span>
                  <span className="text-gray-900">
                    {formatPrice(serviceFee)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900">
                    Total
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Button
                className="w-full mt-5 rounded-full h-12 text-base font-semibold"
                size="lg"
                onClick={handleCheckout}
              >
                Go to checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Trust Info */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-green-600 shrink-0" />
                  <span>Protected by Campuzon Buyer Protection</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 pl-6">
                  Your payment is held securely until you confirm delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
