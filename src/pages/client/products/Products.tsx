import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Filter,
  Grid,
  List,
  ShoppingCart,
  Search,
  Store,
  Tag,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Hero from "@/components/Hero";
import SEO from "@/components/SEO";
import ProductCard from "@/components/ProductCard";
import FilterModal from "@/components/FilterModal";
import EmptyState from "@/components/EmptyState";
import { Icon } from "@iconify/react";
import { categories } from "@/data/categories";
// import { stores } from "@/data/stores"; // replaced by live fetch
import { publicStallService } from "@/services/publicStallService";
import { productService } from "@/services";
import { useApiState } from "@/hooks/useApiState";
import { Product } from "@/types";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import AppLoader from "@/components/AppLoader";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [stallId, setStallId] = useState<string | undefined>(undefined);
  const [storesList, setStoresList] = useState<
    Array<{
      name: string;
      logo?: string;
      description: string;
      products: number;
      fallbackIcon?: string;
      stallId?: string;
    }>
  >([]);
  const productsPerPage = 12;
  const productsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // API state for products
  const productsData = useApiState<{
    products: Product[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({
    initialData: { products: [] },
    onError: (error) => toast.error(`Failed to load products: ${error}`),
  });

  // Determine current tab from URL
  const currentTab = location.pathname.includes("/categories")
    ? "categories"
    : location.pathname.includes("/stores")
    ? "stores"
    : location.pathname.includes("/deals")
    ? "deals"
    : "categories";

  // Fetch products when filters change
  useEffect(() => {
    // Load live stores for the stores tab and filter sidebar
    const loadStores = async () => {
      try {
        const { stores } = await publicStallService.browse({
          limit: 50,
          featured: false,
        });
        setStoresList(
          stores.map((s) => ({
            name: s.name,
            logo: (s as unknown as { logo?: string }).logo, // tolerate missing type on Store
            description: s.description,
            products: s.products,
            fallbackIcon: (s as unknown as { fallbackIcon?: string })
              .fallbackIcon,
            stallId: (s as unknown as { stallId?: string }).stallId,
          }))
        );
      } catch (err) {
        console.error("Failed to load stores", err);
      }
    };

    void loadStores();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const params = {
        category: selectedCategory || undefined,
        store: selectedStore || undefined,
        stallId,
        sortBy:
          sortBy === "popular"
            ? undefined
            : (sortBy as "price" | "name" | "rating" | "date"),
        sortOrder: "desc" as "asc" | "desc",
        page: currentPage,
        limit: productsPerPage,
        hasDiscount: currentTab === "deals" ? true : undefined,
      };

      if (searchQuery) {
        const filters = {
          category: selectedCategory || undefined,
          store: selectedStore || undefined,
          stallId,
          hasDiscount: currentTab === "deals" ? true : undefined,
        };
        productsData.execute(() =>
          productService
            .searchProducts(searchQuery, filters)
            .then((products) => ({ products }))
        );
      } else {
        productsData.execute(() => productService.getProducts(params));
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCategory,
    selectedStore,
    sortBy,
    currentPage,
    searchQuery,
    currentTab,
  ]);

  // Get URL parameters for pre-filtering
  useEffect(() => {
    const storeParam = searchParams.get("store");
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    const stallParam = searchParams.get("stall_id");

    if (storeParam) {
      setSelectedStore(storeParam);
    }

    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }

    if (searchParam) {
      setSearchQuery(searchParam);
      setSearchInput(searchParam);
    }

    if (stallParam) {
      setStallId(stallParam || undefined);
    }
  }, [searchParams]);

  // Filter products for display (client-side filtering for price range)
  const filteredProducts = useMemo(() => {
    if (productsData.isLoading) return [];

    let filtered = [...(productsData.data?.products || [])];

    // Filter by price range (client-side since API doesn't support this)
    if (selectedPriceRange) {
      filtered = filtered.filter((product) => {
        const price = product.price;
        switch (selectedPriceRange) {
          case "Under GH₵ 10":
            return price < 10;
          case "GH₵ 10 - GH₵ 30":
            return price >= 10 && price <= 30;
          case "GH₵ 30 - GH₵ 50":
            return price >= 30 && price <= 50;
          case "Above GH₵ 50":
            return price > 50;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [productsData.data?.products, productsData.isLoading, selectedPriceRange]);

  // Prefer server pagination if provided
  const totalPages =
    productsData.data?.pagination?.totalPages ||
    Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts;

  const scrollToProducts = () => {
    if (productsRef.current) {
      productsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
    setTimeout(scrollToProducts, 100);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case "categories":
        return "Browse by Category";
      case "stores":
        return "Shop by Store";
      case "deals":
        return "Top Deals & Discounts";
      default:
        return "All Products";
    }
  };

  const getPageSubtitle = () => {
    if (location.pathname.includes("/categories"))
      return "Find fresh groceries by category from all your favorite stores";
    if (location.pathname.includes("/stores"))
      return "Shop directly from Ghana's top supermarkets and grocery stores";
    if (location.pathname.includes("/deals"))
      return "Discover amazing discounts and limited-time offers on groceries";
    return "Discover fresh groceries from Ghana's top supermarkets";
  };

  const getSortOptions = () => {
    const baseOptions = [
      { value: "popular", label: "Most Popular" },
      { value: "price-low", label: "Price: Low to High" },
      { value: "price-high", label: "Price: High to Low" },
      { value: "rating", label: "Highest Rated" },
      { value: "newest", label: "Newest First" },
    ];

    if (currentTab === "deals") {
      return [
        { value: "discount", label: "% Discount" },
        { value: "savings", label: "Highest Savings" },
        { value: "expiring", label: "Expiring Soon" },
        ...baseOptions,
      ];
    }

    return baseOptions;
  };

  const renderStars = (rating: number) => {
    return "⭐".repeat(Math.floor(rating));
  };

  const handleTabChange = (tab: string) => {
    navigate(`/${tab}`);
    setSelectedCategory("");
    setSelectedStore("");
    setSelectedPriceRange("");
    setSearchQuery("");
    setSearchInput("");
    setCurrentPage(1);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setTimeout(scrollToProducts, 100);
  };

  const handleStoreSelect = (store: string) => {
    setSelectedStore(store);
    const match = storesList.find((s) => s.name === store);
    setStallId(match?.stallId);
    setCurrentPage(1);
    setTimeout(scrollToProducts, 100);
  };

  const handlePriceRangeSelect = (range: string) => {
    setSelectedPriceRange(selectedPriceRange === range ? "" : range);
    setCurrentPage(1);
  };

  const handleProductClick = (productId: number | string) => {
    navigate(`/product/${productId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedStore("");
    setSelectedPriceRange("");
    setSearchQuery("");
    setSearchInput("");
    setCurrentPage(1);
  };

  const getSEOProps = () => {
    switch (currentTab) {
      case "categories":
        return {
          title: "Browse by Category",
          description:
            "Find fresh groceries by category from all your favorite stores. Browse dairy, produce, beverages, and more from Ghana's top supermarkets.",
          keywords:
            "grocery categories, fresh produce, dairy products, beverages, pantry essentials, Ghana supermarkets",
        };
      case "stores":
        return {
          title: "Shop by Store",
          description:
            "Shop directly from Ghana's top supermarkets and grocery stores including Shoprite, Palace Mall, and other leading retailers.",
          keywords:
            "Ghana supermarkets, Shoprite, Palace Mall, grocery stores, online shopping, food delivery",
        };
      case "deals":
        return {
          title: "Top Deals & Discounts",
          description:
            "Discover amazing discounts and limited-time offers on groceries from Ghana's leading supermarkets. Save big on fresh produce and essentials.",
          keywords:
            "grocery deals, discounts, offers, savings, cheap groceries, Ghana food deals",
        };
      default:
        return {
          title: "All Products",
          description:
            "Discover fresh groceries from Ghana's top supermarkets with great prices and fast delivery.",
          keywords:
            "groceries, supermarket, online shopping, Ghana, food delivery",
        };
    }
  };

  const seoProps = getSEOProps();

  return (
    <>
      <SEO
        title={seoProps.title}
        description={seoProps.description}
        keywords={seoProps.keywords}
      />

      <div className="min-h-screen bg[#f4f7fb] bg-white">
        <div className="hidden lg:block">
          <Hero title={getPageTitle()} subtitle={getPageSubtitle()} />
        </div>
        <div className="max-w-7xl mx-auto section-padding py-8">
          {/* Header */}
          <div className="hidden xlflex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="mb-4 mt-2 lg:mb-0">
              <p className="text-gray-600">
                {currentTab === "deals"
                  ? `${filteredProducts.length} deals available now`
                  : `Showing ${filteredProducts.length} products`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="hidden lg:flex bg-white rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="px-3 py-2"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="px-3 py-2"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {getSortOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Tab-specific content sections */}
          {currentTab === "categories" && (
            <div className="mb-8">
              {isMobile ? (
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex space-x-3 pb-2 w-max">
                    {categories.map((category) => (
                      <div
                        key={category.name}
                        className={`flex-shrink-0 cursor-pointer transition-all rounded-full borde py-3 px-4 ${
                          selectedCategory === category.name
                            ? "bg-primary text-white border-primary"
                            : "text-gray-600 bg-gray-200/30 hover:border-gray-300"
                        }`}
                        onClick={() => handleCategorySelect(category.name)}
                      >
                        <div className="flex items-center space-x-2">
                          {category.icon ? (
                            <Icon
                              icon={category.icon}
                              className="text-lg flex-shrink-0"
                            />
                          ) : (
                            <Tag className="h-5 w-5 text-primary" />
                          )}
                          <span className="text-sm font-medium whitespace-nowrap">
                            {category.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <Card
                      key={category.name}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedCategory === category.name
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => handleCategorySelect(category.name)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="mb-3 h-10 w-10 flex items-center mx-auto justify-center">
                          {category.icon ? (
                            <Icon
                              icon={category.icon}
                              className="text-3xl h-10 w-10 text-primary"
                            />
                          ) : (
                            <Tag className="text-primary h-10 w-10" />
                          )}
                        </div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-gray-500">
                          {category.count} products
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentTab === "stores" && (
            <div className="mb-8">
              {isMobile ? (
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex space-x-3 pb-2 w-max">
                    {storesList.map((store) => (
                      <div
                        key={store.name}
                        className={`flex-shrink-0 cursor-pointer transition-all rounded-full borde py-3 px-4 ${
                          selectedStore === store.name
                            ? "bg-primary text-white border-primary"
                            : "bg-gray-200/30 text-gray-600 border-gray-200/30"
                        }`}
                        onClick={() => handleStoreSelect(store.name)}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon
                            icon={store.fallbackIcon || "mdi:store"}
                            className="text-lg flex-shrink-0"
                          />
                          <span className="text-sm font-medium whitespace-nowrap">
                            {store.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {storesList.map((store) => (
                    <Card
                      key={store.name}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedStore === store.name
                          ? "ring-2 ring-primary"
                          : "border-gray-200/60"
                      }`}
                      onClick={() => handleStoreSelect(store.name)}
                    >
                      <CardContent className="flex flex-col p-6 text-center items-center">
                        <div className="mb-3 h-10 w-10 flex items-center justify-center">
                          <Icon
                            icon={store.fallbackIcon || "mdi:store"}
                            className="text-3xl h-9 w-9 md:h-10 md:w-10 text-primary"
                          />
                          <img
                            src={store.logo || "/placeholder.svg"}
                            alt={store.name}
                            className="h-12 w-12 rounded-full absolute"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                        <h3 className="font-[500]">{store.name}</h3>
                        <p className="text-sm text-gray-500 mb-1 hidden md:block">
                          {store.description}
                        </p>
                        <p className="text-xs text-primary">
                          {store.products} products
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentTab === "deals" && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2 text-red-600">
                <Percent className="w-5 h-5" />
                <span className="font-semibold">Limited Time Offers</span>
              </div>
              <p className="text-sm text-red-500 mt-1">
                Save big on fresh groceries - offers may end soon!
              </p>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8" ref={productsRef}>
            {/* Filters Sidebar */}
            <div
              className={`lg:w-72 space-y-6 ${
                showFilters ? "block" : "hidden lg:block"
              }`}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Search Products</h3>
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search groceries..."
                      value={searchInput}
                      onChange={handleSearchInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </form>
                </CardContent>
              </Card>

              {currentTab !== "stores" && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Store</h3>
                    <div className="space-y-3">
                      {storesList.map((store) => (
                        <div
                          key={store.name}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={store.name}
                            checked={selectedStore === store.name}
                            onCheckedChange={() =>
                              setSelectedStore(
                                selectedStore === store.name ? "" : store.name
                              )
                            }
                          />
                          <label
                            htmlFor={store.name}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {store.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentTab !== "categories" && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Category</h3>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <div
                          key={category.name}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={category.name}
                            checked={selectedCategory === category.name}
                            onCheckedChange={() =>
                              setSelectedCategory(
                                selectedCategory === category.name
                                  ? ""
                                  : category.name
                              )
                            }
                          />
                          <label
                            htmlFor={category.name}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Price Range</h3>
                  <div className="space-y-3">
                    {[
                      "All Prices",
                      "Under GH₵ 10",
                      "GH₵ 10 - GH₵ 30",
                      "GH₵ 30 - GH₵ 50",
                      "Above GH₵ 50",
                    ].map((range) => (
                      <div key={range} className="flex items-center space-x-2">
                        <Checkbox
                          id={range}
                          checked={selectedPriceRange === range}
                          onCheckedChange={() =>
                            handlePriceRangeSelect(
                              range === "All Prices" ? "" : range
                            )
                          }
                        />
                        <label
                          htmlFor={range}
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          {range}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Products Grid/List */}
            <div className="flex-1">
              {productsData.isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <EmptyState
                  title="No products found"
                  subtitle="Try adjusting your filters or search for different products"
                  actionText="Clear Filters"
                  onAction={handleClearFilters}
                  icon="search"
                />
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 md:grid-cols-3  gap-3 md:gap-6 min-h-[770px]"
                      : "space-y-4"
                  }
                >
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      {...product}
                      onClick={handleProductClick}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!productsData.isLoading && totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="rounded-full"
                    >
                      <Icon
                        icon="iconoir:fast-arrow-left"
                        className="w-7 h-7"
                      />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="rounded-full"
                    >
                      <Icon
                        icon="iconoir:fast-arrow-right"
                        className="w-7 h-7"
                      />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal for Mobile */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        selectedCategory={selectedCategory}
        selectedStore={selectedStore}
        selectedPriceRange={selectedPriceRange}
        onCategoryChange={setSelectedCategory}
        onStoreChange={setSelectedStore}
        onPriceRangeChange={setSelectedPriceRange}
        currentTab={currentTab}
      />
    </>
  );
};

export default Products;
