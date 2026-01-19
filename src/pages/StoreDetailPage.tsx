import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  ShoppingBag,
  CheckCircle,
  MessageCircle,
  Share2,
  Phone,
  Mail,
  ChevronRight,
  Search,
} from "lucide-react";
import { Button, Badge, Alert, Pagination } from "@/components/ui";
import { ProductGrid } from "@/components/products";
import { mockStores, mockProducts } from "@/lib/mockData";
import { useAuthStore } from "@/stores";
import { cn } from "@/lib/utils";

type SortOption = "newest" | "price-low" | "price-high" | "popular" | "rating";

const ITEMS_PER_PAGE = 24;

export function StoreDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Find store by slug
  const store = mockStores.find((s) => s.storeSlug === slug);

  // Get store products
  const storeProducts = useMemo(() => {
    if (!store) return [];
    return mockProducts.filter((p) => p.storeID === store.id);
  }, [store]);

  // Get unique categories from store products
  const categories = useMemo(() => {
    const cats = new Set(storeProducts.map((p) => p.category));
    return Array.from(cats);
  }, [storeProducts]);

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return storeProducts;
    return storeProducts.filter((p) => p.category === selectedCategory);
  }, [storeProducts, selectedCategory]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    switch (sortBy) {
      case "price-low":
        return products.sort((a, b) => a.price - b.price);
      case "price-high":
        return products.sort((a, b) => b.price - a.price);
      case "popular":
        return products.sort((a, b) => b.soldCount - a.soldCount);
      case "rating":
        return products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "newest":
      default:
        return products.sort(
          (a, b) =>
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime()
        );
    }
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [sortBy, selectedCategory]);

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/stores/${slug}` } });
      return;
    }
    // Navigate to messages with this store
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
    <div className="min-h-screen bg-white">
      {/* Store Header Banner */}
      <div className="relative h-48 bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden">
        {store.banner ? (
          <img
            src={store.banner}
            alt={`${store.storeName} banner`}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <ShoppingBag className="h-16 w-16 mx-auto mb-3 opacity-40" />
            </div>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Store Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative -mt-20 md:-mt-16"
            >
              <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                {store.logo ? (
                  <img
                    src={store.logo}
                    alt={store.storeName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <ShoppingBag className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Store Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {store.storeName}
                    </h1>
                    {store.isVerified && (
                      <Badge
                        variant="secondary"
                        className="gap-1 bg-blue-50 text-blue-700 border-blue-200"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* Welcome Message / Description */}
                  <p className="text-[15px] text-gray-700 mb-3 max-w-3xl">
                    Welcome to {store.storeName}! {store.description}
                  </p>

                  {/* Store Stats */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {store.rating && (
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">
                          {store.rating.toFixed(1)}%
                        </span>
                        <span>positive feedback</span>
                      </div>
                    )}
                    {store.totalOrders !== undefined && (
                      <div>
                        <span className="font-semibold text-gray-900">
                          {store.totalOrders.toLocaleString()}
                        </span>
                        <span className="ml-1">items sold</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleContactSeller}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex md:hidden gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex-1 border-gray-300"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              size="sm"
              onClick={handleContactSeller}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button className="px-4 py-3 text-sm font-medium text-gray-900 border-b-2 border-blue-600 whitespace-nowrap">
              Store home
            </button>
            <button className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap">
              About
            </button>
            <button className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap">
              Feedback
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Categories Section */}
        {categories.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Featured categories
              </h2>
              <button className="text-sm text-blue-700 hover:underline font-medium flex items-center gap-1">
                See all
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => {
                const categoryProducts = storeProducts.filter(
                  (p) => p.category === category
                );
                const featuredProduct = categoryProducts[0];

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                      selectedCategory === category
                        ? "border-blue-600 ring-2 ring-blue-100"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <img
                      src={
                        featuredProduct?.images[0] || "/placeholder-product.jpg"
                      }
                      alt={category}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-sm font-semibold text-center capitalize">
                        {category.replace("_", " ")}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* All Items Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                All items
              </h2>
              <p className="text-sm text-gray-600">
                {sortedProducts.length}{" "}
                {sortedProducts.length === 1 ? "result" : "results"}
                {selectedCategory !== "all" && (
                  <span>
                    {" "}
                    in{" "}
                    <span className="font-medium capitalize">
                      {selectedCategory.replace("_", " ")}
                    </span>
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Category Filter */}
              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="text-sm text-blue-700 hover:underline font-medium"
                >
                  Clear filter
                </button>
              )}

              {/* Sort Dropdown */}
              <div className="relative">
                <label htmlFor="sort" className="text-sm text-gray-600 mr-2">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md hover:border-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm bg-white cursor-pointer"
                >
                  <option value="newest">Best match</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {paginatedProducts.length > 0 ? (
            <>
              <ProductGrid products={paginatedProducts} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
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
                      " "
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

        {/* Store Contact Info Section */}
        <section className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Store information
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Email</p>
                <a
                  href={`mailto:${store.email}`}
                  className="text-sm text-blue-700 hover:underline"
                >
                  {store.email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Phone</p>
                <a
                  href={`tel:${store.phoneNumber}`}
                  className="text-sm text-blue-700 hover:underline"
                >
                  {store.phoneNumber}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
