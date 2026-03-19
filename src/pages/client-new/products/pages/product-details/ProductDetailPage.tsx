import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { openAuthPrompt } = useAuthPromptStore();
  const { addItem, getItem } = useCartStore();

  const { data: product, isLoading, error } = useProduct(id!);

  // Only fetch related products when we have a product with a storeID
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
      openAuthPrompt(
        getCurrentPath(),
        "Sign in to add items to your wishlist.",
      );
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
    } catch (error) {
      console.error("Failed to start conversation", error);
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

  // Get cart count for badge
  const cartItem = getItem(id!);
  const cartCount = cartItem?.quantity || 0;

  // Filter related products (exclude current product and get wishlist IDs)
  const similarProducts =
    relatedProducts?.filter((p) => p.id !== product.id).slice(0, 4) || [];

  return (
    <div className="min-h-screen pb-28">
      <div className="container mx-auto px-4 py-6 max-w-[1408px]">
        {/* Breadcrumb */}
        {/* <Breadcrumb
          items={[
            { label: "Products", href: "/products" },
            {
              label: product.category,
              href: `/products?category=${product.category}`,
            },
            { label: product.name },
          ]}
          className="mb-6"
        /> */}

        {/* Main Content */}
        <div className="bg-white overflow-hidden">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 p-6 lg:p-8">
            {/* Left Section - Image Gallery */}
            <div className="lg:max-w-[884px]">
              <ProductImageGallery
                images={images}
                productName={product.name}
                cartCount={cartCount}
                isInWishlist={isInWishlist}
                watchersCount={product.viewCount}
                onWishlistToggle={handleWishlistToggle}
                onImageClick={(index) => {
                  // Optional: Open image in modal/lightbox
                  console.log("Open image", index);
                }}
              />

              {/* Product Description Section */}
              <div className="hidden lg:block border-t border-gray-200 p-6 lg:p-8 mt-8">
                <h2 className="text-xl font-bold mb-4">About this product</h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p className="whitespace-pre-wrap">{product.description}</p>
                </div>

                {/* Product Details */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Product Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6 text-sm">
                    {product.category && (
                      <div className="flex items-start gap-3">
                        <span className="text-gray-600 min-w-[120px]">
                          Category:
                        </span>
                        <span className="font-medium text-gray-900">
                          {product.category
                            .replace(/_/g, " ")
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(" ")}
                        </span>
                      </div>
                    )}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex items-start gap-3">
                        <span className="text-gray-600 min-w-[120px]">
                          Tags:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Product Info */}

            {/* Right Section - Product Info */}
            <div className="lg:w-[550px] lg:pt-8 ">
              <ProductInfo
                product={product}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onBuyNow={handleBuyNow}
                onAddToCart={handleAddToCart}
                onAddToWatchlist={handleWishlistToggle}
                onContactSeller={handleContactSeller}
                isInWishlist={isInWishlist}
                hideActionButtons
              />
            </div>
          </div>

          {/* Product Reviews */}
          <div className="border-t border-gray-200 p-6 lg:p-8">
            <ProductReviews productId={id!} />
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="border-t border-gray-200 p-6 lg:p-8">
              <SimilarProducts products={similarProducts} />
            </div>
          )}
        </div>

        {/* Chat Widget */}
        <ProductChat
          product={product}
          onLoginRequired={() =>
            openAuthPrompt(getCurrentPath(), "Sign in to message this seller.")
          }
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white backdrop-blur supports-[backdrop-filter]:bg-white">
        <div className="mx-auto flex max-w-[1408px] items-center gap-3 px-4 py-3">
          {/* <div className="hidden md:block min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {product.name}
            </p>
            <p className="text-base font-bold text-gray-900">
              {formatGHS(Number.isFinite(product.price) ? product.price : 0)}
            </p>
          </div> */}
          <Button
            onClick={handleAddToCart}
            variant="outline"
            size="lg"
            disabled={isOutOfStock}
            className="h-12 flex-1 rounded-full text-base font-semibold md:max-w-1/4 "
          >
            Add to Cart
          </Button>
          <Button
            onClick={handleBuyNow}
            size="lg"
            disabled={isOutOfStock}
            className="h-12 flex-1 rounded-full text-base font-semibold"
          >
            Buy It Now
          </Button>
        </div>
      </div>
    </div>
  );
}
