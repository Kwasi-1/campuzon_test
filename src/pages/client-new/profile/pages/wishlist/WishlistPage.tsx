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
import { ProductCard } from "@/pages/client-new/products/components/ProductCard";

export function WishlistPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { data: wishlist, isLoading } = useWishlist();
  const displayItems = wishlist || [];

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 xl:gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 xl:gap-5 gap-y-6">
            {displayItems.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} variant="grid" isWishlistView={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
