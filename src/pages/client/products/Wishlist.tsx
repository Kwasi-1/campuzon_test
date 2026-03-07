import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import SEO from "@/components/SEO";
// import AppLoader from '@/components/AppLoader';
import { Skeleton } from "@/components/ui/skeleton";

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch wishlist (context already loads from API for authenticated users)
  useEffect(() => {
    const fetchWishlist = async () => {
      setIsLoading(true);
      // Small delay to allow context to finish initial load
      await new Promise((resolve) => setTimeout(resolve, 300));
      setIsLoading(false);
    };

    fetchWishlist();
  }, []);

  const handleAddToCart = (item: import("@/types").Product) => {
    if (item.inStock) {
      addToCart(item);
      toast.success(`Added ${item.name} to cart!`, {
        description: `Total: GH₵ ${item.price.toFixed(2)}`,
      });
    }
  };

  const handleRemoveFromWishlist = async (itemId: number | string) => {
    try {
      await removeFromWishlist(itemId);
      toast.success("Item removed from wishlist");
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to remove from wishlist";
      toast.error(message);
    }
  };

  const handleViewProduct = (productId: number | string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <>
      <SEO
        title="My Shopping List"
        description="Your favorite products saved for later on Tobra"
        keywords="wishlist, favorite products, saved items, Tobra wishlist"
      />

      <div className="min-h-[calc(100vh-110px)]">
        {/* <Hero 
        title="My Wishlist"
        subtitle="Your favorite items saved for later"
      /> */}

        <div className="max-w-6xl mx-auto section-padding py-8 md:py-12 xl:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                My Shopping List
              </h1>
              <p className="text-gray-600">
                Your favorite items saved for later
              </p>
            </div>
            <Badge variant="secondary" className="text-sm text-primary">
              {wishlistItems.length}{" "}
              <span className="hidden md:block ml-1">items</span>
            </Badge>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => handleViewProduct(item.id)}
                    />
                    {item.discount && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        {item.discount}% OFF
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => handleRemoveFromWishlist(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3
                      className="font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-primary"
                      onClick={() => handleViewProduct(item.id)}
                    >
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{item.store}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-primary">
                          GH₵ {item.price}
                        </span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            GH₵ {item.originalPrice}
                          </span>
                        )}
                      </div>
                      {!item.inStock && (
                        <Badge
                          variant="outline"
                          className="text-red-500 border-red-200"
                        >
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      disabled={!item.inStock}
                      variant={item.inStock ? "default" : "outline"}
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {item.inStock ? "Add to Cart" : "Notify When Available"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-gray-600 mb-6">
                Save items you love for easy access later
              </p>
              <Button onClick={() => navigate("/products")}>
                Start Shopping
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
