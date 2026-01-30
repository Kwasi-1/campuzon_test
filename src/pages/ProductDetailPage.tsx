import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Skeleton, Alert, Breadcrumb, Button } from "@/components/ui";
import {
  ProductImageGallery,
  ProductInfo,
  SimilarProducts,
} from "@/components/products";
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
import type { Conversation } from "@/types";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem, getItem } = useCartStore();

  const { data: product, isLoading, error } = useProduct(id!);

  // Only fetch related products when we have a product with a storeID
  const { data: relatedProducts } = useStoreProducts(product?.storeID || "");

  const { data: isInWishlist } = useIsInWishlist(id!);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const startConversation = useStartConversation();

  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = product?.quantity === 0;

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
        product.storeID,
      )) as Conversation;
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
    <div className=" min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-[1408px]">
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
            </div>

            {/* Right Section - Product Info */}
            <div className="lg:w-[524px]">
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

          {/* Product Description Section */}
          <div className="border-t border-gray-200 p-6 lg:p-8">
            <h2 className="text-xl font-bold mb-4">About this product</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              <p className="whitespace-pre-wrap">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Product Details</h3>
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
                    <span className="text-gray-600 min-w-[120px]">Tags:</span>
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

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="border-t border-gray-200 p-6 lg:p-8">
              <SimilarProducts
                products={similarProducts}
                onWishlistToggle={(productId) => {
                  if (!isAuthenticated) {
                    navigate("/login");
                    return;
                  }
                  // Toggle wishlist for similar products
                  // In a real app, you'd track wishlist status for each product
                  addToWishlist.mutate(productId);
                }}
                wishlistProductIds={new Set()}
              />
            </div>
          )}
        </div>

        {/* Chat Widget */}
        <ProductChat
          product={product}
          onLoginRequired={() => navigate("/login")}
        />
      </div>
    </div>
  );
}
