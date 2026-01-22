import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { Button, Pagination, Breadcrumb, Input } from "@/components/ui";
import {
  ProductGrid,
  ProductFilters,
  ProductsToolbar,
  type FilterState,
} from "@/components/products";
import { useProducts } from "@/hooks";
import type { Category, ProductFilters as ProductFiltersType } from "@/types";
import { useUIStore } from "@/stores";

type ViewMode = "grid" | "list";

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filtersOpen, setFiltersOpen } = useUIStore();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  const [filters, setFilters] = useState<FilterState>({
    category: (searchParams.get("category") as Category) || undefined,
    minPrice: searchParams.get("min_price")
      ? Number(searchParams.get("min_price"))
      : undefined,
    maxPrice: searchParams.get("max_price")
      ? Number(searchParams.get("max_price"))
      : undefined,
    sortBy: searchParams.get("sort_by") || "date_created",
    sortOrder: (searchParams.get("sort_order") as "asc" | "desc") || "desc",
  });

  const [page, setPage] = useState(1);

  const productFilters: ProductFiltersType = {
    page,
    perPage: 24,
    category: filters.category,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sortBy: filters.sortBy as ProductFiltersType["sortBy"],
    sortOrder: filters.sortOrder,
    search: searchParams.get("search") || undefined,
  };

  const { data, isLoading } = useProducts(productFilters);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split(":");
    const params = new URLSearchParams(searchParams);
    params.set("sort_by", sortBy);
    params.set("sort_order", sortOrder);
    setSearchParams(params);
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
    }));
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    setSearchParams(params);
    setPage(1);
  };

  const currentSearch = searchParams.get("search");
  const currentCategory = searchParams.get("category");

  // Build page title
  let pageTitle = "All Products";
  if (currentCategory) {
    pageTitle =
      currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
  }
  if (currentSearch) {
    pageTitle = `Search results for "${currentSearch}"`;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1488px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            ...(currentCategory
              ? [
                  {
                    label:
                      currentCategory.charAt(0).toUpperCase() +
                      currentCategory.slice(1),
                  },
                ]
              : []),
            ...(currentSearch
              ? [{ label: `"${currentSearch}"` }]
              : [{ label: "Products" }]),
          ]}
          className="mb-6"
        />

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {pageTitle}
          </h1>
          <p className="text-muted-foreground">
            {isLoading
              ? "Loading..."
              : `${data?.total || 0} products available`}
          </p>
        </div>

        {/* Mobile Search & Filter Bar */}
        <div className="lg:hidden mb-4 space-y-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>

          {/* Filter Button */}
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={() => setFiltersOpen(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {Object.values(filters).filter(Boolean).length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <ProductFilters
            onFilterChange={handleFilterChange}
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
          />

          {/* Products Area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <ProductsToolbar
              totalResults={data?.total || 0}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={`${filters.sortBy || "date_created"}:${filters.sortOrder || "desc"}`}
              onSortChange={handleSortChange}
              className="mb-6"
            />

            {/* Product Grid */}
            <ProductGrid
              products={data?.items || []}
              isLoading={isLoading}
              viewMode={viewMode}
              emptyMessage={
                currentSearch
                  ? `No products found for "${currentSearch}"`
                  : "No products found"
              }
            />

            {/* Pagination */}
            {data && data.pages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={data.pages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
