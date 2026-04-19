import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/shared/Skeleton";
import {
  ProductImageGallery,
  ProductInfo,
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
  useCurrency,
} from "@/hooks";
import { useCartStore, useAuthStore } from "@/stores";
import { useAuthPromptStore } from "@/stores/authPromptStore";
import type { Conversation } from "@/types-new";
import { cn } from "@/lib/utils";

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
  const { formatGHS } = useCurrency();

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

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6 md:py-10">
          {/* Breadcrumb skeleton */}
          <Skeleton className="h-4 w-48 mb-8" />

          <div className="grid md:grid-cols-[1fr_380px] lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] gap-8 lg:gap-16">
            {/* Gallery skeleton */}
            <div className="flex gap-3">
              <div className="hidden md:flex flex-col gap-2 w-[72px]">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="aspect-[3/4] w-full" />
                ))}
              </div>
              <Skeleton className="flex-1 aspect-[3/4] md:aspect-[4/5]" />
            </div>

            {/* Info skeleton */}
            <div className="space-y-4 pt-0 md:pt-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-6 w-24 mt-4" />
              <Skeleton className="h-14 w-full mt-4" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-sm uppercase tracking-widest text-gray-500 mb-3">
            Product not found
          </p>
          <p className="text-gray-600 text-sm mb-6">
            This item doesn't exist or has been removed by the seller.
          </p>
          <Link
            to="/products"
            className="text-sm font-medium underline text-gray-900 hover:text-gray-600"
          >
            ← Continue browsing
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ["/placeholder-product.jpg"];
  const cartItem = getItem(id!);
  const cartCount = cartItem?.quantity || 0;
  const similarProducts = relatedProducts?.filter((p) => p.id !== product.id).slice(0, 6) || [];

  const categoryLabel = product.category
    ? product.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  return (
    <div className="min-h-screen bg-white pb-28 md:pb-0">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-gray-900 transition-colors hidden md:block">Home</Link>
          <ChevronRight className="h-3 w-3 hidden md:block" />
          <Link to="/products" className="hover:text-gray-900 transition-colors hidden md:block">Products</Link>
          {categoryLabel && (
            <>
              <ChevronRight className="h-3 w-3 hidden md:block" />
              <Link
                to={`/products?category=${product.category}`}
                className="hover:text-gray-900 transition-colors capitalize"
              >
                {categoryLabel}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 truncate max-w-[240px]">{product.name}</span>
        </nav>

        {/* Main layout — gallery + info panel */}
        <div className="grid md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] gap-6 md:gap-10 lg:gap-16">
          {/* Left — Image Gallery */}
          <div>
            <ProductImageGallery
              images={images}
              productName={product.name}
              cartCount={cartCount}
              isInWishlist={isInWishlist}
              watchersCount={product.viewCount}
              onWishlistToggle={handleWishlistToggle}
              onImageClick={(index) => console.log("image", index)}
            />
          </div>

          {/* Right — Info panel (sticky on desktop) */}
          <div className="md:sticky md:top-6 md:self-start">
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

        {/* Reviews */}
        <div className="mt-12 md:mt-16 border-t border-gray-200 pt-10">
          <ProductReviews productId={id!} />
        </div>

        {/* Similar / More from Store */}
        {similarProducts.length > 0 && (
          <div className="mt-12 md:mt-16 border-t border-gray-200 pt-10">
            <SimilarProducts products={similarProducts} />
          </div>
        )}
      </div>

      {/* ── Sticky bottom bar — mobile only ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Wishlist icon */}
          <button
            onClick={handleWishlistToggle}
            aria-label="Save to wishlist"
            className={cn(
              "h-12 w-12 shrink-0 flex items-center justify-center border border-gray-300 transition-colors",
              isInWishlist ? "bg-gray-900 border-gray-900" : "hover:border-gray-900",
            )}
          >
            <Heart
              className={cn(
                "h-5 w-5",
                isInWishlist ? "fill-white text-white" : "text-gray-900",
              )}
            />
          </button>

          {/* Price */}
          <div className="flex-1 min-w-0 px-1">
            <p className="text-xs text-gray-500 truncate">{product.name}</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatGHS(Number.isFinite(product.price) ? product.price : 0)}
            </p>
          </div>

          {/* Add to bag */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 h-12 text-sm font-medium uppercase tracking-widest hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            {isOutOfStock ? "Sold Out" : "Add to Bag"}
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
