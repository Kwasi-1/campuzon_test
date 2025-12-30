import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Minus,
  Plus,
} from 'lucide-react';
import {
  Button,
  Badge,
  Avatar,
  Skeleton,
  Alert,
  Breadcrumb,
} from '@/components/ui';
import { ProductGrid } from '@/components/products';
import { ProductChat } from '@/components/chat';
import { useProduct, useStoreProducts, useAddToWishlist, useRemoveFromWishlist, useIsInWishlist, useStartConversation } from '@/hooks';
import { useCartStore, useAuthStore } from '@/stores';
import { formatPrice, formatRelativeTime, cn } from '@/lib/utils';
import type { Conversation } from '@/types';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { addItem, getItem } = useCartStore();

  const { data: product, isLoading, error } = useProduct(id!);
  
  // Only fetch related products when we have a product with a storeID
  const { data: relatedProducts, isLoading: isRelatedLoading } = useStoreProducts(
    product?.storeID || ''
  );

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
      navigate('/login');
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
      navigate('/login');
      return;
    }
    addItem(product, quantity);
    navigate('/cart');
  };

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!product?.storeID) return;

    try {
      const conversation = await startConversation.mutateAsync(product.storeID) as Conversation;
      navigate(`/messages/${conversation.id}`);
    } catch (error) {
      console.error('Failed to start conversation', error);
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

  const images = product.images?.length ? product.images : ['/placeholder-product.jpg'];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Products', href: '/products' },
          { label: product.category, href: `/products?category=${product.category}` },
          { label: product.name },
        ]}
        className="mb-6"
      />

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImageIndex}
                src={images[selectedImageIndex]}
                alt={product.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full w-full object-cover"
              />
            </AnimatePresence>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev === 0 ? images.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev === images.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isOutOfStock && <Badge variant="destructive">Out of Stock</Badge>}
              {product.isFeatured && <Badge variant="warning">Featured</Badge>}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    'shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                    selectedImageIndex === index
                      ? 'border-primary'
                      : 'border-transparent hover:border-primary/50'
                  )}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Store Info */}
          {product.store && (
            <Link
              to={`/stores/${product.store.slug}`}
              className="flex items-center gap-3 group"
            >
              <Avatar
                src={product.store.logo}
                alt={product.store.name}
                fallback={product.store.name}
                size="md"
              />
              <div>
                <p className="font-medium group-hover:text-primary transition-colors">
                  {product.store.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Listed {formatRelativeTime(product.dateCreated)}
                </p>
              </div>
            </Link>
          )}

          {/* Title & Price */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating.toFixed(1)}</span>
                  {product.reviewCount && (
                    <span className="text-muted-foreground">
                      ({product.reviewCount} reviews)
                    </span>
                  )}
                </div>
              )}
              <Badge variant="outline">{product.category.replace('_', ' ')}</Badge>
            </div>
          </div>

          <div className="text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>{product.description}</p>
          </div>

          {/* Quantity & Actions */}
          {!isOwnProduct && (
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.quantity, quantity + 1))
                    }
                    disabled={quantity >= product.quantity}
                    className="p-2 hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.quantity} available
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {isInCart ? 'Update Cart' : 'Add to Cart'}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex-1"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                >
                  Buy Now
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className={cn(isInWishlist && 'text-red-500')}
                >
                  <Heart
                    className={cn('mr-2 h-4 w-4', isInWishlist && 'fill-current')}
                  />
                  {isInWishlist ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" onClick={handleContactSeller}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message Seller
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-xs text-muted-foreground">
                Escrow Protected
              </span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-xs text-muted-foreground">
                Campus Pickup
              </span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-purple-500" />
              </div>
              <span className="text-xs text-muted-foreground">
                Easy Refunds
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 1 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">More from this Store</h2>
          <ProductGrid
            products={relatedProducts.filter((p) => p.id !== product.id).slice(0, 4)}
            isLoading={isRelatedLoading}
          />
        </section>
      )}

      {/* Chat Widget */}
      <ProductChat 
        product={product} 
        onLoginRequired={() => navigate('/login')}
      />
    </div>
  );
}
