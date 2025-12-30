import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  Sparkles,
  Store,
  Package,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { ProductGrid } from '@/components/products';
import { useProducts } from '@/hooks';
import { CATEGORY_OPTIONS } from '@/lib/utils';
import { useAuthStore } from '@/stores';
import { featuredProducts } from '@/lib/mockData';
import type { LucideIcon } from 'lucide-react';

// Helper to get icon component by name
const getIcon = (iconName: string): LucideIcon => {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[iconName] || Package;
};

export function HomePage() {
  const { isAuthenticated } = useAuthStore();
  // Use the hook for real API, but we have mock data as fallback
  const { data: productsData, isLoading: isFeaturedLoading } = useProducts({
    perPage: 8,
    sortBy: 'date_created',
    sortOrder: 'desc',
  });

  // Use mock data for display
  const displayProducts = productsData?.items || featuredProducts;

  return (
    <div className="space-y-10 pb-16">
      {/* Compact Hero Section */}
      <section className="bg-gradient-to-r from-primary/5 via-background to-secondary/5 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
                  Campus Marketplace
                </h1>
                <p className="text-sm text-muted-foreground">
                  Buy & sell safely with escrow protection
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/products">
                <Button>
                  Browse All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/register">
                  <Button variant="outline">Join Now</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Category Pills */}
      <section className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Link to="/products">
            <Badge variant="secondary" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              All
            </Badge>
          </Link>
          {CATEGORY_OPTIONS.slice(0, 8).map((category) => {
            const IconComponent = getIcon(category.icon);
            return (
              <Link key={category.value} to={`/products?category=${category.value}`}>
                <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap flex items-center gap-1.5">
                  <IconComponent className="h-3.5 w-3.5" />
                  {category.label}
                </Badge>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products - Main Focus */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Latest Products</h2>
            <p className="text-muted-foreground text-sm">Fresh listings from students</p>
          </div>
          <Link to="/products">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <ProductGrid
          products={displayProducts}
          isLoading={isFeaturedLoading}
        />
      </section>

      {/* Trust Badges - Compact */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, label: 'Escrow Protected', color: 'text-green-500' },
            { icon: Truck, label: 'Campus Pickup', color: 'text-blue-500' },
            { icon: CreditCard, label: 'Secure Pay', color: 'text-purple-500' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <span className="text-sm font-medium hidden sm:inline">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Seller CTA - Compact */}
      {!isAuthenticated && (
        <section className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white text-center sm:text-left">
              <p className="font-semibold">Want to sell?</p>
              <p className="text-sm text-white/80">Create your store and start earning</p>
            </div>
            <Link to="/register">
              <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
                <Store className="mr-2 h-4 w-4" />
                Start Selling
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
