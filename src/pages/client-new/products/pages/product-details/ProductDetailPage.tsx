import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ChevronRight, Shield, MapPin, Users } from "lucide-react";
import { Skeleton } from "@/components/shared/Skeleton";
import {
  ProductImageGallery,
  ProductInfo,
  DetailedAccordionRow,
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
  const { data: relatedProducts, isLoading: isRelatedLoading } = useStoreProducts(product?.storeID || "");
  const { data: isInWishlist } = useIsInWishlist(id!);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const startConversation = useStartConversation();

  const [quantity, setQuantity] = useState(1);
  const [showStickyCart, setShowStickyCart] = useState(false);
  const isOutOfStock = product?.quantity === 0;

  useEffect(() => {
    // Only initialize observer if we have loaded the product
    if (!product || isLoading) return;

    const target = document.getElementById("main-product-actions");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky cart only if the main button is scrolled OUT OF VIEW upwards
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setShowStickyCart(true);
        } else {
          setShowStickyCart(false);
        }
      },
      { threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [product, isLoading]);

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
      <div className="min-h-screen bg-white pb-24 md:pb-14">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 lg:pb-0">
          {/* Breadcrumb skeleton mobile */}
          <div className="md:hidden mb-6 flex gap-2">
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_0.65fr] gap-8 md:gap-9 lg:gap-12 xl:gap-[60px] items-start md:mb-16">
            
            {/* Gallery Skeleton */}
            <div className="flex flex-col min-w-0 order-1">
              <div className="flex flex-col-reverse xl:flex-row gap-3 md:gap-4 lg:gap-5">
                {/* Thumbnails */}
                <div className="hidden md:flex flex-row xl:flex-col gap-2 xl:w-[72px] shrink-0">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="shrink-0 w-[64px] xl:w-full aspect-[7/8] xl:aspect-[4/5] rounded-[6px]" />
                  ))}
                </div>
                {/* Main image */}
                <Skeleton className="flex-1 w-full aspect-square md:aspect-[4/5] lg:max-h-[560px] rounded md:rounded-md lg:rounded-lg" />
              </div>
              
              {/* Desktop breadcrumb */}
              <div className="hidden md:flex gap-2 mt-6 lg:mt-8">
                 <Skeleton className="h-4 w-16 rounded" />
                 <Skeleton className="h-4 w-4 rounded" />
                 <Skeleton className="h-4 w-20 rounded" />
                 <Skeleton className="h-4 w-4 rounded" />
                 <Skeleton className="h-4 w-32 rounded" />
              </div>
            </div>

            {/* Info Skeleton */}
            <div className="md:sticky md:top-28 order-2 pt-4 md:pt-0">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-6" />
              <Skeleton className="h-6 w-32 mb-8" />

              <div className="space-y-3 mb-6">
                <Skeleton className="h-12 w-full rounded-full" />
              </div>

              <div className="flex flex-col lg:flex-row gap-3 mb-4">
                <Skeleton className="w-full lg:flex-1 h-[48px] lg:h-[50px] rounded-full" />
                <Skeleton className="hidden md:block w-full lg:w-[130px] h-[48px] lg:h-[50px] rounded-full" />
              </div>

              <Skeleton className="h-16 w-full mt-6 rounded-md md:rounded-lg" />
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
    <div className="min-h-screen bg-white pb-24 md:pb-14 text-gray-900 font-sans">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 lg:pb-0">
        <nav className="md:hidden flex items-center gap-1.5 text-xs md:text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
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
        
        {/* Main Product Section layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_0.65fr] gap-8 md:gap9 lg:gap-12 xl:gap-[60px] items-start md:mb-16 ">
          
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
        <div className="max-w-6xl ">
          <DetailedAccordionRow label="THE DETAILS" defaultOpen={true} isborder={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[14px] md:text-[15px] leading-relaxed">
              <div>
                <p className="whitespace-pre-wrap">{product.description || "No description provided for this product."}</p>
                {product.condition && product.condition !== "new" && (
                  <p className="mt-4 text-gray-500 font-medium tracking-wide uppercase text-[11px]">
                    Condition: {product.condition.replace(/-/g, " ")}
                  </p>
                )}
              </div>
              <div className="md:pl-8">
                <span className="font-semibold text-gray-900 block mb-2">Highlights</span>
                <ul className="list-disc pl-4 space-y-1 text-gray-700">
                  <li>Premium quality guarantee</li>
                  <li>Available directly from {product.store?.name || "campus seller"}</li>
                  {product.tags?.map((t, idx) => (
                    <li key={idx} className="capitalize">{t.replace(/-/g, " ")}</li>
                  ))}
                </ul>
              </div>
            </div>
          </DetailedAccordionRow>

          <DetailedAccordionRow label="DELIVERY, RETURNS & SELLER">
            <div className="space-y-6 md:space-y-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="flex items-center gap-2 font-semibold text-[13px] mb-2">
                    <Users className="h-4 w-4" /> Peer Delivery
                  </h4>
                  <p className="text-[13px] text-gray-600">
                    A fellow student will deliver this item to you — typically same-day or next-day.
                  </p>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-semibold text-[13px] mb-2">
                    <MapPin className="h-4 w-4" /> Campus Pickup
                  </h4>
                  <p className="text-[13px] text-gray-600">
                    Meet the seller at a convenient, well-lit campus location. Agree after purchase.
                  </p>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-semibold text-[13px] mb-2">
                    <Shield className="h-4 w-4" /> Buyer Protection
                  </h4>
                  <p className="text-[13px] text-gray-600">
                    Payment held securely in escrow. Released hours after you confirm delivery.
                  </p>
                </div>
              </div>

              {/* Seller details compact view */}
              <div className="mt-8 pt-8 border-t border-[#f2f2f2]">
                <div className="flex items-center justify-between">
                  <Link to={`/stores/${product.store?.slug}`} className="flex items-center gap-4 group">
                    <Avatar className="h-12 w-12 border border-gray-100">
                      <AvatarImage src={product.store?.logo} alt={product.store?.name} />
                      <AvatarFallback className="text-[13px] font-semibold bg-gray-50">
                        {storeInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:underline text-[14px]">
                        {product.store?.name || "Campus Seller"}
                      </h4>
                      <p className="text-gray-500 text-[12px] mt-0.5 tracking-wide flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" /> {product.store?.location || "Campus Seller"}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={handleContactSeller}
                    className="border border-[#dddddd] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-gray-900 hover:border-gray-900 transition-colors"
                  >
                    Contact Seller
                  </button>
                </div>
              </div>
            </div>
          </DetailedAccordionRow>
        </div>

        {/* Similar Products */}
        {(similarProducts.length > 0 || isRelatedLoading) && (
          <div className="mt-12 lg:mt-16">
            <SimilarProducts
              products={similarProducts}
              title="More from this seller"
              storeName={product.store?.name}
              storeSlug={product.store?.slug}
              isLoading={isRelatedLoading}
            />
          </div>
        )}

        {/* Reviews */}
        <div className="mt-16 border-t border-[#dddddd] pt-10">
          <ProductReviews productId={id!} />
        </div>
      </div>

      {/* ── Sticky bottom bar — mobile only ─────────────────────────────────── */}
      <AnimatePresence>
        {showStickyCart && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-transparent px-4 py-3 pb-8 pointer-events-none"
          >
            <div className="flex items-center gap-2 h-12 pointer-events-auto shadow-[0_8px_30px_rgb(0,0,0,0.18)] rounded-full">
              {/* Add to bag */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 bg-[#222222] text-white h-12 text-[14px] font-semibold hover:bg-black disabled:opacity-50 transition-colors rounded-full"
              >
                {isOutOfStock ? "Sold Out" : "Add To Bag"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
