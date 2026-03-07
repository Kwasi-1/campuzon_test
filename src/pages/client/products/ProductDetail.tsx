import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Icon } from "@iconify/react";
import { productService } from "@/services";
import { useApiState } from "@/hooks/useApiState";
import { Product } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // API states
  const productData = useApiState<Product>({
    initialData: null,
    onError: (error) => toast.error(`Failed to load product: ${error}`),
  });

  const relatedProducts = useApiState<Product[]>({
    initialData: [],
    onError: (error) =>
      toast.error(`Failed to load related products: ${error}`),
  });

  // Load product data on mount
  useEffect(() => {
    if (id) {
      // Load product details
      productData.execute(() => productService.getProductById(id));

      // Load related products
      relatedProducts.execute(() => productService.getRelatedProducts(id, 4));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const product = productData.data;
  const isFavorite = product ? isInWishlist(product.id) : false;

  // Loading state
  if (productData.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm hidden md:block">
          <div className="max-w-7xl mx-auto section-padding py-8">
            <div className="space-y-2">
              <Skeleton className="h-4 w-80" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto section-padding py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Product Images Skeleton */}
            <div className="space-y-4 -mx-4 sm:-mx-6 -mt-4 md:mx-0 md:mt-0">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="w-20 h-20 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Product Info Skeleton */}
            <div className="space-y-6">
              {/* Store badge */}
              <Skeleton className="h-6 w-24 rounded-full" />

              <div className="space-y-4">
                {/* Title */}
                <Skeleton className="h-8 w-3/4" />

                {/* Rating and stock */}
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                {/* Price */}
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>

              {/* Quantity and Actions Skeleton */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-32" />
                </div>

                <div className="flex gap-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 flex-1" />
                </div>

                <div className="flex gap-2">
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>

              {/* Delivery Info Skeleton */}
              <div className="border rounded-md p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Skeleton className="w-5 h-5" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Skeleton */}
          <div>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product && !productData.isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center -mt-10">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button variant="ghost" className="text-primary" onClick={() => navigate("/products")}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const productImages = [
    product?.image || "/placeholder.svg",
    // Add more images if available in the future
  ];

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      // CartContext handles API vs guest logic
      await Promise.resolve(addToCart(product, quantity));

      toast.success(`Added ${quantity} ${product.name} to cart!`, {
        description: `Total: GH₵ ${(product.price * quantity).toFixed(2)}`,
      });
    } catch (error) {
      toast.error("Failed to add item to cart. Please try again.");
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    try {
      await Promise.resolve(addToCart(product, quantity));

      toast.success("Added to cart! Redirecting to cart...", {
        description: `${quantity} ${product.name} - GH₵ ${(
          product.price * quantity
        ).toFixed(2)}`,
      });

      setTimeout(() => {
        navigate("/cart");
      }, 1000);
    } catch (error) {
      toast.error("Failed to add item to cart. Please try again.");
    }
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    try {
      if (isFavorite) {
        await Promise.resolve(removeFromWishlist(product.id));
        toast.success("Removed from wishlist");
      } else {
        await Promise.resolve(addToWishlist(product));
        toast.success("Added to wishlist!");
      }
    } catch (e) {
      toast.error("Failed to update wishlist");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadowsm hidden md:block">
        <div className="max-w-7xl mx-auto section-padding py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flx items-center gap-2 mb-4 hidden"
          >
            <Icon icon="ph:arrow-u-up-left" className="w-7 h-7" />
            Back
          </Button>

          <nav className="text-base text-gray-500 space-x-2">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary">
              Products
            </Link>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <span className="text-gray-900 font-medium"> {product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto section-padding py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4 -mx-4 sm:-mx-6 -mt-4 md:mx-0 md:mt-0">
            <div className="aspect-square bg-white roundedlg overflow-hidden">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-8"
              />
            </div>

            {productImages.length > 1 && (
              <div className="flex gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Store badge */}
            <Badge variant="secondary" className="text-primary">
              {product.store}
            </Badge>

            <div>
              <h1 className="text-3xl lg:text-4xl font-bold font-display tracking-wider text-gray-900 mb-2">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {renderStars(product.rating)}
                  <span className="ml-1 text-sm text-gray-600">
                    ({product.reviews} reviews)
                  </span>
                </div>
                <Badge variant={product.inStock ? "default" : "destructive"}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl lg:text-3xl font-bold text-primary">
                  GH₵ {product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      GH₵ {product.originalPrice}
                    </span>
                    <Badge variant="destructive">{product.discount}% OFF</Badge>
                  </>
                )}
              </div>

              {product.unit && (
                <p className="text-gray-600 mb-4">Price {product.unit}</p>
              )}

              {product.description && (
                <p className="text-gray-700 mb-6">{product.description}</p>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  size="lg"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>

                <Button
                  onClick={handleBuyNow}
                  variant="outline"
                  size="lg"
                  disabled={!product.inStock}
                  className="flex-1"
                >
                  Buy Now
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className="flex items-center gap-2"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Delivery Info */}
            <Card className="border-0 rounded-md">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Delivery Information</h3>
                <div className="space-y-3 flex flex-wrap gap-4 gap-x-8">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Free Delivery</p>
                      <p className="text-sm text-gray-600">
                        On orders above GH₵ 100
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Quality Guarantee</p>
                      <p className="text-sm text-gray-600">
                        Fresh products guaranteed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Easy Returns</p>
                      <p className="text-sm text-gray-600">
                        7-day return policy
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.data && relatedProducts.data.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.data.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  {...relatedProduct}
                  onClick={(id) => navigate(`/product/${id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
