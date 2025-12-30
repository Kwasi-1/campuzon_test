import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  ShoppingBag,
  CheckCircle,
  MessageCircle,
  Share2,
  Phone,
  Mail,
  Clock,
  Package,
  Award,
} from 'lucide-react';
import { Button, Badge, Breadcrumb, Alert } from '@/components/ui';
import { ProductGrid } from '@/components/products';
import { mockStores, mockProducts } from '@/lib/mockData';
import { useAuthStore } from '@/stores';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating';

export function StoreDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Find store by slug
  const store = mockStores.find((s) => s.storeSlug === slug);
  
  // Get store products
  const storeProducts = useMemo(() => {
    if (!store) return [];
    return mockProducts.filter((p) => p.storeID === store.id);
  }, [store]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const products = [...storeProducts];
    switch (sortBy) {
      case 'price-low':
        return products.sort((a, b) => a.price - b.price);
      case 'price-high':
        return products.sort((a, b) => b.price - a.price);
      case 'popular':
        return products.sort((a, b) => b.soldCount - a.soldCount);
      case 'rating':
        return products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
      default:
        return products.sort(
          (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        );
    }
  }, [storeProducts, sortBy]);

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/stores/${slug}` } });
      return;
    }
    // Navigate to messages with this store
    navigate(`/messages?store=${store?.id}`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: store?.storeName,
        text: store?.description || '',
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!store) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" title="Store Not Found">
          The store you're looking for doesn't exist or has been removed.
        </Alert>
        <Link to="/stores">
          <Button className="mt-4">Browse Stores</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Store Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
        {store.banner && (
          <img
            src={store.banner}
            alt={`${store.storeName} banner`}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        {/* Store Header */}
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="h-24 w-24 md:h-32 md:w-32 rounded-2xl border-4 border-background bg-muted overflow-hidden shadow-lg"
            >
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={store.storeName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/10">
                  <ShoppingBag className="h-10 w-10 text-primary" />
                </div>
              )}
            </motion.div>

            {/* Store Info */}
            <div className="flex-1 pb-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold">{store.storeName}</h1>
                    {store.isVerified && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1 max-w-2xl">
                    {store.description}
                  </p>
                </div>

                {/* Action Buttons - Desktop */}
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleContactSeller} className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Contact Seller
                  </Button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-4">
                {store.rating && (
                  <div className="flex items-center gap-1.5">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{store.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground text-sm">rating</span>
                  </div>
                )}
                {store.totalOrders !== undefined && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Package className="h-5 w-5" />
                    <span className="font-medium text-foreground">{store.totalOrders.toLocaleString()}</span>
                    <span className="text-sm">orders</span>
                  </div>
                )}
                {/* Top Seller badge - shown if store has 100+ orders or 5000+ in sales */}
                {((store.totalOrders && store.totalOrders >= 100) || (store.totalSales && store.totalSales >= 5000)) && (
                  <Badge variant="secondary" className="gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0 shadow-sm dark:from-amber-500 dark:to-orange-500">
                    <Award className="h-3.5 w-3.5" />
                    Top Seller
                  </Badge>
                )}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm">
                    Since {new Date(store.dateCreated).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Mobile */}
          <div className="flex md:hidden items-center gap-2 mt-4">
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button onClick={handleContactSeller} className="flex-1 gap-2">
              <MessageCircle className="h-4 w-4" />
              Contact Seller
            </Button>
          </div>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Stores', href: '/stores' },
            { label: store.storeName },
          ]}
          className="mb-6"
        />

        {/* Contact Info Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-sm">{store.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium text-sm">{store.phoneNumber}</p>
            </div>
          </div>
          {store.autoResponderEnabled && (
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Auto-responder</p>
                <p className="font-medium text-sm">{store.autoResponderName} is active</p>
              </div>
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="pb-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold">
              Products ({storeProducts.length})
            </h2>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-10 px-3 pr-8 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <ProductGrid products={sortedProducts} />
          ) : (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground">
                This store hasn't listed any products yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
