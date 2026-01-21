import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Store,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useProducts } from "@/hooks";
import { useAuthStore } from "@/stores";
import { mockProducts } from "@/lib/mockData";
import {
  HeroCarousel,
  PromoBanner,
  CategoryScroller,
  ProductScroller,
  DealsGrid,
  SectionHeader,
} from "@/components/home";

// Category data with images for the scroller
const categories = [
  {
    id: "electronics",
    name: "Electronics",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop",
    href: "/products?category=electronics",
  },
  {
    id: "clothing",
    name: "Clothing",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop",
    href: "/products?category=clothing",
  },
  {
    id: "books",
    name: "Books",
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop",
    href: "/products?category=books",
  },
  {
    id: "beauty",
    name: "Beauty",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
    href: "/products?category=beauty",
  },
  {
    id: "stationery",
    name: "Stationery",
    image:
      "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&h=400&fit=crop",
    href: "/products?category=stationery",
  },
  {
    id: "groceries",
    name: "Groceries",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop",
    href: "/products?category=groceries",
  },
  {
    id: "food",
    name: "Food",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop",
    href: "/products?category=food",
  },
  {
    id: "services",
    name: "Services",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=400&fit=crop",
    href: "/products?category=services",
  },
];

// Featured category data for second scroller
const featuredCategories = [
  {
    id: "tech-deals",
    name: "Tech Deals",
    image:
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=400&fit=crop",
    href: "/products?category=electronics&sort=discount",
  },
  {
    id: "textbooks",
    name: "Textbooks",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    href: "/products?category=books",
  },
  {
    id: "dorm-essentials",
    name: "Dorm Essentials",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
    href: "/products?category=furniture",
  },
  {
    id: "fashion",
    name: "Fashion",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop",
    href: "/products?category=fashion",
  },
  {
    id: "study-supplies",
    name: "Study Supplies",
    image:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=400&fit=crop",
    href: "/products?category=stationery",
  },
  {
    id: "sports",
    name: "Sports",
    image:
      "https://images.unsplash.com/photo-1461896836934- voices?w=400&h=400&fit=crop",
    href: "/products?category=sports",
  },
];

export function HomePage() {
  const { isAuthenticated } = useAuthStore();

  // Use the hook for real API data
  const { data: productsData, isLoading } = useProducts({
    perPage: 12,
    sortBy: "date_created",
    sortOrder: "desc",
  });

  // Use API data or fall back to mock data
  const allProducts = productsData?.items || mockProducts;

  // Filter products for different sections
  const recentProducts = allProducts.slice(0, 8);
  const trendingProducts = allProducts.filter((p) => p.isFeatured).slice(0, 8);
  const dealsProducts = allProducts
    .filter((p) => p.comparePrice && p.comparePrice > p.price)
    .slice(0, 9);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1488px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Hero Carousel */}
        <section className="pt-6 pb-8">
          <HeroCarousel />
        </section>

        {/* Promo Banner */}
        <section className="pb-8">
          <PromoBanner
            title="Shopping made easy"
            subtitle="Buy and sell safely with escrow protection"
            ctaText="Learn more"
            ctaLink="/help/how-it-works"
            variant="primary"
          />
        </section>

        {/* Recently Viewed / New Arrivals */}
        <section className="pb-12">
          <SectionHeader
            title="New on Campuzon"
            href="/products?sort=newest"
            linkText="See all"
          />
          <ProductScroller products={recentProducts} />
        </section>

        {/* Shop by Category */}
        <section className="pb-12">
          <SectionHeader
            title="Shop by Category"
            href="/products"
            linkText="See all categories"
          />
          <CategoryScroller categories={categories} />
        </section>

        {/* Trending on Campus */}
        <section className="pb-12">
          <SectionHeader
            title="Trending on Campus"
            href="/products?sort=popular"
            linkText="See all"
          />
          <ProductScroller
            products={
              trendingProducts.length > 0 ? trendingProducts : recentProducts
            }
          />
        </section>

        {/* Deals Section */}
        {dealsProducts.length > 0 && (
          <section className="pb-12">
            <SectionHeader
              title="Today's Deals"
              href="/products?sort=discount"
              linkText="See all deals"
            />
            <DealsGrid products={dealsProducts} />
          </section>
        )}

        {/* Campus Essentials Category Scroller */}
        <section className="pb-12">
          <SectionHeader
            title="Campus Essentials"
            href="/products"
            linkText="Explore"
          />
          <CategoryScroller categories={featuredCategories} />
        </section>

        {/* Trust & Safety Banner */}
        <section className="pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-6 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-900">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Escrow Protected
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your money is safe until delivery
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Campus Pickup</h3>
                <p className="text-sm text-muted-foreground">
                  Meet safely on campus
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-900">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Secure Payments
                </h3>
                <p className="text-sm text-muted-foreground">
                  Mobile money & bank transfers
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Seller CTA */}
        {!isAuthenticated && (
          <section className="pb-12">
            <div className="relative overflow-hidden bg-gradient-to-r from-primary via-blue-600 to-secondary rounded-2xl p-8 md:p-12">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                    <GraduationCap className="w-6 h-6 text-white" />
                    <span className="text-white/80 text-sm font-medium">
                      For Students
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Turn your stuff into cash
                  </h2>
                  <p className="text-white/80 max-w-md">
                    Create your free store and start selling to thousands of
                    students on your campus.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/seller/become">
                    <Button
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90 font-semibold"
                    >
                      <Store className="mr-2 h-5 w-5" />
                      Start Selling
                    </Button>
                  </Link>
                  <Link to="/help/selling">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
