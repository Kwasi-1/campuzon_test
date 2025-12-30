import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  ShoppingCart,
  Trash2,
  Store,
  Package,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Badge,
  EmptyState,
  Breadcrumb,
  ProductCardSkeleton,
} from '@/components/ui';
import { useWishlist, useRemoveFromWishlist } from '@/hooks';
import { useCartStore, useAuthStore } from '@/stores';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

// Mock wishlist items for display
const mockWishlistItems: Product[] = [
  {
    id: 'prod-1',
    storeID: 'store-1',
    name: 'iPhone 14 Pro Max 256GB',
    slug: 'iphone-14-pro-max-256gb',
    description: 'Latest iPhone with Dynamic Island',
    price: 5500,
    comparePrice: 6000,
    quantity: 3,
    minOrderQuantity: 1,
    maxOrderQuantity: null,
    images: ['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=400&fit=crop'],
    thumbnail: null,
    category: 'electronics',
    condition: 'new',
    tags: ['apple', 'iphone', 'smartphone'],
    status: 'active',
    isActive: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 24,
    soldCount: 15,
    viewCount: 450,
    dateCreated: '2024-12-01T00:00:00Z',
    store: {
      id: 'store-1',
      name: 'TechHub UG',
      slug: 'techhub-ug',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    },
  },
  {
    id: 'prod-2',
    storeID: 'store-2',
    name: 'AirPods Pro (2nd Gen)',
    slug: 'airpods-pro-2nd-gen',
    description: 'Premium wireless earbuds with ANC',
    price: 850,
    comparePrice: null,
    quantity: 10,
    minOrderQuantity: 1,
    maxOrderQuantity: null,
    images: ['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop'],
    thumbnail: null,
    category: 'electronics',
    condition: 'new',
    tags: ['apple', 'airpods', 'audio'],
    status: 'active',
    isActive: true,
    isFeatured: false,
    rating: 4.9,
    reviewCount: 56,
    soldCount: 42,
    viewCount: 890,
    dateCreated: '2024-11-15T00:00:00Z',
    store: {
      id: 'store-2',
      name: 'Campus Gadgets',
      slug: 'campus-gadgets',
    },
  },
  {
    id: 'prod-3',
    storeID: 'store-3',
    name: 'Vintage Denim Jacket',
    slug: 'vintage-denim-jacket',
    description: 'Classic denim jacket, size M',
    price: 120,
    comparePrice: 180,
    quantity: 1,
    minOrderQuantity: 1,
    maxOrderQuantity: null,
    images: ['https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=400&h=400&fit=crop'],
    thumbnail: null,
    category: 'fashion',
    condition: 'used_like_new',
    tags: ['denim', 'jacket', 'vintage'],
    status: 'active',
    isActive: true,
    isFeatured: false,
    rating: null,
    reviewCount: 0,
    soldCount: 0,
    viewCount: 45,
    dateCreated: '2024-12-20T00:00:00Z',
    store: {
      id: 'store-3',
      name: 'Campus Thrift',
      slug: 'campus-thrift',
    },
  },
];

export function WishlistPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { data: wishlist, isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  // Use mock data for display
  const displayItems = wishlist || mockWishlistItems;

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };

  const handleRemove = (productId: string) => {
    removeFromWishlist.mutate(productId);
  };

  if (!isAuthenticated) {
    navigate('/login?redirect=/wishlist');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Profile', href: '/profile' },
          { label: 'Wishlist' },
        ]}
        className="mb-6"
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">
            {displayItems.length} saved item{displayItems.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-16 w-16" />}
          title="Your wishlist is empty"
          description="Save items you like by clicking the heart icon on products"
          action={
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayItems.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group h-full hover:shadow-lg transition-shadow overflow-hidden">
                {/* Image */}
                <Link to={`/products/${product.id}`} className="block relative">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.images?.[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                    </Badge>
                  )}
                  {product.quantity === 0 && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Badge variant="outline">Out of Stock</Badge>
                    </div>
                  )}
                </Link>

                <CardContent className="p-4 flex flex-col flex-1">
                  {/* Store */}
                  {product.store && (
                    <Link
                      to={`/stores/${product.store.slug}`}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-2"
                    >
                      <Store className="h-3 w-3" />
                      {product.store.name}
                    </Link>
                  )}

                  {/* Title */}
                  <Link
                    to={`/products/${product.id}`}
                    className="font-medium line-clamp-2 hover:text-primary transition-colors mb-2"
                  >
                    {product.name}
                  </Link>

                  {/* Category & Condition */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                    {product.condition && product.condition !== 'new' && (
                      <Badge variant="secondary" className="text-xs">
                        {product.condition.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.comparePrice)}
                      </span>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <Package className="h-3 w-3" />
                    {product.quantity > 0 ? (
                      <span>
                        {product.quantity} in stock
                      </span>
                    ) : (
                      <span className="text-red-500">Out of stock</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex gap-2">
                    <Button
                      className="flex-1"
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.quantity === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(product.id)}
                      disabled={removeFromWishlist.isPending}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
