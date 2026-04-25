import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, Store, Package } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";  
import { Button } from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/shared/Skeleton";  
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWishlist, useRemoveFromWishlist } from "@/hooks";
import { useCartStore, useAuthStore } from "@/stores";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types-new";

export function WishlistPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { data: wishlist, isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  // Use real data
  const displayItems = wishlist || [];

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };

  const handleRemove = (productId: string) => {
    removeFromWishlist.mutate(productId);
  };

  if (!isAuthenticated) {
    navigate("/login?redirect=/wishlist");
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-0">
        {/* <Breadcrumb
          items={[
            { label: "Profile", href: "/profile" },
            { label: "Watchlist" },
          ]}
          className="mb-6"
        /> */}

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Watchlist</h1>
          <p className="text-sm text-gray-500 mt-1">
            {displayItems.length} item{displayItems.length !== 1 ? "s" : ""}{" "}
            saved
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="bg-white rounded-sm md:rounded-lg md:border border-gray-100 py-16">
            <EmptyState
              icon={<Heart className="h-16 w-16" />}
              title="Your watchlist is empty"
              description="Save items you like by clicking the heart icon on products"
              action={
                <Link to="/products">
                  <Button
                  className="mt-2 rounded-full px-8 h-12"
                >
                  Start Shopping
                </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {displayItems.map((product, index) => {
              const discount =
                product.comparePrice && product.comparePrice > product.price
                  ? Math.round(
                      ((product.comparePrice - product.price) /
                        product.comparePrice) *
                        100,
                    )
                  : null;

              return (
                <div
                  key={product.id}
                  className={`flex gap-4 p-5 hover:bg-gray-50/50 transition-colors ${
                    index !== displayItems.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  }`}
                >
                  {/* Image */}
                  <Link
                    to={`/products/${product.id}`}
                    className="shrink-0 relative"
                  >
                    <img
                      src={product.images?.[0] || "/placeholder-product.jpg"}
                      alt={product.name}
                      className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] object-cover rounded-lg border border-gray-200"
                    />
                    {product.quantity === 0 && (
                      <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                        <Badge variant="outline" className="text-sm">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link
                        to={`/products/${product.id}`}
                        className="text-sm sm:text-base font-medium text-gray-900 hover:text-primary hover:underline line-clamp-2"
                      >
                        {product.name}
                      </Link>

                      {product.store && (
                        <Link
                          to={`/stores/${product.store.slug}`}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary mt-1"
                        >
                          <Store className="h-3 w-3" />
                          {product.store.name}
                        </Link>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-normal text-gray-500 border-gray-200 capitalize"
                        >
                          {product.category}
                        </Badge>
                        {product.condition && product.condition !== "new" && (
                          <Badge
                            variant="secondary"
                            className="text-[11px] font-normal bg-gray-100 text-gray-600 capitalize"
                          >
                            {product.condition.replace("_", " ")}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice &&
                          product.comparePrice > product.price && (
                            <>
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(product.comparePrice)}
                              </span>
                              <span className="text-sm font-semibold text-green-700">
                                {discount}% off
                              </span>
                            </>
                          )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1.5">
                        <Package className="h-3 w-3" />
                        {product.quantity > 0 ? (
                          <span>{product.quantity} in stock</span>
                        ) : (
                          <span className="text-red-600 font-medium">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        className="rounded-full px-5 text-sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.quantity === 0}
                      >
                        <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                        Add to cart
                      </Button>
                      <button
                        onClick={() => handleRemove(product.id)}
                        disabled={removeFromWishlist.isPending}
                        className="text-sm text-primary hover:underline disabled:opacity-50 ml-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
