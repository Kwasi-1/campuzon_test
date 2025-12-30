import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product } from '@/types';
import { Card, Badge, Button, Avatar } from '@/components/ui';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore, useAuthStore } from '@/stores';
import { useAddToWishlist, useRemoveFromWishlist, useIsInWishlist } from '@/hooks';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { addItem, getItem } = useCartStore();
  const { data: isInWishlist } = useIsInWishlist(product.id);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const isInCart = !!getItem(product.id);
  const isOutOfStock = product.quantity === 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;

    if (isInWishlist) {
      removeFromWishlist.mutate(product.id);
    } else {
      addToWishlist.mutate(product.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addItem(product);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={`/products/${product.id}`}>
        <Card
          hover="lift"
          className="group overflow-hidden h-full"
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={product.images?.[0] || '/placeholder-product.jpg'}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isOutOfStock && (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
              {product.isFeatured && (
                <Badge variant="warning">Featured</Badge>
              )}
            </div>

            {/* Wishlist Button */}
            {isAuthenticated && (
              <button
                onClick={handleWishlistToggle}
                className={cn(
                  'absolute top-2 right-2 p-2 rounded-full transition-all',
                  'bg-background/80 backdrop-blur-sm hover:bg-background',
                  isInWishlist
                    ? 'text-red-500'
                    : 'text-muted-foreground hover:text-red-500'
                )}
              >
                <Heart
                  className={cn('h-4 w-4', isInWishlist && 'fill-current')}
                />
              </button>
            )}

            {/* Quick Add Button */}
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4" />
                {isInCart ? 'In Cart' : 'Add to Cart'}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Store Info */}
            {product.store && (
              <div className="flex items-center gap-2">
                <Avatar
                  src={product.store.logo}
                  alt={product.store.name}
                  fallback={product.store.name}
                  size="xs"
                />
                <span className="text-xs text-muted-foreground truncate">
                  {product.store.name}
                </span>
              </div>
            )}

            {/* Title */}
            <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                {product.reviewCount && (
                  <span className="text-xs text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </p>
              {product.quantity > 0 && product.quantity <= 5 && (
                <span className="text-xs text-orange-500">
                  Only {product.quantity} left
                </span>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
