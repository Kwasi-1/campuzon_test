import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  MessageCircle,
  Star,
  Share2,
  Shield,
  Truck,
  RefreshCw,
  Info,
  ZoomIn,
  Eye,
  ChevronDown,
} from "lucide-react";
import {
  Button,
  Badge,
  Avatar,
  Skeleton,
  Alert,
  Breadcrumb,
} from "@/components/ui";
import { ProductGrid } from "@/components/products";
import { ProductChat } from "@/components/chat";
import {
  useProduct,
  useStoreProducts,
  useAddToWishlist,
  useRemoveFromWishlist,
  useIsInWishlist,
  useStartConversation,
} from "@/hooks";
import { useCartStore, useAuthStore } from "@/stores";
import { formatPrice, formatRelativeTime, cn } from "@/lib/utils";
import type { Conversation } from "@/types";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { addItem, getItem } = useCartStore();

  const { data: product, isLoading, error } = useProduct(id!);

  // Only fetch related products when we have a product with a storeID
  const { data: relatedProducts, isLoading: isRelatedLoading } =
    useStoreProducts(product?.storeID || "");

  const { data: isInWishlist } = useIsInWishlist(id!);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const startConversation = useStartConversation();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const cartItem = getItem(id!);
  const isInCart = !!cartItem;
  const isOutOfStock = product?.quantity === 0;
  const isOwnProduct = user?.id === product?.storeID; // Compare with storeID since store owner is linked to store

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      navigate("/login");
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
      navigate("/login");
      return;
    }
    addItem(product, quantity);
    navigate("/cart");
  };

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!product?.storeID) return;

    try {
      const conversation = (await startConversation.mutateAsync(
        product.storeID
      )) as Conversation;
      navigate(`/messages/${conversation.id}`);
    } catch (error) {
      console.error("Failed to start conversation", error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product?.name,
        url: window.location.href,
      });
    } catch {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" title="Product Not Found">
          The product you're looking for doesn't exist or has been removed.
        </Alert>
        <Link to="/products">
          <Button className="mt-4">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : ["/placeholder-product.jpg"];

  // Calculate discount percentage
  const discountPercentage =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100
        )
      : null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Products", href: "/products" },
            {
              label: product.category,
              href: `/products?category=${product.category}`,
            },
            { label: product.name },
          ]}
          className="mb-6"
        />

        <div className="bg-white rounded-lg shadow-sm">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-0">
            {/* Left Column - Image Gallery */}
            <div className="p-6 lg:p-8 border-r border-gray-200">
              <div className="flex gap-4">
                {/* Vertical Thumbnails */}
                {images.length > 1 && (
                  <div className="flex flex-col gap-2 w-16 sm:w-20">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={cn(
                          "relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:border-gray-400",
                          selectedImageIndex === index
                            ? "border-blue-600"
                            : "border-gray-200"
                        )}
                      >
                        <img
                          src={image}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Image */}
                <div className="flex-1">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={selectedImageIndex}
                        src={images[selectedImageIndex]}
                        alt={product.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="h-full w-full object-cover"
                      />
                    </AnimatePresence>

                    {/* Badge - IN CARTS */}
                    {cartItem && (
                      <div className="absolute top-4 left-4">
                        <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                          In {cartItem.quantity} Cart
                          {cartItem.quantity > 1 ? "s" : ""}
                        </div>
                      </div>
                    )}

                    {/* Zoom/Expand Icon */}
                    <button className="absolute top-4 right-4 w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                      <ZoomIn className="w-5 h-5 text-gray-700" />
                    </button>

                    {/* Wishlist Heart */}
                    <button
                      onClick={handleWishlistToggle}
                      className={cn(
                        "absolute top-4 right-16 w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors",
                        isInWishlist ? "text-red-500" : "text-gray-700"
                      )}
                    >
                      <Heart
                        className={cn(
                          "w-5 h-5",
                          isInWishlist && "fill-current"
                        )}
                      />
                    </button>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setSelectedImageIndex((prev) =>
                              prev === 0 ? images.length - 1 : prev - 1
                            )
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm flex items-center justify-center"
                        >
                          <ChevronLeft className="h-5 w-5 text-gray-700" />
                        </button>
                        <button
                          onClick={() =>
                            setSelectedImageIndex((prev) =>
                              prev === images.length - 1 ? 0 : prev + 1
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm flex items-center justify-center"
                        >
                          <ChevronRight className="h-5 w-5 text-gray-700" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Share Button Below Image */}
                  <button
                    onClick={handleShare}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 border border-gray-300 rounded-full hover:border-gray-400 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Product Information */}
            <div className="p-6 lg:p-8">
              {/* Product Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Seller Info */}
              {product.store && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <Link
                    to={`/stores/${product.store.slug}`}
                    className="flex items-center gap-3 group mb-2"
                  >
                    <Avatar
                      src={product.store.logo}
                      alt={product.store.name}
                      fallback={product.store.name}
                      size="sm"
                      className="ring-2 ring-gray-200"
                    />
                    <div>
                      <p className="text-[15px] font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {product.store.name}
                      </p>
                      {product.rating && (
                        <p className="text-[13px] text-gray-600">
                          {product.rating.toFixed(1)}% positive
                        </p>
                      )}
                    </div>
                  </Link>
                  <div className="flex gap-4 text-[13px] text-blue-700">
                    <Link
                      to={`/stores/${product.store.slug}`}
                      className="hover:underline"
                    >
                      Seller's other items
                    </Link>
                    <button
                      onClick={handleContactSeller}
                      className="hover:underline"
                    >
                      Contact seller
                    </button>
                  </div>
                </div>
              )}

              {/* Price Section */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-[14px] text-gray-600">US</span>
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                </div>

                {product.comparePrice &&
                  product.comparePrice > product.price && (
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] text-gray-600">
                        List price US
                      </span>
                      <span className="text-[15px] text-gray-600 line-through">
                        {formatPrice(product.comparePrice)}
                      </span>
                      <span className="text-[15px] text-gray-600">
                        ({discountPercentage}% off)
                      </span>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  )}
              </div>

              {/* Condition */}
              <div className="mb-6 flex items-start gap-2">
                <span className="text-[14px] text-gray-900 font-medium min-w-[100px]">
                  Condition:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-gray-900">
                    {product.condition === "new"
                      ? "New with box"
                      : product.condition === "used_like_new"
                      ? "Open box"
                      : product.condition === "used_good"
                      ? "Pre-Owned"
                      : "Used"}
                  </span>
                  <button className="text-gray-600 hover:text-gray-900">
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quantity Selector */}
              {!isOwnProduct && (
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <label
                      htmlFor="quantity"
                      className="text-[14px] text-gray-900 font-medium min-w-[100px]"
                    >
                      Quantity:
                    </label>
                    <div className="relative">
                      <select
                        id="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-full hover:border-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-[14px] cursor-pointer min-w-[100px]"
                        disabled={isOutOfStock}
                      >
                        {Array.from(
                          { length: Math.min(product.quantity, 10) },
                          (_, i) => i + 1
                        ).map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                    </div>

                    {/* Stock Status */}
                    {product.quantity === 1 ? (
                      <span className="text-[14px] font-semibold text-red-600">
                        Last one · {product.soldCount || 0} sold
                      </span>
                    ) : product.quantity > 10 ? (
                      <span className="text-[14px] text-gray-600">
                        More than 10 available · {product.soldCount || 0} sold
                      </span>
                    ) : (
                      <span className="text-[14px] text-gray-600">
                        {product.quantity} available · {product.soldCount || 0}{" "}
                        sold
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      size="lg"
                      onClick={handleBuyNow}
                      disabled={isOutOfStock}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full py-3 text-[16px] shadow-sm"
                    >
                      Buy It Now
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-full py-3 text-[16px]"
                    >
                      Add to cart
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleWishlistToggle}
                      className={cn(
                        "w-full border-2 font-semibold rounded-full py-3 text-[16px]",
                        isInWishlist
                          ? "border-blue-600 text-blue-600 bg-blue-50"
                          : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                      )}
                    >
                      <Heart
                        className={cn(
                          "mr-2 w-5 h-5",
                          isInWishlist && "fill-current"
                        )}
                      />
                      {isInWishlist ? "Added to Watchlist" : "Add to Watchlist"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Activity Indicators */}
              {(product.soldCount > 0 || product.viewCount > 0) && (
                <div className="mb-6 space-y-2">
                  {product.soldCount > 1 && (
                    <div className="flex items-center gap-2 text-[14px]">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="font-medium">
                        Popular item. {product.soldCount} have already sold.
                      </span>
                    </div>
                  )}
                  {product.viewCount > 10 && (
                    <div className="flex items-center gap-2 text-[14px]">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </div>
                      <span className="font-medium">
                        People want this. {product.viewCount} people are
                        watching this.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Shipping & Delivery Info */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-[14px] text-gray-900 font-medium min-w-[100px]">
                    Shipping:
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold text-gray-900 mb-1">
                      Campus Pickup or Delivery
                    </p>
                    <p className="text-[13px] text-gray-600">
                      Located in: {product.store?.name || "Campus Store"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-[14px] text-gray-900 font-medium min-w-[100px]">
                    Delivery:
                  </span>
                  <div className="text-[14px] text-gray-900">
                    <p className="mb-1">Estimated within 1-3 days</p>
                    <p className="text-[13px] text-gray-600">
                      Seller ships within 1 day after receiving cleared payment.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-[14px] text-gray-900 font-medium min-w-[100px]">
                    Returns:
                  </span>
                  <div className="text-[14px] text-gray-900">
                    <p className="mb-1">
                      7 days returns. Buyer pays for return shipping.
                    </p>
                    <button className="text-[13px] text-blue-700 hover:underline">
                      See details
                    </button>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-[15px] font-semibold mb-4">
                  Shop with confidence
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-gray-900">
                        Escrow Protected
                      </p>
                      <p className="text-[12px] text-gray-600">
                        Secure payment
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-gray-900">
                        Campus Delivery
                      </p>
                      <p className="text-[12px] text-gray-600">
                        Fast & reliable
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description Section */}
          <div className="border-t border-gray-200 p-6 lg:p-8">
            <h2 className="text-xl font-bold mb-4">About this product</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              <p>{product.description}</p>
            </div>

            {/* Product Details */}
            {product.category && (
              <div className="mt-6">
                <h3 className="text-[15px] font-semibold mb-3">
                  Product Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-[14px]">
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {product.category
                        .replace("_", " ")
                        .charAt(0)
                        .toUpperCase() + product.category.slice(1)}
                    </span>
                  </div>
                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <span className="text-gray-600">Tags:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {product.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products - Similar Items */}
        {relatedProducts && relatedProducts.length > 1 && (
          <section className="mt-8">
            <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold mb-6">
                Similar items from eBay Stores
              </h2>
              <ProductGrid
                products={relatedProducts
                  .filter((p) => p.id !== product.id)
                  .slice(0, 6)}
                isLoading={isRelatedLoading}
              />
            </div>
          </section>
        )}

        {/* Chat Widget */}
        <ProductChat
          product={product}
          onLoginRequired={() => navigate("/login")}
        />
      </div>
    </div>
  );
}
