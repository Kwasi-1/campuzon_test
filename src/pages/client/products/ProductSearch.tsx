import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Filter, Grid, List, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Hero from "@/components/Hero";
import { productService } from "@/services";
import { useApiState } from "@/hooks/useApiState";
import { Product } from "@/types";
import { categories } from "@/data/categories";
import { stores } from "@/data/stores";
import { Icon } from "@iconify/react/dist/iconify.js";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import AppLoader from "@/components/AppLoader";
import { toast } from "sonner";

const ProductSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);

  // API state for search results
  const searchResults = useApiState<
    | Product[]
    | {
        products: Product[];
        pagination?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }
  >({
    initialData: [],
    onError: (error) => toast.error(`Search failed: ${error}`),
  });

  const productsPerPage = 12;

  // Fetch search results when query changes
  useEffect(() => {
    const performSearch = async () => {
      const urlSearchQuery = searchParams.get("search") || "";
      setSearchQuery(urlSearchQuery);

      if (urlSearchQuery.trim()) {
        const filters = {
          category: selectedCategory || undefined,
          store: selectedStore || undefined,
        };

        searchResults.execute(() =>
          productService.searchProducts(urlSearchQuery, filters)
        );
      } else {
        // If no search query, get all products with filters
        const searchParams = {
          category: selectedCategory || undefined,
          store: selectedStore || undefined,
          sortBy: sortBy as "price" | "name" | "rating" | "date" | undefined,
          sortOrder: "desc" as "asc" | "desc",
          page: currentPage,
          limit: productsPerPage,
        };

        searchResults.execute(() => productService.getProducts(searchParams));
      }
    };

    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, selectedCategory, selectedStore, sortBy, currentPage]);

  // Search and filter products
  const filteredProducts = useMemo(() => {
    if (searchResults.isLoading) return [];
    const baseList = Array.isArray(searchResults.data)
      ? searchResults.data
      : searchResults.data?.products || [];
    let results = [...baseList];

    // Apply filters
    if (selectedCategory) {
      results = results.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (selectedStore) {
      results = results.filter((product) => product.store === selectedStore);
    }

    if (priceRange) {
      results = results.filter((product) => {
        const price = product.price;
        switch (priceRange) {
          case "under-10":
            return price < 10;
          case "10-30":
            return price >= 10 && price <= 30;
          case "30-50":
            return price >= 30 && price <= 50;
          case "above-50":
            return price > 50;
          default:
            return true;
        }
      });
    }

    // Sort results
    switch (sortBy) {
      case "price-low":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        results.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep relevance order (default from search)
        break;
    }

    return results;
  }, [
    searchResults.data,
    searchResults.isLoading,
    selectedCategory,
    selectedStore,
    priceRange,
    sortBy,
  ]);

  // Pagination
  const totalPages =
    (Array.isArray(searchResults.data)
      ? undefined
      : searchResults.data?.pagination?.totalPages) ||
    Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const handleProductClick = (productId: number | string) => {
    navigate(`/product/${productId}`);
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
    <div className="min-h-screen bg-white">
      <div className=" hidden lg:block">
        <Hero
          title="Search Groceries"
          subtitle="Find fresh groceries and household essentials from your favorite stores"
        />
      </div>

      <div className="max-w-7xl mx-auto section-padding py-8">
        {/* Search Header */}
        <div className="mb-8">
          {/* Results Summary */}
          <div className="flex flex-col md:flex-row items-start justify-between md:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                {searchQuery
                  ? `Search results for "${searchQuery}"`
                  : "All Products"}
              </h1>
              <p className="text-gray-600">
                {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="flex items-center gap-4 mt-4 md:mt-0">
              {/* View Toggle */}
              <div className="hidden md:flex bg-white rounded-lg p-1 border">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Toggle (Mobile) */}
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

          {searchQuery && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setSelectedStore("");
                  setPriceRange("");
                  setSearchParams({});
                }}
                className="text-primary hover:underline text-sm"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:w-64 2xl:w-72 space-y-6 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            {/* Category Filter */}
            <Card>
              <CardContent className="p-4 md:p-6">
                <h3 className="font-semibold mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.name}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={category.name}
                        checked={selectedCategory === category.name}
                        onCheckedChange={(checked) =>
                          setSelectedCategory(checked ? category.name : "")
                        }
                      />
                      <label
                        htmlFor={category.name}
                        className="text-sm cursor-pointer"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Store Filter */}
            <Card>
              <CardContent className="p-4 md:p-6">
                <h3 className="font-semibold mb-3">Store</h3>
                <div className="space-y-2">
                  {stores.map((store) => (
                    <div
                      key={store.name}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={store.name}
                        checked={selectedStore === store.name}
                        onCheckedChange={(checked) =>
                          setSelectedStore(checked ? store.name : "")
                        }
                      />
                      <label
                        htmlFor={store.name}
                        className="text-sm cursor-pointer"
                      >
                        {store.name}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Price Filter */}
            <Card>
              <CardContent className="p-4 md:p-6">
                <h3 className="font-semibold mb-3">Price Range</h3>
                <div className="space-y-2">
                  {[
                    { value: "", label: "All Prices" },
                    { value: "under-10", label: "Under GH₵ 10" },
                    { value: "10-30", label: "GH₵ 10 - 30" },
                    { value: "30-50", label: "GH₵ 30 - 50" },
                    { value: "above-50", label: "Above GH₵ 50" },
                  ].map((range) => (
                    <div
                      key={range.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={range.value}
                        checked={priceRange === range.value}
                        onCheckedChange={(checked) =>
                          setPriceRange(checked ? range.value : "")
                        }
                      />
                      <label
                        htmlFor={range.value}
                        className="text-sm cursor-pointer"
                      >
                        {range.label}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {searchResults.isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters to find what you're
                  looking for.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setSelectedStore("");
                    setPriceRange("");
                    setSearchParams({});
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 ${
                          showFilters ? " grid-cols-1" : " grid-cols-2"
                        }`
                      : "space-y-6"
                  }
                >
                  {paginatedProducts.map((product) => (
                    <Card
                      key={product.id}
                      className={`product-card cursor-pointer hover:shadow-lg transition-shadow ${
                        viewMode === "list" ? "flex" : ""
                      }`}
                      onClick={() => handleProductClick(product.id)}
                    >
                      <div
                        className={`relative overflow-hidden p-4 ${
                          viewMode === "list" ? "w-48 flex-shrink-0" : ""
                        }`}
                      >
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className={`object-contain hover:scale-105 transition-transform ${
                            viewMode === "list" ? "w-full h-48" : "w-full h-48"
                          }`}
                        />
                        {product.discount && (
                          <Badge className="absolute top-2 left-2 bg-red-500">
                            {product.discount}% OFF
                          </Badge>
                        )}
                      </div>

                      <CardContent
                        className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          {product.store} • {product.category}
                        </div>

                        <h3 className="font-medium mb-2 line-clamp-2">
                          {product.name}
                        </h3>

                        <div className="flex items-center mb-2">
                          <div className="flex mr-1">
                            {renderStars(product.rating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            ({product.reviews})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary text-lg">
                            GH₵ {product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-gray-400 line-through text-sm">
                              GH₵ {product.originalPrice}
                            </span>
                          )}
                        </div>

                        {product.unit && (
                          <p className="text-xs text-gray-500 mt-1">
                            {product.unit}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {!searchResults.isLoading && totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="rounded-full"
                      >
                        <Icon
                          icon="iconoir:fast-arrow-left"
                          className="w-7 h-7"
                        />
                        {/* Previous */}
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      )}
                      <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="rounded-full"
                      >
                        {/* Next */}
                        <Icon
                          icon="iconoir:fast-arrow-right"
                          className="w-7 h-7"
                        />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSearch;
