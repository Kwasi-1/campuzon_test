import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, Store, Package, ChevronLeft, Pencil, Star } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/shared/Skeleton";
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
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto p-0 max-w-4xl">
        {/* Page Header - Mobile style matched to screenshot */}
        <div className="flex items-center justify-between px-4 py-4 md:py-6 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors md:hidden"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Wishlist</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-sm text-gray-500 mr-2">
              {displayItems.length} item{displayItems.length !== 1 ? "s" : ""} saved
            </span>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Pencil className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="px-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 bg-white rounded-3xl border border-gray-100">
                <div className="w-32 h-32 bg-gray-100 animate-pulse rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-1/2" />
                  <div className="h-8 bg-gray-100 animate-pulse rounded w-1/3 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="px-4 mt-10">
            <div className="bg-white rounded-3xl md:border border-gray-100 py-16 shadow-sm">
              <EmptyState
                icon={<Heart className="h-16 w-16 text-gray-200" />}
                title="Your wishlist is empty"
                description="Save items you like by clicking the heart icon on products"
                action={
                  <Link to="/products">
                    <Button
                      className="mt-4 rounded-full px-8 h-12 bg-primary hover:bg-primary/90"
                    >
                      Start Shopping
                    </Button>
                  </Link>
                }
              />
            </div>
          </div>
        ) : (
          <div className="px-4 space-y-4 md:space-y-6">
            {displayItems.map((product) => {
              const isOutOfStock = product.quantity === 0;
              const hasDiscount = product.comparePrice && product.comparePrice > product.price;
              
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 sm:gap-6">
                    {/* Image Container */}
                    <div className="shrink-0 relative group">
                      <Link to={`/products/${product.id}`} className="block">
                        <div className="w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 relative">
                          <img
                            src={product.images?.[0] || "/placeholder-product.jpg"}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'opacity-60 grayscale-[0.5]' : ''}`}
                          />
                          
                          {/* Out of Stock Overlay */}
                          {isOutOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                              <span className="text-white text-sm sm:text-base font-bold drop-shadow-md">
                                Out of stock
                              </span>
                            </div>
                          )}

                          {/* Rating Badge */}
                          {(product.rating || product.reviewCount > 0) && (
                            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-black/5">
                              <span className="text-[10px] font-bold text-gray-900">{product.rating || "0.0"}</span>
                              <Star className="h-2.5 w-2.5 fill-primary text-primary" />
                              <span className="text-[10px] text-gray-400">({product.reviewCount || 0})</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <Link
                          to={`/products/${product.id}`}
                          className="text-sm sm:text-base font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2 leading-tight"
                        >
                          {product.name}
                        </Link>
                        
                        {/* Features / Tags - Simulation of screenshot bullets */}
                        <div className="mt-2 space-y-1">
                          {product.store && (
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                              <Store className="h-3 w-3 text-gray-400" />
                              <span className="truncate">{product.store.name}</span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-1">
                             <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal border-gray-100 text-gray-500">
                              {product.category}
                            </Badge>
                            {product.condition && (
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal bg-gray-50 text-gray-400 border-none">
                                {product.condition.replace("_", " ")}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Price Area */}
                        <div className="mt-3 sm:mt-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(product.comparePrice || 0)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-4">
                        {!isOutOfStock ? (
                          <>
                            <Button
                              onClick={() => handleAddToCart(product)}
                              className="flex-1 rounded-full bg-[#82E600] hover:bg-[#72C800] text-white font-bold h-10 border-none shadow-sm"
                            >
                              Add to Cart
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemove(product.id)}
                              className="rounded-full h-10 w-10 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => handleRemove(product.id)}
                            className="w-full rounded-full h-10 border-gray-200 text-[#82E600] font-bold hover:bg-gray-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        )}
                      </div>
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

