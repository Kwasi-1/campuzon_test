import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/shared/Skeleton";
import { Alert } from "@/components/ui/alert";
import { Pagination } from "@/components/shared/Pagination";
import { ProductGrid } from "../../products/components";
import {
  StoreHeader,
  StoreTabs,
  StoreCategories,
  StoreFeedback,
  StoreAbout,
  type StoreTabType,
} from "./components";
import { useAuthStore } from "@/stores";
import { useStoreBySlug, useProducts } from "@/hooks";

type SortOption =
  | "newest"
  | "price-low"
  | "price-high"
  | "popular"
  | "rating"
  | "date_created";

const ITEMS_PER_PAGE = 48;

export function StoreDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [activeTab, setActiveTab] = useState<StoreTabType>("shop");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isSaved, setIsSaved] = useState(false);

  // Fetch store by slug
  const { data: store, isLoading: storeLoading } = useStoreBySlug(slug!);

  // Fetch store products
  const { data: productsData, isLoading: productsLoading } = useProducts({
    storeId: store?.id,
    category:
      selectedCategory !== "all" ? (selectedCategory as any) : undefined,
    sortBy:
      sortBy === "newest"
        ? "date_created"
        : sortBy === "price-low" || sortBy === "price-high"
          ? "price"
          : sortBy === "popular"
            ? "sold_count"
            : "rating",
    sortOrder: sortBy === "price-low" ? "asc" : "desc",
    page: currentPage,
    perPage: ITEMS_PER_PAGE,
  });

  const storeProducts = productsData?.items || [];
  const totalItems = productsData?.pagination.total || 0;

  // Get unique categories from store products
  // In a real app, this might come from a separate endpoint or all store products
  const categories = useMemo(() => {
    const categoryMap = new Map<
      string,
      { name: string; image?: string; productCount: number }
    >();
    storeProducts.forEach((p) => {
      if (!categoryMap.has(p.category)) {
        categoryMap.set(p.category, {
          name: p.category,
          image: p.images?.[0],
          productCount: 1,
        });
      } else {
        const existing = categoryMap.get(p.category)!;
        categoryMap.set(p.category, {
          ...existing,
          productCount: existing.productCount + 1,
        });
      }
    });
    return Array.from(categoryMap.values());
  }, [storeProducts]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Get featured products
  const featuredProducts = useMemo(() => {
    return storeProducts.filter((p) => p.isFeatured).slice(0, 4);
  }, [storeProducts]);

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/stores/${slug}` } });
      return;
    }
    navigate(`/messages?store=${store?.id}`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: store?.storeName,
        text: store?.description || "",
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleSaveStore = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/stores/${slug}` } });
      return;
    }
    setIsSaved(!isSaved);
  };

  if (storeLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <h3 className="font-bold">Store Not Found</h3>
          <p>The store you're looking for doesn't exist or has been removed.</p>
        </Alert>
        <Link to="/stores">
          <Button className="mt-4">Browse Stores</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Store Header with Banner */}
      <StoreHeader
        store={store}
        onShare={handleShare}
        onContact={handleContactSeller}
        onSave={handleSaveStore}
        isSaved={isSaved}
      />

      {/* Navigation Tabs */}
      <StoreTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        productCount={storeProducts.length}
        hasSaleItems={storeProducts.some(
          (p) => p.comparePrice && p.comparePrice > p.price,
        )}
      />

      {/* Main Content */}
      <div className=" px-4 py-6">
        {/* Shop Tab Content */}
        {activeTab === "shop" && (
          <>
            {/* Featured Categories */}
            <StoreCategories
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={(cat) =>
                setSelectedCategory(cat === selectedCategory ? "all" : cat)
              }
              onSeeAll={() => {}}
            />

            {/* All Items Section */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">All Items</h2>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sorting and filters */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                      aria-label="Sort products"
                    >
                      <option value="newest">Best Match</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="popular">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>

                  {selectedCategory !== "all" && (
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="text-sm text-blue-700 hover:underline"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </div>

              {/* Products Grid */}
              {productsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                  ))}
                </div>
              ) : storeProducts.length > 0 ? (
                <>
                  <ProductGrid products={storeProducts} />

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                  <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedCategory !== "all"
                      ? `No products in ${selectedCategory.replace(
                          "_",
                          " ",
                        )} category.`
                      : "This store hasn't listed any products yet."}
                  </p>
                  {selectedCategory !== "all" && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCategory("all")}
                    >
                      View all products
                    </Button>
                  )}
                </div>
              )}
            </section>
          </>
        )}

        {/* About Tab Content */}
        {activeTab === "about" && (
          <div className="max-w-3xl">
            <StoreAbout
              store={store}
              memberSince={store.dateCreated}
              isTopRated={store.isVerified}
            />
          </div>
        )}

        {/* Feedback Tab Content */}
        {activeTab === "feedback" && (
          <div className="max-w-4xl">
            <StoreFeedback store={store} />
          </div>
        )}

        {/* Sale Tab Content */}
        {activeTab === "sale" && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Sale Items</h2>
            <ProductGrid
              products={storeProducts.filter(
                (p) => p.comparePrice && p.comparePrice > p.price,
              )}
            />
          </section>
        )}
      </div>

      {/* Footer Experience Feedback */}
      <div className="py-8 text-center border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">
          Do you like our store experience?
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Like store experience"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
          </button>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dislike store experience"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
