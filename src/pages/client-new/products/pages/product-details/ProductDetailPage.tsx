import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ChevronRight, Shield, MapPin, Users } from "lucide-react";
import { Skeleton } from "@/components/shared/Skeleton";
import {
  ProductImageGallery,
  ProductInfo,
  // DetailedAccordionRow,
  SimilarProducts,
  ProductReviews,
} from "../../components";
import { ProductChat } from "./components/ProductChat";
import {
  useProduct,
  useStoreProducts,
  useAddToWishlist,
  useRemoveFromWishlist,
  useIsInWishlist,
  useStartConversation,
} from "@/hooks";
import { useCartStore, useAuthStore } from "@/stores";
import { useAuthPromptStore } from "@/stores/authPromptStore";
import type { Conversation } from "@/types-new";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { openAuthPrompt } = useAuthPromptStore();
  const { addItem, getItem } = useCartStore();

  const { data: product, isLoading, error } = useProduct(id!);
  const { data: relatedProducts } = useStoreProducts(product?.storeID || "");
  const { data: isInWishlist } = useIsInWishlist(id!);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const startConversation = useStartConversation();

  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product?.quantity === 0;

  const getCurrentPath = () =>
    `${window.location.pathname}${window.location.search}${window.location.hash}`;

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      openAuthPrompt(getCurrentPath(), "Sign in to save items to your wishlist.");
      return;
    }
    if (isInWishlist) {
      removeFromWishlist.mutate(id!);
    } else {
      addToWishlist.mutate(id!);
    }
  };

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    addItem(product, quantity);
    setQuantity(1);
  };

  const handleBuyNow = () => {
    if (!product || isOutOfStock) return;
    if (!isAuthenticated) {
      openAuthPrompt(getCurrentPath(), "Sign in to continue with checkout.");
      return;
    }
    addItem(product, quantity);
    navigate("/cart");
  };

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      openAuthPrompt(getCurrentPath(), "Sign in to message this seller.");
      return;
    }
    if (!product?.id) return;
    try {
      const conversation = (await startConversation.mutateAsync({
        productID: product.id,
      })) as Conversation;
      navigate(`/messages/${conversation.id}`);
    } catch (err) {
      console.error("Failed to start conversation", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Breadcrumb skeleton */}
          <Skeleton className="h-4 w-48 mb-8" />
          <div className="grid md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_560px] gap-8 lg:gap-[60px]">
            <div className="flex gap-4">
              <div className="hidden md:flex flex-col gap-2.5 w-[75px]">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="aspect-[4/5] w-full" />
                ))}
              </div>
              <Skeleton className="flex-1 aspect-[4/5]" />
            </div>
            <div className="space-y-4 pt-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-32 mt-6" />
              <Skeleton className="h-12 w-full mt-8" />
              <div className="flex gap-2">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-[120px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[500px] bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-900 mb-3">
            Product not found
          </p>
          <p className="text-gray-600 text-sm mb-6">
            This item doesn't exist or has been removed by the seller.
          </p>
          <Link
            to="/products"
            className="text-[13px] font-semibold underline text-gray-900 hover:text-gray-600 uppercase tracking-widest"
          >
            Continue browsing
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ["/placeholder-product.jpg"];
  const cartItem = getItem(id!);
  const cartCount = cartItem?.quantity || 0;
  const similarProducts = relatedProducts?.filter((p) => p.id !== product.id).slice(0, 8) || [];
  const categoryLabel = product.category
    ? product.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Category";

  const storeInitial = product.store?.name?.charAt(0)?.toUpperCase() || "S";

  return (
    <div className="min-h-screen bg-white pb-32 md:pb-16 text-gray-900 font-sans">
      <div className="container mx-auto px-4 md:px-8 py-6 md:py-10">
        
        {/* Main Product Section layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_560px] gap-8 md:gap-11 lg:gap-12 xl:gap-[60px] items-start mb-16 lg:mb-24">
          
          {/* Left panel: Gallery & Breadcrumbs */}
          <div className="flex flex-col min-w-0 order-1">
            <ProductImageGallery
              images={images}
              productName={product.name}
              cartCount={cartCount}
              isInWishlist={isInWishlist}
              watchersCount={product.viewCount}
              onWishlistToggle={handleWishlistToggle}
              onImageClick={(index) => console.log("Zoom image", index)}
            />

            {/* Breadcrumb — Desktop (Right below the image) */}
            <nav className="hidden md:flex flex-wrap items-center gap-[6px] text-[14px] font-medium text-gray-500 mt-6 lg:mt-8 tracking-wide">
              <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/products" className="hover:text-gray-900 transition-colors">Products</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to={`/products?category=${product.category}`} className="hover:text-gray-900 transition-colors">
                {categoryLabel}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
            </nav>
          </div>

          {/* Right panel: Details (Sticky) */}
          <div className="md:sticky md:top-28 order-2">
            
            {/* Breadcrumb — Mobile (Above title) */}
            <nav className="md:hidden flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 mb-6 tracking-wide">
              <Link to="/">Home</Link> <ChevronRight className="h-3 w-3" />
              <span className="truncate">{categoryLabel}</span> <ChevronRight className="h-3 w-3" />
              <span className="text-gray-900 truncate flex-1">{product.name}</span>
            </nav>

            <ProductInfo
              product={product}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onBuyNow={handleBuyNow}
              onAddToCart={handleAddToCart}
              onAddToWatchlist={handleWishlistToggle}
              onContactSeller={handleContactSeller}
              isInWishlist={isInWishlist}
            />
          </div>
        </div>

        {/* Detailed Accordions Section (Below main visual content) */}


        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-12 lg:mt-16 lg:pt-10">
            <SimilarProducts
              products={similarProducts}
              title="More from this seller"
              storeName={product.store?.name}
              storeSlug={product.store?.slug}
            />
          </div>
        )}

        {/* Reviews */}
        <div className="mt-16 border-t border-[#dddddd] pt-10">
          <ProductReviews productId={id!} />
        </div>
      </div>

      {/* ── Sticky bottom bar — mobile only ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 px-4 py-3 pb-8">
        <div className="flex items-center gap-2 h-12">
          {/* Wishlist icon */}
          <button
            onClick={handleWishlistToggle}
            aria-label="Save to wishlist"
            className={cn(
              "h-12 w-12 shrink-0 flex items-center justify-center border transition-colors",
              isInWishlist ? "bg-gray-900 border-gray-900" : "border-[#dddddd] bg-white hover:border-gray-900",
            )}
          >
            <Heart
              className={cn(
                "h-5 w-5",
                isInWishlist ? "fill-white text-white" : "text-gray-900",
              )}
            />
          </button>

          {/* Add to bag */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 bg-[#222222] text-white h-12 text-[14px] font-semibold hover:bg-black disabled:opacity-50 transition-colors"
          >
            {isOutOfStock ? "Sold Out" : "Add To Bag"}
          </button>
        </div>
      </div>

      {/* Chat widget */}
      <ProductChat
        product={product}
        onLoginRequired={() =>
          openAuthPrompt(getCurrentPath(), "Sign in to message this seller.")
        }
      />
    </div>
  );
}
